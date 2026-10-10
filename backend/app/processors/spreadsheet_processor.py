"""
Spreadsheet processor for extracting invoice data from CSV, TSV, and Excel files.
"""
import csv
import json
from typing import Dict, List, Any, Optional, Union
import io
from app.core.errors import ProcessingException
from app.processors.file_validator import FileType


class SpreadsheetProcessor:
    """Process spreadsheet files to extract structured data."""

    @staticmethod
    def process_csv(file_data: bytes, delimiter: str = ',') -> List[Dict[str, Any]]:
        """Process CSV file data."""
        try:
            # Decode bytes to string
            text_data = file_data.decode('utf-8')

            # Parse CSV
            csv_reader = csv.DictReader(io.StringIO(text_data), delimiter=delimiter)

            # Convert to list of dictionaries
            rows = []
            for row in csv_reader:
                # Clean up empty values
                cleaned_row = {k: v.strip() if isinstance(v, str) else v
                             for k, v in row.items() if v is not None}
                rows.append(cleaned_row)

            return rows
        except Exception as e:
            raise ProcessingException(f"Failed to process CSV file: {str(e)}", "spreadsheet_processing_error")

    @staticmethod
    def process_tsv(file_data: bytes) -> List[Dict[str, Any]]:
        """Process TSV file data."""
        return SpreadsheetProcessor.process_csv(file_data, delimiter='\t')

    @staticmethod
    def process_xlsx(file_data: bytes) -> List[Dict[str, Any]]:
        """Process Excel file data."""
        try:
            # Try to import openpyxl
            try:
                import openpyxl
            except ImportError:
                raise ProcessingException(
                    "openpyxl is required for Excel file processing. Install with: pip install openpyxl",
                    "missing_dependency"
                )

            # Load workbook from bytes
            workbook = openpyxl.load_workbook(io.BytesIO(file_data))

            # Get the first worksheet
            worksheet = workbook.active

            # Extract data
            rows = []

            # Get header from first row
            header = []
            for cell in worksheet[1]:
                header.append(str(cell.value) if cell.value is not None else "")

            # Process data rows
            for row in worksheet.iter_rows(min_row=2, values_only=True):
                if any(cell is not None for cell in row):  # Skip completely empty rows
                    row_data = {}
                    for i, cell_value in enumerate(row):
                        if i < len(header):
                            key = header[i] if header[i] else f"column_{i}"
                            # Clean up the value
                            if isinstance(cell_value, str):
                                row_data[key] = cell_value.strip()
                            else:
                                row_data[key] = cell_value
                    rows.append(row_data)

            return rows
        except Exception as e:
            raise ProcessingException(f"Failed to process Excel file: {str(e)}", "spreadsheet_processing_error")

    @staticmethod
    def process_file(file_data: bytes, file_type: FileType) -> List[Dict[str, Any]]:
        """Process a spreadsheet file based on its type."""
        if file_type == FileType.CSV:
            return SpreadsheetProcessor.process_csv(file_data)
        elif file_type == FileType.TSV:
            return SpreadsheetProcessor.process_tsv(file_data)
        elif file_type == FileType.XLSX:
            return SpreadsheetProcessor.process_xlsx(file_data)
        else:
            raise ProcessingException(f"Unsupported file type for spreadsheet processing: {file_type}", "unsupported_file_type")


def process_spreadsheet_file(file_data: bytes, file_type: FileType) -> Dict[str, Any]:
    """
    Process a spreadsheet file and extract invoice-relevant data.

    Returns a dictionary with extracted data and metadata.
    """
    try:
        # Process the file to get raw data
        raw_data = SpreadsheetProcessor.process_file(file_data, file_type)

        if not raw_data:
            return {
                "success": False,
                "error": "No data found in file",
                "data": [],
                "metadata": {
                    "rows_processed": 0,
                    "columns_found": 0
                }
            }

        # Analyze the data to detect invoice-like patterns
        # This is a simplified version - in production, this would be more sophisticated
        columns = list(raw_data[0].keys()) if raw_data else []

        # Try to map common column names to invoice fields
        field_mapping = {
            # Invoice number/ID
            'invoice_number': ['invoice_no', 'invoice_number', 'inv_no', 'bill_no'],
            # Date
            'invoice_date': ['invoice_date', 'date', 'bill_date', 'inv_date'],
            # Customer info
            'customer_name': ['customer_name', 'client_name', 'bill_to', 'party_name'],
            'customer_gstin': ['customer_gstin', 'client_gstin', 'gstin'],
            # Amounts
            'total_amount': ['total_amount', 'amount', 'total', 'grand_total'],
            'taxable_value': ['taxable_value', 'subtotal', 'net_amount'],
            # Tax amounts
            'cgst_amount': ['cgst_amount', 'cgst'],
            'sgst_amount': ['sgst_amount', 'sgst'],
            'igst_amount': ['igst_amount', 'igst'],
            # Line items would be more complex to detect
        }

        # Extract key fields from first row (assuming single invoice per file for simplicity)
        extracted_data = {}
        if raw_data:
            first_row = raw_data[0]
            for std_field, possible_keys in field_mapping.items():
                for key in possible_keys:
                    if key in first_row:
                        extracted_data[std_field] = first_row[key]
                        break

        return {
            "success": True,
            "data": extracted_data,
            "raw_data": raw_data,
            "metadata": {
                "rows_processed": len(raw_data),
                "columns_found": len(columns),
                "column_names": columns,
                "file_type": file_type.value
            }
        }

    except ProcessingException:
        raise
    except Exception as e:
        raise ProcessingException(f"Unexpected error during spreadsheet processing: {str(e)}", "processing_error")