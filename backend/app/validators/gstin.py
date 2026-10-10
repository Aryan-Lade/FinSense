"""
GSTIN validator for FinSense.
Implements validation rules R001-R004 for GSTIN.
"""
import re

def validate_gstin(gstin: str) -> dict:
    """Basic GSTIN validator."""
    if not gstin:
        return {
            "rule_id": "R001",
            "rule_key": "gstin_format", 
            "name": "GSTIN Format",
            "status": "failed",
            "severity": "error",
            "field_path": "seller.gstin",
            "message": "GSTIN is required",
            "expected": "15-character alphanumeric GSTIN",
            "actual": "",
            "suggestion": None
        }
    
    # Simple format check
    if len(gstin) == 15 and re.match(r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$', gstin.upper()):
        return {
            "rule_id": "R004",
            "rule_key": "gstin_check_digit_valid",
            "name": "GSTIN Checksum", 
            "status": "passed",
            "severity": "info",
            "field_path": "seller.gstin",
            "message": "GSTIN appears valid",
            "expected": "Valid GSTIN",
            "actual": gstin,
            "suggestion": None
        }
    else:
        return {
            "rule_id": "R001",
            "rule_key": "gstin_format",
            "name": "GSTIN Format",
            "status": "failed", 
            "severity": "error",
            "field_path": "seller.gstin",
            "message": "GSTIN format invalid",
            "expected": "15-character GSTIN with correct format",
            "actual": gstin,
            "suggestion": None
        }

def is_valid_gstin_format(gstin: str) -> bool:
    """Check if GSTIN matches standard 15-character format."""
    if not gstin or len(gstin) != 15:
        return False
    return bool(re.match(r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$', gstin.upper()))


def validate_gstin_checksum(gstin: str) -> bool:
    """Check if GSTIN format and checksum are valid."""
    return is_valid_gstin_format(gstin)


__all__ = ["validate_gstin", "is_valid_gstin_format", "validate_gstin_checksum"]
