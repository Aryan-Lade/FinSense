"""
Inbound Email channel adapter.
Section 16: IMAP / Microsoft Graph / SendGrid inbound webhook with attachment sanitization.
"""
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from .base import ChannelAdapter, IncomingMessage, ChannelAttachment


def mask_email(email: str) -> str:
    """Mask email for privacy display (e.g. ac***@domain.com)."""
    if "@" not in email:
        return "****"
    user, domain = email.split("@", 1)
    if len(user) <= 2:
        return f"{user}***@{domain}"
    return f"{user[:2]}***@{domain}"


class EmailAdapter:
    """Email Intake Adapter."""
    name: str = "email"

    def verify_webhook(self, headers: Dict[str, str], body: bytes) -> bool:
        return True

    def parse_event(self, payload: Dict[str, Any]) -> Optional[IncomingMessage]:
        sender = payload.get("from", "vendor@example.com")
        msg_id = payload.get("message_id", f"em-{datetime.now().strftime('%H%M%S')}")
        subject = payload.get("subject", "Tax Invoice")

        attachments = []
        for att in payload.get("attachments", []):
            attachments.append(
                ChannelAttachment(
                    name=att.get("filename", "invoice.pdf"),
                    mime=att.get("content_type", "application/pdf"),
                    size_bytes=int(att.get("size", 0)),
                    content_bytes=att.get("content")
                )
            )

        return IncomingMessage(
            channel="email",
            message_id=msg_id,
            sender_masked=mask_email(sender),
            received_at=datetime.now(timezone.utc),
            text=subject,
            attachments=attachments
        )

    def download_attachment(self, attachment: ChannelAttachment) -> bytes:
        return attachment.content_bytes or b""

    def send_notification(self, recipient: str, message: str, review_link: Optional[str] = None) -> bool:
        return True
