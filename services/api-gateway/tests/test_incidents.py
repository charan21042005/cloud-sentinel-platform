import pytest
from fastapi import status
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_incident_authenticated(auth_client: AsyncClient):
    """
    Validate that an authenticated sentinel can log a new incident.
    """
    incident_data = {
        "title": "Critical System Failure",
        "description": "Kernel panic detected on production node 01",
        "severity": "critical",
        "service_name": "compute-engine",
    }

    response = await auth_client.post("/api/v1/incidents/", json=incident_data)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == incident_data["title"]
    assert data["status"] == "open"


@pytest.mark.asyncio
async def test_list_incidents_authenticated(auth_client: AsyncClient):
    """
    Validate that incidents can be retrieved by authenticated users.
    """
    response = await auth_client.get("/api/v1/incidents/")
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_incident_access_unauthorized(client: AsyncClient):
    """
    Ensure incident creation is blocked for unauthenticated users.
    """
    response = await client.post("/api/v1/incidents/", json={})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
