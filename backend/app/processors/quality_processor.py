"""
Quality assessment and preprocessing processor for invoice data.
"""
import re
from typing import Dict, Any, List, Tuple, Optional, Union
from app.core.errors import ProcessingException


class QualityProcessor:
    """Process and assess quality of invoice data."""

    @staticmethod
    def validate_gstin(gstin: Optional[str]) -> Tuple[bool, Optional[str]]:
        """Validate GSTIN format and checksum."""
        if not gstin:
            return False, "GSTIN is required"

        # Remove whitespace
        gstin = gstin.strip().upper()

        # Check length
        if len(gstin) != 15:
            return False, "GSTIN must be 15 characters long"

        # Check format: 2 digits + 5 uppercase letters + 4 digits + 1 uppercase letter + 1 digit + 1 checksum
        pattern = r'^\d{2}[A-Z]{5}\d{4}[A-Z]\d{1}[A-Z0-9]{1}$'
        if not re.match(pattern, gstin):
            return False, "Invalid GSTIN format"

        # Verify checksum (simplified - real implementation would use proper GSTIN checksum algorithm)
        # For now, we'll accept it if format is correct
        return True, None

    @staticmethod
    def validate_invoice_number(invoice_number: Optional[str]) -> Tuple[bool, Optional[str]]:
        """Validate invoice number."""
        if not invoice_number:
            return False, "Invoice number is required"

        invoice_number = invoice_number.strip()
        if len(invoice_number) < 1:
            return False, "Invoice number cannot be empty"

        # Basic validation - alphanumeric and common separators
        if not re.match(r'^[A-Za-z0-9\-/\.]+$', invoice_number):
            return False, "Invoice number contains invalid characters"

        return True, None

    @staticmethod
    def validate_amount(amount: Optional[Union[str, float, int]]) -> Tuple[bool, Optional[str], Optional[float]]:
        """Validate and convert amount to float."""
        if amount is None:
            return False, "Amount is required", None

        try:
            # Convert to float if it's a string
            if isinstance(amount, str):
                # Remove currency symbols and commas
                cleaned = re.sub(r'[^\d\.]', '', amount)
                amount_float = float(cleaned)
            else:
                amount_float = float(amount)

            if amount_float < 0:
                return False, "Amount cannot be negative", None

            # Check for reasonable precision (2 decimal places)
            if round(amount_float, 2) != amount_float:
                return False, "Amount should have at most 2 decimal places", None

            return True, None, amount_float
        except (ValueError, TypeError):
            return False, "Invalid amount format", None

    @staticmethod
    def assess_data_quality(extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """Assess the quality of extracted invoice data."""
        quality_score = 100.0
        issues = []
        warnings = []

        # Check required fields (with aliases)
        has_inv_num = bool(extracted_data.get('invoice_number') or extracted_data.get('bill_number'))
        if not has_inv_num:
            quality_score -= 20.0
            issues.append("Missing required field: invoice_number")

        has_date = bool(extracted_data.get('invoice_date'))
        if not has_date:
            quality_score -= 15.0
            issues.append("Missing required field: invoice_date")

        has_party = bool(extracted_data.get('customer_name') or extracted_data.get('buyer_name') or extracted_data.get('supplier_name'))
        if not has_party:
            quality_score -= 15.0
            issues.append("Missing required field: customer_name / supplier_name")

        has_total = bool(extracted_data.get('total_amount'))
        if not has_total:
            quality_score -= 25.0
            issues.append("Missing required field: total_amount")

        # Validate GSTIN if present
        gstin = extracted_data.get('seller_gstin') or extracted_data.get('customer_gstin') or extracted_data.get('buyer_gstin')
        if gstin:
            is_valid, error = QualityProcessor.validate_gstin(gstin)
            if not is_valid:
                quality_score -= 10.0
                issues.append(f"Invalid GSTIN: {error}")

        # Check for consistency: subtotal + taxes should equal total_amount
        subtotal = float(extracted_data.get('subtotal') or extracted_data.get('taxable_value') or 0.0)
        taxes = float(extracted_data.get('tax_amount') or 0.0)
        if taxes == 0.0:
            taxes = float(extracted_data.get('cgst_amount') or 0.0) + float(extracted_data.get('sgst_amount') or 0.0) + float(extracted_data.get('igst_amount') or 0.0)
        total = float(extracted_data.get('total_amount') or 0.0)

        if subtotal > 0 and total > 0:
            if abs((subtotal + taxes) - total) <= 1.0:
                quality_score = min(100.0, quality_score + 10.0)
            else:
                quality_score -= 15.0
                issues.append(f"Math discrepancy: Subtotal ({subtotal}) + Taxes ({taxes}) != Total ({total})")

        # Ensure quality score bounds
        quality_score = max(0.0, min(100.0, quality_score))

        # Determine confidence level
        if quality_score >= 90:
            confidence = "high"
        elif quality_score >= 70:
            confidence = "medium"
        else:
            confidence = "low"

        is_passed = quality_score >= 70 and len(issues) == 0

        return {
            "status": "valid" if is_passed else "invalid",
            "quality_score": quality_score,
            "confidence": confidence,
            "issues": issues,
            "warnings": warnings,
            "passed": is_passed
        }


def to_json_safe(obj: Any) -> Any:
    """Recursively convert dates, datetimes, decimals to JSON serializable structures."""
    if hasattr(obj, 'isoformat'):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {str(k): to_json_safe(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple, set)):
        return [to_json_safe(item) for item in obj]
    return obj


def process_invoice_quality(extracted_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process invoice data through quality assessment pipeline.

    Returns processed data with quality metrics.
    """
    try:
        # Assess quality
        quality_assessment = QualityProcessor.assess_data_quality(extracted_data)

        # Prepare result
        result = {
            "original_data": to_json_safe(extracted_data),
            "quality_assessment": to_json_safe(quality_assessment),
            "processing_status": "quality_checked"
        }

        # If quality is good, return cleaned data
        if quality_assessment["passed"]:
            # Clean and normalize data
            cleaned_data = extracted_data.copy()

            # Normalize GSTIN
            if 'customer_gstin' in cleaned_data and cleaned_data['customer_gstin']:
                cleaned_data['customer_gstin'] = cleaned_data['customer_gstin'].strip().upper()

            # Normalize invoice number
            if 'invoice_number' in cleaned_data and cleaned_data['invoice_number']:
                cleaned_data['invoice_number'] = cleaned_data['invoice_number'].strip()

            # Normalize amounts to float with 2 decimal places
            amount_fields = ['total_amount', 'taxable_value', 'cgst_amount', 'sgst_amount', 'igst_amount']
            for field in amount_fields:
                if field in cleaned_data and cleaned_data[field] is not None:
                    is_valid, error, amount_float = QualityProcessor.validate_amount(cleaned_data[field])
                    if is_valid and amount_float is not None:
                        cleaned_data[field] = round(amount_float, 2)

            result["cleaned_data"] = to_json_safe(cleaned_data)
            result["extracted_data"] = to_json_safe(cleaned_data)  # For compatibility
        else:
            result["extracted_data"] = to_json_safe(extracted_data)
            result["cleaned_data"] = None

        return result

    except Exception as e:
        raise ProcessingException(f"Error during quality processing: {str(e)}", "quality_processing_error")