from typing import Sequence
from app.repositories.incident_repository import IncidentRepository
from app.schemas.incident import IncidentCreate
from app.db.models.incident import Incident
from app.core.logging import logger

class IncidentService:
    def __init__(self, incident_repo: IncidentRepository):
        self.incident_repo = incident_repo

    async def create_incident(self, incident_in: IncidentCreate) -> Incident:
        logger.info(f"Logging new incident: {incident_in.title}")
        return await self.incident_repo.create(incident_in.model_dump())

    async def list_incidents(self, skip: int = 0, limit: int = 100) -> Sequence[Incident]:
        return await self.incident_repo.list(skip=skip, limit=limit)
