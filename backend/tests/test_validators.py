"""
Comprehensive tests for FinSense Validation Engine (R001 - R052).
"""
import pytest
from app.validators import (
    validate_gstin, 
    validate_gstin_checksum, 
    compute_gstin_check_digit,
    gstin_suggestions,
    validate_tax_consistency,
    validate_arithmetic,
    validate_fields,
    engine,
    make_gstin
)

def test_gstin_verified_vector():
    """Verified vector: 27AAPFU0939F1ZV is mathematically valid."""
    valid_gstin = "27AAPFU0939F1ZV"
    assert validate_gstin_checksum(valid_gstin) is True
    results = validate_gstin(valid_gstin)
    assert not any(r.severity == "error" for r in results)

def test_gstin_check_digit_failure_and_suggestion():
    """Corrupt 15th digit should trigger R004 error and provide correction suggestion."""
    corrupted = "27AAPFU0939F1Z5"  # Correct check digit is 'V'
    assert validate_gstin_checksum(corrupted) is False
    results = validate_gstin(corrupted)
    r004 = [r for r in results if r.rule_id == "R004"]
    assert len(r004) == 1
    assert r004[0].status == "failed"
    assert r004[0].expected == "V"
    assert r004[0].suggestion == "27AAPFU0939F1ZV"

def test_tax_intrastate_consistency():
    """Intra-state supply requires CGST + SGST with equal rates, IGST = 0."""
    inv = {
        "seller": {"state_code": "27", "gstin": "27AAPFU0939F1ZV"},
        "buyer": {"state_code": "27"},
        "meta": {"place_of_supply_code": "27"},
        "totals": {
            "total_taxable_value": 1000.0,
            "total_cgst": 90.0,
            "total_sgst": 90.0,
            "total_igst": 0.0,
            "total_tax": 180.0,
            "total_amount": 1180.0
        }
    }
    results = validate_tax_consistency(inv)
    assert not any(r.severity == "error" for r in results)
    assert any(r.rule_id == "R010" and "Intra-state" in r.message for r in results)

def test_tax_interstate_error_when_cgst_present():
    """Inter-state supply charging CGST/SGST instead of IGST triggers R012 error."""
    inv = {
        "seller": {"state_code": "27"},
        "buyer": {"state_code": "24"},
        "meta": {"place_of_supply_code": "24"},
        "totals": {
            "total_taxable_value": 1000.0,
            "total_cgst": 90.0,
            "total_sgst": 90.0,
            "total_igst": 0.0,
            "total_amount": 1180.0
        }
    }
    results = validate_tax_consistency(inv)
    r012 = [r for r in results if r.rule_id == "R012" and r.status == "failed"]
    assert len(r012) == 1

def test_arithmetic_grand_total_reconciliation():
    """Arithmetic reconciliation detects math discrepancies."""
    inv = {
        "totals": {
            "total_taxable_value": 1000.0,
            "total_cgst": 90.0,
            "total_sgst": 90.0,
            "total_igst": 0.0,
            "total_tax": 180.0,
            "round_off": 0.0,
            "total_amount": 1180.0
        }
    }
    results = validate_arithmetic(inv)
    assert not any(r.severity == "error" for r in results)

def test_arithmetic_amount_in_words_cross_check():
    """Rule R028: Amount in words mismatch triggers warning."""
    inv = {
        "totals": {
            "total_taxable_value": 1000.0,
            "total_tax": 180.0,
            "total_amount": 1180.0,
            "amount_in_words": "One Thousand One Hundred and Eighty-Nine Rupees Only" # 1,189 vs 1,180
        }
    }
    results = validate_arithmetic(inv)
    r028 = [r for r in results if r.rule_id == "R028" and r.status == "failed"]
    assert len(r028) == 1
    assert r028[0].severity == "warning"

def test_validation_engine_complete_valid_invoice():
    """ValidationEngine produces a status='valid' report for a compliant invoice."""
    inv = {
        "meta": {
            "invoice_number": "INV-2026-001",
            "invoice_date": "2026-05-10",
            "document_category": "gst_invoice",
            "place_of_supply_code": "27",
            "currency": "INR"
        },
        "seller": {
            "legal_name": "Apex Cloud Systems Pvt Ltd",
            "gstin": "27AAPFU0939F1ZV",
            "state_code": "27"
        },
        "buyer": {
            "legal_name": "Zenith Enterprises",
            "state_code": "27"
        },
        "totals": {
            "total_taxable_value": 10000.0,
            "total_cgst": 900.0,
            "total_sgst": 900.0,
            "total_igst": 0.0,
            "total_tax": 1800.0,
            "round_off": 0.0,
            "total_amount": 11800.0,
            "amount_in_words": "Eleven Thousand Eight Hundred Rupees Only"
        },
        "items": [
            {
                "description": "Cloud hosting services",
                "quantity": 1,
                "unit_price": 10000.0,
                "taxable_amount": 10000.0,
                "cgst_rate": 9.0,
                "sgst_rate": 9.0,
                "total_amount": 11800.0
            }
        ]
    }
    report = engine.run_all(inv)
    assert report.status == "valid"
    assert report.is_valid is True
    assert len(report.errors) == 0
    assert len(report.checks_passed) > 0
