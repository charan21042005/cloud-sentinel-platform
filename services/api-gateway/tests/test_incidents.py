import pytest
from fastapi import status
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_alertmanager_webhook(client: AsyncClient):
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

    response = await client.post("/api/v1/incidents/webhook", json=webhook_payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "success"
    assert data["correlated_chains"] == 1


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
