from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.incident import Incident
from app.db.models.user import User
from app.dependencies.database import get_db
from app.repositories.incident_repository import IncidentRepository
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.services.incident_service import IncidentService
from app.services.user_service import UserService


async def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    repo = UserRepository(db)
    return UserService(repo)


async def get_incident_service(db: AsyncSession = Depends(get_db)) -> IncidentService:
    repo = IncidentRepository(db)
    return IncidentService(repo)


async def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    repo = UserRepository(db)
    return AuthService(repo)
