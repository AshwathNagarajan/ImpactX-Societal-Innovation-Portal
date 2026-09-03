from fastapi import APIRouter, Depends

from app.core.dependencies import require_industry
from app.schemas.industry import PartnershipCreate
from app.services import industry_service

router = APIRouter(prefix="/industry", tags=["Industry"])


@router.get("/dashboard")
async def dashboard(user=Depends(require_industry)):
    return {"success": True, "data": await industry_service.dashboard(user)}


@router.get("/recommended-projects")
async def recommended_projects(user=Depends(require_industry)):
    return {"success": True, "items": await industry_service.recommended_projects()}


@router.get("/recommendations")
async def recommendations(user=Depends(require_industry)):
    return {"success": True, "items": await industry_service.ai_recommendations(user)}


@router.get("/projects")
async def projects(user=Depends(require_industry)):
    return {"success": True, "items": await industry_service.recommended_projects()}


@router.post("/partnerships")
async def create_partnership(payload: PartnershipCreate, user=Depends(require_industry)):
    return {"success": True, "data": await industry_service.create_partnership(payload, user)}


@router.post("/projects/{project_id}/support")
async def support_project(project_id: str, user=Depends(require_industry)):
    return await industry_service.support_project(project_id, user)


@router.put("/partnerships/{partnership_id}")
async def update_partnership(partnership_id: str, payload: dict, user=Depends(require_industry)):
    return {"success": True, "message": "Partnership update endpoint ready.", "partnership_id": partnership_id, "data": payload}
