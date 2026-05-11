from typing import List
from fastapi import APIRouter, Depends, status
from app.schemas.incident import IncidentCreate, IncidentResponse
from app.services.incident_service import IncidentService
from app.dependencies.services import get_incident_service
from app.dependencies.auth import get_current_user
from app.db.models.user import User

# Prefix and tags are now handled by the central api_router
router = APIRouter()

@router.post("/", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident(
    incident_in: IncidentCreate, 
    service: IncidentService = Depends(get_incident_service),
    current_user: User = Depends(get_current_user)
):
    """
    Log a new incident or platform event.
    Requires Authentication.
    """
    return await service.create_incident(incident_in)

@router.get("/", response_model=List[IncidentResponse])
async def list_incidents(
    skip: int = 0, 
    limit: int = 100, 
    service: IncidentService = Depends(get_incident_service),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve a paginated list of platform incidents.
    Requires Authentication.
    """
    return await service.list_incidents(skip=skip, limit=limit)
