"""
Document model for storing uploaded files and processing info.
"""
from sqlalchemy import Column, String, Integer, Text, DateTime, Boolean, JSON, ForeignKey, Index, func
from sqlalchemy.orm import relationship
from .base import Base


class Document(Base):
    """Document model for uploaded files."""
    __tablename__ = "documents"
    
    # Basic file info
    original_filename = Column(String(500), nullable=False)
    stored_path = Column(String(500), nullable=False)
    mime_type = Column(String(100), nullable=False)
    size_bytes = Column(Integer, nullable=False)
    sha256 = Column(String(64), nullable=False, unique=True, index=True)
    
    # Processing info
    pipeline = Column(String(50))  # pdf_image, spreadsheet, etc.
    processing_status = Column(String(20), default="queued")  # queued, processing, completed, failed
    error_message = Column(Text, nullable=True)
    
    # Source tracking (for omnichannel)
    batch_id = Column(String(36), nullable=True, index=True)
    source_channel = Column(String(20), nullable=True)  # website, whatsapp, email, simulated
    source_message_id = Column(String(100), nullable=True)
    source_sender_masked = Column(String(100), nullable=True)
    source_received_at = Column(DateTime(timezone=True), nullable=True)
    source_attachment_name = Column(String(255), nullable=True)
    source_attachment_hash = Column(String(64), nullable=True)
    
    # Ingestion tracking
    ingestion_status = Column(String(20), default="pending")  # pending, processing, completed, failed
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    invoices = relationship("Invoice", back_populates="document")
    
    # Indexes
    __table_args__ = (
        Index("idx_documents_sha256", "sha256"),
        Index("idx_documents_processing_status", "processing_status"),
        Index("idx_documents_source_channel", "source_channel"),
        Index("idx_documents_created_at", "created_at"),
    )
