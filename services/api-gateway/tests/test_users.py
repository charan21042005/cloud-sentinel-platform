from unittest.mock import AsyncMock

import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy import select

from app.db.models.user import User
from app.db.models.incident import Incident
from app.core.security import verify_password
from app.services.websocket.manager import ConnectionManager

LOCAL_DB_URL = "postgresql+asyncpg://local-user:synthetic-password@127.0.0.1:5432/cloud_sentinel"


def configure_bootstrap(
    monkeypatch,
    environment="development",
    database_url=LOCAL_DB_URL,
    file_values=None,
    process_values=None,
):
    from app.cli import bootstrap_admin

    file_values = file_values or {
        "ENVIRONMENT": environment,
        "DATABASE_URL": database_url,
    }
    process_values = process_values or {}
    monkeypatch.setattr(bootstrap_admin.settings, "ENVIRONMENT", environment)
    monkeypatch.setattr(bootstrap_admin.settings, "DATABASE_URL", database_url)
    monkeypatch.setattr(
        bootstrap_admin, "_configured_sources", lambda: (file_values, process_values)
    )
    monkeypatch.setattr(
        bootstrap_admin,
        "_resolve_local_database_host",
        lambda host: host in {"localhost", "127.0.0.1", "::1"},
    )
    return bootstrap_admin


async def client_with_role(client: AsyncClient, db_session, role: str) -> AsyncClient:
    username = f"{role}_tester"
    password = "synthetic-test-password"
    await client.post(
        "/api/v1/auth/register",
        json={"username": username, "email": f"{role}@example.com", "password": password},
    )
    user = (
        await db_session.execute(select(User).where(User.username == username))
    ).scalar_one()
    user.role = role
    await db_session.commit()
    login = await client.post(
        "/api/v1/auth/login", json={"username": username, "password": password}
    )
    client.headers["Authorization"] = f"Bearer {login.json()['access_token']}"
    return client


@pytest.mark.asyncio
async def test_get_my_profile(auth_client: AsyncClient):
    """
    Validate that an authenticated user can retrieve their own profile.
    """
    response = await auth_client.get("/api/v1/users/me")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["username"] == "auth_tester"
    assert "role" in data


