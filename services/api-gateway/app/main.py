from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.logging import logger, setup_logging
from app.db.redis import redis_manager
from app.db.session import engine

# Initialize structured logging
setup_logging()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """
    Lifecycle manager for Cloud Sentinel API.
    Handles startup and shutdown of critical infrastructure connections.
    """
    # --- Startup ---
    logger.info("🎬 Initializing Cloud Sentinel Platform...")

    # Initialize Redis connection pool
    try:
        await redis_manager.connect()
        logger.info("✅ Redis connected successfully.")
    except Exception as e:
        logger.error(f"❌ Redis connection failed: {e}")

    # Validate Database connectivity
    try:
        # Pre-ping is handled by SQLAlchemy engine, but we do a test connection here
        async with engine.connect() as conn:
            logger.info("✅ PostgreSQL connected successfully.")
    except Exception as e:
        logger.error(f"❌ PostgreSQL connection failed: {e}")

    yield

    # --- Shutdown ---
    logger.info("🛑 Shutting down Cloud Sentinel Platform...")

    # Close Redis
    await redis_manager.disconnect()

    # Close Database Engine
    await engine.dispose()
    logger.info("🔌 Database and Cache connections closed.")


def create_application() -> FastAPI:
    """
    App Factory for Cloud Sentinel API Gateway.
    """
    application = FastAPI(
        title="Cloud Sentinel API Gateway",
        version="1.0.0",
        description="Scalable API Gateway for Cloud Sentinel Observability Platform",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # Standard Middleware
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount the central router
    application.include_router(api_router)

    return application


app = create_application()
