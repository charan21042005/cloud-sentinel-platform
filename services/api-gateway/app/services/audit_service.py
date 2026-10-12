from typing import Any, Optional
from uuid import UUID

from app.db.models.audit_log import AuditLog
from app.repositories.audit_repository import AuditRepository


class AuditService:
    """Append-only application interface for audit event creation and listing."""

    def __init__(self, repository: AuditRepository):
        self.repository = repository

    def stage(
        self,
        event_type: str,
        message: str,
        *,
        actor_user_id: Optional[UUID] = None,
        outcome: str = "success",
        target_type: Optional[str] = None,
        target_id: Optional[str] = None,
        details: Optional[dict[str, Any]] = None,
    ) -> AuditLog:
        """Add an event to the current unit of work for atomic operation logging."""
        event = AuditLog(
            event_type=event_type,
            message=message,
            actor_user_id=actor_user_id,
            outcome=outcome,
            target_type=target_type,
            target_id=target_id,
            details=details,
        )
        self.repository.db.add(event)
        return event

    async def record(
        self,
        event_type: str,
        message: str,
        *,
        actor_user_id: Optional[UUID] = None,
        outcome: str = "success",
        target_type: Optional[str] = None,
        target_id: Optional[str] = None,
        details: Optional[dict[str, Any]] = None,
    ) -> AuditLog:
        event = self.stage(
            event_type, message, actor_user_id=actor_user_id, outcome=outcome,
            target_type=target_type, target_id=target_id, details=details,
        )
        await self.repository.db.commit()
        await self.repository.db.refresh(event)
        return event

    async def list_page(self, skip: int, limit: int) -> tuple[list[AuditLog], bool]:
        return await self.repository.list_page(skip, limit)
