from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from app.core.dependencies import get_current_user
from app.services import comment_service

router = APIRouter(prefix="/comments", tags=["Comments"], dependencies=[Depends(get_current_user)])


class CommentCreate(BaseModel):
    entity_type: str
    entity_id: str
    body: str


@router.get("")
async def comments(entity_type: str = Query(...), entity_id: str = Query(...)):
    return {"success": True, "items": await comment_service.list_comments(entity_type, entity_id)}


@router.post("")
async def create_comment(payload: CommentCreate, user=Depends(get_current_user)):
    return {"success": True, "data": await comment_service.create_comment(payload.model_dump(), user)}
