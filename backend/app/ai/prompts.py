"""
VLM prompts and structured JSON schema guidance.
Section 10.4: Pydantic v2 JSON schema, null for unreadable/absent, no guessing, re-read prompt.
"""

EXTRACTION_SYSTEM_PROMPT = """You are FinSense, a specialized GST invoice and bill intelligence extractor.
Your job is to extract structured financial data from invoice images and OCR text into valid JSON matching the exact schema below.

CRITICAL RULES:
1. PERCEIVE -> UNDERSTAND -> VALIDATE -> TRUST: Do NOT invent, assume, or hallucinate missing information. If a field is not present or unreadable, return null.
2. DATES: Format all dates as YYYY-MM-DD (Indian bills typically use DD/MM/YYYY).
3. NUMBERS: Return numbers as clean floats/integers without commas, currency symbols (₹, Rs), or units.
4. GSTIN: Standard 15-character uppercase alphanumeric code (e.g., 27AAPFU0939F1ZV).
5. ORIGINAL TEXT: For non-English or multilingual invoices (Hindi/Devanagari), preserve original text in original_text where appropriate.
6. RETURN ONLY VALID JSON. Do not wrap in markdown or conversational commentary.
"""

JSON_SCHEMA_EXAMPLE = """{
  "meta": {
    "document_category": "gst_invoice",
    "invoice_number": "INV-2026-001",
    "invoice_date": "2026-09-15",
    "due_date": null,
    "currency": "INR",
    "place_of_supply_code": "27"
  },
  "seller": {
    "legal_name": "Supplier Company Ltd",
    "gstin": "27AAPFU0939F1ZV",
    "state_code": "27",
    "address": "Mumbai, Maharashtra"
  },
  "buyer": {
    "legal_name": "Customer Enterprise",
    "gstin": "24AAACG1234A1Z5",
    "state_code": "24",
    "address": "Ahmedabad, Gujarat"
  },
  "items": [
    {
      "line_no": 1,
      "description": "Industrial Goods",
      "hsn_code": "8481",
      "quantity": 2.0,
      "rate": 2500.0,
      "taxable_value": 5000.0,
      "cgst_rate": null,
      "sgst_rate": null,
      "igst_rate": 18.0,
      "igst_amount": 900.0,
      "total_amount": 5900.0
    }
  ],
  "totals": {
    "total_taxable_value": 5000.0,
    "total_cgst": 0.0,
    "total_sgst": 0.0,
    "total_igst": 900.0,
    "total_cess": 0.0,
    "total_tax": 900.0,
    "round_off": 0.0,
    "total_amount": 5900.0,
    "amount_in_words": "Five Thousand Nine Hundred Rupees Only"
  }
}"""


def get_reread_prompt(field_path: str, previous_value: str, rule_id: str, rule_message: str) -> str:
    """Bounded re-read prompt targeting a specific erroneous field."""
    return (
        f"Look only at field '{field_path}'. Previous reading '{previous_value}' "
        f"failed rule {rule_id}: '{rule_message}'. Re-read the characters from the image carefully. "
        f"Return JSON strictly in the format: {{\"{field_path}\": value}}."
    )
