"""
Supplier repository.
"""
from app.repositories.base import BaseRepository
from app.models.suppliers import Supplier


class SupplierRepository(BaseRepository[Supplier]):
    def __init__(self, db):
        super().__init__(Supplier, db)