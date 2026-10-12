from fastapi import APIRouter, Depends, Query

from app.db.models.user import User
from app.dependencies.auth import require_admin
from app.dependencies.services import get_audit_service
from app.schemas.audit import AuditEventPage
from app.services.audit_service import AuditService

router = APIRouter()


@router.get("/", response_model=AuditEventPage)
async def list_audit_events(
    skip: int = Query(0, ge=0, le=10000),
    limit: int = Query(25, ge=1, le=100),
    service: AuditService = Depends(get_audit_service),
    _admin: User = Depends(require_admin),
):
    items, has_more = await service.list_page(skip, limit)
    return {"items": items, "skip": skip, "limit": limit, "has_more": has_more}
