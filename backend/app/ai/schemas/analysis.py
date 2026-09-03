from typing import Any, Literal

from pydantic import BaseModel, Field


class RagSource(BaseModel):
    source: str = ""
    document_type: str = ""
    category: str = ""
    score: float = 0.0


class SimilarChallenge(BaseModel):
    challenge_id: str = ""
    title: str = ""
    category: str = ""
    district: str = ""
    similarity: float = Field(default=0.0, ge=0, le=1)
    relationship: str = "NOT_DUPLICATE"


class SeverityAssessment(BaseModel):
    level: Literal["LOW", "MODERATE", "HIGH", "CRITICAL"]
    score: int = Field(ge=0, le=100)
    reason: str
    signals: dict[str, int] = {}


class PriorityAssessment(BaseModel):
    level: Literal["LOW", "MODERATE", "HIGH", "CRITICAL"]
    score: int = Field(ge=0, le=100)
    factors: list[dict[str, Any]] = []


class ChallengeAIAnalysis(BaseModel):
    challenge_id: str
    summary: str = ""
    problem_statement: str = ""
    primary_category: str = "OTHER"
    subcategory: str = "General Civic Innovation"
    secondary_categories: list[str] = []
    category_confidence: float = Field(default=0.0, ge=0, le=1)
    severity: SeverityAssessment
    priority: PriorityAssessment
    affected_groups: list[str] = []
    root_causes: list[str] = []
    key_constraints: list[str] = []
    required_expertise: list[str] = []
    recommended_departments: list[str] = []
    recommended_technologies: list[str] = []
    similar_challenges: list[SimilarChallenge] = []
    duplicate_probability: float = Field(default=0.0, ge=0, le=1)
    recommended_institutes: list[dict[str, Any]] = []
    proposed_solution_directions: list[dict[str, Any]] = []
    potential_industry_support: list[str] = []
    related_government_context: list[str] = []
    expected_social_impact: str = ""
    risks: list[str] = []
    confidence_score: float = Field(default=0.0, ge=0, le=1)
    rag_sources: list[RagSource] = []
    ai_status: Literal["PENDING", "PROCESSING", "COMPLETED", "FAILED"] = "COMPLETED"
    audit: dict[str, Any] = {}

