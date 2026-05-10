from datetime import datetime
from uuid import UUID
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class IncidentBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    description: Optional[str] = None
    severity: str = Field(default="low")
    status: str = Field(default="open")

class IncidentCreate(IncidentBase):
    pass

class IncidentResponse(IncidentBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime
