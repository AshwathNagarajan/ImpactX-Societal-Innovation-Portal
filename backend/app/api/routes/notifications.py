from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("")
async def list_notifications(user=Depends(get_current_user)):
    return {"success": True, "items": await notification_service.list_notifications(user)}


@router.put("/{notification_id}/read")
async def mark_read(notification_id: str, user=Depends(get_current_user)):
    return {"success": True, "data": await notification_service.mark_read(notification_id)}


@router.put("/read-all")
async def mark_all_read(user=Depends(get_current_user)):
    return {"success": True, "data": await notification_service.mark_all_read(user)}
