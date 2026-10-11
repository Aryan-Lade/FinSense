# FinSense Deterministic Validation Rules (validation-rules.md)

Version: `1.0.0` (Pure Python, Deterministic, Zero Hallucination)

## GSTIN Validation Rules (R001 - R004)
- **R001: `gstin_format_valid` (Error)**
  - Regex: `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$`
  - Example: `27AAPFU0939F1ZV` passes; `INVALID_GSTIN` fails.
- **R002: `gstin_state_code_valid` (Error)**
  - Cross-checks the first 2 digits against the domain state codes table (01 to 38, 97, 99).
- **R003: `gstin_pan_structure_valid` (Warning)**
  - Verifies that the 4th character of the embedded PAN belongs to `{P, C, H, F, A, T, B, L, J, G}`.
- **R004: `gstin_check_digit_valid` (Error)**
  - Weighted modulus 36 algorithm.
  - Verified test vector: `27AAPFU0939F1ZV` passes.

## Tax Consistency Rules (R010 - R013)
- **R010: `intrastate_tax_structure` (Error)**
  - When supplier state matches place of supply: CGST and SGST are required and IGST must be zero.
- **R011: `interstate_tax_structure` (Error)**
  - When supplier state differs from place of supply: IGST is required and CGST/SGST must be zero.
- **R012: `cgst_sgst_parity` (Error)**
  - CGST rate and amount must match SGST rate and amount exactly.

## Arithmetic Reconciliation Rules (R020 - R028)
- **R020: `line_item_math` (Error)**
  - Line Total = (Quantity × Unit Price) - Discount + Taxes (within ₹1.00 tolerance).
- **R021: `subtotal_reconciliation` (Error)**
  - Sum of line item taxable amounts = Invoice Subtotal.
- **R022: `grand_total_reconciliation` (Error)**
  - Grand Total = Subtotal + Total Tax + Cess + Round Off (±₹1.00).
- **R023: `round_off_bounds` (Warning)**
  - Round off adjustment magnitude must be ≤ ₹1.00.
- **R028: `amount_in_words_crosscheck` (Warning)**
  - English/Hindi amount in words must match the numerical Grand Total.

## Field Presence & Sanity Rules (R030 - R044)
- **R030: `required_fields_present` (Error)**
  - Bill Number, Invoice Date, Supplier Name, and Total Amount must be present.
- **R031: `invoice_date_sanity` (Warning)**
  - Invoice date cannot be in the future or older than 5 years.
- **R032: `due_date_after_invoice` (Warning)**
  - Due date must be on or after invoice date.
- **R033: `currency_is_inr` (Warning)**
  - Currency must default to INR unless foreign trade is indicated.

## Duplicate Detection (R050 - R052)
- **R050: `ledger_duplicate_detected` (Warning)**
  - Same Supplier GSTIN (or normalized name) + Bill Number already registered in ledger.
- **R051: `sha256_duplicate_detected` (Warning)**
  - Identical file cryptographic hash already uploaded.
