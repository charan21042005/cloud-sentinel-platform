from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.incident import Incident
from app.db.models.user import User
from app.dependencies.database import get_db
from app.dependencies.auth import require_operator, require_viewer
from app.dependencies.services import get_incident_service
from app.schemas.incident import (
    AlertmanagerWebhookPayload,
    IncidentResponse,
)
from app.services.incident_service import IncidentService

router = APIRouter()


@router.get("/analytics")
async def incident_analytics(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_viewer),
):
    """Aggregate stored incident records; this is not an external threat feed."""
    date_bucket = func.date(Incident.triggered_at)
    daily_result = await db.execute(
        select(date_bucket, func.count(Incident.id))
        .group_by(date_bucket)
        .order_by(date_bucket.desc())
        .limit(30)
    )
    severity_result = await db.execute(
        select(Incident.severity, func.count(Incident.id)).group_by(Incident.severity)
    )
    status_result = await db.execute(
        select(Incident.status, func.count(Incident.id)).group_by(Incident.status)
    )
    total = await db.scalar(select(func.count(Incident.id)))
    since = datetime.now(timezone.utc) - timedelta(hours=24)
    recent = await db.scalar(
        select(func.count(Incident.id)).where(Incident.triggered_at >= since)
    )
    daily = [
        {"date": str(day), "count": count}
        for day, count in reversed(daily_result.all())
    ]
    return {
        "total_incidents": int(total or 0),
        "recent_24h_count": int(recent or 0),
        "daily_counts": daily,
        "severity_counts": [
            {"severity": key, "count": count} for key, count in severity_result.all()
        ],
        "status_counts": [
            {"status": key, "count": count} for key, count in status_result.all()
        ],
    }


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def alertmanager_webhook(
    payload: AlertmanagerWebhookPayload,
    service: IncidentService = Depends(get_incident_service),
    _operator: User = Depends(require_operator),
) -> Dict[str, Any]:
    """
    Enterprise Alertmanager Webhook Receiver.
    Ingests raw alert batches, extracts cryptographic signatures, executes automated
    deduplication loops, and records incident timeline events.
    Internal monitoring route.
    """
    processed = await service.process_webhook(payload, actor_user_id=_operator.id)
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
    current_user: User = Depends(require_viewer),
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
    current_user: User = Depends(require_operator),
):
    """
    Operator Manual Override.
    Acknowledges active chains, silencing paging loops and assigning user actor attribution.
    Requires Authentication.
    """
    incident = await service.acknowledge_incident(
        incident_id, actor=current_user.username, actor_user_id=current_user.id
    )
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
    current_user: User = Depends(require_operator),
):
    """
    Operator Manual Override.
    Terminates persistent incident chains and marks lifecycle resolution.
    Requires Authentication.
    """
    incident = await service.resolve_incident(
        incident_id, actor=current_user.username, actor_user_id=current_user.id
    )
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active incident chain not found or already resolved.",
        )
    return incident
