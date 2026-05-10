from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Text, DateTime, func
from app.db.base import Base
from app.db.mixins import UUIDPrimaryKeyMixin

class AuditLog(Base, UUIDPrimaryKeyMixin):
    """
    Immutable Audit Log for platform security and event tracing.
    """
    __tablename__ = "audit_logs"

    event_type: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Audit logs are immutable, only creation time is needed
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(),
        nullable=False
    )
