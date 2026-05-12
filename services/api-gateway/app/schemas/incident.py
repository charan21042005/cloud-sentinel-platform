from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


# --- ALERTMANAGER INGESTION SCHEMAS ---

class AlertmanagerAlertItem(BaseModel):
    """Represents an individual alert inside the webhook payload array."""
    status: str  # firing or resolved
    labels: Dict[str, Any] = Field(default_factory=dict)
    annotations: Dict[str, Any] = Field(default_factory=dict)
    startsAt: Optional[str] = None
    endsAt: Optional[str] = None
    fingerprint: Optional[str] = None


class AlertmanagerWebhookPayload(BaseModel):
    """The root payload schema POSTed by Alertmanager."""
    receiver: str
    status: str
    alerts: List[AlertmanagerAlertItem]
    groupLabels: Dict[str, Any] = Field(default_factory=dict)
    commonLabels: Dict[str, Any] = Field(default_factory=dict)
    commonAnnotations: Dict[str, Any] = Field(default_factory=dict)


# --- INTERNAL & FRONTEND DTO CONTRACTS ---

class IncidentBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    severity: str = Field(default="low")
    status: str = Field(default="firing")
    source: str = Field(default="Prometheus")
    affected_service: Optional[str] = None


class IncidentCreate(IncidentBase):
    fingerprint: str
    labels: Optional[Dict[str, Any]] = None
    annotations: Optional[Dict[str, Any]] = None
    raw_payload: Optional[Dict[str, Any]] = None
    triggered_at: Optional[datetime] = None


class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    escalation_level: Optional[int] = None
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None


class IncidentEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    incident_id: UUID
    event_type: str
    timestamp: datetime
    actor: str
    event_metadata: Optional[Dict[str, Any]] = None


class IncidentResponse(IncidentBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    fingerprint: str
    triggered_at: datetime
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    labels: Optional[Dict[str, Any]] = None
    annotations: Optional[Dict[str, Any]] = None
    occurrence_count: int
    event_count: int
    last_seen_at: datetime
    escalation_level: int
    events: Optional[List[IncidentEventResponse]] = None
