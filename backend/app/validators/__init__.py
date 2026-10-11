"""
FinSense deterministic validation module.
"""
from .gstin import (
    validate_gstin, 
    is_valid_gstin_format, 
    validate_gstin_checksum, 
    compute_gstin_check_digit,
    gstin_suggestions, 
    make_gstin
)
from .tax import validate_tax_consistency
from .arithmetic import validate_arithmetic
from .fields import validate_fields
from .duplicates import validate_duplicates
from .engine import ValidationEngine, engine, run_validation, VALIDATION_VERSION

__all__ = [
    "validate_gstin",
    "is_valid_gstin_format",
    "validate_gstin_checksum",
    "gstin_suggestions",
    "make_gstin",
    "validate_tax_consistency",
    "validate_arithmetic",
    "validate_fields",
    "validate_duplicates",
    "ValidationEngine",
    "engine",
    "run_validation",
    "VALIDATION_VERSION"
]
