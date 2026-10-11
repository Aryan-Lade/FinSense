"""
GSTIN validator for FinSense.
Implements validation rules R001-R004 for GSTIN:
- R001: GSTIN format (15-character alphanumeric)
- R002: State code valid (01-38, 97, 99)
- R003: PAN 4th character entity type (P, C, H, F, A, T, B, L, J, G)
- R004: 36-modulus check digit verification
"""
import re
from typing import Optional, List, Dict, Any
from app.domain.state_codes import STATE_CODES
from app.schemas.validation import ValidationResult

CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
PAN_ENTITY_TYPES = set("PCHFATBLJG")
GSTIN_REGEX = re.compile(r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$')


def compute_gstin_check_digit(gstin14: str) -> str:
    """
    Compute 15th check digit for a 14-character GSTIN prefix using the official 36-modulus algorithm.
    """
    if len(gstin14) < 14:
        raise ValueError("GSTIN prefix must be at least 14 characters")
    
    total = 0
    for i, ch in enumerate(gstin14[:14].upper()):
        if ch not in CHARSET:
            return ""
        v = CHARSET.index(ch) * (1 if i % 2 == 0 else 2)
        total += (v // 36) + (v % 36)
    
    check_char = CHARSET[(36 - (total % 36)) % 36]
    return check_char


def is_valid_gstin_format(gstin: Optional[str]) -> bool:
    """Check if GSTIN matches standard 15-character format."""
    if not gstin or len(gstin) != 15:
        return False
    return bool(GSTIN_REGEX.match(gstin.upper()))


def validate_gstin_checksum(gstin: Optional[str]) -> bool:
    """Verify both format and the 15th check digit."""
    if not is_valid_gstin_format(gstin):
        return False
    g = gstin.upper()
    return compute_gstin_check_digit(g[:14]) == g[14]


def gstin_suggestions(bad_gstin: str) -> List[str]:
    """
    Suggest valid GSTINs for OCR optical confusion characters:
    0/O, 1/I, 5/S, 8/B, 2/Z, 6/G.
    """
    if not bad_gstin:
        return []
    
    raw = bad_gstin.upper().strip()
    if len(raw) != 15:
        return []
    
    # Confusions map
    confusions = {
        '0': ['O'], 'O': ['0'],
        '1': ['I'], 'I': ['1'],
        '5': ['S'], 'S': ['5'],
        '8': ['B'], 'B': ['8'],
        '2': ['Z'], 'Z': ['2'],
        '6': ['G'], 'G': ['6']
    }
    
    candidates = []
    
    # 1. Try recomputing 15th check digit directly if first 14 are plausible
    if len(raw) == 15:
        try:
            expected_chk = compute_gstin_check_digit(raw[:14])
            if expected_chk and expected_chk != raw[14]:
                fixed = raw[:14] + expected_chk
                if is_valid_gstin_format(fixed) and validate_gstin_checksum(fixed):
                    candidates.append(fixed)
        except Exception:
            pass

    # 2. Try single-char substitutions across positions
    for idx, char in enumerate(raw):
        if char in confusions:
            for alt in confusions[char]:
                modified = raw[:idx] + alt + raw[idx+1:]
                if is_valid_gstin_format(modified) and validate_gstin_checksum(modified):
                    if modified not in candidates:
                        candidates.append(modified)
                        
    return candidates[:3]


def validate_gstin(gstin: Optional[str], field_path: str = "seller.gstin") -> List[ValidationResult]:
    """
    Run full R001-R004 validations on a GSTIN.
    """
    results = []
    
    if not gstin:
        results.append(ValidationResult(
            rule_id="R001",
            rule_key="gstin_format",
            name="GSTIN Format",
            status="failed",
            severity="error",
            field_path=field_path,
            message=f"{field_path} is required",
            expected="15-character valid GSTIN",
            actual="",
            suggestion=None
        ))
        return results

    g = gstin.upper().strip()
    
    # R001: 15-character regex format check
    if not is_valid_gstin_format(g):
        suggestions = gstin_suggestions(g)
        results.append(ValidationResult(
            rule_id="R001",
            rule_key="gstin_format",
            name="GSTIN Format",
            status="failed",
            severity="error",
            field_path=field_path,
            message="GSTIN does not match standard 15-character alphanumeric format",
            expected="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$",
            actual=gstin,
            suggestion=suggestions[0] if suggestions else None
        ))
        return results
    else:
        results.append(ValidationResult(
            rule_id="R001",
            rule_key="gstin_format",
            name="GSTIN Format",
            status="passed",
            severity="info",
            field_path=field_path,
            message="15-character GSTIN format verified",
            expected="15-character format",
            actual=g
        ))

    # R002: State Code validation
    state_code = g[:2]
    if state_code not in STATE_CODES:
        results.append(ValidationResult(
            rule_id="R002",
            rule_key="gstin_state_code_valid",
            name="GSTIN State Code",
            status="failed",
            severity="error",
            field_path=field_path,
            message=f"Invalid state code '{state_code}' in GSTIN",
            expected="Valid 2-digit Indian State/UT code (01-38, 97, 99)",
            actual=state_code,
            suggestion=None
        ))
    else:
        results.append(ValidationResult(
            rule_id="R002",
            rule_key="gstin_state_code_valid",
            name="GSTIN State Code",
            status="passed",
            severity="info",
            field_path=field_path,
            message=f"State code {state_code} ({STATE_CODES[state_code]}) verified",
            expected=state_code,
            actual=state_code
        ))

    # R003: PAN 4th character entity type
    pan_entity = g[5]
    if pan_entity not in PAN_ENTITY_TYPES:
        results.append(ValidationResult(
            rule_id="R003",
            rule_key="gstin_pan_entity_type",
            name="GSTIN Entity Type",
            status="failed",
            severity="warning",
            field_path=field_path,
            message=f"PAN 4th character '{pan_entity}' is not a recognized entity type (P, C, H, F, A, T, B, L, J, G)",
            expected="One of P, C, H, F, A, T, B, L, J, G",
            actual=pan_entity,
            suggestion=None
        ))
    else:
        results.append(ValidationResult(
            rule_id="R003",
            rule_key="gstin_pan_entity_type",
            name="GSTIN Entity Type",
            status="passed",
            severity="info",
            field_path=field_path,
            message=f"Recognized PAN entity type '{pan_entity}' verified",
            expected="Valid PAN entity type",
            actual=pan_entity
        ))

    # R004: Check Digit verification
    expected_check = compute_gstin_check_digit(g[:14])
    actual_check = g[14]
    
    if expected_check != actual_check:
        suggestions = gstin_suggestions(g)
        results.append(ValidationResult(
            rule_id="R004",
            rule_key="gstin_check_digit_valid",
            name="GSTIN Checksum",
            status="failed",
            severity="error",
            field_path=field_path,
            message=f"GSTIN check digit mismatch: expected '{expected_check}', got '{actual_check}'",
            expected=expected_check,
            actual=actual_check,
            suggestion=suggestions[0] if suggestions else (g[:14] + expected_check)
        ))
    else:
        results.append(ValidationResult(
            rule_id="R004",
            rule_key="gstin_check_digit_valid",
            name="GSTIN Checksum",
            status="passed",
            severity="info",
            field_path=field_path,
            message="GSTIN check digit mathematically verified",
            expected=expected_check,
            actual=actual_check
        ))

    return results


def make_gstin(state_code: str = "27", pan: str = "AAPFU0939F", entity_num: str = "1") -> str:
    """Factory helper to generate valid GSTINs for testing and fixtures."""
    prefix = f"{state_code}{pan}{entity_num}Z"
    chk = compute_gstin_check_digit(prefix)
    return prefix + chk
