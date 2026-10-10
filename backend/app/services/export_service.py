"""
Export service for generating reports in various formats.
"""
import csv
import json
from typing import Dict, Any, List, Optional
import io
from app.core.errors import ProcessingException


class ExportService:
    """Service for exporting data in various formats."""

    @staticmethod
    def export_to_csv(data: List[Dict[str, Any]], filename: str = "export.csv") -> bytes:
        """Export data to CSV format."""
        try:
            if not data:
                # Return CSV with just headers if no data
                output = io.StringIO()
                writer = csv.writer(output)
                writer.writerow(["No data available"])
                return output.getvalue().encode('utf-8')

            # Get all unique keys from all dictionaries
            fieldnames = set()
            for row in data:
                if isinstance(row, dict):
                    fieldnames.update(row.keys())

            fieldnames = sorted(list(fieldnames))

            # Write to CSV
            output = io.StringIO()
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()

            for row in data:
                if isinstance(row, dict):
                    # Convert None values to empty strings
                    cleaned_row = {k: ("" if v is None else v) for k, v in row.items()}
                    writer.writerow(cleaned_row)
                else:
                    # Handle non-dict items
                    writer.writerow({"value": str(row)})

            return output.getvalue().encode('utf-8')

        except Exception as e:
            raise ProcessingException(f"Failed to export to CSV: {str(e)}", "export_error")

    @staticmethod
    def export_to_json(data: Any, filename: str = "export.json") -> bytes:
        """Export data to JSON format."""
        try:
            json_data = json.dumps(data, indent=2, default=str)
            return json_data.encode('utf-8')
        except Exception as e:
            raise ProcessingException(f"Failed to export to JSON: {str(e)}", "export_error")

    @staticmethod
    def export_invoices_to_csv(invoices: List[Dict[str, Any]]) -> bytes:
        """Export invoices to CSV format with standard invoice fields."""
        try:
            # Standard invoice fields for export
            invoice_fields = [
                'invoice_number', 'invoice_date', 'customer_name', 'customer_gstin',
                'supplier_name', 'supplier_gstin', 'total_amount', 'taxable_value',
                'cgst_amount', 'sgst_amount', 'igst_amount', 'status'
            ]

            output = io.StringIO()
            writer = csv.DictWriter(output, fieldnames=invoice_fields)
            writer.writeheader()

            for invoice in invoices:
                if isinstance(invoice, dict):
                    # Extract only the fields we want, providing defaults for missing ones
                    row = {}
                    for field in invoice_fields:
                        row[field] = invoice.get(field, "")
                    writer.writerow(row)
                else:
                    # Handle non-dict items
                    row = {field: "" for field in invoice_fields}
                    row["value"] = str(invoice)
                    writer.writerow(row)

            return output.getvalue().encode('utf-8')

        except Exception as e:
            raise ProcessingException(f"Failed to export invoices to CSV: {str(e)}", "export_error")


def export_data(data: List[Dict[str, Any]], format: str = "csv") -> bytes:
    """Convenience function to export data."""
    if format.lower() == "json":
        return ExportService.export_to_json(data)
    else:  # Default to CSV
        return ExportService.export_to_csv(data)


def export_invoices(invoices: List[Dict[str, Any]]) -> bytes:
    """Convenience function to export invoices."""
    return ExportService.export_invoices_to_csv(invoices)