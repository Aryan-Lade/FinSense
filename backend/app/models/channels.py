"""
Channel messages model for omnichannel inbox.
"""
from sqlalchemy import Column, String, Integer, DateTime, Text, JSON, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from .base import Base
from .documents import Document


class ChannelMessage(Base):
    """Channel message model for omnichannel tracking."""
    __tablename__ = "channel_messages"
    
    # Core identification
    id = Column(String(36), primary_key=True, index=True)
    channel = Column(String(20), nullable=False)  # website, whatsapp, email, simulated
    message_id = Column(String(100), nullable=False)  # Unique ID from channel
    
    # Sender info (masked for privacy)
    sender_masked = Column(String(100), nullable=True)
    
    # Timing
    received_at = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # Attachment info
    attachment_hash = Column(String(64), nullable=True)
    
    # Processing status
    ingestion_status = Column(String(20), default="pending")  # pending, processing, completed, failed
    notification_status = Column(String(20), default="pending")  # pending, sent, failed
    
    # Links to processed data
    review_url = Column(String(500), nullable=True)  # URL for reviewing the message
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=True, index=True)
    
    # Relationships
    document = relationship("Document")
    
    # Indexes
    __table_args__ = (
        Index("idx_channel_messages_channel", "channel"),
        Index("idx_channel_messages_message_id", "message_id"),
        Index("idx_channel_messages_received_at", "received_at"),
        Index("idx_channel_messages_ingestion_status", "ingestion_status"),
        Index("idx_channel_messages_document_id", "document_id"),
        UniqueConstraint("channel", "message_id", name="uq_channel_message_unique"),
    )
