from typing import Sequence

from app.core.logging import logger
from app.db.models.incident import Incident
from app.repositories.incident_repository import IncidentRepository
from app.schemas.incident import IncidentCreate


class IncidentService:
    def __init__(self, incident_repo: IncidentRepository):
        self.incident_repo = incident_repo

    async def create_incident(self, incident_in: IncidentCreate) -> Incident:
        """
        Create and persist a new platform incident.
        """
        logger.info(f"Logging new incident: {incident_in.title}")
        incident_obj = Incident(**incident_in.model_dump())
        return await self.incident_repo.create(incident_obj)

    async def list_incidents(
        self, skip: int = 0, limit: int = 100
    ) -> Sequence[Incident]:
        """
        Retrieve a list of platform incidents.
        """
        return await self.incident_repo.list(skip=skip, limit=limit)
