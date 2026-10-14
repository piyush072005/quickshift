"""QuickShift WhatsApp Cloud API routes for a single-instance demo deployment.

Pending offers and inbound-window timestamps are held in memory. Use a database
before scaling or relying on this for production operations.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import os
import re
from datetime import datetime, timezone
from uuid import uuid4

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field

load_dotenv()
router = APIRouter()

# Demo-only in-memory state. A database/queue should replace this for production.
OFFERS: dict[str, dict] = {}
LAST_INBOUND_AT: dict[str, datetime] = {}


class SendShiftOfferRequest(BaseModel):
    recipient_phone: str = Field(min_length=8, max_length=24)
    employee_name: str = Field(min_length=1, max_length=120)
    role: str = Field(min_length=1, max_length=120)
    department: str = Field(min_length=1, max_length=80)
    date: str = Field(min_length=8, max_length=30)
    time_range: str = Field(min_length=3, max_length=60)
    shift_label: str = Field(default="Day", min_length=1, max_length=30)
    payout: str = Field(min_length=1, max_length=100)
    note: str = Field(default="", max_length=500)


def _digits(phone: str) -> str:
    return re.sub(r"\D", "", phone or "")


def _required_setting(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise HTTPException(
            status_code=503,
            detail=f"Backend configuration is missing {name}. Set it in the backend .env file or deployment environment.",
        )
    return value


def _extract_message_text(message: dict) -> str:
    if isinstance(message.get("text"), dict):
        return str(message["text"].get("body", ""))
    interactive = message.get("interactive") or {}
    button_reply = interactive.get("button_reply") or {}
    if button_reply.get("title"):
        return str(button_reply["title"])
    if button_reply.get("id"):
        return str(button_reply["id"])
    list_reply = interactive.get("list_reply") or {}
    if list_reply.get("title"):
        return str(list_reply["title"])
    button = message.get("button") or {}
    return str(button.get("text", ""))


def _public_offer(offer: dict) -> dict:
    return {
        key: offer.get(key)
        for key in (
            "offer_id", "status", "employee_name", "role", "department",
            "date", "time_range", "shift_label", "payout", "note",
            "recipient_phone", "meta_message_id", "reply_text", "updated_at",
        )
    }


@router.post("/api/whatsapp/send-offer")
async def send_shift_offer(request: SendShiftOfferRequest):
    """Send a real WhatsApp text offer using the Meta Cloud API."""
    access_token = _required_setting("WHATSAPP_ACCESS_TOKEN")
    phone_number_id = _required_setting("WHATSAPP_PHONE_NUMBER_ID")
    api_version = os.getenv("WHATSAPP_API_VERSION", "v26.0").strip().strip("/")

    recipient = _digits(request.recipient_phone)
    if not 8 <= len(recipient) <= 15:
        raise HTTPException(
            status_code=422,
            detail="Enter the recipient phone number with country code, for example +91XXXXXXXXXX.",
        )

    # WhatsApp permits free-form business messages during the customer-service
    # window. Meta will return its own API error if the window is closed or the
    # recipient is not allowed by the test account. The worker can send Hi to
    # the business/test number first, after the webhook is configured.
    body = (
        "QUICKSHIFT — HOTEL SHIFT OFFER\n\n"
        f"Hello {request.employee_name},\n"
        f"Role: {request.role}\n"
        f"Department: {request.department}\n"
        f"Date: {request.date}\n"
        f"Time: {request.time_range}\n"
        f"Payout: {request.payout}\n"
        f"Manager note: {request.note.strip() or 'No additional instructions.'}\n\n"
        "Reply ACCEPT to accept this shift, or DECLINE to decline it."
    )

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": recipient,
        "type": "text",
        "text": {"preview_url": False, "body": body},
    }
    url = f"https://graph.facebook.com/{api_version}/{phone_number_id}/messages"

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                url,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail="Could not reach the Meta WhatsApp API. Check the backend internet connection and try again.",
        ) from exc

    try:
        meta_result = response.json()
    except ValueError:
        meta_result = {"raw_response": response.text[:1000]}

    if response.status_code >= 400:
        error = meta_result.get("error", {}) if isinstance(meta_result, dict) else {}
        meta_message = error.get("message") or "Meta rejected the WhatsApp message."
        error_code = error.get("code")
        detail = f"WhatsApp API error{f' {error_code}' if error_code else ''}: {meta_message}"
        if error_code == 131047:
            detail += " The customer-service window may have expired. Have the recipient message the test/business number, then try again."
        raise HTTPException(status_code=502, detail=detail)

    messages = meta_result.get("messages", []) if isinstance(meta_result, dict) else []
    meta_message_id = messages[0].get("id") if messages else None
    offer_id = str(uuid4())
    created_at = datetime.now(timezone.utc).isoformat()

    OFFERS[offer_id] = {
        "offer_id": offer_id,
        "status": "awaiting_response",
        "employee_name": request.employee_name,
        "role": request.role,
        "department": request.department,
        "date": request.date,
        "time_range": request.time_range,
        "shift_label": request.shift_label,
        "payout": request.payout,
        "note": request.note,
        "recipient_phone": recipient,
        "meta_message_id": meta_message_id,
        "reply_text": None,
        "created_at": created_at,
        "updated_at": created_at,
    }

    return _public_offer(OFFERS[offer_id])


@router.get("/api/whatsapp/offers/{offer_id}")
def get_shift_offer_status(offer_id: str):
    offer = OFFERS.get(offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found. The demo server may have restarted.")
    return _public_offer(offer)


@router.get("/api/whatsapp/webhook")
async def verify_whatsapp_webhook(request: Request):
    """Meta webhook handshake: return hub.challenge for the configured token."""
    verify_token = _required_setting("WHATSAPP_VERIFY_TOKEN")
    query = request.query_params
    mode = query.get("hub.mode")
    token = query.get("hub.verify_token")
    challenge = query.get("hub.challenge")

    if mode == "subscribe" and token and hmac.compare_digest(token, verify_token) and challenge:
        return PlainTextResponse(challenge, status_code=200)

    raise HTTPException(status_code=403, detail="Webhook verification failed.")


@router.post("/api/whatsapp/webhook")
async def receive_whatsapp_webhook(request: Request):
    """Verify Meta's signature, then process inbound messages and replies."""
    app_secret = _required_setting("META_APP_SECRET")
    raw_body = await request.body()
    signature = request.headers.get("x-hub-signature-256", "")
    expected_signature = "sha256=" + hmac.new(
        app_secret.encode("utf-8"), raw_body, hashlib.sha256
    ).hexdigest()

    if not signature or not hmac.compare_digest(signature, expected_signature):
        raise HTTPException(status_code=401, detail="Invalid WhatsApp webhook signature.")

    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=400, detail="Webhook body was not valid JSON.") from exc

    now = datetime.now(timezone.utc)

    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value", {})
            for message in value.get("messages", []):
                sender = _digits(str(message.get("from", "")))
                if not sender:
                    continue

                # Remember last inbound time for future customer-service-window checks.
                LAST_INBOUND_AT[sender] = now
                message_text = _extract_message_text(message).strip()
                normalized = message_text.casefold()

                # Match an explicit ACCEPT/DECLINE reply to the latest open offer
                # addressed to this phone number. Unrelated messages only refresh
                # the inbound customer-service window.
                matched_offer = None
                for offer in reversed(list(OFFERS.values())):
                    if (
                        offer.get("recipient_phone") == sender
                        and offer.get("status") == "awaiting_response"
                    ):
                        matched_offer = offer
                        break

                if not matched_offer:
                    continue

                if re.search(r"\b(accept|accepted|yes)\b", normalized):
                    matched_offer["status"] = "accepted"
                elif re.search(r"\b(decline|declined|reject|no)\b", normalized):
                    matched_offer["status"] = "declined"
                else:
                    continue

                matched_offer["reply_text"] = message_text[:500]
                matched_offer["updated_at"] = now.isoformat()

    return {"status": "ok"}
