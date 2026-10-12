import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy import select

from app.core.security import verify_password
from app.db.models.user import User


@pytest.mark.asyncio
async def test_auth_registration_flow(client: AsyncClient):
    """
    Test a complete registration and duplicate prevention flow.
    """
    user_data = {
        "username": "test_sentinel",
        "email": "sentinel@test.com",
        "password": "securepassword123",
    }

    # 1. Successful Registration
    response = await client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["username"] == user_data["username"]
    assert data["email"] == user_data["email"]
    assert "id" in data

    # 2. Duplicate Username Rejection
    duplicate_user = {
        "username": "test_sentinel",
        "email": "different@test.com",
        "password": "newpassword123",
    }
    response = await client.post("/api/v1/auth/register", json=duplicate_user)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Username already taken" in response.json()["detail"]


@pytest.mark.asyncio
async def test_auth_login_flow(client: AsyncClient):
    """
    Test successful login and JWT issuance.
    """
    # Pre-register a user
    user_data = {
        "username": "login_user",
        "email": "login@test.com",
        "password": "password123",
    }
    await client.post("/api/v1/auth/register", json=user_data)

    # 1. Successful Login
    login_data = {"username": "login_user", "password": "password123"}
    response = await client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

    # 2. Invalid Password Failure
    bad_login = {"username": "login_user", "password": "wrongpassword"}
    response = await client.post("/api/v1/auth/login", json=bad_login)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Incorrect username or password" in response.json()["detail"]


@pytest.mark.asyncio
async def test_registration_persists_only_a_password_hash(client: AsyncClient, db_session):
    password = "test-only-password-482"
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "username": "hash_check_user",
            "email": "hash-check@example.com",
            "password": password,
        },
    )

    assert response.status_code == status.HTTP_201_CREATED
    result = await db_session.execute(
        select(User).where(User.username == "hash_check_user")
    )
    user = result.scalar_one()
    assert user.hashed_password != password
    assert verify_password(password, user.hashed_password)
    assert user.role == "viewer"


@pytest.mark.asyncio
async def test_public_registration_ignores_attempted_role_escalation(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "username": "role_spoof_user",
            "email": "role-spoof@example.com",
            "password": "test-only-password-483",
            "role": "admin",
        },
    )
    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()["role"] == "viewer"
    assert "hashed_password" not in response.json()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "payload",
    [
        {"username": "ab", "email": "valid@example.com", "password": "long-enough-password"},
        {"username": "valid_user", "email": "invalid-email", "password": "long-enough-password"},
        {"username": "valid_user", "email": "valid@example.com", "password": "short"},
        {"username": "valid_user", "email": "valid@example.com", "password": "😀" * 19},
    ],
)
async def test_registration_rejects_invalid_fields(client: AsyncClient, payload):
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
