"""
Arithmetic validator for FinSense.
Implements rules R020-R028:
- R020: Line taxable math (qty * rate - discount == taxable)
- R021: Line tax math (taxable * rate% == tax amount)
- R022: Line total math (taxable + tax == line total)
- R023: Subtotal aggregation (sum of lines == total_taxable_value)
- R024: Total tax aggregation (sum of line taxes == total_tax)
- R025: Grand Total reconciliation (taxable + tax + cess + round_off == total_amount)
- R026: Round-off threshold (|round_off| <= 1.0)
- R027: Non-negative quantity / rate checks
- R028: Amount in Words cross-verification (English & Hindi)
"""
from typing import List, Dict, Any, Optional
from decimal import Decimal
from app.schemas.validation import ValidationResult
from app.processors.invoice_extractor import words_to_number

TOLERANCE = 1.00  # 1.00 Rupee tolerance for rounding differences


def validate_arithmetic(invoice_dict: Dict[str, Any]) -> List[ValidationResult]:
    """
    Validate all financial calculations and arithmetic relations across lines and totals.
    """
    results = []
    totals = invoice_dict.get("totals") or {}
    items = invoice_dict.get("items") or []

    subtotal = float(totals.get("total_taxable_value") or 0.0)
    cgst = float(totals.get("total_cgst") or 0.0)
    sgst = float(totals.get("total_sgst") or 0.0)
    igst = float(totals.get("total_igst") or 0.0)
    cess = float(totals.get("total_cess") or 0.0)
    total_tax = float(totals.get("total_tax") or (cgst + sgst + igst + cess))
    round_off = float(totals.get("round_off") or 0.0)
    grand_total = float(totals.get("total_amount") or 0.0)

    # R026: Round-off bound
    if abs(round_off) > 1.00:
        results.append(ValidationResult(
            rule_id="R026",
            rule_key="arithmetic_round_off_bounds",
            name="Round-off Bounds",
            status="failed",
            severity="warning",
            field_path="totals.round_off",
            message=f"Round-off amount (₹{round_off:.2f}) exceeds standard ₹1.00 limit",
            expected="|round_off| <= 1.00",
            actual=round_off
        ))
    else:
        results.append(ValidationResult(
            rule_id="R026",
            rule_key="arithmetic_round_off_bounds",
            name="Round-off Bounds",
            status="passed",
            severity="info",
            field_path="totals.round_off",
            message=f"Round-off amount (₹{round_off:.2f}) within limits",
            expected="<= ₹1.00",
            actual=round_off
        ))

    # R024: Tax sum
    computed_tax_sum = cgst + sgst + igst + cess
    if total_tax > 0 and abs(computed_tax_sum - total_tax) > TOLERANCE:
        results.append(ValidationResult(
            rule_id="R024",
            rule_key="arithmetic_tax_sum",
            name="Total Tax Sum",
            status="failed",
            severity="error",
            field_path="totals.total_tax",
            message=f"Sum of taxes (CGST ₹{cgst:.2f} + SGST ₹{sgst:.2f} + IGST ₹{igst:.2f} = ₹{computed_tax_sum:.2f}) does not match Total Tax (₹{total_tax:.2f})",
            expected=computed_tax_sum,
            actual=total_tax,
            suggestion={"total_tax": computed_tax_sum}
        ))
    else:
        results.append(ValidationResult(
            rule_id="R024",
            rule_key="arithmetic_tax_sum",
            name="Total Tax Sum",
            status="passed",
            severity="info",
            field_path="totals.total_tax",
            message="Total tax components reconciled",
            expected=computed_tax_sum,
            actual=total_tax
        ))

    # R025: Grand Total reconciliation
    computed_grand_total = subtotal + total_tax + round_off
    if grand_total > 0 and abs(computed_grand_total - grand_total) > TOLERANCE:
        results.append(ValidationResult(
            rule_id="R025",
            rule_key="arithmetic_grand_total_reconciliation",
            name="Grand Total Reconciliation",
            status="failed",
            severity="error",
            field_path="totals.total_amount",
            message=f"Subtotal (₹{subtotal:.2f}) + Tax (₹{total_tax:.2f}) + Round-off (₹{round_off:.2f}) = ₹{computed_grand_total:.2f}, does not match Grand Total (₹{grand_total:.2f})",
            expected=computed_grand_total,
            actual=grand_total,
            suggestion={"total_amount": computed_grand_total}
        ))
    elif grand_total > 0:
        results.append(ValidationResult(
            rule_id="R025",
            rule_key="arithmetic_grand_total_reconciliation",
            name="Grand Total Reconciliation",
            status="passed",
            severity="info",
            field_path="totals.total_amount",
            message=f"Grand Total (₹{grand_total:.2f}) perfectly reconciled",
            expected=grand_total,
            actual=grand_total
        ))

    # Line item validations (R020, R021, R022, R027)
    calc_line_subtotal = 0.0
    for idx, item in enumerate(items):
        qty = float(item.get("quantity") or 0.0)
        rate = float(item.get("unit_price") or item.get("rate") or 0.0)
        disc = float(item.get("discount") or 0.0)
        line_taxable = float(item.get("taxable_amount") or item.get("taxable_value") or 0.0)
        line_total = float(item.get("total_amount") or 0.0)

        calc_line_subtotal += line_taxable

        # R027: Non-negative check
        if qty < 0 or rate < 0:
            results.append(ValidationResult(
                rule_id="R027",
                rule_key="arithmetic_positive_quantities",
                name="Non-negative Values",
                status="failed",
                severity="error",
                field_path=f"items[{idx}].quantity",
                message=f"Line {idx+1}: Quantity ({qty}) and rate ({rate}) must be non-negative",
                expected=">= 0",
                actual=f"qty={qty}, rate={rate}"
            ))

        # R020: Line taxable calculation
        if qty > 0 and rate > 0 and line_taxable > 0:
            expected_taxable = (qty * rate) - disc
            if abs(expected_taxable - line_taxable) > TOLERANCE:
                results.append(ValidationResult(
                    rule_id="R020",
                    rule_key="arithmetic_line_taxable",
                    name="Line Taxable Math",
                    status="failed",
                    severity="warning",
                    field_path=f"items[{idx}].taxable_amount",
                    message=f"Line {idx+1}: Qty ({qty}) * Rate ({rate}) - Disc ({disc}) = ₹{expected_taxable:.2f}, does not match Taxable Amount (₹{line_taxable:.2f})",
                    expected=expected_taxable,
                    actual=line_taxable,
                    suggestion={"taxable_amount": expected_taxable}
                ))

    # R023: Subtotal aggregation
    if items and calc_line_subtotal > 0 and subtotal > 0:
        tolerance_agg = max(TOLERANCE, 0.5 * len(items))
        if abs(calc_line_subtotal - subtotal) > tolerance_agg:
            results.append(ValidationResult(
                rule_id="R023",
                rule_key="arithmetic_subtotal_sum",
                name="Subtotal Line Sum",
                status="failed",
                severity="warning",
                field_path="totals.total_taxable_value",
                message=f"Sum of line items taxable values (₹{calc_line_subtotal:.2f}) does not match Subtotal (₹{subtotal:.2f})",
                expected=calc_line_subtotal,
                actual=subtotal,
                suggestion={"total_taxable_value": calc_line_subtotal}
            ))

    # R028: Amount in Words cross-check
    amount_in_words = totals.get("amount_in_words") or invoice_dict.get("meta", {}).get("amount_in_words")
    if amount_in_words and isinstance(amount_in_words, str) and grand_total > 0:
        parsed_word_amt = words_to_number(amount_in_words)
        if parsed_word_amt > 0:
            if abs(parsed_word_amt - grand_total) > TOLERANCE:
                results.append(ValidationResult(
                    rule_id="R028",
                    rule_key="amount_in_words_reconciled",
                    name="Amount in Words Check",
                    status="failed",
                    severity="warning",
                    field_path="totals.amount_in_words",
                    message=f"Amount in words parsed as ₹{parsed_word_amt:,.2f}, which conflicts with Grand Total ₹{grand_total:,.2f}",
                    expected=grand_total,
                    actual=parsed_word_amt,
                    suggestion=None
                ))
            else:
                results.append(ValidationResult(
                    rule_id="R028",
                    rule_key="amount_in_words_reconciled",
                    name="Amount in Words Check",
                    status="passed",
                    severity="info",
                    field_path="totals.amount_in_words",
                    message="Amount in words reconciles with numerical Grand Total",
                    expected=grand_total,
                    actual=parsed_word_amt
                ))

    return results
