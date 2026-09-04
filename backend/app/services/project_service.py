from fastapi import HTTPException
from pymongo import ReturnDocument

from app.ai.project_intelligence.lifecycle import current_stage_detail, lifecycle_actions, lifecycle_steps, next_statuses, normalize_stage, validate_transition
from app.core.database import get_database
from app.schemas.project import ProjectCreate, ProjectTransitionRequest
from app.utils.helpers import utc_now
from app.utils.serializers import serialize_document


async def generate_project_id() -> str:
    count = await get_database().projects.count_documents({})
    return f"PRJ-{count + 1:04d}"


async def create_project(payload: ProjectCreate) -> dict:
    now = utc_now()
    document = payload.model_dump()
    document["status"] = normalize_stage(document.get("status"))
    document.update(
        {
            "project_id": await generate_project_id(),
            "progress": 0,
            "prototype_status": "NOT_STARTED",
            "pilot_status": "NOT_STARTED",
            "implementation_status": "NOT_STARTED",
            "impact_metrics": {},
            "ai_roadmap": [],
            "lifecycle": lifecycle_steps(document["status"]),
            "created_at": now,
            "updated_at": now,
        }
    )
    await get_database().projects.insert_one(document)
    return serialize_document(document)


async def list_projects() -> list[dict]:
    cursor = get_database().projects.find().sort("created_at", -1)
    return [serialize_document(item) async for item in cursor]


async def get_project(project_id: str) -> dict:
    project = await get_database().projects.find_one({"project_id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return serialize_document(project)


async def project_lifecycle(project_id: str, user: dict | None = None) -> dict:
    project = await get_database().projects.find_one({"project_id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    current = normalize_stage(project.get("status"))
    role = (user or {}).get("role", "ALL")
    return {
        "project_id": project_id,
        "current_stage": current_stage_detail(current),
        "steps": lifecycle_steps(current),
        "next_statuses": next_statuses(current),
        "available_actions": lifecycle_actions(current, role),
        "status_history": project.get("status_history", []),
    }


async def update_project(project_id: str, updates: dict) -> dict:
    allowed = {"title", "team", "mentor", "proposal", "progress", "prototype_status", "pilot_status", "implementation_status", "impact_metrics"}
    updates = {key: value for key, value in updates.items() if key in allowed}
    updates["updated_at"] = utc_now()
    result = await get_database().projects.find_one_and_update({"project_id": project_id}, {"$set": updates}, return_document=ReturnDocument.AFTER)
    if not result:
        raise HTTPException(status_code=404, detail="Project not found")
    return serialize_document(result)


async def transition_project(project_id: str, payload: ProjectTransitionRequest, user: dict) -> dict:
    database = get_database()
    project = await database.projects.find_one({"project_id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    current = normalize_stage(project.get("status"))
    target = normalize_stage(payload.target_status)
    if not validate_transition(current, target):
        raise HTTPException(status_code=400, detail=f"Transition from {current} to {target} is not allowed.")
    event = {"from": current, "to": target, "note": payload.note, "changed_by": user.get("id"), "timestamp": utc_now()}
    target_detail = current_stage_detail(target)
    await database.projects.update_one(
        {"project_id": project_id},
        {
            "$set": {
                "status": target,
                "progress": max(int(project.get("progress") or 0), int(target_detail.get("progress") or 0)),
                "lifecycle": lifecycle_steps(target),
                "updated_at": utc_now(),
            },
            "$push": {"status_history": event},
        },
    )
    updated = await database.projects.find_one({"project_id": project_id})
    return serialize_document(updated)


async def advance_project(project_id: str, note: str, user: dict) -> dict:
    project = await get_database().projects.find_one({"project_id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    actions = lifecycle_actions(project.get("status"), user.get("role"))
    if not actions:
        raise HTTPException(status_code=403, detail="No lifecycle action is available for your role at this stage.")
    return await transition_project(project_id, ProjectTransitionRequest(target_status=actions[0]["target_status"], note=note), user)
