from fastapi import APIRouter, File, Form, UploadFile

from app.services.evidence_service import save_evidence_files

router = APIRouter(prefix="/evidence", tags=["Evidence"])


@router.post("/upload")
async def upload_evidence(
    entity_type: str = Form("general"),
    entity_id: str = Form(""),
    files: list[UploadFile] = File(...),
):
    return {"success": True, "items": await save_evidence_files(files, entity_type, entity_id, None)}
