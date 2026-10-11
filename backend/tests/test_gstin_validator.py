"""
Test for GSTIN validator.
"""
import pytest
from app.validators.gstin import validate_gstin


def test_valid_gstin_format():
    """Test validation of a valid GSTIN format."""
    results = validate_gstin("27AAPFU0939F1ZV")
    # All rules should pass or not fail with error
    statuses = [r.status for r in results]
    assert "failed" not in statuses
    check_digit_rule = next(r for r in results if r.rule_id == "R004")
    assert check_digit_rule.status == "passed"


def test_invalid_gstin_format():
    """Test validation of GSTIN with invalid format."""
    results = validate_gstin("INVALID_GSTIN")
    format_rule = next(r for r in results if r.rule_id == "R001")
    assert format_rule.status == "failed"


def test_empty_gstin():
    """Test validation of empty GSTIN."""
    results = validate_gstin("")
    format_rule = next(r for r in results if r.rule_id == "R001")
    assert format_rule.status == "failed"


def test_gstin_too_short():
    """Test validation of too short GSTIN."""
    results = validate_gstin("27AAPFU0939F1Z")  # 14 chars
    format_rule = next(r for r in results if r.rule_id == "R001")
    assert format_rule.status == "failed"


def test_gstin_too_long():
    """Test validation of too long GSTIN."""
    results = validate_gstin("27AAPFU0939F1ZV1")  # 16 chars
    format_rule = next(r for r in results if r.rule_id == "R001")
    assert format_rule.status == "failed"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
