from typing import List
from fastapi import APIRouter, Depends, status
from app.schemas.incident import IncidentCreate, IncidentResponse
from app.services.incident_service import IncidentService
from app.dependencies.services import get_incident_service

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.post("/", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident(
    incident_in: IncidentCreate, 
    service: IncidentService = Depends(get_incident_service)
):
    """
    Log a new incident or platform event.
    """
    return await service.create_incident(incident_in)

@router.get("/", response_model=List[IncidentResponse])
async def list_incidents(
    skip: int = 0, 
    limit: int = 100, 
    service: IncidentService = Depends(get_incident_service)
):
    """
    Retrieve a paginated list of platform incidents.
    """
    return await service.list_incidents(skip=skip, limit=limit)
