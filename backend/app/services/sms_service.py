import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


def _normalize_provider() -> str:
    return (settings.sms_provider or "").strip().lower()


async def _send_fast2sms(to: str, message: str) -> dict:
    if not settings.fast2sms_api_key:
        return {"sent": False, "provider": "fast2sms", "message": "FAST2SMS_API_KEY is not configured."}

    payload = {
        "route": settings.fast2sms_route,
        "numbers": to,
    }
    if settings.fast2sms_route == "otp":
        otp = "".join(ch for ch in message if ch.isdigit())[:6]
        payload["variables_values"] = otp
    else:
        payload["message"] = message

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            "https://www.fast2sms.com/dev/bulkV2",
            headers={"authorization": settings.fast2sms_api_key},
            data=payload,
        )
    try:
        body = response.json()
    except ValueError:
        body = {"raw": response.text}

    ok = response.is_success and bool(body.get("return", response.is_success))
    return {
        "sent": ok,
        "provider": "fast2sms",
        "message": body.get("message") or ("SMS sent." if ok else "Fast2SMS rejected the request."),
        "status_code": response.status_code,
    }


async def _send_twilio(to: str, message: str) -> dict:
    if not all([settings.twilio_account_sid, settings.twilio_auth_token, settings.twilio_from_number]):
        return {"sent": False, "provider": "twilio", "message": "Twilio credentials are not configured."}

    destination = to if to.startswith("+") else f"+91{to}"
    url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.twilio_account_sid}/Messages.json"
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            url,
            data={"To": destination, "From": settings.twilio_from_number, "Body": message},
            auth=(settings.twilio_account_sid, settings.twilio_auth_token),
        )
    try:
        body = response.json()
    except ValueError:
        body = {"raw": response.text}

    ok = response.status_code in {200, 201}
    return {
        "sent": ok,
        "provider": "twilio",
        "message": body.get("status") or body.get("message") or ("SMS sent." if ok else "Twilio rejected the request."),
        "status_code": response.status_code,
    }


async def send_sms(to: str, message: str) -> dict:
    provider = _normalize_provider()
    try:
        if provider == "fast2sms":
            result = await _send_fast2sms(to, message)
        elif provider == "twilio":
            result = await _send_twilio(to, message)
        else:
            result = {"sent": False, "provider": "unconfigured", "message": "Set SMS_PROVIDER to fast2sms or twilio."}
    except httpx.HTTPError as exc:
        logger.exception("SMS provider request failed for %s", to)
        return {"sent": False, "provider": provider or "unconfigured", "message": str(exc)}

    if not result.get("sent"):
        logger.warning("SMS was not sent to %s via %s: %s", to, result.get("provider"), result.get("message"))
    return result
