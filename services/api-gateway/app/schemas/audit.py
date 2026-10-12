from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AuditEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    event_type: str
    message: str
    actor_user_id: Optional[UUID] = None
    outcome: Optional[str] = None
    target_type: Optional[str] = None
    target_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    created_at: datetime


class AuditEventPage(BaseModel):
    items: list[AuditEventResponse]
    skip: int
    limit: int
    has_more: bool
