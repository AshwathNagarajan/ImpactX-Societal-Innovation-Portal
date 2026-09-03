from datetime import datetime, timezone
from typing import Any

from app.ai.project_intelligence.lifecycle import STAGE_WEIGHTS, normalize_stage


def calculate_progress(project: dict[str, Any], milestones: list[dict[str, Any]] | None = None) -> int:
    milestones = milestones or []
    if milestones:
        total = 0
        weight_total = 0
        for milestone in milestones:
            stage = normalize_stage(milestone.get("stage"))
            weight = STAGE_WEIGHTS.get(stage, 10)
            total += int(milestone.get("completion_percentage") or 0) * weight
            weight_total += weight
        return round(total / max(1, weight_total))
    return int(project.get("progress") or 0)


def evaluate_project_health(project: dict[str, Any], milestones: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    milestones = milestones or []
    progress = calculate_progress(project, milestones)
    now = datetime.now(timezone.utc)
    overdue = 0
    for milestone in milestones:
        due = milestone.get("due_date")
        if isinstance(due, str):
            try:
                due = datetime.fromisoformat(due.replace("Z", "+00:00"))
            except ValueError:
                due = None
        if due and due < now and milestone.get("status") not in ("APPROVED", "COMPLETED"):
            overdue += 1
    expected_progress = min(100, progress + overdue * 8 + (10 if normalize_stage(project.get("status")) in ("PILOT", "IMPLEMENTATION") else 0))
    score = max(0, min(100, 100 - overdue * 14 - max(0, expected_progress - progress)))
    if score >= 80:
        health = "ON_TRACK"
    elif score >= 65:
        health = "ATTENTION_REQUIRED"
    elif score >= 45:
        health = "AT_RISK"
    else:
        health = "CRITICAL"
    risks = []
    if overdue:
        risks.append(f"{overdue} milestone(s) are overdue.")
    if progress < expected_progress:
        risks.append("Progress is behind the expected project curve.")
    recommended_actions = ["Review next milestone owners", "Confirm field testing access", "Update evidence and deliverables"]
    return {
        "health": health,
        "health_score": score,
        "progress": progress,
        "expected_progress": expected_progress,
        "overdue_milestones": overdue,
        "risks": risks,
        "recommended_actions": recommended_actions,
        "summary": f"Project health is {health.replace('_', ' ').lower()} with {progress}% deterministic progress.",
    }

