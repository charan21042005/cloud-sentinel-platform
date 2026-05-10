from app.db.models.incident import Incident
from app.repositories.base import BaseRepository

class IncidentRepository(BaseRepository[Incident]):
    """
    Incident-specific Repository.
    """
    pass
