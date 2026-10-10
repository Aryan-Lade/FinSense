"""
Hindi and English keywords for invoice field extraction.
"""

# English keywords
ENGLISH_KEYWORDS = {
    "invoice_no": [
        "invoice", "inv", "bill", "invoice no", "invoice number", "bill no", 
        "bill number", "inv no", "inv #", "invoice #", "bill #"
    ],
    "date": [
        "date", "invoice date", "bill date", "date of invoice"
    ],
    "due_date": [
        "due date", "payment due", "due", "pay by", "payment date"
    ],
    "total": [
        "total", "grand total", "amount due", "balance due", "total amount",
        "grand total amount"
    ],
    "gst": [
        "gst", "vat", "tax", "cgst", "sgst", "igst", "cess"
    ],
    "hsn": [
        "hsn", "hsn code", "sac", "sac code"
    ],
    "quantity": [
        "qty", "quantity", "quantity", "nos", "number"
    ],
    "rate": [
        "rate", "unit price", "price", "unit rate"
    ],
    "taxable_value": [
        "taxable value", "assessable value", "taxable amount"
    ]
}

# Hindi keywords
HINDI_KEYWORDS = {
    "invoice_no": [
        "बिल नंबर", "चालान नंबर", "बिल संख्या", "invoice नंबर"
    ],
    "date": [
        "दिनांक", "तारीख", "बिल तारीख"
    ],
    "due_date": [
        "देय तिथि", "भुगतान तिथि", "अंतिम तिथि"
    ],
    "total": [
        "कुल राशि", "कुल", "कुल भुगतान", "शुद्ध राशि"
    ],
    "gst": [
        "जीएसटी", "कर", "सीजीएसटी", "एसजीएसटी", "आईजीएसटी", "उपकर"
    ],
    "hsn": [
        "एचएसएन", "एसएसी"
    ],
    "quantity": [
        "मात्रा", "संख्या", "इकाई"
    ],
    "rate": [
        "दर", "'unité मूल्य", "मूल्य"
    ],
    "taxable_value": [
        "करयोग्य मूल्य", "आकलनीय मूल्य"
    ]
}

# Combined keywords for language detection
ALL_KEYWORDS = {
    "en": ENGLISH_KEYWORDS,
    "hi": HINDI_KEYWORDS
}


def get_keywords_for_language(language: str) -> dict:
    """Get keywords for specified language."""
    return ALL_KEYWORDS.get(language.lower(), ENGLISH_KEYWORDS)


def get_all_keywords() -> dict:
    """Get all keywords for all languages."""
    return ALL_KEYWORDS
