from typing import List, Optional

from pydantic import BaseModel


class IndustryProfile(BaseModel):
    name: str
    sector: str
    expertise: List[str] = []
    technologies: List[str] = []
    support_types: List[str] = []
    csr_domains: List[str] = []
    previous_projects: List[str] = []
    locations: List[str] = []


class PartnershipCreate(BaseModel):
    project_id: str
    support_type: str
    contribution: str
    mentor_name: str = ""
    timeline: str = ""
    notes: str = ""
    funding_amount: Optional[int] = None
    currency: str = "INR"
    funding_type: str = ""
    milestone_release: str = ""
    csr_category: str = ""


class ProjectSupportRequest(BaseModel):
    support_type: str = "Technical Mentorship"
    contribution: str = "Industry support offered from project discovery."
    mentor_name: str = ""
    timeline: str = ""
    notes: str = ""
    funding_amount: Optional[int] = None
    currency: str = "INR"
    funding_type: str = ""
    milestone_release: str = ""
    csr_category: str = ""
