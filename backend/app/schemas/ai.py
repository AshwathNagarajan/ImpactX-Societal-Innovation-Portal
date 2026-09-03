from typing import List

from pydantic import BaseModel, Field


class SimilarChallenge(BaseModel):
    challenge_id: str = ""
    title: str = ""
    similarity: float = 0.0


class RagSource(BaseModel):
    source: str = ""
    type: str = ""
    score: float = 0.0


class AIAnalysis(BaseModel):
    summary: str = ""
    category: str = ""
    subcategory: str = ""
    priority_score: int = Field(default=0, ge=0, le=100)
    priority_level: str = "MEDIUM"
    impact_score: int = Field(default=0, ge=0, le=100)
    duplicate_probability: float = Field(default=0.0, ge=0, le=1)
    similar_challenges: List[SimilarChallenge] = []
    recommended_domains: List[str] = []
    required_expertise: List[str] = []
    recommended_technologies: List[str] = []
    recommended_departments: List[str] = []
    recommended_institutes: List[dict] = []
    potential_industry_support: List[str] = []
    possible_government_schemes: List[str] = []
    suggested_solution_direction: str = ""
    risk_factors: List[str] = []
    expected_social_impact: str = ""
    confidence_score: float = Field(default=0.0, ge=0, le=1)
    rag_sources: List[RagSource] = []
