from datetime import date, datetime
from typing import Any

from bson import ObjectId


def serialize_value(value: Any) -> Any:
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, list):
        return [serialize_value(item) for item in value]
    if isinstance(value, dict):
        return serialize_document(value)
    return value


def serialize_document(document: dict | None) -> dict | None:
    if document is None:
        return None
    result = {key: serialize_value(value) for key, value in document.items()}
    if "_id" in result:
        result["id"] = result.pop("_id")
    return result
