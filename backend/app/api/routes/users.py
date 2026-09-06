from fastapi import APIRouter, Depends

from app.core.dependencies import require_admin
from app.schemas.user import UserCreate, UserUpdate
from app.services import user_service

router = APIRouter(prefix="/admin/users", tags=["Admin Users"], dependencies=[Depends(require_admin)])


@router.get("")
async def users():
    return {"success": True, "items": await user_service.list_users()}


@router.post("")
async def create_user(payload: UserCreate, actor=Depends(require_admin)):
    return {"success": True, "data": await user_service.create_user(payload, actor)}


@router.put("/{user_id}")
async def update_user(user_id: str, payload: UserUpdate, actor=Depends(require_admin)):
    return {"success": True, "data": await user_service.update_user(user_id, payload, actor)}
