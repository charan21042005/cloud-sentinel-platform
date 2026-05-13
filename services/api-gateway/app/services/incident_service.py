import hashlib
import json
from datetime import datetime, timezone
from typing import Optional, Sequence, List

from app.core.logging import logger
from app.db.models.incident import Incident, IncidentEvent
from app.repositories.incident_repository import IncidentRepository
from app.schemas.incident import (
    AlertmanagerWebhookPayload,
    IncidentCreate,
    IncidentUpdate,
    IncidentResponse,
)
from app.services.websocket.manager import websocket_manager


class IncidentService:
    """
    Enterprise Correlation Engine handling high-speed Alertmanager webhooks,
    deterministic deduplication fingerprinting, auto-resolution routines,
    and forensic audit logging.
    """

    def __init__(self, incident_repo: IncidentRepository):
        self.incident_repo = incident_repo

    @staticmethod
    def _generate_fingerprint(labels: dict) -> str:
        """Generates a deterministic SHA-256 fingerprint from alert labels."""
        if not labels:
            return hashlib.sha256(b"unknown_alert").hexdigest()[:16]
        sorted_labels = sorted(labels.items())
        label_str = json.dumps(sorted_labels)
        return hashlib.sha256(label_str.encode()).hexdigest()[:16]

    async def process_webhook(
        self, payload: AlertmanagerWebhookPayload
    ) -> List[Incident]:
        """
        Primary entrypoint for the SRE Observability Control Plane.
        Iterates over Alertmanager batch payloads, applying correlation windows
        and managing persistent event chains.
        """
        processed_incidents = []
        receiver = payload.receiver
        source = f"Alertmanager ({receiver})"

        for alert in payload.alerts:
            # 1. Deduplication fingerprinting
            fingerprint = alert.fingerprint or self._generate_fingerprint(alert.labels)
            alertname = alert.labels.get("alertname", "PlatformAnomaly")
            severity = alert.labels.get("severity", "warning").lower()
            summary = (
                alert.annotations.get("summary") or f"Alert triggered: {alertname}"
            )
            affected_service = alert.labels.get("instance") or alert.labels.get(
                "service"
            )

            # Check if active chain exists
            active_incident = await self.incident_repo.get_active_by_fingerprint(
                fingerprint
            )

            if alert.status == "firing":
                now_utc = datetime.now(timezone.utc)
                if active_incident:
                    # Apply Correlation Window logic
                    # If last seen is within the window, correlate
                    window_seconds = active_incident.correlation_window
                    elapsed = (
                        now_utc
                        - active_incident.last_seen_at.replace(tzinfo=timezone.utc)
                    ).total_seconds()

                    if elapsed <= window_seconds:
                        logger.info(
                            f"[Correlation Engine] Correlating duplicate alert into chain [{active_incident.id}]"
                        )
                        active_incident.occurrence_count += 1
                        active_incident.event_count += 1
                        active_incident.last_seen_at = now_utc
                        active_incident.raw_payload = alert.model_dump()

                        # Check for severity escalation
                        if (
                            severity == "critical"
                            and active_incident.severity != "critical"
                        ):
                            active_incident.severity = "critical"
                            active_incident.escalation_level += 1
                            await self._append_event(
                                active_incident,
                                "severity_changed",
                                "Alertmanager",
                                {"new_severity": "critical"},
                            )

                        await self.incident_repo.db.commit()
                        await self.incident_repo.db.refresh(active_incident)
                        processed_incidents.append(active_incident)

                        # Add audit log for correlation detection
                        await self._append_event(
                            active_incident,
                            "correlation_detected",
                            "Alertmanager",
                            {"fingerprint": fingerprint},
                        )

                        # Fanout WebSocket broadcast notifying real-time SOC fabric
                        try:
                            fresh_incident = await self.incident_repo.get_with_events(
                                active_incident.id
                            )
                            if fresh_incident:
                                dto = IncidentResponse.model_validate(
                                    fresh_incident
                                ).model_dump(mode="json")
                                await websocket_manager.broadcast(
                                    "incidents",
                                    {
                                        "event": "incident_updated",
                                        "mutation": "correlation",
                                        "data": dto,
                                    },
                                )
                        except Exception as e:
                            logger.warning(
                                f"[WebSocket Broadcaster] Error fanning out correlation: {e}"
                            )

                        continue
                    else:
                        logger.info(
                            "[Correlation Engine] Chain expired. Creating fresh incident chain."
                        )
                        # Active chain exists but outside correlation window. Resolve old chain.
                        await self.resolve_incident(
                            active_incident.id, "System Auto-Expiry"
                        )

                # Create fresh incident chain
                logger.info(f"[Incident Engine] Creating new incident chain: {summary}")
                create_dto = IncidentCreate(
                    title=summary,
                    description=alert.annotations.get("description"),
                    severity=severity,
                    status="firing",
                    source=source,
                    affected_service=affected_service,
                    fingerprint=fingerprint,
                    labels=alert.labels,
                    annotations=alert.annotations,
                    raw_payload=alert.model_dump(),
                )
                new_incident = Incident(**create_dto.model_dump())
                persisted = await self.incident_repo.create(new_incident)

                # Initialize timeline audit history
                await self._append_event(
                    persisted,
                    "triggered",
                    "Alertmanager",
                    {"initial_severity": severity},
                )
                processed_incidents.append(persisted)

                # Fanout WebSocket broadcast notifying real-time SOC fabric of newly spawned anomalies
                try:
                    fresh_persisted = await self.incident_repo.get_with_events(
                        persisted.id
                    )
                    if fresh_persisted:
                        dto = IncidentResponse.model_validate(
                            fresh_persisted
                        ).model_dump(mode="json")
                        await websocket_manager.broadcast(
                            "incidents",
                            {
                                "event": "incident_created",
                                "mutation": "triggered",
                                "data": dto,
                            },
                        )
                except Exception as e:
                    logger.warning(
                        f"[WebSocket Broadcaster] Error fanning out incident creation: {e}"
                    )

            elif alert.status == "resolved" and active_incident:
                logger.info(
                    f"[Incident Engine] Auto-resolving incident chain [{active_incident.id}]"
                )
                resolved = await self.resolve_incident(
                    active_incident.id, "Alertmanager Auto-Resolve"
                )
                if resolved:
                    processed_incidents.append(resolved)

        return processed_incidents

    async def _append_event(
        self,
        incident: Incident,
        event_type: str,
        actor: str,
        metadata: Optional[dict] = None,
    ) -> IncidentEvent:
        """Appends an immutable log event to the forensic timeline."""
        event = IncidentEvent(
            incident_id=incident.id,
            event_type=event_type,
            actor=actor,
            event_metadata=metadata,
            timestamp=datetime.now(timezone.utc),
        )
        incident.event_count += 1
        return await self.incident_repo.create_event(event)

    async def list_incidents(
        self, skip: int = 0, limit: int = 100
    ) -> Sequence[Incident]:
        """Retrieves hydrated incident domains for frontend execution dashboards."""
        return await self.incident_repo.list_active(skip=skip, limit=limit)

    async def acknowledge_incident(
        self, incident_id: any, actor: str
    ) -> Optional[Incident]:
        """Silences notifications and assigns initial SRE ownership."""
        incident = await self.incident_repo.get_with_events(incident_id)
        if not incident or incident.status == "resolved":
            return None

        incident.status = "acknowledged"
        incident.acknowledged_at = datetime.now(timezone.utc)
        await self._append_event(
            incident, "acknowledged", actor, {"action": "Acknowledged by SRE"}
        )
        await self.incident_repo.db.commit()
        await self.incident_repo.db.refresh(incident)

        # Broadcast live operational mutations to synchronize SOC teams
        try:
            fresh_ack = await self.incident_repo.get_with_events(incident.id)
            if fresh_ack:
                dto = IncidentResponse.model_validate(fresh_ack).model_dump(mode="json")
                await websocket_manager.broadcast(
                    "incidents",
                    {
                        "event": "incident_updated",
                        "mutation": "acknowledged",
                        "data": dto,
                    },
                )
                await websocket_manager.broadcast(
                    "system-events",
                    {
                        "event": "operator_action",
                        "actor": actor,
                        "action": f"Acknowledged incident chain '{fresh_ack.title}'",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    },
                )
        except Exception as e:
            logger.warning(
                f"[WebSocket Broadcaster] Error fanning out acknowledgment: {e}"
            )

        return incident

    async def resolve_incident(
        self, incident_id: any, actor: str
    ) -> Optional[Incident]:
        """Terminates active chains and closes operational lifecycle."""
        incident = await self.incident_repo.get_with_events(incident_id)
        if not incident or incident.status == "resolved":
            return None

        incident.status = "resolved"
        incident.resolved_at = datetime.now(timezone.utc)
        await self._append_event(
            incident, "resolved", actor, {"resolution_source": actor}
        )
        await self.incident_repo.db.commit()
        await self.incident_repo.db.refresh(incident)

        # Broadcast live resolution closure across the operational fabric
        try:
            fresh_res = await self.incident_repo.get_with_events(incident.id)
            if fresh_res:
                dto = IncidentResponse.model_validate(fresh_res).model_dump(mode="json")
                await websocket_manager.broadcast(
                    "incidents",
                    {
                        "event": "incident_updated",
                        "mutation": "resolved",
                        "data": dto,
                    },
                )
                await websocket_manager.broadcast(
                    "system-events",
                    {
                        "event": "operator_action",
                        "actor": actor,
                        "action": f"Resolved incident chain '{fresh_res.title}'",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    },
                )
        except Exception as e:
            logger.warning(f"[WebSocket Broadcaster] Error fanning out resolution: {e}")

        return incident
