from fastapi import APIRouter
from app.api.routes import health, database_health
from app.api.v1.routes import auth, users, incidents, telemetry, chaos

api_router = APIRouter()

# Infrastructure & Health (Root Level)
api_router.include_router(health.router)
api_router.include_router(database_health.router)

# API v1 (Domain Level)
api_router.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
api_router.include_router(
    incidents.router, prefix="/api/v1/incidents", tags=["Incidents"]
)
api_router.include_router(
    telemetry.router, prefix="/api/v1/telemetry", tags=["Telemetry & Observability"]
)
api_router.include_router(
    chaos.router, prefix="/api/v1/chaos", tags=["Chaos Engineering"]
)
