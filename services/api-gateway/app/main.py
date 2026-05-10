from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.logging import logger

def create_application() -> FastAPI:
    """
    App Factory for Cloud Sentinel API Gateway.
    """
    application = FastAPI(
        title="Cloud Sentinel API Gateway",
        version="1.0.0",
        description="Scalable API Gateway for Cloud Sentinel Observability Platform",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # Standard Middleware
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount the central router at the root level
    # This allows /health to be accessed directly at http://localhost:8000/health
    application.include_router(api_router)

    @application.on_event("startup")
    async def startup_event():
        logger.info(f"Starting {settings.PROJECT_NAME} in {settings.ENVIRONMENT} mode")

    return application

app = create_application()
