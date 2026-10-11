"""
Reminder rules computation engine.
Section 13: Deterministic rules, 10-day then 2-day repeat schedule, timezone-aware.
"""
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, date, time, timedelta
from zoneinfo import ZoneInfo
from app.core.config import settings


def compute_next_reminder(
    received_at: datetime,
    due_date: Optional[date] = None,
    rule_type: str = "after_receipt",
    custom_fire_at: Optional[datetime] = None,
    interval_days: int = 10,
    repeat_days: int = 2,
    timezone_str: str = "Asia/Kolkata"
) -> Tuple[datetime, Optional[str]]:
    """
    Compute first reminder fire time in UTC and any warning message.
    Returns (fire_at_utc, warning_message).
    """
    tz = ZoneInfo(timezone_str or settings.TIMEZONE)
    reminder_time_str = getattr(settings, "REMINDER_TIME", "09:00")
    r_hour, r_minute = map(int, reminder_time_str.split(":"))

    warning: Optional[str] = None
    target_dt_local: datetime

    # 1. Custom date wins
    if rule_type == "custom" and custom_fire_at:
        if custom_fire_at.tzinfo is None:
            target_dt_local = custom_fire_at.replace(tzinfo=tz)
        else:
            target_dt_local = custom_fire_at.astimezone(tz)
    # 2. Before due date
    elif rule_type == "before_due_date":
        if not due_date:
            raise ValueError("Due date required for 'before_due_date' rule.")
        due_dt = datetime.combine(due_date - timedelta(days=interval_days), time(r_hour, r_minute), tzinfo=tz)
        target_dt_local = due_dt
    # 3. On due date
    elif rule_type == "on_due_date":
        if not due_date:
            raise ValueError("Due date required for 'on_due_date' rule.")
        target_dt_local = datetime.combine(due_date, time(r_hour, r_minute), tzinfo=tz)
    # 4. Default: after_receipt
    else:
        # received_at + N days
        rec_local = received_at.astimezone(tz) if received_at.tzinfo else received_at.replace(tzinfo=tz)
        target_date = (rec_local + timedelta(days=interval_days)).date()
        target_dt_local = datetime.combine(target_date, time(r_hour, r_minute), tzinfo=tz)

    now_local = datetime.now(tz)
    if target_dt_local < now_local:
        warning = f"Computed reminder time ({target_dt_local.strftime('%Y-%m-%d %H:%M')}) is in the past."

    # Convert to UTC
    fire_at_utc = target_dt_local.astimezone(ZoneInfo("UTC"))
    return fire_at_utc, warning


def advance_reminder_slot(
    current_fire_at_utc: datetime,
    repeat_days: int = 2,
    now_utc: Optional[datetime] = None
) -> Tuple[datetime, int]:
    """
    Advance next_fire_at by repeat_days, skipping past missed slots without notification storms.
    Returns (next_fire_at_utc, missed_count).
    """
    if now_utc is None:
        now_utc = datetime.now(ZoneInfo("UTC"))

    next_fire = current_fire_at_utc
    missed = 0
    delta = timedelta(days=max(1, repeat_days))

    while next_fire <= now_utc:
        next_fire += delta
        missed += 1

    return next_fire, max(0, missed - 1)
