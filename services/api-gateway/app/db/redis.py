from redis import asyncio as aioredis

from app.core.config import settings
from app.core.logging import logger


class RedisManager:
    """
    Centralized manager for Async Redis connections.
    """

    def __init__(self):
        self.redis: aioredis.Redis | None = None

    async def connect(self):
        """Initialize Redis connection pool"""
        if not self.redis:
            self.redis = aioredis.from_url(
                settings.REDIS_URL, encoding="utf-8", decode_responses=True
            )
            logger.info("📡 Redis connection pool initialized.")

    async def disconnect(self):
        """Close Redis connection pool"""
        if self.redis:
            await self.redis.close()
            logger.info("🔌 Redis connection pool closed.")


# Global Redis manager instance
redis_manager = RedisManager()
