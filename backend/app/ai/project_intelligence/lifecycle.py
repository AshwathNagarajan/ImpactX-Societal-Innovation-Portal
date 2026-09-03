from enum import StrEnum


class ProjectLifecycleStatus(StrEnum):
    PLANNING = "PLANNING"
    RESEARCH = "RESEARCH"
    SOLUTION_DESIGN = "SOLUTION_DESIGN"
    PROTOTYPE = "PROTOTYPE"
    TESTING = "TESTING"
    PILOT = "PILOT"
    IMPLEMENTATION = "IMPLEMENTATION"
    IMPACT_MONITORING = "IMPACT_MONITORING"
    COMPLETED = "COMPLETED"
    ON_HOLD = "ON_HOLD"
    NEEDS_REVISION = "NEEDS_REVISION"
    CANCELLED = "CANCELLED"


ORDERED_STAGES = [
    ProjectLifecycleStatus.PLANNING,
    ProjectLifecycleStatus.RESEARCH,
    ProjectLifecycleStatus.SOLUTION_DESIGN,
    ProjectLifecycleStatus.PROTOTYPE,
    ProjectLifecycleStatus.TESTING,
    ProjectLifecycleStatus.PILOT,
    ProjectLifecycleStatus.IMPLEMENTATION,
    ProjectLifecycleStatus.IMPACT_MONITORING,
    ProjectLifecycleStatus.COMPLETED,
]


STAGE_ALIASES = {
    "ASSIGNED": "PLANNING",
    "RESEARCH": "RESEARCH",
    "PROTOTYPE": "PROTOTYPE",
    "TESTING": "TESTING",
    "PILOT": "PILOT",
    "IMPLEMENTATION": "IMPLEMENTATION",
    "COMPLETED": "COMPLETED",
}


ALLOWED_TRANSITIONS = {
    "PLANNING": {"RESEARCH", "NEEDS_REVISION", "ON_HOLD", "CANCELLED"},
    "RESEARCH": {"SOLUTION_DESIGN", "NEEDS_REVISION", "ON_HOLD", "CANCELLED"},
    "SOLUTION_DESIGN": {"PROTOTYPE", "NEEDS_REVISION", "ON_HOLD", "CANCELLED"},
    "PROTOTYPE": {"TESTING", "NEEDS_REVISION", "ON_HOLD", "CANCELLED"},
    "TESTING": {"PILOT", "NEEDS_REVISION", "ON_HOLD", "CANCELLED"},
    "PILOT": {"IMPLEMENTATION", "NEEDS_REVISION", "ON_HOLD", "CANCELLED"},
    "IMPLEMENTATION": {"IMPACT_MONITORING", "NEEDS_REVISION", "ON_HOLD"},
    "IMPACT_MONITORING": {"COMPLETED", "NEEDS_REVISION", "ON_HOLD"},
    "ON_HOLD": {"PLANNING", "RESEARCH", "SOLUTION_DESIGN", "PROTOTYPE", "TESTING", "PILOT", "IMPLEMENTATION", "CANCELLED"},
    "NEEDS_REVISION": {"PLANNING", "RESEARCH", "SOLUTION_DESIGN", "PROTOTYPE", "TESTING", "ON_HOLD", "CANCELLED"},
    "COMPLETED": set(),
    "CANCELLED": set(),
}


STAGE_WEIGHTS = {
    "RESEARCH": 10,
    "SOLUTION_DESIGN": 15,
    "PROTOTYPE": 20,
    "TESTING": 15,
    "PILOT": 20,
    "IMPLEMENTATION": 15,
    "IMPACT_MONITORING": 5,
}


def normalize_stage(status: str | None) -> str:
    return STAGE_ALIASES.get(str(status or "PLANNING").upper(), str(status or "PLANNING").upper())


def validate_transition(current: str, target: str) -> bool:
    return normalize_stage(target) in ALLOWED_TRANSITIONS.get(normalize_stage(current), set())


def lifecycle_steps(current: str) -> list[dict[str, str | bool]]:
    normalized = normalize_stage(current)
    current_index = next((index for index, stage in enumerate(ORDERED_STAGES) if stage.value == normalized), 0)
    steps = []
    for index, stage in enumerate(ORDERED_STAGES):
        steps.append(
            {
                "stage": stage.value,
                "label": stage.value.replace("_", " ").title(),
                "state": "current" if index == current_index else "completed" if index < current_index else "upcoming",
            }
        )
    return steps

