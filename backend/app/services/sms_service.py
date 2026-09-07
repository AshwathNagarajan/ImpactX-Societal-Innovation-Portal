import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_sms(to: str, message: str) -> dict:
    if settings.is_development:
        logger.info("DEV SMS to %s: %s", to, message)
        return {"sent": True, "provider": "development", "message": "OTP logged by development SMS adapter."}
    logger.warning("SMS provider is not configured. Message for %s was not sent.", to)
    return {"sent": False, "provider": "unconfigured", "message": "SMS provider is not configured."}
