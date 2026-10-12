from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.audit_log import AuditLog


class AuditRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_page(self, skip: int, limit: int) -> tuple[list[AuditLog], bool]:
        result = await self.db.execute(
            select(AuditLog)
            .order_by(AuditLog.created_at.desc(), AuditLog.id.desc())
            .offset(skip)
            .limit(limit + 1)
        )
        rows = list(result.scalars().all())
        has_more = len(rows) > limit
        return rows[:limit], has_more
