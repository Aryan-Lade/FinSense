"""
Invoice repository.
"""
from app.repositories.base import BaseRepository
from app.models.invoices import Invoice


class InvoiceRepository(BaseRepository[Invoice]):
    def __init__(self, db):
        super().__init__(Invoice, db)

    def get_by_supplier(self, supplier_id: int, skip: int = 0, limit: int = 100):
        """Get invoices by supplier ID."""
        return (
            self.db.query(self.model)
            .filter(self.model.supplier_id == supplier_id)
            .offset(skip)
            .limit(limit)
            .all()
        )