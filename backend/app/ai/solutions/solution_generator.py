from typing import Any

from app.ai.schemas.solution import SolutionSuggestion


def generate_solution_directions(challenge: dict[str, Any], analysis: dict[str, Any] | None = None, context: list[dict[str, Any]] | None = None) -> list[dict[str, Any]]:
    analysis = analysis or {}
    category = analysis.get("primary_category") or challenge.get("category", "OTHER")
    expertise = analysis.get("required_expertise") or ["Community Research", "Product Design", "Field Implementation"]
    technologies = analysis.get("recommended_technologies") or ["Mobile data collection", "Dashboard analytics", "Field validation toolkit"]
    base_steps = ["Validate field requirements", "Co-design prototype with community users", "Run controlled pilot", "Measure adoption and outcomes"]
    templates = [
        {
            "title": f"Data-Led {category.replace('_', ' ').title()} Intervention",
            "approach": "Create a lightweight digital workflow to collect field evidence, prioritize response and monitor implementation with district stakeholders.",
            "complexity": "MEDIUM",
        },
        {
            "title": "Community Pilot and Alert System",
            "approach": "Deploy a small field pilot using local volunteers, sensor or mobile inputs, and escalation dashboards for responsible agencies.",
            "complexity": "MEDIUM",
        },
        {
            "title": "Institution-Led Prototype Program",
            "approach": "Form a multidisciplinary institute team to build and test a practical prototype before industry-supported scale-up.",
            "complexity": "HIGH",
        },
    ]
    suggestions = []
    for template in templates:
        suggestion = SolutionSuggestion(
            title=template["title"],
            approach=template["approach"],
            problem_addressed=challenge.get("title", ""),
            technologies=technologies[:5],
            required_expertise=expertise[:5],
            estimated_complexity=template["complexity"],
            estimated_duration="8-12 weeks" if template["complexity"] == "MEDIUM" else "12-16 weeks",
            resources_required=["Faculty mentor", "Student team", "Field partner", "Prototype budget"],
            potential_benefits=["Faster validation", "Transparent progress tracking", "Community-centered implementation"],
            limitations=["Requires reliable field access", "Needs admin validation before scale-up"],
            implementation_steps=base_steps,
            success_metrics=["Pilot adoption rate", "Response time improvement", "Beneficiaries reached", "Stakeholder satisfaction"],
        )
        suggestions.append(suggestion.model_dump())
    return suggestions

