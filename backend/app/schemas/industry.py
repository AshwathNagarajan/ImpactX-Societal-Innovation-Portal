from typing import List

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
