from pydantic import BaseModel


class SolutionSuggestion(BaseModel):
    title: str
    approach: str
    problem_addressed: str
    technologies: list[str]
    required_expertise: list[str]
    estimated_complexity: str = "MEDIUM"
    estimated_duration: str = "8-12 weeks"
    resources_required: list[str] = []
    potential_benefits: list[str] = []
    limitations: list[str] = []
    implementation_steps: list[str] = []
    success_metrics: list[str] = []

