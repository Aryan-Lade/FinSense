"""
Simulated channel adapter for DEMO_MODE and offline evaluations.
Section 16: Labeled SIMULATED, creates verified test events through the same pipeline.
"""
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from .base import ChannelAdapter, IncomingMessage, ChannelAttachment


class SimulatedChannelAdapter:
    """Simulator adapter for WhatsApp and Email demo testing."""
    name: str = "simulated"

    def verify_webhook(self, headers: Dict[str, str], body: bytes) -> bool:
        return True

    def parse_event(self, payload: Dict[str, Any]) -> Optional[IncomingMessage]:
        channel = payload.get("channel", "whatsapp")
        sender = payload.get("sender", "+91 98765 43210")
        msg_id = payload.get("message_id", f"sim-{datetime.now().strftime('%H%M%S')}")
        file_name = payload.get("filename", "invoice_sample.pdf")

        return IncomingMessage(
            channel=channel,
            message_id=msg_id,
            sender_masked=f"{sender[:4]}****{sender[-3:]}" if len(sender) >= 8 else "****",
            received_at=datetime.now(timezone.utc),
            text=payload.get("text", "Please find attached the bill for payment processing."),
            attachments=[
                ChannelAttachment(
                    name=file_name,
                    mime="application/pdf" if file_name.endswith(".pdf") else "image/jpeg",
                    size_bytes=int(payload.get("size_bytes", 154200)),
                    content_bytes=payload.get("content_bytes")
                )
            ]
        )

    def download_attachment(self, attachment: ChannelAttachment) -> bytes:
        return attachment.content_bytes or b"%PDF-1.4 demo test content"

    def send_notification(self, recipient: str, message: str, review_link: Optional[str] = None) -> bool:
        return True
