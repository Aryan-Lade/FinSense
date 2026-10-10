"""
Money utilities for handling currency values with precision.
"""
from decimal import Decimal, ROUND_HALF_UP
from typing import Union


def to_decimal(value: Union[str, int, float, Decimal]) -> Decimal:
    """Convert value to Decimal with proper precision."""
    if isinstance(value, Decimal):
        return value
    return Decimal(str(value))


def round_money(value: Union[str, int, float, Decimal], places: int = 2) -> Decimal:
    """Round monetary value to specified decimal places."""
    return to_decimal(value).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def parse_amount(amount_str: str) -> Decimal:
    """Parse amount string removing currency symbols and commas."""
    if not amount_str or not isinstance(amount_str, str):
        return Decimal('0')
    
    # Remove common currency symbols and whitespace
    cleaned = amount_str.strip()
    for symbol in ['₹', 'Rs.', 'INR', '$', '€', '£']:
        cleaned = cleaned.replace(symbol, '')
    
    # Remove commas
    cleaned = cleaned.replace(',', '')
    
    # Handle negative values in parentheses
    if cleaned.startswith('(') and cleaned.endswith(')'):
        cleaned = '-' + cleaned[1:-1]
    
    try:
        return to_decimal(cleaned)
    except Exception:
        return Decimal('0')


def format_amount(amount: Union[str, int, float, Decimal], currency: str = "₹") -> str:
    """Format amount as currency string."""
    decimal_amount = round_money(amount)
    return f"{currency} {decimal_amount:,.2f}"
