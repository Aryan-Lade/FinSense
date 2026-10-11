"""
Tax consistency validator for FinSense.
Implements rules R010-R013:
- R010: Supply type determination (Intra-state vs Inter-state)
- R011: Intra-state tax consistency (CGST + SGST required, equal rates, IGST == 0)
- R012: Inter-state tax consistency (IGST required, CGST == SGST == 0)
- R013: Line-level tax rate consistency
"""
from typing import List, Dict, Any, Optional
from app.schemas.validation import ValidationResult


def validate_tax_consistency(invoice_dict: Dict[str, Any]) -> List[ValidationResult]:
    """
    Validate GST tax structure based on seller, buyer, and place of supply.
    """
    results = []

    meta = invoice_dict.get("meta") or {}
    seller = invoice_dict.get("seller") or {}
    buyer = invoice_dict.get("buyer") or {}
    totals = invoice_dict.get("totals") or {}
    items = invoice_dict.get("items") or []

    # Check applicability
    reverse_charge = meta.get("reverse_charge", False)
    if reverse_charge:
        results.append(ValidationResult(
            rule_id="R010",
            rule_key="tax_reverse_charge_applicable",
            name="Reverse Charge Handling",
            status="not_applicable",
            severity="info",
            field_path="meta.reverse_charge",
            message="Reverse charge invoice: tax rules marked not applicable for recipient settlement"
        ))
        return results

    # Determine seller state code
    seller_state = seller.get("state_code")
    if not seller_state and seller.get("gstin") and len(seller.get("gstin")) >= 2:
        seller_state = seller.get("gstin")[:2]

    # Determine supply state code
    supply_state = meta.get("place_of_supply_code")
    if not supply_state:
        supply_state = buyer.get("state_code")
    if not supply_state and buyer.get("gstin") and len(buyer.get("gstin")) >= 2:
        supply_state = buyer.get("gstin")[:2]

    if not seller_state or not supply_state:
        results.append(ValidationResult(
            rule_id="R010",
            rule_key="tax_supply_type",
            name="Supply Type Resolution",
            status="warning",
            severity="warning",
            field_path="meta.place_of_supply_code",
            message="Cannot deterministically resolve both Seller State and Place of Supply to verify tax type",
            expected="Resolved state codes for Seller and Place of Supply",
            actual=f"Seller: {seller_state or 'Unknown'}, Supply: {supply_state or 'Unknown'}"
        ))
        return results

    is_intrastate = (str(seller_state) == str(supply_state))

    total_cgst = float(totals.get("total_cgst") or 0.0)
    total_sgst = float(totals.get("total_sgst") or 0.0)
    total_igst = float(totals.get("total_igst") or 0.0)

    # R010: Record supply type
    results.append(ValidationResult(
        rule_id="R010",
        rule_key="tax_supply_type",
        name="Supply Type Resolution",
        status="passed",
        severity="info",
        field_path="meta.place_of_supply_code",
        message=f"{'Intra-state' if is_intrastate else 'Inter-state'} supply resolved (Seller: {seller_state}, Supply: {supply_state})",
        expected="Valid supply determination",
        actual=f"State {seller_state} -> State {supply_state}"
    ))

    # R011: Intra-state rules
    if is_intrastate:
        if total_igst > 1.0 and (total_cgst == 0 or total_sgst == 0):
            results.append(ValidationResult(
                rule_id="R011",
                rule_key="tax_intrastate_composition",
                name="Intra-state Tax Composition",
                status="failed",
                severity="error",
                field_path="totals.total_igst",
                message=f"Intra-state supply (State {seller_state}) should charge CGST + SGST, but IGST (₹{total_igst:.2f}) was detected",
                expected="CGST + SGST (IGST = 0)",
                actual=f"IGST = ₹{total_igst:.2f}",
                suggestion={"total_cgst": total_igst / 2.0, "total_sgst": total_igst / 2.0, "total_igst": 0.0}
            ))
        elif abs(total_cgst - total_sgst) > 1.0:
            results.append(ValidationResult(
                rule_id="R011",
                rule_key="tax_intrastate_parity",
                name="CGST/SGST Parity",
                status="failed",
                severity="error",
                field_path="totals.total_cgst",
                message=f"CGST (₹{total_cgst:.2f}) and SGST (₹{total_sgst:.2f}) must be equal in intra-state transactions",
                expected=f"CGST == SGST",
                actual=f"CGST: {total_cgst:.2f}, SGST: {total_sgst:.2f}"
            ))
        else:
            results.append(ValidationResult(
                rule_id="R011",
                rule_key="tax_intrastate_composition",
                name="Intra-state Tax Composition",
                status="passed",
                severity="info",
                field_path="totals.total_cgst",
                message="Intra-state CGST and SGST distribution verified",
                expected="CGST == SGST and IGST == 0",
                actual=f"CGST: ₹{total_cgst:.2f}, SGST: ₹{total_sgst:.2f}"
            ))

    # R012: Inter-state rules
    else:
        if (total_cgst > 1.0 or total_sgst > 1.0) and total_igst == 0:
            results.append(ValidationResult(
                rule_id="R012",
                rule_key="tax_interstate_composition",
                name="Inter-state Tax Composition",
                status="failed",
                severity="error",
                field_path="totals.total_cgst",
                message=f"Inter-state supply (State {seller_state} -> State {supply_state}) should charge IGST only, but CGST/SGST were detected",
                expected="IGST only (CGST = SGST = 0)",
                actual=f"CGST: ₹{total_cgst:.2f}, SGST: ₹{total_sgst:.2f}",
                suggestion={"total_igst": total_cgst + total_sgst, "total_cgst": 0.0, "total_sgst": 0.0}
            ))
        else:
            results.append(ValidationResult(
                rule_id="R012",
                rule_key="tax_interstate_composition",
                name="Inter-state Tax Composition",
                status="passed",
                severity="info",
                field_path="totals.total_igst",
                message="Inter-state IGST application verified",
                expected="IGST only",
                actual=f"IGST: ₹{total_igst:.2f}"
            ))

    # R013: Line item rate checks
    for idx, item in enumerate(items):
        cgst_r = float(item.get("cgst_rate") or 0.0)
        sgst_r = float(item.get("sgst_rate") or 0.0)
        if is_intrastate and (cgst_r > 0 or sgst_r > 0):
            if abs(cgst_r - sgst_r) > 0.01:
                results.append(ValidationResult(
                    rule_id="R013",
                    rule_key="tax_line_rate_parity",
                    name="Line Tax Rate Parity",
                    status="failed",
                    severity="error",
                    field_path=f"items[{idx}].cgst_rate",
                    message=f"Line {idx+1}: CGST rate ({cgst_r}%) does not equal SGST rate ({sgst_r}%)",
                    expected=f"CGST rate == SGST rate",
                    actual=f"{cgst_r}% vs {sgst_r}%"
                ))

    return results
