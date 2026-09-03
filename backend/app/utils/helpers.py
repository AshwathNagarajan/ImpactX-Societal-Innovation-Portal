from datetime import datetime, timezone


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def normalize_role(role: str) -> str:
    return role.strip().upper()


def normalize_status(status: str) -> str:
    return status.strip().upper().replace(" ", "_")
