"""
Base repository class with common CRUD operations.
"""
from typing import Generic, TypeVar, Type, List, Optional, Union, Any
from sqlalchemy.orm import Session
from app.models.base import BaseModel

ModelType = TypeVar("ModelType", bound=BaseModel)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db

    def get(self, id: Union[str, int]) -> Optional[ModelType]:
        """Get a record by ID."""
        return self.db.query(self.model).filter(self.model.id == str(id)).first()

    def get_multi(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Get multiple records with pagination."""
        return self.db.query(self.model).offset(skip).limit(limit).all()

    def create(self, obj_in: Any) -> ModelType:
        """Create a new record."""
        if hasattr(obj_in, "model_dump"):
            data = obj_in.model_dump()
        elif hasattr(obj_in, "dict"):
            data = obj_in.dict()
        elif isinstance(obj_in, dict):
            data = obj_in
        else:
            data = dict(obj_in)
        db_obj = self.model(**data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, id: Union[str, int], obj_in: Any) -> Optional[ModelType]:
        """Update a record by ID."""
        db_obj = self.get(id)
        if db_obj:
            if hasattr(obj_in, "model_dump"):
                update_data = obj_in.model_dump(exclude_unset=True)
            elif hasattr(obj_in, "dict"):
                update_data = obj_in.dict(exclude_unset=True)
            elif isinstance(obj_in, dict):
                update_data = obj_in
            else:
                update_data = dict(obj_in)
            for field, value in update_data.items():
                if hasattr(db_obj, field):
                    setattr(db_obj, field, value)
            self.db.commit()
            self.db.refresh(db_obj)
        return db_obj

    def delete(self, id: Union[str, int]) -> bool:
        """Delete a record by ID."""
        db_obj = self.get(id)
        if db_obj:
            self.db.delete(db_obj)
            self.db.commit()
            return True
        return False

    def count(self) -> int:
        """Count total records."""
        return self.db.query(self.model).count()