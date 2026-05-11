import pytest
from fastapi import status
from httpx import AsyncClient


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
