from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user, require_admin, require_industry, require_institute
from app.services.analytics_service import public_analytics, role_analytics

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/public")
async def public():
    return {"success": True, "data": await public_analytics()}


@router.get("/admin")
async def admin(user=Depends(require_admin)):
    return {"success": True, "data": await role_analytics("admin", user)}


@router.get("/institute")
async def institute(user=Depends(require_institute)):
    return {"success": True, "data": await role_analytics("institute", user)}


@router.get("/industry")
async def industry(user=Depends(require_industry)):
    return {"success": True, "data": await role_analytics("industry", user)}


@router.get("/impact")
async def impact(user=Depends(get_current_user)):
    return {"success": True, "data": await role_analytics("impact", user)}
