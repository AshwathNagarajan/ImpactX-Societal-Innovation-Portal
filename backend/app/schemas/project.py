from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    challenge_id: str
    institute_id: str
    industry_ids: List[str] = []
    title: str
    status: str = "PLANNING"
    team: Dict[str, Any] = {}
    mentor: str = ""
    proposal: Dict[str, Any] = {}


class ProjectTransitionRequest(BaseModel):
    target_status: str
    note: str = ""


class ProjectOut(ProjectCreate):
    id: Optional[str] = None
    project_id: str
    progress: int = 0
    prototype_status: str = ""
    pilot_status: str = ""
    implementation_status: str = ""
    impact_metrics: Dict[str, Any] = {}
    ai_roadmap: List[Dict[str, Any]] = []
