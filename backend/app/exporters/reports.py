"""
Audit and error reports generator.
Section 19: Review report and error report generation.
"""
from typing import List, Dict, Any
import io
import csv
from .csv_exporter import sanitize_csv_cell


def generate_review_report(invoices: List[Dict[str, Any]]) -> str:
    """Generate CSV review report for bills requiring manual attention."""
    output = io.StringIO()
    output.write("\ufeff")
    writer = csv.writer(output)
    writer.writerow(["Invoice ID", "Bill Number", "Supplier", "Total Amount", "Review Status", "Review Reasons", "Validation Errors"])

    for inv in invoices:
        val = inv.get("validation_json", {})
        errors = "; ".join([e.get("message", "") for e in val.get("errors", [])])
        reasons = ", ".join(inv.get("review_reasons") or [])
        writer.writerow([
            sanitize_csv_cell(inv.get("id")),
            sanitize_csv_cell(inv.get("bill_number")),
            sanitize_csv_cell(inv.get("supplier_name")),
            sanitize_csv_cell(inv.get("total_amount")),
            sanitize_csv_cell(inv.get("review_status")),
            sanitize_csv_cell(reasons),
            sanitize_csv_cell(errors)
        ])

    return output.getvalue()


def generate_error_report(invoices: List[Dict[str, Any]]) -> str:
    """Generate CSV error report with detailed failed validation rules."""
    output = io.StringIO()
    output.write("\ufeff")
    writer = csv.writer(output)
    writer.writerow(["Bill Number", "Supplier", "Rule ID", "Rule Key", "Severity", "Field Path", "Expected", "Actual", "Message"])

    for inv in invoices:
        val = inv.get("validation_json", {})
        for err in val.get("errors", []):
            writer.writerow([
                sanitize_csv_cell(inv.get("bill_number")),
                sanitize_csv_cell(inv.get("supplier_name")),
                sanitize_csv_cell(err.get("rule_id")),
                sanitize_csv_cell(err.get("rule_key")),
                sanitize_csv_cell(err.get("severity")),
                sanitize_csv_cell(err.get("field_path")),
                sanitize_csv_cell(err.get("expected")),
                sanitize_csv_cell(err.get("actual")),
                sanitize_csv_cell(err.get("message"))
            ])

    return output.getvalue()
