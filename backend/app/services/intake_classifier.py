SERVICE_REQUEST_KEYWORDS = [
    "no electricity",
    "power cut",
    "street light",
    "streetlight",
    "garbage",
    "waste pickup",
    "water insufficient",
    "no water",
    "water supply",
    "drainage blockage",
    "road repair",
    "pothole",
]

THREAT_KEYWORDS = ["shut down", "shutdown", "hack", "bomb", "attack", "threat", "destroy system"]

INNOVATION_KEYWORDS = [
    "prototype",
    "ai",
    "iot",
    "sensor",
    "analytics",
    "monitoring",
    "platform",
    "early warning",
    "prediction",
    "assistive",
    "automation",
]


def classify_intake(challenge: dict, analysis: dict) -> dict:
    text = f"{challenge.get('title', '')} {challenge.get('description', '')} {challenge.get('expected_impact', '')}".lower()
    duplicate_probability = float(analysis.get("duplicate_probability") or 0)
    priority = analysis.get("priority") or {}
    severity = analysis.get("severity") or {}
    affected = int(challenge.get("people_affected") or 0)

    if any(keyword in text for keyword in THREAT_KEYWORDS):
        return {
            "classification": "SPAM_OR_THREAT",
            "status": "QUARANTINED",
            "approved": False,
            "reason": "Submission contains threatening or abusive language and was quarantined by AI.",
        }
    if duplicate_probability >= 0.90:
        return {
            "classification": "DUPLICATE",
            "status": "DUPLICATE",
            "approved": False,
            "reason": "AI detected a likely duplicate of an existing challenge.",
        }
    if len(text.strip()) < 80 or affected <= 0:
        return {
            "classification": "INSUFFICIENT_INFORMATION",
            "status": "INFO_REQUIRED",
            "approved": False,
            "reason": "Submission needs more detail or affected population evidence before intake.",
        }

    innovation_score = 0
    innovation_score += 2 if affected >= 500 else 1 if affected >= 100 else 0
    innovation_score += 2 if priority.get("score", 0) >= 45 else 0
    innovation_score += 2 if severity.get("score", 0) >= 35 else 0
    innovation_score += 2 if any(keyword in text for keyword in INNOVATION_KEYWORDS) else 0
    innovation_score += 1 if challenge.get("expected_impact") else 0

    if any(keyword in text for keyword in SERVICE_REQUEST_KEYWORDS) and innovation_score < 5:
        return {
            "classification": "SERVICE_REQUEST",
            "status": "SERVICE_REQUEST",
            "approved": False,
            "reason": "AI classified this as a department-level service request, not a prototype-worthy innovation challenge.",
        }
    if innovation_score >= 5:
        return {
            "classification": "INNOVATION_CHALLENGE",
            "status": "OPEN_FOR_INSTITUTE",
            "approved": True,
            "reason": "AI approved this as a scalable, prototype-worthy innovation challenge.",
        }
    return {
        "classification": "SERVICE_REQUEST",
        "status": "SERVICE_REQUEST",
        "approved": False,
        "reason": "AI classified this as a localized service request rather than an innovation challenge.",
    }
