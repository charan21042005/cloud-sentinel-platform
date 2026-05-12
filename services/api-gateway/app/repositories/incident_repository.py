from typing import Optional, Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models.incident import Incident, IncidentEvent
from app.repositories.base import BaseRepository


class IncidentRepository(BaseRepository[Incident]):
    """
    Incident-specific Repository optimized for active event chains,
    fingerprint correlation, and eager relationship loading.
    """

    def __init__(self, db: AsyncSession):
        super().__init__(Incident, db)

    async def get_active_by_fingerprint(self, fingerprint: str) -> Optional[Incident]:
        """
        Retrieves an active (non-resolved) incident matching the unique fingerprint.
        Eagerly loads the immutable audit event list.
        """
        query = (
            select(Incident)
            .where(Incident.fingerprint == fingerprint)
            .where(Incident.status != "resolved")
            .options(selectinload(Incident.events))
            .order_by(Incident.triggered_at.desc())
            .limit(1)
        )
        result = await self.db.execute(query)
        return result.scalars().first()

    async def get_with_events(self, incident_id: any) -> Optional[Incident]:
        """Retrieves an incident by ID with eagerly loaded events."""
        query = (
            select(Incident)
            .where(Incident.id == incident_id)
            .options(selectinload(Incident.events))
        )
        result = await self.db.execute(query)
        return result.scalars().first()

    async def list_active(self, skip: int = 0, limit: int = 100) -> Sequence[Incident]:
        """Retrieves active operational incidents for the primary SRE dashboard."""
        query = (
            select(Incident)
            .options(selectinload(Incident.events))
            .order_by(Incident.status.asc(), Incident.triggered_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return result.scalars().all()

    async def create_event(self, event: IncidentEvent) -> IncidentEvent:
        """Appends an immutable timeline event directly to the session."""
        self.db.add(event)
        await self.db.commit()
        await self.db.refresh(event)
        return event
