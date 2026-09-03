from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.schemas.project import ProjectCreate
from app.services import project_service

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("")
async def list_projects(user=Depends(get_current_user)):
    return {"success": True, "items": await project_service.list_projects()}


@router.post("")
async def create_project(payload: ProjectCreate, user=Depends(get_current_user)):
    return {"success": True, "data": await project_service.create_project(payload)}
