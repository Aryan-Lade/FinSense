"""
Base database model.
"""
import uuid
from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import declarative_base


class Base:
    """Base model with common fields."""
    
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now()
    )


# Create the base class
Base = declarative_base(cls=Base)
BaseModel = Base
