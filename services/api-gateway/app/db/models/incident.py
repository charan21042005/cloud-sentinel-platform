from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import JSON, String, Text, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

# Engine-agnostic JSON definition: utilizes high-performance JSONB on PostgreSQL, falls back to standard JSON on SQLite test suite
JSONVariant = JSON().with_variant(JSONB, "postgresql")

from app.db.base import Base
from app.db.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class Incident(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Enterprise Incident Model optimized for high-throughput operational intelligence
    and automated forensic deduplication.
    """

    __tablename__ = "incidents"

    fingerprint: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    severity: Mapped[str] = mapped_column(
        String(50), default="low", index=True
    )  # info, low, medium, high, critical
    status: Mapped[str] = mapped_column(
        String(50), default="firing", index=True
    )  # firing, acknowledged, resolved
    source: Mapped[str] = mapped_column(String(100), default="Prometheus")
    affected_service: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Forensic Timestamps
    triggered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, index=True
    )
    acknowledged_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    resolved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Preserved JSON payloads for downstream AI Analysis
    labels: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONVariant, nullable=True)
    annotations: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSONVariant, nullable=True
    )
    raw_payload: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSONVariant, nullable=True
    )

    # Analytics and Auto-Triage Metadata
    occurrence_count: Mapped[int] = mapped_column(Integer, default=1)
    event_count: Mapped[int] = mapped_column(Integer, default=1)
    last_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )
    correlation_window: Mapped[int] = mapped_column(
        Integer, default=1800
    )  # Configurable deduplication expiry (seconds)
    escalation_level: Mapped[int] = mapped_column(Integer, default=0)

    # Relationship to immutable audit events
    events: Mapped[List["IncidentEvent"]] = relationship(
        "IncidentEvent",
        back_populates="incident",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class IncidentEvent(Base, UUIDPrimaryKeyMixin):
    """
    Immutable Forensic Audit Log tracking precise status mutations, escalations,
    and external triggers.
    """

    __tablename__ = "incident_events"

    incident_id: Mapped[Any] = mapped_column(
        ForeignKey("incidents.id", ondelete="CASCADE"), index=True
    )
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, index=True
    )
    actor: Mapped[str] = mapped_column(String(100), default="System")
    event_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSONVariant, nullable=True
    )

    incident: Mapped["Incident"] = relationship("Incident", back_populates="events")
