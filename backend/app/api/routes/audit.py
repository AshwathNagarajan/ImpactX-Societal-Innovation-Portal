from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.services.audit_service import list_events

router = APIRouter(prefix="/audit", tags=["Audit"], dependencies=[Depends(get_current_user)])


@router.get("/events")
async def events(entity_type: str = "", entity_id: str = "", limit: int = 50):
    return {"success": True, "items": await list_events(entity_type, entity_id, limit)}
