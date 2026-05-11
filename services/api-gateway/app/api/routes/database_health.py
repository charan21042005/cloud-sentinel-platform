from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.redis import redis_manager
from app.dependencies.database import get_db

router = APIRouter()


@router.get("/health/database", tags=["Infrastructure"])
async def health_database(db: AsyncSession = Depends(get_db)):
    """
    Validates PostgreSQL connectivity using a simple SELECT 1 query.
    """
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "healthy", "service": "postgresql"}
    except Exception as e:
        return {"status": "unhealthy", "service": "postgresql", "error": str(e)}


@router.get("/health/redis", tags=["Infrastructure"])
async def health_redis():
    """
    Validates Redis connectivity using a PING command.
    """
    try:
        if not redis_manager.redis:
            return {
                "status": "unhealthy",
                "service": "redis",
                "error": "Redis not initialized",
            }

        await redis_manager.redis.ping()
        return {"status": "healthy", "service": "redis"}
    except Exception as e:
        return {"status": "unhealthy", "service": "redis", "error": str(e)}
