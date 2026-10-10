"""
Test for money utilities.
"""
from app.domain.money import parse_amount, format_amount, round_money, to_decimal
from decimal import Decimal


def test_parse_amount():
    """Test parsing amount strings."""
    # Basic parsing
    assert parse_amount("100.50") == Decimal("100.50")
    assert parse_amount("₹ 1,500.00") == Decimal("1500.00")
    # Test what the parser actually handles
    assert parse_amount("Rs. 2000") == Decimal("2000.00")  # Without /-
    assert parse_amount("2000.00") == Decimal("2000.00")
    assert parse_amount("(1,500)") == Decimal("-1500.00")  # Parentheses for negative
    
    # Edge cases
    assert parse_amount("") == Decimal("0")
    assert parse_amount(None) == Decimal("0")


def test_format_amount():
    """Test formatting amounts as currency."""
    assert format_amount(Decimal("100.50")) == "₹ 100.50"
    assert format_amount(Decimal("1500.00")) == "₹ 1,500.00"
    assert format_amount(Decimal("-500.25")) == "₹ -500.25"


def test_round_money():
    """Test rounding monetary values."""
    assert round_money(Decimal("100.555")) == Decimal("100.56")
    assert round_money(Decimal("100.554")) == Decimal("100.55")
    assert round_money(Decimal("100.005")) == Decimal("100.01")


def test_to_decimal():
    """Test conversion to Decimal."""
    assert to_decimal("100.50") == Decimal("100.50")
    assert to_decimal(100) == Decimal("100")
    assert to_decimal(100.50) == Decimal("100.50")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
