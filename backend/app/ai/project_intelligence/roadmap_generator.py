from datetime import timedelta
from typing import Any

from app.utils.helpers import utc_now


ROADMAP_TEMPLATE = [
    ("Problem Validation", "Confirm community need, stakeholders, constraints and success criteria.", 14),
    ("Research and Requirement Analysis", "Study domain context, prior attempts, technical requirements and field conditions.", 21),
    ("Solution Design", "Design solution architecture, prototype plan and evaluation method.", 21),
    ("Prototype Development", "Build the minimum viable prototype with testable modules.", 30),
    ("Testing", "Run technical, user and field-readiness tests.", 21),
    ("Community Pilot", "Deploy the solution with selected users and monitor outcomes.", 30),
    ("Evaluation", "Compare metrics against baseline and document learning.", 14),
    ("Implementation Planning", "Prepare scale-up, governance handoff and operational plan.", 21),
    ("Impact Monitoring", "Measure sustained benefits, adoption and innovation outputs.", 30),
]


def generate_project_roadmap(project: dict[str, Any], challenge: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    start = utc_now()
    roadmap = []
    cursor = start
    for index, (title, description, days) in enumerate(ROADMAP_TEMPLATE, start=1):
        due_date = cursor + timedelta(days=days)
        roadmap.append(
            {
                "phase": index,
                "title": title,
                "description": description,
                "expected_duration_days": days,
                "start_date": cursor.isoformat(),
                "due_date": due_date.isoformat(),
                "deliverables": ["Phase report", "Evidence artifacts"] if index < 4 else ["Prototype evidence", "Metric report"],
                "success_criteria": ["Stakeholder review completed", "Deliverables accepted"],
                "risks": ["Field access delay", "Data quality gaps"] if index in (1, 6) else ["Resource availability"],
            }
        )
        cursor = due_date
    return roadmap

