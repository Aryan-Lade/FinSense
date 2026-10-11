"""
CSV Exporter with CSV-injection protection and multiple export profiles.
Section 19: CSV injection guard (prefix = + - @ with '), UTF-8 BOM.
Profiles: finsense, flat_csv, accounting_generic, gstn_aligned.
"""
from typing import List, Dict, Any, Optional
import io
import csv

INJECTION_CHARS = ("=", "+", "-", "@", "\t", "\r")


def sanitize_csv_cell(val: Any) -> Any:
    """Guard against CSV/Excel formula injection vulnerabilities."""
    if val is None:
        return ""
    s = str(val)
    if s and s[0] in INJECTION_CHARS:
        return f"'{s}"
    return s


def export_invoices_to_csv(
    invoices: List[Dict[str, Any]],
    profile: str = "finsense",
    columns: Optional[List[str]] = None
) -> str:
    """
    Export invoice records to CSV string using specified profile.
    """
    output = io.StringIO()
    # Write UTF-8 BOM for Excel compatibility
    output.write("\ufeff")

    if profile == "accounting_generic":
        # Voucher format: Date, Voucher/Bill No, Party Name, Party GSTIN, Taxable, CGST, SGST, IGST, Cess, Round-off, Total, Narration
        headers = [
            "Voucher Date", "Bill Number", "Party Name", "Party GSTIN",
            "Taxable Amount", "CGST", "SGST", "IGST", "Cess", "Round Off",
            "Total Amount", "Narration"
        ]
        writer = csv.writer(output)
        writer.writerow(headers)

        for inv in invoices:
            can = inv.get("canonical_json", {})
            tots = can.get("totals", {})
            writer.writerow([
                sanitize_csv_cell(inv.get("invoice_date", "")),
                sanitize_csv_cell(inv.get("bill_number", "")),
                sanitize_csv_cell(inv.get("supplier_name", "")),
                sanitize_csv_cell(can.get("seller", {}).get("gstin", "")),
                sanitize_csv_cell(inv.get("subtotal", 0.0)),
                sanitize_csv_cell(tots.get("total_cgst", 0.0)),
                sanitize_csv_cell(tots.get("total_sgst", 0.0)),
                sanitize_csv_cell(tots.get("total_igst", 0.0)),
                sanitize_csv_cell(tots.get("total_cess", 0.0)),
                sanitize_csv_cell(tots.get("round_off", 0.0)),
                sanitize_csv_cell(inv.get("total_amount", 0.0)),
                sanitize_csv_cell(f"Bill {inv.get('bill_number', '')} from {inv.get('supplier_name', '')}")
            ])

    elif profile == "flat_csv":
        # One row per line item
        headers = [
            "Bill Number", "Invoice Date", "Supplier", "Buyer",
            "Item Description", "HSN/SAC", "Quantity", "Unit Price",
            "Taxable Amount", "CGST Amount", "SGST Amount", "IGST Amount", "Line Total"
        ]
        writer = csv.writer(output)
        writer.writerow(headers)

        for inv in invoices:
            can = inv.get("canonical_json", {})
            items = can.get("line_items", []) or can.get("items", [])
            if not items:
                items = [{
                    "description": "General Supplies",
                    "hsn_code": "-",
                    "quantity": 1,
                    "unit_price": inv.get("subtotal", 0.0),
                    "taxable_amount": inv.get("subtotal", 0.0),
                    "total_amount": inv.get("total_amount", 0.0)
                }]

            for it in items:
                writer.writerow([
                    sanitize_csv_cell(inv.get("bill_number", "")),
                    sanitize_csv_cell(inv.get("invoice_date", "")),
                    sanitize_csv_cell(inv.get("supplier_name", "")),
                    sanitize_csv_cell(inv.get("buyer_name", "")),
                    sanitize_csv_cell(it.get("description", "")),
                    sanitize_csv_cell(it.get("hsn_code") or it.get("hsn_sac") or ""),
                    sanitize_csv_cell(it.get("quantity", 1)),
                    sanitize_csv_cell(it.get("unit_price") or it.get("rate") or 0.0),
                    sanitize_csv_cell(it.get("taxable_amount") or it.get("taxable_value") or 0.0),
                    sanitize_csv_cell(it.get("cgst_amount", 0.0)),
                    sanitize_csv_cell(it.get("sgst_amount", 0.0)),
                    sanitize_csv_cell(it.get("igst_amount", 0.0)),
                    sanitize_csv_cell(it.get("total_amount") or it.get("line_total") or 0.0)
                ])

    elif profile == "gstn_aligned":
        # Field names aligned with GST return schema (GSTR-2B / e-Invoice aligned)
        headers = [
            "Supplier GSTIN", "Supplier Legal Name", "Document Type", "Document Number",
            "Document Date", "Place of Supply", "Reverse Charge", "Total Taxable Value",
            "Integrated Tax (IGST)", "Central Tax (CGST)", "State/UT Tax (SGST)",
            "Cess Amount", "Invoice Value"
        ]
        writer = csv.writer(output)
        writer.writerow(headers)

        for inv in invoices:
            can = inv.get("canonical_json", {})
            meta = can.get("meta", {})
            tots = can.get("totals", {})
            writer.writerow([
                sanitize_csv_cell(can.get("seller", {}).get("gstin", "")),
                sanitize_csv_cell(inv.get("supplier_name", "")),
                sanitize_csv_cell(meta.get("document_category", "INV")),
                sanitize_csv_cell(inv.get("bill_number", "")),
                sanitize_csv_cell(inv.get("invoice_date", "")),
                sanitize_csv_cell(meta.get("place_of_supply_code", "")),
                sanitize_csv_cell("N"),
                sanitize_csv_cell(inv.get("subtotal", 0.0)),
                sanitize_csv_cell(tots.get("total_igst", 0.0)),
                sanitize_csv_cell(tots.get("total_cgst", 0.0)),
                sanitize_csv_cell(tots.get("total_sgst", 0.0)),
                sanitize_csv_cell(tots.get("total_cess", 0.0)),
                sanitize_csv_cell(inv.get("total_amount", 0.0))
            ])

    else:
        # Default 'finsense' profile
        headers = [
            "ID", "Bill Number", "Supplier Name", "Buyer Name", "Invoice Date", "Due Date",
            "Subtotal", "Tax Amount", "Total Amount", "Validation Status",
            "Review Status", "Payment Status"
        ]
        writer = csv.writer(output)
        writer.writerow(headers)

        for inv in invoices:
            writer.writerow([
                sanitize_csv_cell(inv.get("id", "")),
                sanitize_csv_cell(inv.get("bill_number", "")),
                sanitize_csv_cell(inv.get("supplier_name", "")),
                sanitize_csv_cell(inv.get("buyer_name", "")),
                sanitize_csv_cell(inv.get("invoice_date", "")),
                sanitize_csv_cell(inv.get("due_date", "")),
                sanitize_csv_cell(inv.get("subtotal", 0.0)),
                sanitize_csv_cell(inv.get("tax_amount", 0.0)),
                sanitize_csv_cell(inv.get("total_amount", 0.0)),
                sanitize_csv_cell(inv.get("validation_status", "valid")),
                sanitize_csv_cell(inv.get("review_status", "approved")),
                sanitize_csv_cell(inv.get("payment_status", "unpaid"))
            ])

    return output.getvalue()
