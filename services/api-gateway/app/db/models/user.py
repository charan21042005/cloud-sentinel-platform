from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Boolean, DateTime
from app.db.base import Base
from app.db.mixins import UUIDPrimaryKeyMixin, TimestampMixin
from datetime import datetime

class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    User Model representing the platform's core identity.
    """
    __tablename__ = "users"

    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="viewer", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
