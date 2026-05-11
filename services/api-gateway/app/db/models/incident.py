from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class Incident(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Incident Model representing cloud-native platform events and alerts.
    """

    __tablename__ = "incidents"

    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    severity: Mapped[str] = mapped_column(
        String(50), default="low", index=True
    )  # low, medium, high, critical
    status: Mapped[str] = mapped_column(
        String(50), default="open", index=True
    )  # open, investigating, resolved, closed
