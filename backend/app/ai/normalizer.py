"""
Normalizer and suggestion generator for extracted invoice fields.
Section 10.5:
- Allowed silently: trim, uppercase GSTIN, strip symbols, Devanagari digits to ASCII, date format, filling state code from GSTIN prefix as derived.
- Not allowed silently: modifying identifiers or arithmetic values. Generates suggestions requiring user confirmation.
"""
from typing import Dict, Any, List, Tuple, Optional
import re
from app.domain.state_codes import get_state_code_from_name, get_state_name

DEVANAGARI_DIGITS = str.maketrans("०१२३४५६७८९", "0123456789")


def normalize_devanagari_digits(text: str) -> str:
    """Convert Hindi Devanagari digits ०-९ to ASCII 0-9."""
    if not isinstance(text, str):
        return text
    return text.translate(DEVANAGARI_DIGITS)


def clean_currency_string(val: Any) -> Optional[float]:
    """Strip currency symbols, commas, and whitespace, returning float."""
    if val is None:
        return None
    if isinstance(val, (int, float)):
        return float(val)
    s = normalize_devanagari_digits(str(val))
    s = re.sub(r"[₹Rs\.\,\s/-]", "", s)
    s = s.replace("(", "-").replace(")", "")
    try:
        return float(s)
    except ValueError:
        return None


def normalize_invoice_dict(raw: Dict[str, Any]) -> Tuple[Dict[str, Any], List[Dict[str, Any]], Dict[str, Any]]:
    """
    Normalizes invoice fields safely.
    Returns:
      (normalized_dict, suggestions_list, audit_log)
    """
    normalized = dict(raw)
    suggestions: List[Dict[str, Any]] = []
    audit: Dict[str, Any] = {}

    meta = dict(normalized.get("meta", {}))
    seller = dict(normalized.get("seller", {}))
    buyer = dict(normalized.get("buyer", {}))
    totals = dict(normalized.get("totals", {}))

    # 1. Normalize Seller GSTIN
    if seller.get("gstin"):
        orig_gstin = str(seller["gstin"]).strip()
        clean_gstin = re.sub(r"\s+", "", orig_gstin).upper()
        if clean_gstin != orig_gstin:
            audit["seller.gstin"] = {"old": orig_gstin, "new": clean_gstin, "reason": "uppercase_whitespace_strip"}
        seller["gstin"] = clean_gstin

        # Derive state code from GSTIN prefix if missing
        if len(clean_gstin) >= 2 and clean_gstin[:2].isdigit():
            prefix = clean_gstin[:2]
            if not seller.get("state_code"):
                seller["state_code"] = prefix
                seller["state_name"] = get_state_name(prefix) or seller.get("state_name")
                audit["seller.state_code"] = {"new": prefix, "source": "derived_from_gstin"}

    # 2. Normalize Buyer GSTIN
    if buyer.get("gstin"):
        orig_gstin = str(buyer["gstin"]).strip()
        clean_gstin = re.sub(r"\s+", "", orig_gstin).upper()
        buyer["gstin"] = clean_gstin
        if len(clean_gstin) >= 2 and clean_gstin[:2].isdigit() and not buyer.get("state_code"):
            buyer["state_code"] = clean_gstin[:2]
            buyer["state_name"] = get_state_name(clean_gstin[:2]) or buyer.get("state_name")

    # 3. Clean Totals & Amounts
    for field_name in ["total_amount", "total_taxable_value", "total_tax", "total_cgst", "total_sgst", "total_igst", "round_off"]:
        if field_name in totals and totals[field_name] is not None:
            cleaned = clean_currency_string(totals[field_name])
            if cleaned is not None:
                totals[field_name] = cleaned

    # 4. Normalize Line Items
    items = list(normalized.get("items", []))
    for it in items:
        if isinstance(it, dict):
            for amt_field in ["rate", "quantity", "taxable_value", "cgst_amount", "sgst_amount", "igst_amount", "total_amount"]:
                if amt_field in it and it[amt_field] is not None:
                    it[amt_field] = clean_currency_string(it[amt_field])

    normalized["meta"] = meta
    normalized["seller"] = seller
    normalized["buyer"] = buyer
    normalized["totals"] = totals
    normalized["items"] = items

    return normalized, suggestions, audit
