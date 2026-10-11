"""
Validation Engine for FinSense.
Orchestrates pure Python verification rules across GSTIN, Tax, Arithmetic, Fields, and Duplicates.
Produces versioned, deterministic ValidationReport without AI intervention.
"""
from typing import Dict, Any, Optional, List
from app.schemas.validation import ValidationResult, ValidationReport
from .gstin import validate_gstin
from .tax import validate_tax_consistency
from .arithmetic import validate_arithmetic
from .fields import validate_fields
from .duplicates import validate_duplicates

VALIDATION_VERSION = "1.0.0"


class ValidationEngine:
    """Deterministic 7-Point Indian GST and Financial Arithmetic Validation Engine."""

    def __init__(self, version: str = VALIDATION_VERSION):
        self.version = version

    def run_all(
        self, 
        invoice: Dict[str, Any], 
        db_session: Optional[Any] = None,
        current_invoice_id: Optional[str] = None
    ) -> ValidationReport:
        """
        Execute all deterministic validation suites on an invoice canonical dictionary.
        Never modifies any extracted value to make rules pass.
        """
        all_results: List[ValidationResult] = []

        # 1. GSTIN Validations (R001 - R004)
        seller = invoice.get("seller") or {}
        buyer = invoice.get("buyer") or {}
        seller_gstin = seller.get("gstin")
        buyer_gstin = buyer.get("gstin")

        if seller_gstin:
            all_results.extend(validate_gstin(seller_gstin, field_path="seller.gstin"))
        if buyer_gstin:
            all_results.extend(validate_gstin(buyer_gstin, field_path="buyer.gstin"))

        # 2. Tax Consistency Validations (R010 - R013)
        all_results.extend(validate_tax_consistency(invoice))

        # 3. Arithmetic & Rounding Validations (R020 - R028)
        all_results.extend(validate_arithmetic(invoice))

        # 4. Mandatory Field Presence & Formats (R030 - R044)
        all_results.extend(validate_fields(invoice))

        # 5. Duplicate Detection (R050 - R052)
        all_results.extend(validate_duplicates(invoice, db_session=db_session, current_invoice_id=current_invoice_id))

        # Partition errors and warnings
        errors = [r for r in all_results if r.status == "failed" and r.severity == "error"]
        warnings = [r for r in all_results if r.status == "failed" and r.severity == "warning"]
        passed = [r for r in all_results if r.status == "passed"]

        checks_passed_messages = [p.message for p in passed]

        # Determine overall document validation status
        if len(errors) > 0:
            status = "invalid"
        elif len(warnings) > 0:
            status = "warnings"
        else:
            status = "valid"

        return ValidationReport(
            validation_version=self.version,
            status=status,
            results=all_results,
            errors=errors,
            warnings=warnings,
            checks_passed=checks_passed_messages
        )


# Global singleton instance
engine = ValidationEngine()


def run_validation(invoice: Dict[str, Any], db_session: Optional[Any] = None) -> ValidationReport:
    """Convenience function to run all validation rules."""
    return engine.run_all(invoice, db_session=db_session)
