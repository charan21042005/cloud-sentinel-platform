from fastapi import APIRouter

from app.api.routes import database_health, health
from app.api.v1.routes import incidents, users

api_router = APIRouter()

# Infrastructure & Health (Root Level)
api_router.include_router(health.router)
api_router.include_router(database_health.router)

# API v1 (Domain Level)
from app.api.v1.routes import auth, incidents, users

api_router.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
api_router.include_router(
    incidents.router, prefix="/api/v1/incidents", tags=["Incidents"]
)
