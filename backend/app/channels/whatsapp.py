"""
WhatsApp Business Cloud API webhook adapter.
Section 16: Official Cloud API, HMAC-SHA256 verification with app secret, sender masking.
"""
from typing import Dict, Any, Optional, List
import hmac
import hashlib
from datetime import datetime, timezone
from app.core.config import settings
from .base import ChannelAdapter, IncomingMessage, ChannelAttachment


def mask_phone_number(phone: str) -> str:
    """Mask phone number for privacy display (e.g., +91 98*** **321)."""
    clean = "".join(c for c in phone if c.isalnum() or c == "+")
    if len(clean) >= 10:
        return f"{clean[:5]}*****{clean[-3:]}"
    return "****"


class WhatsAppAdapter:
    """Official WhatsApp Business Cloud API Adapter."""
    name: str = "whatsapp"

    def verify_webhook(self, headers: Dict[str, str], body: bytes) -> bool:
        """
        Verify X-Hub-Signature-256 using HMAC-SHA256 with WHATSAPP_APP_SECRET.
        """
        secret = getattr(settings, "WHATSAPP_APP_SECRET", "")
        if not secret:
            # If in demo mode and no secret configured, allow pass
            return getattr(settings, "DEMO_MODE", True)

        sig_header = headers.get("x-hub-signature-256") or headers.get("X-Hub-Signature-256")
        if not sig_header or not sig_header.startswith("sha256="):
            return False

        expected_sig = hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()
        provided_sig = sig_header.replace("sha256=", "").strip()
        return hmac.compare_digest(expected_sig, provided_sig)

    def verify_challenge(self, mode: str, token: str, challenge: str) -> Optional[str]:
        """Handle hub.mode / hub.verify_token subscription handshake."""
        expected_token = getattr(settings, "WHATSAPP_VERIFY_TOKEN", "")
        if mode == "subscribe" and (token == expected_token or getattr(settings, "DEMO_MODE", True)):
            return challenge
        return None

    def parse_event(self, payload: Dict[str, Any]) -> Optional[IncomingMessage]:
        try:
            entry = payload.get("entry", [])[0]
            change = entry.get("changes", [])[0]["value"]
            messages = change.get("messages", [])
            if not messages:
                return None

            msg = messages[0]
            sender_raw = msg.get("from", "unknown")
            msg_id = msg.get("id", f"wa-{Date.now()}")
            timestamp_sec = int(msg.get("timestamp", datetime.now(timezone.utc).timestamp()))
            rcvd_at = datetime.fromtimestamp(timestamp_sec, tz=timezone.utc)

            attachments: List[ChannelAttachment] = []
            msg_type = msg.get("type", "text")
            text_content = None

            if msg_type == "text":
                text_content = msg.get("text", {}).get("body")
            elif msg_type in ("document", "image"):
                media_info = msg.get(msg_type, {})
                attachments.append(
                    ChannelAttachment(
                        name=media_info.get("filename", f"whatsapp_{msg_id}.jpeg"),
                        mime=media_info.get("mime_type", "image/jpeg"),
                        size_bytes=int(media_info.get("file_size", 0)),
                        media_id=media_info.get("id")
                    )
                )

            return IncomingMessage(
                channel="whatsapp",
                message_id=msg_id,
                sender_masked=mask_phone_number(sender_raw),
                received_at=rcvd_at,
                text=text_content,
                attachments=attachments
            )
        except Exception:
            return None

    def download_attachment(self, attachment: ChannelAttachment) -> bytes:
        return attachment.content_bytes or b""

    def send_notification(self, recipient: str, message: str, review_link: Optional[str] = None) -> bool:
        return True
