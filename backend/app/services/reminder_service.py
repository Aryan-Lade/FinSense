"""
Reminder service for orchestrating reminder logic.
"""
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.reminders import Reminder, ReminderEvent
from app.repositories.reminders import ReminderRepository
from app.core.errors import ProcessingException
from app.core.clock import get_current_time
import uuid


class ReminderService:
    """Service for managing reminder orchestration."""

    def __init__(self, db):
        self.db = db
        self.reminder_repo = ReminderRepository(db)

    def create_reminder_for_invoice(
        self,
        invoice_id: str,
        rule_type: str,
        interval_days: Optional[int] = None,
        repeat_every_days: Optional[int] = None,
        first_fire_at: Optional[datetime] = None,
        timezone: str = "Asia/Kolkata",
        notification_channels: Optional[List[str]] = None
    ) -> Reminder:
        """Create a reminder for an invoice based on rules."""
        try:
            # Generate idempotency key to prevent duplicates
            idempotency_key = str(uuid.uuid5(
                uuid.NAMESPACE_DNS,
                f"{invoice_id}_{rule_type}_{interval_days or 0}_{repeat_every_days or 0}"
            ))

            # Set default first fire time if not provided
            if first_fire_at is None:
                first_fire_at = get_current_time()
                if rule_type == "after_receipt" and interval_days:
                    first_fire_at += timedelta(days=interval_days)
                elif rule_type == "before_due_date":
                    # This would need the invoice due date - placeholder logic
                    first_fire_at += timedelta(days=3)  # Default 3 days before
                elif rule_type == "on_due_date":
                    # This would need the invoice due date - placeholder logic
                    pass  # Would set to due date

            # Create reminder
            reminder_data = {
                "invoice_id": invoice_id,
                "rule_type": rule_type,
                "interval_days": interval_days,
                "repeat_every_days": repeat_every_days,
                "first_fire_at": first_fire_at,
                "next_fire_at": first_fire_at,  # Initially same as first fire
                "timezone": timezone,
                "notification_channels": notification_channels or ["email"],
                "idempotency_key": idempotency_key,
                "status": "scheduled"
            }

            reminder = self.reminder_repo.create(reminder_data)
            return reminder

        except Exception as e:
            raise ProcessingException(f"Failed to create reminder: {str(e)}", "reminder_creation_error")

    def get_due_reminders(self, current_time: Optional[datetime] = None) -> List[Reminder]:
        """Get reminders that are due to be sent."""
        if current_time is None:
            current_time = get_current_time()

        # Get reminders where next_fire_at is in the past and status is scheduled
        # This is a simplified query - in practice, you'd want to optimize this
        all_reminders = self.reminder_repo.get_multi(limit=1000)  # Get a batch
        due_reminders = [
            r for r in all_reminders
            if r.status == "scheduled"
            and r.next_fire_at
            and r.next_fire_at <= current_time
        ]

        return due_reminders

    def send_reminder(self, reminder_id: str, channel: str = "email") -> ReminderEvent:
        """Send a reminder through the specified channel."""
        try:
            reminder = self.reminder_repo.get(reminder_id)
            if not reminder:
                raise ProcessingException(f"Reminder not found: {reminder_id}", "reminder_not_found")

            if reminder.status != "scheduled":
                raise ProcessingException(f"Reminder is not in scheduled status: {reminder.status}", "invalid_reminder_status")

            # Create reminder event
            event_id = str(uuid.uuid4())
            fired_at = get_current_time()

            event_data = {
                "id": event_id,
                "reminder_id": reminder_id,
                "fire_at": reminder.next_fire_at or fired_at,
                "delivered_at": fired_at,
                "channel": channel
            }

            # In a real implementation, we would save this to the reminder_events table
            # For now, we'll just update the reminder

            # Update reminder based on repeat rules
            if reminder.repeat_every_days and reminder.next_fire_at:
                # Schedule next occurrence
                next_fire = reminder.next_fire_at + timedelta(days=reminder.repeat_every_days)
                reminder.next_fire_at = next_fire
            else:
                # No repeat, mark as completed
                reminder.status = "completed"
                reminder.next_fire_at = None

            reminder.last_sync_at = fired_at
            # In a real implementation, we'd also update reminder.last_error if there was an error

            # Save changes
            self.reminder_repo.db.commit()
            self.reminder_repo.db.refresh(reminder)

            # Return the event (in a real implementation, this would come from the DB)
            return ReminderEvent(
                id=event_id,
                reminder_id=reminder_id,
                fire_at=reminder.next_fire_at or fired_at,
                delivered_at=fired_at,
                channel=channel
            )

        except ProcessingException:
            raise
        except Exception as e:
            raise ProcessingException(f"Failed to send reminder: {str(e)}", "reminder_sending_error")

    def process_due_reminders(self) -> List[ReminderEvent]:
        """Process all due reminders and return the events sent."""
        due_reminders = self.get_due_reminders()
        events_sent = []

        for reminder in due_reminders:
            try:
                # Use the first available channel, or default to email
                channel = reminder.notification_channels[0] if reminder.notification_channels else "email"
                event = self.send_reminder(reminder.id, channel)
                events_sent.append(event)
            except ProcessingException as e:
                # Log the error and continue with other reminders
                # In a real implementation, we'd update the reminder with the error
                reminder.last_error = str(e)
                self.reminder_repo.db.commit()
                continue

        return events_sent


def process_reminders() -> List[ReminderEvent]:
    """Convenience function to process reminders."""
    # Get database session
    db_gen = get_db()
    db = next(db_gen)
    try:
        service = ReminderService(db)
        return service.process_due_reminders()
    finally:
        db.close()