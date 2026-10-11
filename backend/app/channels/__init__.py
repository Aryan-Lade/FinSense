"""
Omnichannel intake adapters.
"""
from .base import ChannelAdapter, IncomingMessage, ChannelAttachment
from .whatsapp import WhatsAppAdapter, mask_phone_number
from .email import EmailAdapter, mask_email
from .simulated import SimulatedChannelAdapter

__all__ = [
    "ChannelAdapter",
    "IncomingMessage",
    "ChannelAttachment",
    "WhatsAppAdapter",
    "mask_phone_number",
    "EmailAdapter",
    "mask_email",
    "SimulatedChannelAdapter",
]
