from fastapi import APIRouter
from app.api.routes import health, database_health

api_router = APIRouter()

# Infrastructure & Health
api_router.include_router(health.router)
api_router.include_router(database_health.router)
