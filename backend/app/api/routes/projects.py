from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.schemas.project import ProjectCreate, ProjectTransitionRequest
from app.services import project_service

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("")
async def list_projects(user=Depends(get_current_user)):
    return {"success": True, "items": await project_service.list_projects()}


@router.get("/{project_id}")
async def get_project(project_id: str, user=Depends(get_current_user)):
    return {"success": True, "data": await project_service.get_project(project_id)}


@router.get("/{project_id}/lifecycle")
async def get_project_lifecycle(project_id: str, user=Depends(get_current_user)):
    return {"success": True, "data": await project_service.project_lifecycle(project_id, user)}


@router.post("")
async def create_project(payload: ProjectCreate, user=Depends(get_current_user)):
    return {"success": True, "data": await project_service.create_project(payload)}


@router.put("/{project_id}")
async def update_project(project_id: str, payload: dict, user=Depends(get_current_user)):
    return {"success": True, "message": "Project updated successfully.", "data": await project_service.update_project(project_id, payload)}


@router.post("/{project_id}/transition")
async def transition_project(project_id: str, payload: ProjectTransitionRequest, user=Depends(get_current_user)):
    return {"success": True, "data": await project_service.transition_project(project_id, payload, user)}


@router.post("/{project_id}/advance")
async def advance_project(project_id: str, payload: dict, user=Depends(get_current_user)):
    return {"success": True, "data": await project_service.advance_project(project_id, payload.get("note", ""), user)}
