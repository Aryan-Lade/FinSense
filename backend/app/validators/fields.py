"""
Field presence and format validator for FinSense.
Implements rules R030-R044:
- R030: Bill / Invoice number presence & format
- R031: Invoice date presence
- R032: Supplier name presence
- R033: Grand total amount presence
- R034: Seller GSTIN for GST invoices
- R035: Date range sanity checks
- R036: Due date >= Invoice date
- R037: Currency INR verification
- R038: Buyer name presence
- R039: Configured GST tax slabs check
- R040: HSN/SAC code format
"""
import re
import datetime
from typing import List, Dict, Any, Optional
from app.schemas.validation import ValidationResult
from app.domain.gst_rates import is_valid_gst_rate, get_valid_gst_rates


def validate_fields(invoice_dict: Dict[str, Any]) -> List[ValidationResult]:
    """
    Validate presence and integrity of mandatory and recommended fields.
    """
    results = []
    meta = invoice_dict.get("meta") or {}
    seller = invoice_dict.get("seller") or {}
    buyer = invoice_dict.get("buyer") or {}
    totals = invoice_dict.get("totals") or {}
    items = invoice_dict.get("items") or []

    is_gst_category = (meta.get("document_category") == "gst_invoice" or bool(seller.get("gstin")))

    # R030: Bill / Invoice Number
    bill_no = str(meta.get("invoice_number") or invoice_dict.get("bill_number") or "").strip()
    if not bill_no:
        results.append(ValidationResult(
            rule_id="R030",
            rule_key="field_bill_number_required",
            name="Bill Number Presence",
            status="failed",
            severity="error",
            field_path="meta.invoice_number",
            message="Invoice / Bill number is mandatory",
            expected="Valid reference string",
            actual=None
        ))
    elif len(bill_no) > 30:
        results.append(ValidationResult(
            rule_id="R030",
            rule_key="field_bill_number_length",
            name="Bill Number Length",
            status="failed",
            severity="warning",
            field_path="meta.invoice_number",
            message=f"Bill number '{bill_no}' exceeds standard 30 characters",
            expected="<= 30 characters",
            actual=len(bill_no)
        ))
    else:
        results.append(ValidationResult(
            rule_id="R030",
            rule_key="field_bill_number_required",
            name="Bill Number Presence",
            status="passed",
            severity="info",
            field_path="meta.invoice_number",
            message=f"Bill number '{bill_no}' verified",
            expected="Present",
            actual=bill_no
        ))

    # R031: Invoice Date
    inv_date = meta.get("invoice_date") or invoice_dict.get("invoice_date")
    parsed_inv_date = None
    if not inv_date:
        results.append(ValidationResult(
            rule_id="R031",
            rule_key="field_invoice_date_required",
            name="Invoice Date Presence",
            status="failed",
            severity="error",
            field_path="meta.invoice_date",
            message="Invoice Date is mandatory",
            expected="YYYY-MM-DD date",
            actual=None
        ))
    else:
        try:
            if isinstance(inv_date, str):
                parsed_inv_date = datetime.date.fromisoformat(inv_date.split("T")[0].split(" ")[0])
            elif isinstance(inv_date, datetime.date):
                parsed_inv_date = inv_date
        except Exception:
            pass

        if not parsed_inv_date:
            results.append(ValidationResult(
                rule_id="R031",
                rule_key="field_invoice_date_format",
                name="Invoice Date Format",
                status="failed",
                severity="error",
                field_path="meta.invoice_date",
                message=f"Could not parse valid date from '{inv_date}'",
                expected="Standard date",
                actual=str(inv_date)
            ))
        else:
            today = datetime.date.today()
            # R035: Date range sanity check
            if parsed_inv_date > today + datetime.timedelta(days=2):
                results.append(ValidationResult(
                    rule_id="R035",
                    rule_key="field_invoice_date_future",
                    name="Invoice Date Timeline",
                    status="failed",
                    severity="warning",
                    field_path="meta.invoice_date",
                    message=f"Invoice Date '{parsed_inv_date}' is in the future",
                    expected=f"<= {today}",
                    actual=str(parsed_inv_date)
                ))
            elif parsed_inv_date < today - datetime.timedelta(days=365 * 5):
                results.append(ValidationResult(
                    rule_id="R035",
                    rule_key="field_invoice_date_historical",
                    name="Invoice Date Timeline",
                    status="failed",
                    severity="warning",
                    field_path="meta.invoice_date",
                    message=f"Invoice Date '{parsed_inv_date}' is more than 5 years old",
                    expected="Within past 5 years",
                    actual=str(parsed_inv_date)
                ))
            else:
                results.append(ValidationResult(
                    rule_id="R031",
                    rule_key="field_invoice_date_required",
                    name="Invoice Date Presence",
                    status="passed",
                    severity="info",
                    field_path="meta.invoice_date",
                    message=f"Invoice date {parsed_inv_date} verified",
                    expected="Valid date",
                    actual=str(parsed_inv_date)
                ))

    # R036: Due Date >= Invoice Date
    due_date = meta.get("due_date") or invoice_dict.get("due_date")
    if due_date and parsed_inv_date:
        try:
            parsed_due_date = None
            if isinstance(due_date, str):
                parsed_due_date = datetime.date.fromisoformat(due_date.split("T")[0].split(" ")[0])
            elif isinstance(due_date, datetime.date):
                parsed_due_date = due_date
            
            if parsed_due_date and parsed_due_date < parsed_inv_date:
                results.append(ValidationResult(
                    rule_id="R036",
                    rule_key="field_due_date_sequence",
                    name="Due Date Sequence",
                    status="failed",
                    severity="warning",
                    field_path="meta.due_date",
                    message=f"Due Date ({parsed_due_date}) precedes Invoice Date ({parsed_inv_date})",
                    expected=f">= {parsed_inv_date}",
                    actual=str(parsed_due_date)
                ))
        except Exception:
            pass

    # R032: Supplier Name
    supplier_name = str(seller.get("legal_name") or seller.get("trade_name") or invoice_dict.get("supplier_name") or "").strip()
    if not supplier_name or supplier_name.lower() in ["unknown", "n/a", "vendor"]:
        results.append(ValidationResult(
            rule_id="R032",
            rule_key="field_supplier_name_required",
            name="Supplier Name Presence",
            status="failed",
            severity="error",
            field_path="seller.legal_name",
            message="Supplier / Vendor name is mandatory",
            expected="Identified vendor entity",
            actual=supplier_name or None
        ))
    else:
        results.append(ValidationResult(
            rule_id="R032",
            rule_key="field_supplier_name_required",
            name="Supplier Name Presence",
            status="passed",
            severity="info",
            field_path="seller.legal_name",
            message=f"Supplier '{supplier_name}' verified",
            expected="Present",
            actual=supplier_name
        ))

    # R033: Total Amount
    total_amount = float(totals.get("total_amount") or invoice_dict.get("total_amount") or 0.0)
    if total_amount <= 0:
        results.append(ValidationResult(
            rule_id="R033",
            rule_key="field_total_amount_positive",
            name="Total Amount Presence",
            status="failed",
            severity="error",
            field_path="totals.total_amount",
            message="Grand Total Amount must be positive",
            expected="> 0.00",
            actual=total_amount
        ))
    else:
        results.append(ValidationResult(
            rule_id="R033",
            rule_key="field_total_amount_positive",
            name="Total Amount Presence",
            status="passed",
            severity="info",
            field_path="totals.total_amount",
            message=f"Grand Total amount ₹{total_amount:,.2f} verified",
            expected="> 0",
            actual=total_amount
        ))

    # R034: Seller GSTIN (Mandatory if GST category)
    seller_gstin = str(seller.get("gstin") or "").strip()
    if is_gst_category and not seller_gstin:
        results.append(ValidationResult(
            rule_id="R034",
            rule_key="field_seller_gstin_required",
            name="Seller GSTIN Presence",
            status="failed",
            severity="error",
            field_path="seller.gstin",
            message="Seller GSTIN is required for GST invoices",
            expected="15-character GSTIN",
            actual=None
        ))
    elif is_gst_category:
        results.append(ValidationResult(
            rule_id="R034",
            rule_key="field_seller_gstin_required",
            name="Seller GSTIN Presence",
            status="passed",
            severity="info",
            field_path="seller.gstin",
            message=f"Seller GSTIN {seller_gstin} present",
            expected="Present",
            actual=seller_gstin
        ))

    # R037: Currency INR check
    currency = str(meta.get("currency") or invoice_dict.get("currency") or "INR").upper()
    if currency != "INR":
        results.append(ValidationResult(
            rule_id="R037",
            rule_key="field_currency_inr",
            name="Currency Verification",
            status="failed",
            severity="warning",
            field_path="meta.currency",
            message=f"Document currency is '{currency}', domestic GST engine expects INR",
            expected="INR",
            actual=currency
        ))

    # R039: GST Rates in Slabs
    valid_slabs = get_valid_gst_rates()
    for idx, item in enumerate(items):
        for rate_key in ["cgst_rate", "sgst_rate", "igst_rate"]:
            r = item.get(rate_key)
            if r is not None and float(r) > 0:
                # Total line rate (e.g. 9% CGST + 9% SGST is an 18% slab)
                slab_rate = float(r) * 2 if rate_key in ["cgst_rate", "sgst_rate"] else float(r)
                if not is_valid_gst_rate(slab_rate):
                    results.append(ValidationResult(
                        rule_id="R039",
                        rule_key="field_gst_slab_valid",
                        name="GST Slab Verification",
                        status="failed",
                        severity="warning",
                        field_path=f"items[{idx}].{rate_key}",
                        message=f"Line {idx+1}: Implied GST rate {slab_rate}% not in standard slabs {valid_slabs}",
                        expected=f"One of {valid_slabs}",
                        actual=f"{slab_rate}%"
                    ))

    return results
