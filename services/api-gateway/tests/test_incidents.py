import pytest
from fastapi import status
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_alertmanager_webhook(client: AsyncClient, db_session):
    """
    Validate that the internal webhook sink ingests Alertmanager arrays correctly.
    """
    webhook_payload = {
        "receiver": "webhook",
        "status": "firing",
        "alerts": [
            {
                "status": "firing",
                "labels": {
                    "alertname": "TestAnomaly",
                    "severity": "critical",
                    "instance": "localhost",
                },
                "annotations": {"summary": "System anomaly triggered in test suite"},
            }
        ],
        "groupLabels": {},
        "commonLabels": {},
        "commonAnnotations": {},
    }

    await client.post(
        "/api/v1/auth/register",
        json={
            "username": "webhook_operator",
            "email": "webhook@example.com",
            "password": "webhook-password",
        },
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={"username": "webhook_operator", "password": "webhook-password"},
    )
    from sqlalchemy import select
    from app.db.models.user import User

    user = (
        await db_session.execute(
            select(User).where(User.username == "webhook_operator")
        )
    ).scalar_one()
    user_id = user.id
    user.role = "operator"
    await db_session.commit()
    response = await client.post(
        "/api/v1/incidents/webhook",
        json=webhook_payload,
        headers={"Authorization": f"Bearer {login.json()['access_token']}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "success"
    assert data["correlated_chains"] == 1

    from app.db.models.audit_log import AuditLog

    event = (
        await db_session.execute(
            select(AuditLog).where(AuditLog.event_type == "incident.triggered")
        )
    ).scalar_one()
    assert event.outcome == "success"
    assert event.actor_user_id == user_id
    assert event.target_type == "incident"
    assert event.details == {"incident_event_type": "triggered"}


@pytest.mark.asyncio
async def test_list_incidents_authenticated(auth_client: AsyncClient):
    """
    Validate that incidents can be retrieved by authenticated SRE operators.
    """
    response = await auth_client.get("/api/v1/incidents/")
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_incident_access_unauthorized(client: AsyncClient):
    """
    Ensure operational views are strictly blocked for unauthenticated packets.
    """
    response = await client.get("/api/v1/incidents/")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.asyncio
async def test_telemetry_requires_authentication(client: AsyncClient):
    response = await client.get("/api/v1/telemetry/system/live")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
