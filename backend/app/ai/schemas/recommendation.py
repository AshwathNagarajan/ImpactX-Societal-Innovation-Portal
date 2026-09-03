from typing import Any

from pydantic import BaseModel, Field


class InstituteRecommendation(BaseModel):
    institute_id: str = ""
    name: str = ""
    match_score: int = Field(default=0, ge=0, le=100)
    matching_expertise: list[str] = []
    relevant_departments: list[str] = []
    reason: str = ""
    recommended_role: str = "Solution Development Partner"
    scoring: dict[str, Any] = {}


class IndustryRecommendation(BaseModel):
    industry_id: str = ""
    name: str = ""
    match_score: int = Field(default=0, ge=0, le=100)
    matching_capabilities: list[str] = []
    recommended_support: list[str] = []
    reason: str = ""
    scoring: dict[str, Any] = {}