@pytest.mark.asyncio
async def test_unauthorized_profile_access(client: AsyncClient):
    """
    Ensure that requests without a valid token are rejected.
    """
    response = await client.get("/api/v1/users/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.asyncio
async def test_user_management_requires_admin(client: AsyncClient, db_session):
    response = await client.get("/api/v1/users/")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

    viewer = await client_with_role(client, db_session, "viewer")
    response = await viewer.get("/api/v1/users/")
    assert response.status_code == status.HTTP_403_FORBIDDEN
    incident_response = await viewer.patch(
        "/api/v1/incidents/00000000-0000-0000-0000-000000000001/resolve"
    )
    assert incident_response.status_code == status.HTTP_403_FORBIDDEN
    create_response = await viewer.post(
        "/api/v1/users/",
        json={
            "username": "forbidden_user",
            "email": "forbidden@example.com",
            "password": "synthetic-forbidden-password",
            "role": "operator",
        },
    )
    assert create_response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
async def test_invalid_token_is_unauthorized(client: AsyncClient):
    response = await client.get(
        "/api/v1/users/me", headers={"Authorization": "Bearer invalid-token"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.asyncio
async def test_operator_permissions_are_limited_to_operations(client: AsyncClient, db_session):
    operator = await client_with_role(client, db_session, "operator")
    assert (await operator.get("/api/v1/incidents/")).status_code == status.HTTP_200_OK
    assert (await operator.get("/api/v1/users/")).status_code == status.HTTP_403_FORBIDDEN
    assert (await operator.post("/api/v1/chaos/inject", json={"target_fault": "packet_loss"})).status_code == status.HTTP_403_FORBIDDEN
    profile = await operator.get("/api/v1/users/me")
    assert (
        await operator.patch(
            f"/api/v1/users/{profile.json()['id']}/role", json={"role": "admin"}
        )
    ).status_code == status.HTTP_403_FORBIDDEN
    incident = Incident(fingerprint="rbac-test-chain", title="RBAC test incident")
    db_session.add(incident)
    await db_session.flush()
    incident_id = incident.id
    await db_session.commit()
    response = await operator.patch(f"/api/v1/incidents/{incident_id}/resolve")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "resolved"


@pytest.mark.asyncio
async def test_admin_can_create_users_and_change_roles(client: AsyncClient, db_session):
    admin = await client_with_role(client, db_session, "admin")
    response = await admin.post(
        "/api/v1/users/",
        json={
            "username": "managed_operator",
            "email": "managed@example.com",
            "password": "synthetic-managed-password",
            "role": "operator",
        },
    )
    assert response.status_code == status.HTTP_201_CREATED
    created = response.json()
    assert created["role"] == "operator"
    assert "hashed_password" not in created
    stored = (
        await db_session.execute(
            select(User).where(User.username == "managed_operator")
        )
    ).scalar_one()
    assert verify_password("synthetic-managed-password", stored.hashed_password)

    listing = await admin.get("/api/v1/users/")
    assert listing.status_code == status.HTTP_200_OK
    assert all("hashed_password" not in user for user in listing.json())
    managed = next(user for user in listing.json() if user["username"] == "managed_operator")
    changed = await admin.patch(f"/api/v1/users/{managed['id']}/role", json={"role": "admin"})
    assert changed.status_code == status.HTTP_200_OK
    assert changed.json()["role"] == "admin"
    duplicate = await admin.post(
        "/api/v1/users/",
        json={
            "username": "managed_operator",
            "email": "managed@example.com",
            "password": "another-synthetic-password",
            "role": "viewer",
        },
    )
    assert duplicate.status_code == status.HTTP_409_CONFLICT


@pytest.mark.asyncio
async def test_last_active_admin_cannot_be_demoted(client: AsyncClient, db_session):
    admin = await client_with_role(client, db_session, "admin")
    profile = await admin.get("/api/v1/users/me")
    response = await admin.patch(
        f"/api/v1/users/{profile.json()['id']}/role", json={"role": "operator"}
    )
    assert response.status_code == status.HTTP_409_CONFLICT
    assert response.json()["detail"] == "The last active administrator cannot be demoted"


@pytest.mark.asyncio
async def test_admin_role_input_is_validated(client: AsyncClient, db_session):
    admin = await client_with_role(client, db_session, "admin")
    response = await admin.post(
        "/api/v1/users/",
        json={"username": "bad_role", "email": "bad-role@example.com", "password": "synthetic-password", "role": "root"},
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


@pytest.mark.asyncio
async def test_bootstrap_is_cli_only_and_refuses_existing_admin(
    client: AsyncClient, db_session, monkeypatch
):
    from app import main
    from app.cli import bootstrap_admin
    from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

    configure_bootstrap(monkeypatch)
    assert not any("bootstrap" in route.path for route in main.app.routes)
    await client_with_role(client, db_session, "admin")
    prompts = iter(["another_admin", "another@example.com"])
    monkeypatch.setattr("builtins.input", lambda _prompt: next(prompts))
    monkeypatch.setattr(bootstrap_admin, "getpass", lambda _prompt: "synthetic-bootstrap-password")
    class InteractiveStream:
        def isatty(self):
            return True

    monkeypatch.setattr(bootstrap_admin.sys, "stdin", InteractiveStream())
    monkeypatch.setattr(bootstrap_admin.sys, "stderr", InteractiveStream())
    test_session_factory = async_sessionmaker(
        bind=db_session.bind, class_=AsyncSession, expire_on_commit=False
    )
    monkeypatch.setattr(bootstrap_admin, "SessionLocal", test_session_factory)
    with pytest.raises(SystemExit, match="An administrator already exists"):
        await bootstrap_admin.bootstrap_admin()


@pytest.mark.asyncio
async def test_bootstrap_creates_hashed_admin_once(db_session, monkeypatch):
    from app.cli import bootstrap_admin
    from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

    prompts = iter(["first_admin", "first-admin@example.com"])
    passwords = iter(["synthetic-first-admin-password", "synthetic-first-admin-password"])
    monkeypatch.setattr("builtins.input", lambda _prompt: next(prompts))
    monkeypatch.setattr(bootstrap_admin, "getpass", lambda _prompt: next(passwords))

    class InteractiveStream:
        def isatty(self):
            return True

    monkeypatch.setattr(bootstrap_admin.sys, "stdin", InteractiveStream())
    monkeypatch.setattr(bootstrap_admin.sys, "stderr", InteractiveStream())
    configure_bootstrap(monkeypatch)
    test_session_factory = async_sessionmaker(
        bind=db_session.bind, class_=AsyncSession, expire_on_commit=False
    )
    monkeypatch.setattr(bootstrap_admin, "SessionLocal", test_session_factory)

    await bootstrap_admin.bootstrap_admin()
    user = (
        await db_session.execute(select(User).where(User.username == "first_admin"))
    ).scalar_one()
    assert user.role == "admin"
    assert verify_password("synthetic-first-admin-password", user.hashed_password)
    from app.db.models.audit_log import AuditLog

    bootstrap_event = (
        await db_session.execute(
            select(AuditLog).where(AuditLog.event_type == "user.created")
        )
    ).scalar_one()
    assert bootstrap_event.target_id == str(user.id)
    assert bootstrap_event.details == {
        "role": "admin",
        "creation_source": "local_cli_bootstrap",
    }

    monkeypatch.setattr(
        "builtins.input", lambda _prompt: pytest.fail("repeat bootstrap prompted for credentials")
    )
    with pytest.raises(SystemExit, match="An administrator already exists"):
        await bootstrap_admin.bootstrap_admin()


@pytest.mark.parametrize(
    ("environment", "database_url", "file_values", "process_values"),
    [
        ("development", LOCAL_DB_URL, {"DATABASE_URL": LOCAL_DB_URL}, {}),
        ("", LOCAL_DB_URL, {"ENVIRONMENT": "", "DATABASE_URL": LOCAL_DB_URL}, {}),
        ("staging", LOCAL_DB_URL, {"ENVIRONMENT": "staging", "DATABASE_URL": LOCAL_DB_URL}, {}),
        (
            "production",
            LOCAL_DB_URL,
            {"ENVIRONMENT": "development", "DATABASE_URL": LOCAL_DB_URL},
            {"ENVIRONMENT": "production"},
        ),
        (
            "development",
            LOCAL_DB_URL,
            {"ENVIRONMENT": "development", "DATABASE_URL": LOCAL_DB_URL},
            {
                "DATABASE_URL": "postgresql+asyncpg://other:synthetic-password@db.example.net:5432/cloud_sentinel"
            },
        ),
        ("development", LOCAL_DB_URL, {"ENVIRONMENT": "development"}, {}),
        ("production", LOCAL_DB_URL, {"ENVIRONMENT": "production", "DATABASE_URL": LOCAL_DB_URL}, {}),
        ("development", "", {"ENVIRONMENT": "development", "DATABASE_URL": ""}, {}),
        (
            "development",
            "postgresql+asyncpg://user:synthetic-password@db.example.net:5432/cloud_sentinel",
            {
                "ENVIRONMENT": "development",
                "DATABASE_URL": "postgresql+asyncpg://user:synthetic-password@db.example.net:5432/cloud_sentinel",
            },
            {},
        ),
        (
            "development",
            "sqlite+aiosqlite:///./local.db",
            {"ENVIRONMENT": "development", "DATABASE_URL": "sqlite+aiosqlite:///./local.db"},
            {},
        ),
        (
            "development",
            "postgresql+asyncpg://user:synthetic-password@postgres:5432/cloud_sentinel",
            {
                "ENVIRONMENT": "development",
                "DATABASE_URL": "postgresql+asyncpg://user:synthetic-password@postgres:5432/cloud_sentinel",
            },
            {},
        ),
    ],
    ids=[
        "missing-environment",
        "empty-environment",
        "unknown-environment",
        "conflicting-environment",
        "conflicting-database-url",
        "missing-database-url",
        "production-environment",
        "empty-database-url",
        "production-database",
        "unsupported-url",
        "ambiguous-service-host",
    ],
)
def test_bootstrap_target_fails_closed(
    monkeypatch, environment, database_url, file_values, process_values
):
    from app.cli import bootstrap_admin

    configure_bootstrap(monkeypatch, environment, database_url, file_values, process_values)
    with pytest.raises(SystemExit):
        bootstrap_admin.validate_bootstrap_target()


def test_bootstrap_target_accepts_explicit_local_development_database(monkeypatch):
    bootstrap_admin = configure_bootstrap(monkeypatch)
    target = bootstrap_admin.validate_bootstrap_target()
    assert target.url.host == "127.0.0.1"
    assert target.compose_target is None


def test_bootstrap_target_accepts_only_verified_local_compose_database(monkeypatch):
    compose_url = (
        "postgresql+asyncpg://local-user:synthetic-password@postgres:5432/cloud_sentinel"
    )
    bootstrap_admin = configure_bootstrap(monkeypatch, database_url=compose_url)
    monkeypatch.setattr(
        bootstrap_admin,
        "_verify_local_compose_database",
        lambda _url: bootstrap_admin.VerifiedComposeTarget("a" * 64, "172.20.0.4"),
    )

    resolved = bootstrap_admin.validate_bootstrap_target()

    assert resolved.url.host == "postgres"
    assert resolved.url.port == 5432
    assert resolved.url.database == "cloud_sentinel"
    assert resolved.compose_target.database_ip == "172.20.0.4"


def test_bootstrap_target_rejects_unverified_compose_database(monkeypatch):
    compose_url = (
        "postgresql+asyncpg://local-user:synthetic-password@postgres:5432/cloud_sentinel"
    )
    bootstrap_admin = configure_bootstrap(monkeypatch, database_url=compose_url)
    monkeypatch.setattr(
        bootstrap_admin, "_verify_local_compose_database", lambda _url: False
    )

    with pytest.raises(SystemExit, match="not a supported local development"):
        bootstrap_admin.validate_bootstrap_target()


def test_bootstrap_host_check_rejects_nonlocal_and_ambiguous_hosts():
    from app.cli import bootstrap_admin

    assert bootstrap_admin._resolve_local_database_host("127.0.0.1")
    assert bootstrap_admin._resolve_local_database_host("::1")
    assert not bootstrap_admin._resolve_local_database_host("db.example.net")
    assert not bootstrap_admin._resolve_local_database_host("postgres")


@pytest.mark.asyncio
async def test_bootstrap_refuses_noninteractive_terminal_before_database_access(monkeypatch):
    from app.cli import bootstrap_admin

    configure_bootstrap(monkeypatch)

    class NonInteractiveStream:
        def isatty(self):
            return False

    monkeypatch.setattr(bootstrap_admin.sys, "stdin", NonInteractiveStream())
    monkeypatch.setattr(bootstrap_admin.sys, "stderr", NonInteractiveStream())

    def database_access_must_not_happen():
        pytest.fail("non-interactive bootstrap attempted database access")

    monkeypatch.setattr(bootstrap_admin, "SessionLocal", database_access_must_not_happen)
    with pytest.raises(SystemExit, match="interactive terminal"):
        await bootstrap_admin.bootstrap_admin()


def test_compose_child_requires_matching_api_container_identity(monkeypatch):
    from app.cli import bootstrap_admin

    compose_url = (
        "postgresql+asyncpg://local-user:synthetic-password@postgres:5432/cloud_sentinel"
    )
    bootstrap = configure_bootstrap(monkeypatch, database_url=compose_url)
    target = bootstrap.VerifiedComposeTarget("a" * 64, "172.20.0.4")
    monkeypatch.setenv("HOSTNAME", "b" * 12)

    with pytest.raises(SystemExit, match="handoff could not be verified"):
        bootstrap.validate_bootstrap_target(target)


def test_compose_child_accepts_matching_api_container_identity(monkeypatch):
    from app.cli import bootstrap_admin

    compose_url = (
        "postgresql+asyncpg://local-user:synthetic-password@postgres:5432/cloud_sentinel"
    )
    bootstrap = configure_bootstrap(monkeypatch, database_url=compose_url)
    target = bootstrap.VerifiedComposeTarget("a" * 64, "172.20.0.4")
    monkeypatch.setenv("HOSTNAME", "a" * 12)

    resolved = bootstrap.validate_bootstrap_target(target)

    assert resolved.url.host == "postgres"
    assert resolved.compose_target == target


@pytest.mark.asyncio
async def test_host_bootstrap_hands_off_to_verified_api_container(monkeypatch):
    from types import SimpleNamespace
    from app.cli import bootstrap_admin

    compose_url = (
        "postgresql+asyncpg://local-user:synthetic-password@postgres:5432/cloud_sentinel"
    )
    bootstrap = configure_bootstrap(monkeypatch, database_url=compose_url)
    target = bootstrap.BootstrapTarget(
        url=bootstrap.make_url(compose_url),
        compose_target=bootstrap.VerifiedComposeTarget("a" * 64, "172.20.0.4"),
    )
    monkeypatch.setattr(
        bootstrap, "validate_bootstrap_target", lambda _child=None: target
    )

    class InteractiveStream:
        def isatty(self):
            return True

    monkeypatch.setattr(bootstrap.sys, "stdin", InteractiveStream())
    monkeypatch.setattr(bootstrap.sys, "stderr", InteractiveStream())
    calls = []

    def fake_run(args, check):
        calls.append((args, check))
        return SimpleNamespace(returncode=0)

    monkeypatch.setattr(bootstrap.subprocess, "run", fake_run)
    await bootstrap.bootstrap_admin()

    assert calls == [
        (
            [
                "docker", "exec", "-it", "sentinel-api-gateway", "python", "-c",
                "import asyncio,sys; from app.cli.bootstrap_admin import "
                "_bootstrap_verified_compose_child; "
                "asyncio.run(_bootstrap_verified_compose_child(sys.argv[1],sys.argv[2]))",
                "a" * 64,
                "172.20.0.4",
            ],
            False,
        )
    ]


@pytest.mark.asyncio
async def test_compose_child_rejects_wrong_database_identity_before_prompt(
    monkeypatch,
):
    from app.cli import bootstrap_admin

    compose_url = (
        "postgresql+asyncpg://local-user:synthetic-password@postgres:5432/cloud_sentinel"
    )
    bootstrap = configure_bootstrap(monkeypatch, database_url=compose_url)
    target = bootstrap.VerifiedComposeTarget("a" * 64, "172.20.0.4")
    monkeypatch.setenv("HOSTNAME", "a" * 12)
    monkeypatch.setattr(
        bootstrap,
        "validate_bootstrap_target",
        lambda _child=None: bootstrap.BootstrapTarget(
            url=bootstrap.make_url(compose_url), compose_target=target
        ),
    )

    class InteractiveStream:
        def isatty(self):
            return True

    class Result:
        def one(self):
            return ("unexpected_db", "local-user", "172.20.0.4/32")

    class Session:
        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args):
            return False

        async def execute(self, _query):
            return Result()

    monkeypatch.setattr(bootstrap.sys, "stdin", InteractiveStream())
    monkeypatch.setattr(bootstrap.sys, "stderr", InteractiveStream())
    monkeypatch.setattr(bootstrap, "SessionLocal", Session)
    monkeypatch.setattr(
        "builtins.input", lambda _prompt: pytest.fail("prompted before identity check")
    )

    with pytest.raises(SystemExit, match="database identity did not match"):
        await bootstrap.bootstrap_admin(target)


@pytest.mark.asyncio
async def test_websocket_rejects_anonymous_and_accepts_active_user(client, db_session):
    manager = ConnectionManager()
    anonymous_socket = AsyncMock()
    assert not await manager.connect(anonymous_socket, "telemetry", None, db_session)
    anonymous_socket.close.assert_awaited_once_with(code=1008, reason="Authentication required")
    anonymous_socket.accept.assert_not_awaited()

    await client.post(
        "/api/v1/auth/register",
        json={"username": "socket_user", "email": "socket@example.com", "password": "synthetic-socket-password"},
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={"username": "socket_user", "password": "synthetic-socket-password"},
    )
    socket = AsyncMock()
    assert await manager.connect(socket, "telemetry", login.json()["access_token"], db_session)
    socket.accept.assert_awaited_once()
    socket.send_json.assert_awaited_once()
    manager.disconnect(socket, "telemetry")
