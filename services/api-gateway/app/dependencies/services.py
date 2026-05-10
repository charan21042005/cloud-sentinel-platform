from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.database import get_db
from app.repositories.user_repository import UserRepository
from app.repositories.incident_repository import IncidentRepository
from app.services.user_service import UserService
from app.services.incident_service import IncidentService
from app.db.models.user import User
from app.db.models.incident import Incident

async def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    repo = UserRepository(User, db)
    return UserService(repo)

async def get_incident_service(db: AsyncSession = Depends(get_db)) -> IncidentService:
    repo = IncidentRepository(Incident, db)
    return IncidentService(repo)
