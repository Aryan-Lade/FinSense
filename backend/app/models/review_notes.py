"""
Review notes model for storing notes on invoices.
"""
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Index, func
from sqlalchemy.orm import relationship
from .base import Base
from .invoices import Invoice


class ReviewNote(Base):
    """Review note model for storing notes on invoices."""
    __tablename__ = "review_notes"
    
    # Foreign key
    invoice_id = Column(String(36), ForeignKey("invoices.id"), nullable=False, index=True)
    
    # Note content
    author = Column(String(100), nullable=True)  # Who wrote the note
    text = Column(Text, nullable=False)  # The note content
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    invoice = relationship("Invoice", back_populates="review_notes")
    
    # Indexes
    __table_args__ = (
        Index("idx_review_notes_invoice_id", "invoice_id"),
        Index("idx_review_notes_created_at", "created_at"),
    )


# Add relationship to Invoice model
Invoice.review_notes = relationship("ReviewNote", back_populates="invoice", cascade="all, delete-orphan")
