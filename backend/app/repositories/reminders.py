"""
Reminder repository.
"""
from app.repositories.base import BaseRepository
from app.models.reminders import Reminder


class ReminderRepository(BaseRepository[Reminder]):
    def __init__(self, db):
        super().__init__(Reminder, db)

    def get_by_invoice(self, invoice_id: int, skip: int = 0, limit: int = 100):
        """Get reminders by invoice ID."""
        return (
            self.db.query(self.model)
            .filter(self.model.invoice_id == invoice_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_sent_status(self, is_sent: bool, skip: int = 0, limit: int = 100):
        """Get reminders by sent status."""
        return (
            self.db.query(self.model)
            .filter(self.model.is_sent == is_sent)
            .offset(skip)
            .limit(limit)
            .all()
        )