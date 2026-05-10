from fastapi import APIRouter
from app.api.routes import health, database_health
from app.api.v1.routes import users, incidents

api_router = APIRouter()

# Infrastructure & Health (Root Level)
api_router.include_router(health.router)
api_router.include_router(database_health.router)

# API v1 (Domain Level)
api_router.include_router(users.router, prefix="/api/v1")
api_router.include_router(incidents.router, prefix="/api/v1")
