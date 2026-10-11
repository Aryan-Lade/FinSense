"""
Mock extractor for deterministic tests and offline DEMO_MODE.
Section 10.4.
"""
from typing import List, Dict, Any, Tuple, Optional
from PIL import Image
from app.processors.ocr.base import OcrResult
from .extractor_base import Extractor


class MockExtractor:
    """Mock extractor returning pre-defined fixtures or deterministic defaults."""
    name: str = "mock"

    def __init__(self, fixtures: Optional[Dict[str, Dict[str, Any]]] = None):
        self.fixtures = fixtures or {}

    def extract(
        self,
        images: List[Image.Image],
        ocr_result: OcrResult,
        hints: Optional[Dict[str, Any]] = None
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        # Check if hints have a specific mock target or filename
        sha256 = (hints or {}).get("sha256")
        if sha256 and sha256 in self.fixtures:
            fix = self.fixtures[sha256]
            return fix.get("invoice", {}), fix.get("provenance", {})

        # Check OCR text to match known demo cases
        text = ocr_result.full_text if ocr_result else ""

        if "Darshan" in text or "DE/2026" in text:
            supplier = "Darshan Engineering"
            bill_no = "DE/2026/0491"
            gstin = "27AAPFU0939F1ZV"
            tot = 5900.0
            taxable = 5000.0
            tax = 900.0
        elif "Gujarat" in text or "GFT" in text:
            supplier = "Gujarat Freight Tools"
            bill_no = "GFT-8821"
            gstin = "24AAACG1234A1Z5"
            tot = 11800.0
            taxable = 10000.0
            tax = 1800.0
        elif "Phonewale" in text or "PW" in text:
            supplier = "Phonewale Retail Pvt Ltd"
            bill_no = "PW-2026-901"
            gstin = "24AABCP4567D1Z8"
            tot = 24999.0
            taxable = 21185.59
            tax = 3813.41
        elif "Surabhi" in text:
            supplier = "Surabhi Hardwares"
            bill_no = "SH/2026/102"
            gstin = "29ABCDE1234F1ZW"
            tot = 4500.0
            taxable = 3813.56
            tax = 686.44
        elif "Latha" in text:
            supplier = "Latha Enterprises"
            bill_no = "LE-771"
            gstin = "33AAACL9999M1Z2"
            tot = 1250.0
            taxable = 1059.32
            tax = 190.68
        else:
            supplier = "Generic Supplier Ltd"
            bill_no = "INV-2026-001"
            gstin = "27AAPFU0939F1ZV"
            tot = 5900.0
            taxable = 5000.0
            tax = 900.0

        raw_invoice = {
            "meta": {
                "document_category": "gst_invoice",
                "invoice_number": bill_no,
                "invoice_date": "2026-09-15",
                "due_date": "2026-09-25",
                "currency": "INR",
                "place_of_supply_code": gstin[:2] if len(gstin) >= 2 else "27"
            },
            "seller": {
                "legal_name": supplier,
                "gstin": gstin,
                "state_code": gstin[:2] if len(gstin) >= 2 else "27",
                "address": "Industrial Area, Phase 1"
            },
            "buyer": {
                "legal_name": "FinSense Demo Customer",
                "gstin": "24AAACG1234A1Z5",
                "state_code": "24",
                "address": "Commercial Hub"
            },
            "items": [
                {
                    "line_no": 1,
                    "description": "Standard Commercial Supplies",
                    "hsn_code": "8481",
                    "quantity": 1.0,
                    "rate": taxable,
                    "taxable_value": taxable,
                    "cgst_rate": None,
                    "sgst_rate": None,
                    "igst_rate": 18.0,
                    "igst_amount": tax,
                    "total_amount": tot
                }
            ],
            "totals": {
                "total_taxable_value": taxable,
                "total_cgst": 0.0,
                "total_sgst": 0.0,
                "total_igst": tax,
                "total_cess": 0.0,
                "total_tax": tax,
                "round_off": 0.0,
                "total_amount": tot,
                "amount_in_words": "Five Thousand Nine Hundred Rupees Only" if tot == 5900.0 else "Sample Amount"
            }
        }

        provenance = {
            "meta.invoice_number": {
                "value": bill_no,
                "confidence": 0.95,
                "source": "simulated",
                "evidence": f"Found '{bill_no}' in header",
                "bbox": [0.6, 0.1, 0.9, 0.15],
                "page": 1,
                "status": "accepted"
            },
            "seller.gstin": {
                "value": gstin,
                "confidence": 0.96,
                "source": "simulated",
                "evidence": f"Found valid GSTIN '{gstin}'",
                "bbox": [0.05, 0.15, 0.45, 0.20],
                "page": 1,
                "status": "accepted"
            },
            "seller.legal_name": {
                "value": supplier,
                "confidence": 0.92,
                "source": "simulated",
                "evidence": f"Supplier name '{supplier}'",
                "bbox": [0.05, 0.05, 0.5, 0.10],
                "page": 1,
                "status": "accepted"
            },
            "totals.total_amount": {
                "value": tot,
                "confidence": 0.98,
                "source": "simulated",
                "evidence": f"Grand total ₹{tot}",
                "bbox": [0.65, 0.6, 0.95, 0.65],
                "page": 1,
                "status": "accepted"
            }
        }

        return raw_invoice, provenance

    def reread(
        self,
        images: List[Image.Image],
        ocr_result: OcrResult,
        field_paths: List[str],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        results = {}
        for fp in field_paths:
            if "gstin" in fp:
                results[fp] = "27AAPFU0939F1ZV"
            elif "total" in fp:
                results[fp] = 5900.0
        return results
