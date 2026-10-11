"""
Omnichannel intake protocol and canonical data classes.
Section 16: ChannelAdapter interface, IncomingMessage with masked sender.
"""
from typing import Protocol, List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime


@dataclass
class ChannelAttachment:
    name: str
    mime: str
    size_bytes: int
    content_bytes: Optional[bytes] = None
    media_id: Optional[str] = None
    sha256: str = ""


@dataclass
class IncomingMessage:
    channel: str  # website | whatsapp | email | simulated
    message_id: str
    sender_masked: str
    received_at: datetime
    text: Optional[str] = None
    attachments: List[ChannelAttachment] = None

    def __post_init__(self):
        if self.attachments is None:
            self.attachments = []


class ChannelAdapter(Protocol):
    """Protocol for omnichannel intake adapters."""
    name: str

    def verify_webhook(self, headers: Dict[str, str], body: bytes) -> bool:
        """Verify webhook authenticity / cryptographic signature."""
        ...

    def parse_event(self, payload: Dict[str, Any]) -> Optional[IncomingMessage]:
        """Parse raw incoming payload into normalized IncomingMessage."""
        ...

    def download_attachment(self, attachment: ChannelAttachment) -> bytes:
        """Download raw attachment binary data."""
        ...

    def send_notification(self, recipient: str, message: str, review_link: Optional[str] = None) -> bool:
        """Send notification or receipt confirmation."""
        ...
