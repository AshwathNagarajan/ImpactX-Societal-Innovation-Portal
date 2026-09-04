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

STAGE_DETAILS = {
    "PLANNING": {
        "label": "Challenge Intake",
        "summary": "Scope, ownership and field context are being confirmed before research starts.",
        "owner": "Admin",
        "progress": 8,
    },
    "RESEARCH": {
        "label": "Research Validation",
        "summary": "Institute teams validate root causes, users, constraints and available evidence.",
        "owner": "Institute",
        "progress": 22,
    },
    "SOLUTION_DESIGN": {
        "label": "Solution Blueprint",
        "summary": "A practical solution, architecture, resources and implementation plan are prepared.",
        "owner": "Institute",
        "progress": 36,
    },
    "PROTOTYPE": {
        "label": "Prototype Build",
        "summary": "A working prototype is developed with measurable success criteria.",
        "owner": "Institute",
        "progress": 52,
    },
    "TESTING": {
        "label": "Lab & Field Testing",
        "summary": "The prototype is tested for reliability, usability and field readiness.",
        "owner": "Institute",
        "progress": 66,
    },
    "PILOT": {
        "label": "Pilot Deployment",
        "summary": "Industry and government partners support controlled deployment in target locations.",
        "owner": "Industry",
        "progress": 78,
    },
    "IMPLEMENTATION": {
        "label": "Implementation",
        "summary": "The solution is scaled with administrative ownership and local partner support.",
        "owner": "Admin",
        "progress": 90,
    },
    "IMPACT_MONITORING": {
        "label": "Impact Monitoring",
        "summary": "Adoption, beneficiary reach, cost savings and social outcomes are measured.",
        "owner": "Admin",
        "progress": 96,
    },
    "COMPLETED": {
        "label": "Impact Closed",
        "summary": "The lifecycle is complete and impact evidence is ready for reporting.",
        "owner": "Admin",
        "progress": 100,
    },
}


STAGE_ALIASES = {
    "ASSIGNED": "PLANNING",
    "RESEARCH": "RESEARCH",
    "PROTOTYPE": "PROTOTYPE",
    "TESTING": "TESTING",
    "PILOT": "PILOT",
    "IMPLEMENTATION": "IMPLEMENTATION",
    "COMPLETED": "COMPLETED",
    "IN_DEVELOPMENT": "PROTOTYPE",
    "PILOT_TESTING": "PILOT",
    "IMPLEMENTED": "COMPLETED",
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


def lifecycle_steps(current: str) -> list[dict[str, str | int | bool]]:
    normalized = normalize_stage(current)
    current_index = next((index for index, stage in enumerate(ORDERED_STAGES) if stage.value == normalized), 0)
    steps = []
    for index, stage in enumerate(ORDERED_STAGES):
        detail = STAGE_DETAILS.get(stage.value, {})
        steps.append(
            {
                "stage": stage.value,
                "label": detail.get("label", stage.value.replace("_", " ").title()),
                "summary": detail.get("summary", ""),
                "owner": detail.get("owner", ""),
                "progress": detail.get("progress", 0),
                "state": "current" if index == current_index else "completed" if index < current_index else "upcoming",
            }
        )
    return steps


def current_stage_detail(current: str) -> dict[str, str | int]:
    normalized = normalize_stage(current)
    detail = STAGE_DETAILS.get(normalized, STAGE_DETAILS["PLANNING"])
    return {"stage": normalized, **detail}


def next_statuses(current: str) -> list[str]:
    normalized = normalize_stage(current)
    ordered = [stage.value for stage in ORDERED_STAGES]
    allowed = ALLOWED_TRANSITIONS.get(normalized, set())
    return [stage for stage in ordered if stage in allowed]


def lifecycle_actions(current: str, role: str | None = None) -> list[dict[str, str]]:
    normalized = normalize_stage(current)
    role = str(role or "ALL").upper()
    actions_by_stage = {
        "PLANNING": [
            {"role": "ADMIN", "label": "Start Research", "target_status": "RESEARCH", "description": "Assign institute ownership and begin field research."},
        ],
        "RESEARCH": [
            {"role": "INSTITUTE", "label": "Submit Blueprint", "target_status": "SOLUTION_DESIGN", "description": "Move from problem research to proposed solution design."},
        ],
        "SOLUTION_DESIGN": [
            {"role": "INSTITUTE", "label": "Begin Prototype", "target_status": "PROTOTYPE", "description": "Approve the blueprint and start prototype development."},
        ],
        "PROTOTYPE": [
            {"role": "INSTITUTE", "label": "Send To Testing", "target_status": "TESTING", "description": "Prototype is ready for controlled testing."},
        ],
        "TESTING": [
            {"role": "INSTITUTE", "label": "Request Pilot", "target_status": "PILOT", "description": "Testing is complete and pilot deployment support is required."},
        ],
        "PILOT": [
            {"role": "INDUSTRY", "label": "Support Implementation", "target_status": "IMPLEMENTATION", "description": "Confirm pilot support and implementation readiness."},
            {"role": "ADMIN", "label": "Approve Implementation", "target_status": "IMPLEMENTATION", "description": "Authorize wider implementation after pilot review."},
        ],
        "IMPLEMENTATION": [
            {"role": "ADMIN", "label": "Start Impact Review", "target_status": "IMPACT_MONITORING", "description": "Begin official outcome measurement."},
        ],
        "IMPACT_MONITORING": [
            {"role": "ADMIN", "label": "Close Project", "target_status": "COMPLETED", "description": "Mark the project complete with impact evidence."},
        ],
    }
    actions = actions_by_stage.get(normalized, [])
    if role == "ALL":
        return actions
    return [action for action in actions if action["role"] in {role, "ALL"}]
