"""
Batch model for processing multiple documents.
"""
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, JSON, Index, ForeignKey, func
from sqlalchemy.orm import relationship
from .base import Base


class Batch(Base):
    """Batch model for processing multiple documents."""
    __tablename__ = "batches"
    
    # Batch info
    total_files = Column(Integer, default=0)
    succeeded = Column(Integer, default=0)
    needs_review = Column(Integer, default=0)
    validation_failures = Column(Integer, default=0)
    duplicate_suspects = Column(Integer, default=0)
    unsupported_corrupt = Column(Integer, default=0)
    
    # Progress tracking
    progress_percent = Column(Float, default=0.0)
    
    # Status
    status = Column(String(20), default="processing")  # processing, completed, failed, interrupted
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Indexes
    __table_args__ = (
        Index("idx_batches_status", "status"),
        Index("idx_batches_created_at", "created_at"),
    )


class BatchItem(Base):
    """Individual items within a batch."""
    __tablename__ = "batch_items"
    
    # Foreign keys
    batch_id = Column(String(36), ForeignKey("batches.id"), nullable=False, index=True)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False, index=True)
    
    # Processing results
    status = Column(String(20), nullable=False)  # succeeded, needs_review, validation_failed, duplicate_suspect, unsupported_corrupt, failed
    error_message = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    batch = relationship("Batch", back_populates="items")
    document = relationship("Document")
    
    # Indexes
    __table_args__ = (
        Index("idx_batch_items_batch_id", "batch_id"),
        Index("idx_batch_items_document_id", "document_id"),
        Index("idx_batch_items_status", "status"),
    )


# Add relationship to Batch model
Batch.items = relationship("BatchItem", back_populates="batch", cascade="all, delete-orphan")
