from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field


class SubmittedBy(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    phone: str = ""
    type: str = "Citizen"


class ChallengeCreate(BaseModel):
    submitted_by: SubmittedBy
    title: str = Field(..., min_length=5)
    description: str = Field(..., min_length=20)
    category: str
    subcategory: str = ""
    district: str
    city_or_village: str = ""
    location: str = ""
    urgency: str = "MEDIUM"
    people_affected: int = Field(default=0, ge=0)
    existing_attempts: str = ""
    expected_impact: str = ""
    attachments: List[Dict[str, Any]] = []


class ChallengeOut(ChallengeCreate):
    id: Optional[str] = None
    challenge_id: str
    status: str
    priority: str
    ai_analysis: Dict[str, Any] = {}
    matched_institutes: List[Dict[str, Any]] = []
    assigned_institute_id: Optional[str] = None
    industry_partners: List[Dict[str, Any]] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ChallengeListResponse(BaseModel):
    success: bool = True
    total: int
    page: int
    limit: int
    items: List[Dict[str, Any]]


class PriorityUpdate(BaseModel):
    priority: str


class AssignInstituteRequest(BaseModel):
    institute_id: str
