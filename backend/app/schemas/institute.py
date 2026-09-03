from typing import List

from pydantic import BaseModel


class InstituteProfile(BaseModel):
    name: str
    departments: List[str] = []
    expertise: List[str] = []
    research_domains: List[str] = []
    facilities: List[str] = []
    previous_projects: List[str] = []
    district: str = ""
    availability: bool = True


class ProposalCreate(BaseModel):
    challenge_id: str
    proposed_solution: str
    technology: str
    team_members: List[str] = []
    faculty_mentor: str
    estimated_duration: str
    required_resources: str = ""
    expected_outcome: str
    need_industry_support: bool = False
