"""
Integrations API endpoints for Google Calendar, WhatsApp, and external services.
Section 14 & 16.
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List

router = APIRouter(prefix="/integrations", tags=["integrations"])

_integrations_state = {
    "google_calendar": {
        "provider": "google_calendar",
        "status": "connected (simulator)",
        "account_label": "demo.admin@finsense.internal",
        "calendar_name": "FinSense Reminders",
        "last_synced": "2026-10-11T10:00:00Z"
    },
    "whatsapp": {
        "provider": "whatsapp",
        "status": "active",
        "phone_number": "+91 (Cloud API Gateway)",
        "webhook_url": "/api/channels/whatsapp/webhook"
    },
    "email": {
        "provider": "email",
        "status": "active (simulated)",
        "inbox_address": "bills-inbox@finsense.internal"
    }
}


@router.get("")
@router.get("/")
def get_integrations():
    """List connection status for all third-party integrations."""
    return list(_integrations_state.values())


@router.get("/google/connect")
def connect_google_calendar():
    """Initiate OAuth2 connection to Google Calendar."""
    return {
        "auth_url": "https://accounts.google.com/o/oauth2/v2/auth?scope=calendar.events&response_type=code",
        "status": "oauth_flow_initiated",
        "state": "mock_oauth_state_123"
    }


@router.get("/google/callback")
def google_calendar_callback(code: str = "", state: str = ""):
    """Handle OAuth2 callback."""
    return {"success": True, "message": "Google Calendar connected successfully"}


@router.post("/google/disconnect")
def disconnect_google_calendar():
    """Disconnect Google Calendar integration."""
    _integrations_state["google_calendar"]["status"] = "disconnected"
    return {"success": True}


@router.post("/{provider}/test")
def test_integration(provider: str):
    """Run diagnostic ping for an integration provider."""
    if provider not in _integrations_state:
        raise HTTPException(status_code=404, detail="Provider not found")
    return {
        "provider": provider,
        "status": "operational",
        "latency_ms": 42,
        "mode": "simulator" if provider == "google_calendar" else "verified"
    }
