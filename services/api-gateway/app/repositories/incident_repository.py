from app.db.models.incident import Incident
from app.repositories.base import BaseRepository
from sqlalchemy.ext.asyncio import AsyncSession

class IncidentRepository(BaseRepository[Incident]):
    """
    Incident-specific Repository.
    """
    def __init__(self, db: AsyncSession):
        super().__init__(Incident, db)
