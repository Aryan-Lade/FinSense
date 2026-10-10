"""
Base Pydantic schemas for FinSense.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class BaseSchema(BaseModel):
    """Base schema with common configuration."""
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class TimestampSchema(BaseSchema):
    """Schema with timestamp fields."""
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class PaginationParams(BaseSchema):
    """Pagination parameters."""
    page: int = Field(1, ge=1, description="Page number")
    limit: int = Field(10, ge=1, le=100, description="Items per page")
    
    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit


class PaginatedResponse(BaseSchema):
    """Paginated response wrapper."""
    items: List[Any]
    total: int
    page: int
    limit: int
    pages: int
    
    @classmethod
    def create(
        cls, 
        items: List[Any], 
        total: int, 
        page: int, 
        limit: int
    ) -> "PaginatedResponse":
        pages = (total + limit - 1) // limit if limit > 0 else 0
        return cls(
            items=items,
            total=total,
            page=page,
            limit=limit,
            pages=pages
        )
