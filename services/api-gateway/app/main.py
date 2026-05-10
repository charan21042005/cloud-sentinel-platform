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
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="Scalable API Gateway for Cloud Sentinel Observability Platform",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # Set all CORS enabled origins
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, replace with specific origins
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include centralized router
    application.include_router(api_router, prefix=settings.API_V1_STR)

    @application.on_event("startup")
    async def startup_event():
        logger.info(f"🚀 Starting {settings.PROJECT_NAME} in {settings.ENVIRONMENT} mode")

    return application

app = create_application()
