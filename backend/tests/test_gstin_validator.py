"""
Test for GSTIN validator.
"""
import pytest
from app.validators.gstin import validate_gstin


def test_valid_gstin_format():
    """Test validation of a valid GSTIN format."""
    # This is a known valid format: 27AAPFU0939F1ZV (we'll trust it's valid for format)
    result = validate_gstin("27AAPFU0939F1ZV")
    assert result["status"] == "passed"
    assert result["rule_id"] == "R004"


def test_invalid_gstin_format():
    """Test validation of GSTIN with invalid format."""
    result = validate_gstin("INVALID_GSTIN")
    assert result["status"] == "failed"
    assert result["rule_id"] == "R001"  # Format validation


def test_empty_gstin():
    """Test validation of empty GSTIN."""
    result = validate_gstin("")
    assert result["status"] == "failed"
    assert result["rule_id"] == "R001"


def test_gstin_too_short():
    """Test validation of too short GSTIN."""
    result = validate_gstin("27AAPFU0939F1Z")  # 14 chars
    assert result["status"] == "failed"


def test_gstin_too_long():
    """Test validation of too long GSTIN."""
    result = validate_gstin("27AAPFU0939F1ZV1")  # 16 chars
    assert result["status"] == "failed"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
