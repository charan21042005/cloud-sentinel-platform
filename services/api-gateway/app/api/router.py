from fastapi import APIRouter
from app.api.routes.health import router as health_router

api_router = APIRouter()

# Include infrastructure routes at the root level of this router
api_router.include_router(health_router)

# Future domain routers can be added here with prefixes:
# api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
