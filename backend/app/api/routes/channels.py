"""
Omnichannel intake API endpoints.
Section 16: WhatsApp Cloud API webhook, email webhook, simulated triggers, omnichannel inbox.
"""
from fastapi import APIRouter, Request, Query, HTTPException, Response
from typing import Dict, Any, List
from datetime import datetime, timezone
from app.channels.whatsapp import WhatsAppAdapter
from app.channels.simulated import SimulatedChannelAdapter

router = APIRouter(prefix="/channels", tags=["channels"])

_messages_inbox: List[Dict[str, Any]] = [
    {
        "id": "msg-001",
        "channel": "whatsapp",
        "sender_masked": "+91 98*** **412",
        "received_at": datetime.now(timezone.utc).isoformat(),
        "attachment_name": "Darshan_Engineering_DE0491.pdf",
        "processing_status": "completed",
        "validation_status": "valid",
        "confidence": 0.96,
        "notification_status": "delivered"
    },
    {
        "id": "msg-002",
        "channel": "email",
        "sender_masked": "ac***@surabhi.com",
        "received_at": datetime.now(timezone.utc).isoformat(),
        "attachment_name": "Invoice_SHB45620.jpeg",
        "processing_status": "completed",
        "validation_status": "valid",
        "confidence": 0.98,
        "notification_status": "delivered"
    }
]


@router.get("/whatsapp/webhook")
async def verify_whatsapp_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token")
):
    """WhatsApp Cloud API webhook handshake verification."""
    adapter = WhatsAppAdapter()
    challenge = adapter.verify_challenge(hub_mode, hub_verify_token, hub_challenge)
    if challenge:
        return Response(content=challenge, media_type="text/plain")
    raise HTTPException(status_code=403, detail="Verification token mismatch")


@router.post("/whatsapp/webhook")
async def handle_whatsapp_webhook(request: Request):
    """WhatsApp Cloud API incoming message webhook with HMAC verification."""
    body = await request.body()
    adapter = WhatsAppAdapter()
    if not adapter.verify_webhook(dict(request.headers), body):
        raise HTTPException(status_code=401, detail="Invalid webhook HMAC signature")

    payload = await request.json()
    msg = adapter.parse_event(payload)
    if msg:
        _messages_inbox.insert(0, {
            "id": msg.message_id,
            "channel": "whatsapp",
            "sender_masked": msg.sender_masked,
            "received_at": msg.received_at.isoformat(),
            "attachment_name": msg.attachments[0].name if msg.attachments else "none",
            "processing_status": "completed",
            "validation_status": "valid",
            "confidence": 0.95,
            "notification_status": "pending"
        })
    return {"status": "received"}


@router.post("/simulate")
async def simulate_channel_event(payload: Dict[str, Any]):
    """Simulate inbound WhatsApp or Email invoice event for demo purposes."""
    sim = SimulatedChannelAdapter()
    msg = sim.parse_event(payload)
    record = {
        "id": msg.message_id,
        "channel": msg.channel,
        "sender_masked": msg.sender_masked,
        "received_at": msg.received_at.isoformat(),
        "attachment_name": msg.attachments[0].name if msg.attachments else "bill.pdf",
        "processing_status": "completed",
        "validation_status": "valid",
        "confidence": 0.97,
        "notification_status": "simulated"
    }
    _messages_inbox.insert(0, record)
    return {"success": True, "message": record}


@router.get("/messages")
def get_inbox_messages():
    """Retrieve omnichannel inbox messages."""
    return _messages_inbox
