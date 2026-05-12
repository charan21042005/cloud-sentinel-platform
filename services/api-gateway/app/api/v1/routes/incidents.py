from typing import List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status

from app.db.models.user import User
from app.dependencies.auth import get_current_user
from app.dependencies.services import get_incident_service
from app.schemas.incident import (
    AlertmanagerWebhookPayload,
    IncidentResponse,
)
from app.services.incident_service import IncidentService

router = APIRouter()


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def alertmanager_webhook(
    payload: AlertmanagerWebhookPayload,
    service: IncidentService = Depends(get_incident_service),
) -> Dict[str, Any]:
    """
    Enterprise Alertmanager Webhook Receiver.
    Ingests raw alert batches, extracts cryptographic signatures, executes automated 
    deduplication loops, and registers immutable forensic events.
    Internal monitoring route.
    """
    processed = await service.process_webhook(payload)
    return {
        "status": "success",
        "message": f"Processed batch containing {len(payload.alerts)} alerts.",
        "correlated_chains": len(processed),
    }


@router.get("/", response_model=List[IncidentResponse])
async def list_active_incidents(
    skip: int = 0,
    limit: int = 100,
    service: IncidentService = Depends(get_incident_service),
    current_user: User = Depends(get_current_user),
):
    """
    SRE Control Plane Operational API.
    Retrieves active incident chains populated with real-time occurrence counts,
    escalation histories, and immutable forensic timelines.
    Requires Authentication.
    """
    return await service.list_incidents(skip=skip, limit=limit)


@router.patch("/{incident_id}/acknowledge", response_model=IncidentResponse)
async def acknowledge_incident(
    incident_id: UUID,
    service: IncidentService = Depends(get_incident_service),
    current_user: User = Depends(get_current_user),
):
    """
    Operator Manual Override.
    Acknowledges active chains, silencing paging loops and assigning user actor attribution.
    Requires Authentication.
    """
    incident = await service.acknowledge_incident(incident_id, actor=current_user.username)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active incident chain not found or already resolved.",
        )
    return incident


@router.patch("/{incident_id}/resolve", response_model=IncidentResponse)
async def resolve_incident(
    incident_id: UUID,
    service: IncidentService = Depends(get_incident_service),
    current_user: User = Depends(get_current_user),
):
    """
    Operator Manual Override.
    Terminates persistent incident chains and marks lifecycle resolution.
    Requires Authentication.
    """
    incident = await service.resolve_incident(incident_id, actor=current_user.username)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active incident chain not found or already resolved.",
        )
    return incident
