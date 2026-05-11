import pytest
from httpx import AsyncClient
from fastapi import status

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
