from datetime import datetime, timedelta, timezone

import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy import select

from app.db.models.audit_log import AuditLog
from app.db.models.incident import Incident
from app.db.models.user import User


async def authenticated_user(client: AsyncClient, db_session, role: str):
    username = f"audit_{role}"
    password = "synthetic-audit-test-password"
    await client.post(
        "/api/v1/auth/register",
        json={"username": username, "email": f"{username}@example.com", "password": password},
    )
    user = (
        await db_session.execute(select(User).where(User.username == username))
    ).scalar_one()
    user.role = role
    await db_session.commit()
    response = await client.post(
        "/api/v1/auth/login", json={"username": username, "password": password}
    )
    client.headers["Authorization"] = f"Bearer {response.json()['access_token']}"
    return user


@pytest.mark.asyncio
async def test_audit_records_authentication_without_credentials(client, db_session):
    await client.post(
        "/api/v1/auth/register",
        json={"username": "audit_login", "email": "audit-login@example.com", "password": "synthetic-login-password"},
    )
    failed = await client.post(
        "/api/v1/auth/login", json={"username": "audit_login", "password": "incorrect"}
    )
    assert failed.status_code == status.HTTP_401_UNAUTHORIZED
    succeeded = await client.post(
        "/api/v1/auth/login", json={"username": "audit_login", "password": "synthetic-login-password"}
    )
    assert succeeded.status_code == status.HTTP_200_OK

    events = list((await db_session.execute(select(AuditLog))).scalars())
    login_events = [event for event in events if event.event_type == "authentication.login"]
    assert {event.outcome for event in login_events} == {"failure", "success"}
    failed_event = next(event for event in login_events if event.outcome == "failure")
    assert failed_event.details == {"reason": "invalid_credentials"}
    assert all("password" not in event.message.lower() for event in events)


@pytest.mark.asyncio
async def test_audit_list_is_admin_only_paginated_and_read_only(client, db_session):
    assert (await client.get("/api/v1/audit/")).status_code == status.HTTP_401_UNAUTHORIZED
    await authenticated_user(client, db_session, "viewer")
    assert (await client.get("/api/v1/audit/")).status_code == status.HTTP_403_FORBIDDEN

    admin = await authenticated_user(client, db_session, "admin")
    events = [
        AuditLog(event_type="test.event", message=f"event {index}", actor_user_id=admin.id)
        for index in range(3)
    ]
    db_session.add_all(events)
    await db_session.commit()
    response = await client.get("/api/v1/audit/?skip=0&limit=2")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["has_more"]
    assert len(response.json()["items"]) == 2
    assert "hashed_password" not in response.text
    assert (await client.delete("/api/v1/audit/")).status_code == status.HTTP_405_METHOD_NOT_ALLOWED


@pytest.mark.asyncio
async def test_incident_analytics_uses_stored_records_and_viewer_policy(client, db_session):
    assert (await client.get("/api/v1/incidents/analytics")).status_code == status.HTTP_401_UNAUTHORIZED
    await authenticated_user(client, db_session, "viewer")
    now = datetime.now(timezone.utc)
    db_session.add_all(
        [
            Incident(fingerprint="analytics-a", title="stored incident A", severity="high", status="firing", triggered_at=now),
            Incident(fingerprint="analytics-b", title="stored incident B", severity="low", status="resolved", triggered_at=now - timedelta(days=1)),
        ]
    )
    await db_session.commit()
    response = await client.get("/api/v1/incidents/analytics")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total_incidents"] == 2
    assert data["recent_24h_count"] == 1
    assert {item["severity"] for item in data["severity_counts"]} == {"high", "low"}
    assert {item["status"] for item in data["status_counts"]} == {"firing", "resolved"}
    assert sum(item["count"] for item in data["daily_counts"]) == 2


@pytest.mark.asyncio
async def test_operator_is_denied_admin_audit_list(client, db_session):
    await authenticated_user(client, db_session, "operator")
    assert (await client.get("/api/v1/audit/")).status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
async def test_admin_user_management_operations_are_audited(client, db_session):
    admin = await authenticated_user(client, db_session, "admin")
    admin_id = admin.id
    created = await client.post(
        "/api/v1/users/",
        json={
            "username": "audited_managed_user",
            "email": "audited-managed@example.com",
            "password": "synthetic-managed-password",
            "role": "viewer",
        },
    )
    assert created.status_code == status.HTTP_201_CREATED
    changed = await client.patch(
        f"/api/v1/users/{created.json()['id']}/role", json={"role": "operator"}
    )
    assert changed.status_code == status.HTTP_200_OK
    events = list((await db_session.execute(select(AuditLog))).scalars())
    user_events = [event for event in events if event.event_type.startswith("user.")]
    assert {event.event_type for event in user_events} >= {"user.created", "user.role_changed"}
    assert all(event.actor_user_id == admin_id for event in user_events)
    role_event = next(event for event in user_events if event.event_type == "user.role_changed")
    assert role_event.details == {"previous_role": "viewer", "new_role": "operator"}


@pytest.mark.asyncio
async def test_incident_transition_is_audited_with_authenticated_actor(client, db_session):
    operator = await authenticated_user(client, db_session, "operator")
    operator_id = operator.id
    incident = Incident(fingerprint="audit-transition", title="Stored audit test incident")
    db_session.add(incident)
    await db_session.flush()
    incident_id = incident.id
    await db_session.commit()
    response = await client.patch(f"/api/v1/incidents/{incident_id}/acknowledge")
    assert response.status_code == status.HTTP_200_OK
    event = (
        await db_session.execute(
            select(AuditLog).where(AuditLog.event_type == "incident.acknowledged")
        )
    ).scalar_one()
    assert event.actor_user_id == operator_id
    assert event.target_id == str(incident_id)
    assert event.details == {"incident_event_type": "acknowledged"}
