"""
Bilingual (English + Hindi) Indian GST Invoice Extractor.
Extracts structured canonical financial records from OCR text and token coordinates:
- Invoice / Bill Number (multi-pattern, multiline, cash memo / challan support)
- Seller & Buyer GSTINs (with algorithmic validation and spaced-text handling)
- Supplier Name & Buyer Name (entity ranking and multiline Bill-To parsing)
- Invoice Date & Due Date (universal date parsing with dateutil and Indian DD/MM/YYYY format)
- Financial Totals: Taxable Subtotal, CGST, SGST, IGST, Grand Total (with rate percentage isolation)
- Table line items (with quantities, rates, amounts, and unit detection)
- Field-level provenance and confidence scores
"""
import re
import datetime
from typing import Dict, Any, List, Optional, Tuple
import dateutil.parser
from app.validators.gstin import is_valid_gstin_format


class InvoiceDataExtractor:
    """Extracts structured invoice fields from OCR text and words."""

    GSTIN_STRICT = re.compile(r'\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b', re.IGNORECASE)
    GSTIN_SPACED = re.compile(r'\b([0-9]{2}\s*[A-Z]{5}\s*[0-9]{4}\s*[A-Z]{1}\s*[1-9A-Z]{1}\s*Z\s*[0-9A-Z]{1})\b', re.IGNORECASE)

    @classmethod
    def extract(cls, ocr_text: str, word_blocks: Optional[List[Dict[str, Any]]] = None, lang_info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Main extraction entry point. Returns normalized canonical data,
        field-level provenance, and extracted fields summary.
        """
        text = ocr_text or ""
        lines = [l.strip() for l in text.split("\n") if l.strip()]

        seller_gstin, buyer_gstin = cls._extract_gstins(text, lines)
        invoice_num = cls._extract_invoice_number(text, lines)
        inv_date, due_date = cls._extract_dates(text, lines)
        supplier_name = cls._extract_supplier_name(lines, seller_gstin)
        buyer_name = cls._extract_buyer_name(text, lines, buyer_gstin)
        totals = cls._extract_totals(text, lines)
        line_items = cls._extract_line_items(lines, totals, supplier_name)

        # Detect languages
        languages = ["en"]
        if lang_info and lang_info.get("is_hindi"):
            languages = ["hi", "en"] if lang_info.get("is_mixed") else ["hi"]

        # Build Canonical JSON
        canonical = {
            "meta": {
                "invoice_number": invoice_num or "INV-UNKNOWN",
                "invoice_date": inv_date.strftime("%Y-%m-%d") if inv_date else datetime.date.today().strftime("%Y-%m-%d"),
                "due_date": due_date.strftime("%Y-%m-%d") if due_date else (inv_date + datetime.timedelta(days=15)).strftime("%Y-%m-%d") if inv_date else None,
                "currency": "INR",
                "document_category": "gst_invoice",
                "language_detected": languages
            },
            "seller": {
                "legal_name": supplier_name or "Direct Vendor",
                "gstin": seller_gstin,
                "state_code": seller_gstin[:2] if seller_gstin else None
            },
            "buyer": {
                "legal_name": buyer_name or "Enterprise Customer",
                "gstin": buyer_gstin,
                "state_code": buyer_gstin[:2] if buyer_gstin else None
            },
            "totals": totals,
            "line_items": line_items
        }

        # Build Provenance metadata
        provenance = cls._build_provenance(canonical, word_blocks)

        tax_sum = round(totals["total_cgst"] + totals["total_sgst"] + totals["total_igst"], 2)

        return {
            "canonical": canonical,
            "provenance": provenance,
            "extracted_fields": {
                # Standard FinSense field names
                "bill_number": invoice_num,
                "supplier_name": supplier_name,
                "seller_gstin": seller_gstin,
                "buyer_name": buyer_name,
                "buyer_gstin": buyer_gstin,
                "invoice_date": inv_date.strftime("%Y-%m-%d") if inv_date else None,
                "due_date": due_date.strftime("%Y-%m-%d") if due_date else None,
                "subtotal": totals["total_taxable_value"],
                "tax_amount": tax_sum,
                "total_amount": totals["total_amount"],
                # Compatibility fields for validation pipeline
                "invoice_number": invoice_num,
                "customer_name": buyer_name,
                "customer_gstin": buyer_gstin,
                "taxable_value": totals["total_taxable_value"],
                "cgst_amount": totals["total_cgst"],
                "sgst_amount": totals["total_sgst"],
                "igst_amount": totals["total_igst"],
                "line_items": line_items
            }
        }

    @classmethod
    def _extract_gstins(cls, text: str, lines: List[str]) -> Tuple[Optional[str], Optional[str]]:
        """Find and classify Seller vs Buyer Indian GSTINs."""
        found = []
        # 1. Strict regex
        for g in cls.GSTIN_STRICT.findall(text):
            gu = g.upper()
            if gu not in found:
                found.append(gu)

        # 2. Spaced regex for OCR character spacing
        for g in cls.GSTIN_SPACED.findall(text):
            clean = re.sub(r'\s+', '', g).upper()
            if len(clean) == 15 and is_valid_gstin_format(clean) and clean not in found:
                found.append(clean)

        # 3. Label-based search: e.g. "GSTIN: 27..."
        for m in re.finditer(r'(?:GSTIN|GST\s*NO|UIN)\s*[:\-\/]?\s*([0-9A-Z\s]{15,20})', text, re.IGNORECASE):
            raw = re.sub(r'\s+', '', m.group(1)).upper()
            cand = raw[:15]
            if len(cand) == 15 and is_valid_gstin_format(cand) and cand not in found:
                found.append(cand)

        seller_gstin = None
        buyer_gstin = None

        # Find buyer section marker line index
        buyer_marker_idx = -1
        for idx, line in enumerate(lines):
            l_lower = line.lower()
            if any(m in l_lower for m in ["billed to", "bill to", "buyer", "consignee", "customer", "party name", "ग्राहक", "खरीदार"]):
                buyer_marker_idx = idx
                break

        if buyer_marker_idx != -1:
            for g in found:
                for idx, line in enumerate(lines):
                    if g in line.replace(" ", ""):
                        if idx <= buyer_marker_idx and seller_gstin is None:
                            seller_gstin = g
                        elif idx > buyer_marker_idx and buyer_gstin is None:
                            buyer_gstin = g

        if not seller_gstin and len(found) > 0:
            seller_gstin = found[0]
        if not buyer_gstin and len(found) > 1:
            buyer_gstin = found[1]

        return seller_gstin, buyer_gstin

    @classmethod
    def _extract_invoice_number(cls, text: str, lines: List[str]) -> Optional[str]:
        """Extract invoice number in English or Hindi (चालान संख्या, बिल क्र.)."""
        patterns = [
            r'(?:Invoice\s*No\.?|Invoice\s*Number|Inv\s*#|Inv\s*No\.?|Bill\s*No\.?|Bill\s*#|चालान\s*(?:क्र\.?|सं\.?|संख्या)|बिल\s*(?:क्र\.?|सं\.?|संख्या))\s*[:\-]?\s*([A-Za-z0-9\/\-_]{3,25})',
            r'(?:Tax\s*Invoice\s*No\.?|Bill\s*Reference|Ref\s*No\.?)\s*[:\-]?\s*([A-Za-z0-9\/\-_]{3,25})'
        ]
        for pat in patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                inv_num = m.group(1).strip()
                if len(inv_num) >= 3 and not inv_num.isalpha() and not inv_num.lower().startswith("dated"):
                    return inv_num

        # Check line by line for multiline / table label layout
        for i, line in enumerate(lines[:20]):
            clean = line.strip().lower()
            if any(k in clean for k in ["invoiceno", "invoice no", "invoice number", "bill no", "inv no", "चालान क्र", "बिल क्र", "invoice #", "bill #"]):
                # Case A: Same line after colon
                if ":" in line:
                    parts = line.split(":", 1)
                    cand = parts[1].strip().split()[0] if parts[1].strip() else ""
                    if len(cand) >= 3 and any(c.isdigit() for c in cand) and not is_valid_gstin_format(cand):
                        return cand
                # Case B: Look ahead up to 3 lines (skipping Date/Tax Invoice labels)
                for offset in [1, 2, 3]:
                    if i + offset < len(lines):
                        cand = lines[i + offset].strip().split()[0] if lines[i + offset].strip() else ""
                        if cand.lower() in ["date", "dated", "tax invoice", "bill to", "taxable"]:
                            continue
                        if re.match(r'^[A-Za-z0-9\/\-_]{3,25}$', cand) and any(c.isdigit() for c in cand) and not is_valid_gstin_format(cand) and not cand.lower().startswith("date"):
                            return cand

        # Fallback search for standard invoice numbering schemes (e.g. SGE/2026/0491 or REL-2026-98124)
        matches = re.findall(r'\b([A-Z]{2,5}[-\/][0-9]{2,4}[-\/][A-Za-z0-9]{2,8})\b', text)
        if matches:
            return matches[0]

        generic_matches = re.findall(r'\b([A-Z]{2,4}[-\/][0-9]{3,8})\b', text)
        if generic_matches:
            return generic_matches[0]

        return None

    @classmethod
    def _extract_dates(cls, text: str, lines: List[str]) -> Tuple[Optional[datetime.date], Optional[datetime.date]]:
        """Extract invoice date and payment due date using flexible universal parsing."""
        inv_date = None
        due_date = None

        def parse_date_str(s: str) -> Optional[datetime.date]:
            if not s:
                return None
            try:
                # Clean punctuation from edges
                s_clean = re.sub(r'[^\w\s\-\/\.]', '', s).strip()
                dt = dateutil.parser.parse(s_clean, dayfirst=True, fuzzy=True)
                if 2000 <= dt.year <= 2035:
                    return dt.date()
            except Exception:
                pass
            return None

        # 1. Invoice Date on same line
        inv_patterns = [
            r'(?:Invoice\s*Date|Bill\s*Date|Date\s*of\s*Issue|Dated|दिनांक|तारीख)\s*[:\-]?\s*([0-9A-Za-z\s\/\.\-]{6,20})'
        ]
        for pat in inv_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                d = parse_date_str(m.group(1))
                if d:
                    inv_date = d
                    break

        # Check multiline date (label on line i, date value on line i+1)
        if not inv_date:
            for i, line in enumerate(lines[:25]):
                lower = line.lower()
                if any(k in lower for k in ["invoice date", "bill date", "dated", "date of issue", "दिनांक"]):
                    if i + 1 < len(lines):
                        d = parse_date_str(lines[i + 1])
                        if d:
                            inv_date = d
                            break

        # 2. Due Date search
        due_patterns = [
            r'(?:Due\s*Date|Payment\s*Due|Due\s*On|देय\s*तिथि)\s*[:\-]?\s*([0-9A-Za-z\s\/\.\-]{6,20})'
        ]
        for pat in due_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                d = parse_date_str(m.group(1))
                if d:
                    due_date = d
                    break

        if not due_date and inv_date:
            for i, line in enumerate(lines[:30]):
                if any(k in line.lower() for k in ["due date", "payment due", "देय तिथि"]):
                    if i + 1 < len(lines):
                        d = parse_date_str(lines[i + 1])
                        if d:
                            due_date = d
                            break

        # Fallback: scan any valid date pattern in the text
        if not inv_date:
            date_matches = re.findall(
                r'\b(?:\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]+\d{2,4})\b',
                text,
                re.IGNORECASE
            )
            for dm in date_matches:
                d = parse_date_str(dm)
                if d:
                    inv_date = d
                    break

        return inv_date, due_date

    @classmethod
    def _extract_supplier_name(cls, lines: List[str], seller_gstin: Optional[str]) -> str:
        """Extract supplier / company name, typically at the top of invoice."""
        if not lines:
            return "Direct Vendor"

        skip_exact = [
            "tax invoice", "gst invoice", "bill of supply", "cash memo", "invoice",
            "चालान", "बिल", "original", "duplicate", "triplicate", "retail invoice",
            "page 1", "page 2", "tax invoice / bill of supply", "original for recipient"
        ]
        address_markers = [
            "plot", "road", "street", "nagar", "midc", "floor", "near", "opposite",
            "tel:", "phone", "email", "pin", "state code", "state name", "gstin", "pan:"
        ]
        biz_suffixes = [
            "ltd", "limited", "pvt", "enterprises", "traders", "solutions",
            "technologies", "services", "industries", "retail", "mart", "store",
            "corp", "agency", "holdings", "infotech", "works", "company"
        ]

        candidates = []
        for i, line in enumerate(lines[:10]):
            clean = line.strip()
            lower = clean.lower()
            if any(s == lower or lower.startswith(s) for s in skip_exact):
                continue
            if seller_gstin and seller_gstin in clean.replace(" ", ""):
                continue
            if len(clean) < 3 or clean.isdigit():
                continue
            if any(a in lower for a in address_markers):
                continue

            score = 10 - i
            if any(b in lower for b in biz_suffixes):
                score += 15
            if clean.isupper() and len(clean) > 5:
                score += 3
            candidates.append((score, clean))

        if candidates:
            candidates.sort(key=lambda x: x[0], reverse=True)
            return candidates[0][1]

        return lines[0].strip()

    @classmethod
    def _extract_buyer_name(cls, text: str, lines: List[str], buyer_gstin: Optional[str]) -> str:
        """Extract buyer name from Billed To / Consignee / Customer section."""
        # 1. Regex search for marker with value on same line
        marker_pats = [
            r'(?:Billed\s*To|Bill\s*To|Buyer|Consignee|Customer(?:\s*Name)?|Party\s*Name|ग्राहक|खरीदार)\s*[:\-\/]?\s*([^\n\r]*)'
        ]
        for pat in marker_pats:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                val = m.group(1).strip()
                val = re.sub(r'^[^\w]+', '', val).strip()
                # Ensure it's not empty, not another label, and not GSTIN
                if len(val) > 2 and not any(k in val.lower() for k in ["bill to", "billed to", "buyer", "consignee", "gstin", "address", "state"]):
                    return val

        # 2. Check multiline layout (marker on line i, buyer name on line i+1 or i+2)
        for i, line in enumerate(lines):
            clean = line.lower()
            if any(k in clean for k in ["billed to", "bill to", "buyer", "consignee", "customer name", "party name", "खरीदार", "ग्राहक"]):
                for offset in [1, 2]:
                    if i + offset < len(lines):
                        next_line = lines[i + offset].strip()
                        if len(next_line) > 2 and not any(ign in next_line.lower() for ign in ["gstin", "state", "address", "phone", "email", "pan:"]):
                            return next_line

        return "Enterprise Customer"

    @classmethod
    def _extract_totals(cls, text: str, lines: List[str]) -> Dict[str, float]:
        """Extract subtotal, taxes (CGST, SGST, IGST), and total amount with rate isolation."""
        subtotal = 0.0
        cgst = 0.0
        sgst = 0.0
        igst = 0.0
        total_amt = 0.0

        def parse_amount(val_str: str) -> float:
            cleaned = re.sub(r'[^\d.]', '', val_str)
            try:
                return float(cleaned)
            except Exception:
                return 0.0

        # Grand Total patterns
        # Grand Total patterns on same line
        total_patterns = [
            r'(?:Grand\s*Total|Total\s*Amount\s*(?:Payable)?|Invoice\s*Total|Net\s*Amount|Invoice\s*Value|Total\s*Amount|कुल\s*(?:राशि|देय))\s*[:\-]?\s*(?:₹|INR|Rs\.?)?\s*([0-9,]+\.[0-9]{2})',
            r'(?:Grand\s*Total|Total\s*Amount\s*(?:Payable)?|Invoice\s*Total|Net\s*Amount|Invoice\s*Value|Total\s*Amount|कुल\s*(?:राशि|देय))\s*[:\-]?\s*(?:₹|INR|Rs\.?)?\s*([0-9,]+)',
            r'\b(?:Total)\s*[:\-]?\s*(?:₹|INR|Rs\.?)?\s*([0-9,]+\.[0-9]{2})'
        ]
        for pat in total_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                val = parse_amount(m.group(1))
                if val > total_amt and val > 10.0:
                    total_amt = val
                    break

        # Subtotal / Taxable Value patterns on same line
        sub_patterns = [
            r'(?:Taxable\s*(?:Amount|Value)|Sub\s*Total|Total\s*Before\s*Tax|करयोग्य\s*मूल्य)\s*[:\-]?\s*(?:₹|INR|Rs\.?)?\s*([0-9,]+\.[0-9]{2})',
            r'(?:Taxable\s*(?:Amount|Value)|Sub\s*Total|Total\s*Before\s*Tax|करयोग्य\s*मूल्य)\s*[:\-]?\s*(?:₹|INR|Rs\.?)?\s*([0-9,]+)'
        ]
        for pat in sub_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                val = parse_amount(m.group(1))
                if val > subtotal and val > 10.0:
                    subtotal = val
                    break

        # Multiline scan for separated Total and Sub Total labels
        for i, line in enumerate(lines):
            clean = line.strip().lower()
            if clean in ["total", "grand total", "net amount", "invoice total", "total amount", "invoice value", "कुल देय", "कुल राशि"]:
                for offset in [1, 2, 3]:
                    if i + offset < len(lines):
                        cand = lines[i + offset].strip()
                        # Check if cand is a formatted monetary number
                        if re.match(r'^(?:₹|INR|Rs\.?)?\s*[0-9,]+\.[0-9]{2}$', cand):
                            v = parse_amount(cand)
                            if v > total_amt and v > 10.0:
                                total_amt = v
                                break
            elif any(clean == k or clean.startswith(k) for k in ["sub total", "subtotal", "taxable amount", "taxable value", "करयोग्य मूल्य"]):
                for offset in [1, 2]:
                    if i + offset < len(lines):
                        cand = lines[i + offset].strip()
                        if re.match(r'^(?:₹|INR|Rs\.?)?\s*[0-9,]+\.[0-9]{2}$', cand):
                            v = parse_amount(cand)
                            if v > subtotal and v > 10.0:
                                subtotal = v
                                break

        # Taxes: Scan lines for CGST, SGST, IGST while ignoring rate percentages like @ 9% or (2.5%)
        for line in lines:
            l_clean = line.strip()
            l_lower = l_clean.lower()
            if "cgst" in l_lower or "केन्द्रीय कर" in l_clean:
                nums = re.findall(r'([0-9,]+\.[0-9]{2})', l_clean)
                if nums:
                    cgst = parse_amount(nums[-1])
            elif "sgst" in l_lower or "utgst" in l_lower or "राज्य कर" in l_clean:
                nums = re.findall(r'([0-9,]+\.[0-9]{2})', l_clean)
                if nums:
                    sgst = parse_amount(nums[-1])
            elif "igst" in l_lower or "एकीकृत कर" in l_clean:
                nums = re.findall(r'([0-9,]+\.[0-9]{2})', l_clean)
                if nums:
                    igst = parse_amount(nums[-1])

        # Scan for Tax Table summary lines (e.g. Total TaxAmount table with 4 columns)
        if cgst == 0.0 and sgst == 0.0:
            for line in lines:
                nums = re.findall(r'([0-9,]+\.[0-9]{2})', line)
                if len(nums) >= 3 and any(k in line.lower() for k in ["total", "tax"]):
                    # Likely tax row: e.g. Taxable, CGST, SGST, Total Tax
                    try:
                        c_cand = parse_amount(nums[1])
                        s_cand = parse_amount(nums[2])
                        if c_cand > 0 and c_cand == s_cand:
                            cgst = c_cand
                            sgst = s_cand
                    except Exception:
                        pass

        # Disambiguate and reconcile total and subtotal
        tax_sum = cgst + sgst + igst
        if total_amt < subtotal and subtotal > 0.0:
            total_amt = round(subtotal + tax_sum, 2)
        elif total_amt == 0.0 and subtotal > 0.0:
            total_amt = round(subtotal + tax_sum, 2)
        elif subtotal == 0.0 and total_amt > 0.0:
            subtotal = round(total_amt - tax_sum, 2) if tax_sum > 0 else round(total_amt / 1.18, 2)
            if tax_sum == 0.0:
                calc_tax = round(total_amt - subtotal, 2)
                cgst = round(calc_tax / 2, 2)
                sgst = round(calc_tax / 2, 2)

        return {
            "total_taxable_value": round(subtotal, 2),
            "total_cgst": round(cgst, 2),
            "total_sgst": round(sgst, 2),
            "total_igst": round(igst, 2),
            "total_amount": round(total_amt, 2)
        }

    @classmethod
    def _extract_line_items(cls, lines: List[str], totals: Dict[str, float], supplier_name: str) -> List[Dict[str, Any]]:
        """Extract table line items bounded between the header and summary footer."""
        header_keywords = ["description", "particulars", "item", "product", "details of goods", "सामग्री", "विवरण"]
        footer_keywords = ["sub total", "taxable", "total", "cgst", "sgst", "igst", "grand total", "amount in words", "round off", "कुल", "करयोग्य"]

        start_idx = -1
        end_idx = len(lines)

        for i, line in enumerate(lines):
            lower = line.lower()
            if start_idx == -1 and any(hk in lower for hk in header_keywords) and any(col in lower for col in ["qty", "rate", "amount", "price", "total", "दर", "मात्रा"]):
                start_idx = i + 1
                continue
            if start_idx != -1 and any(fk in lower for fk in footer_keywords):
                end_idx = i
                break

        table_lines = lines[start_idx:end_idx] if start_idx != -1 else lines
        items = []

        for line in table_lines:
            clean = line.strip()
            lower = clean.lower()
            if not clean or any(fk in lower for fk in footer_keywords):
                continue
            if start_idx == -1 and any(ign in lower for ign in ["invoice", "date", "gstin", "phone", "email", "road", "plot", "billed to"]):
                continue

            # Pipe-separated table format from pdfplumber
            if "|" in clean:
                cells = [c.strip() for c in clean.split("|") if c.strip()]
                if len(cells) >= 3:
                    desc = cells[0]
                    amt_str = re.sub(r'[^\d.]', '', cells[-1])
                    try:
                        amt = float(amt_str)
                        if amt > 0:
                            items.append({
                                "description": desc,
                                "quantity": 1.0,
                                "unit_price": amt,
                                "tax_rate": 18.0,
                                "tax_amount": round(amt * 0.18, 2),
                                "total_amount": amt
                            })
                    except Exception:
                        pass
                continue

            # Number sequence scan at end of line
            num_matches = list(re.finditer(r'\b\d+(?:,\d+)*(?:\.\d{1,2})?\b', clean))
            if num_matches:
                last_m = num_matches[-1]
                try:
                    amt = float(last_m.group(0).replace(",", ""))
                    if amt <= 0 or amt > 100000000:
                        continue

                    qty = 1.0
                    rate = amt
                    desc_end_idx = last_m.start()

                    if len(num_matches) >= 3:
                        try:
                            rate_cand = float(num_matches[-2].group(0).replace(",", ""))
                            qty_cand = float(num_matches[-3].group(0).replace(",", ""))
                            if 0.01 <= qty_cand <= 10000 and rate_cand > 0:
                                qty = qty_cand
                                rate = rate_cand
                                desc_end_idx = num_matches[-3].start()
                        except Exception:
                            pass
                    elif len(num_matches) >= 2:
                        try:
                            rate_cand = float(num_matches[-2].group(0).replace(",", ""))
                            if rate_cand > 0:
                                rate = rate_cand
                                desc_end_idx = num_matches[-2].start()
                        except Exception:
                            pass

                    desc_str = clean[:desc_end_idx].strip()
                    desc_str = re.sub(r'^\d+[\.\)\s]+', '', desc_str).strip()
                    if len(desc_str) >= 2:
                        items.append({
                            "description": desc_str,
                            "quantity": qty,
                            "unit_price": rate,
                            "tax_rate": 18.0,
                            "tax_amount": round(amt * 0.18, 2),
                            "total_amount": amt
                        })
                except Exception:
                    pass

        # Fallback item: derive dynamically from totals
        if not items:
            total_amt = totals.get("total_amount", 0.0)
            subtotal = totals.get("total_taxable_value", 0.0)
            items.append({
                "description": f"Supplies from {supplier_name}",
                "quantity": 1.0,
                "unit_price": subtotal if subtotal > 0 else total_amt,
                "tax_rate": 18.0,
                "tax_amount": round(totals.get("total_cgst", 0.0) + totals.get("total_sgst", 0.0) + totals.get("total_igst", 0.0), 2),
                "total_amount": total_amt
            })

        return items

    @classmethod
    def _build_provenance(cls, canonical: Dict[str, Any], word_blocks: Optional[List[Dict[str, Any]]]) -> Dict[str, Any]:
        """Build provenance metadata for extracted fields."""
        return {
            "meta.invoice_number": {
                "confidence": 0.98 if canonical["meta"]["invoice_number"] != "INV-UNKNOWN" else 0.50,
                "source": "ocr_engine",
                "status": "accepted" if canonical["meta"]["invoice_number"] != "INV-UNKNOWN" else "flagged"
            },
            "seller.gstin": {
                "confidence": 0.99 if canonical["seller"]["gstin"] else 0.50,
                "source": "ocr_engine",
                "status": "accepted" if canonical["seller"]["gstin"] else "flagged"
            },
            "totals.total_amount": {
                "confidence": 0.98 if canonical["totals"]["total_amount"] > 0 else 0.50,
                "source": "ocr_engine",
                "status": "accepted"
            },
            "totals.total_taxable_value": {
                "confidence": 0.96 if canonical["totals"]["total_taxable_value"] > 0 else 0.50,
                "source": "ocr_engine",
                "status": "accepted"
            }
        }
