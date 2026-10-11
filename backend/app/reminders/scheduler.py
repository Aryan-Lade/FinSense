"""
Reminder scheduler and execution engine.
Section 13 & 26: APScheduler job, idempotent execution, reminder_number, sent_at, missed_count.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from zoneinfo import ZoneInfo
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import get_db_context
from app.models.reminders import Reminder, ReminderEvent
from app.models.invoices import Invoice
from .rules import advance_reminder_slot


def run_due_reminders(now_utc: Optional[datetime] = None) -> List[Dict[str, Any]]:
    """
    Execute all due scheduled reminders whose bills remain unpaid.
    Idempotent execution with UNIQUE(reminder_id, fire_at) constraint.
    """
    if now_utc is None:
        now_utc = datetime.now(ZoneInfo("UTC"))

    results = []

    with get_db_context() as db:
        due_reminders = (
            db.query(Reminder)
            .join(Invoice, Reminder.invoice_id == Invoice.id)
            .filter(
                Reminder.status == "scheduled",
                Reminder.next_fire_at <= now_utc,
                Invoice.payment_status == "unpaid",
                Invoice.review_status != "rejected"
            )
            .all()
        )

        for rem in due_reminders:
            # Check existing events count for this reminder to compute reminder_number
            event_count = db.query(ReminderEvent).filter(ReminderEvent.reminder_id == rem.id).count()
            current_num = event_count + 1

            # Advance slot safely skipping missed intervals
            repeat_days = rem.repeat_every_days or getattr(settings, "REMINDER_REPEAT_DAYS", 2)
            next_fire, missed = advance_reminder_slot(rem.next_fire_at, repeat_days, now_utc)

            # Record event
            event = ReminderEvent(
                reminder_id=rem.id,
                reminder_number=current_num,
                fire_at=rem.next_fire_at,
                sent_at=now_utc,
                channel="in_app",
                missed_count=missed
            )
            db.add(event)

            # Update reminder next fire time
            rem.next_fire_at = next_fire
            results.append({
                "reminder_id": rem.id,
                "invoice_id": rem.invoice_id,
                "reminder_number": current_num,
                "next_fire_at": next_fire.isoformat(),
                "missed_count": missed
            })

        db.commit()

    return results
