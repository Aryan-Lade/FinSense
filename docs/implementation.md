# FinSense — Technical Implementation Specification

**Engineering Blueprint for Full-Stack AI Invoice Intelligence & Lifecycle Automation**

---

## 1. Architecture Overview

FinSense is engineered as a decoupled, asynchronous, high-throughput microservices-ready monolith optimized for hackathon speed and production scalability.

```
+---------------------------------------------------------------------------------------+
|                                    PRESENTATION LAYER                                 |
|                  React 18 + Tailwind CSS + Lucide Icons + Vite                        |
|  - Modern Dark/Light Theme         - Side-by-side Review Interface                    |
|  - Drag & Drop Dropzone            - Dynamic Analytics & Payables Dashboard           |
+-------------------------------------------+-------------------------------------------+
                                            | (REST APIs / WebSockets / Multipart Form)
+-------------------------------------------v-------------------------------------------+
|                                   APPLICATION GATEWAY                                 |
|                                FastAPI (Python 3.10+)                                 |
|  - Request Validation (Pydantic v2)        - Rate Limiting & File Guards              |
|  - Asynchronous Background Tasks           - OAuth2 / Google Calendar Manager         |
+-----+-----------------------+--------------------+--------------------+---------------+
      |                       |                    |                    |
+-----v-------------+ +-------v-----------+ +------v-----------+ +------v-------------+
| INGESTION ENGINE  | | OCR & VISION      | | REASONING ENGINE | | VALIDATION ENGINE  |
| - MIME Detection  | | - PaddleOCR (Hi/En| | - VLM Extraction | | - GSTIN Checksum   |
| - PDF Extractor   | | - Image De-skew   | |   (Qwen2-VL/LLM) | | - Math Balance     |
| - Excel / CSV     | | - Blur / Contrast | | - JSON Schema    | | - Inter/Intra State|
|   Parser          | |   Inspector       | |   Enforcement    | | - Duplicate Det.   |
+-------------------+ +-------------------+ +------------------+ +--------------------+
      |                       |                    |                    |
+-----v-----------------------v--------------------v--------------------v---------------+
|                                    STORAGE & SERVICES                                 |
| - Supabase PostgreSQL (Normalized DB)        - Google Calendar API v3                 |
| - Supabase Storage (Encrypted S3 bucket)     - Python APScheduler (Reminder Engine)  |
+---------------------------------------------------------------------------------------+
```

---

## 2. Directory Structure & Codebase Organization

```
FinSense/
├── docs/
│   ├── overview.md
│   ├── implementation.md
│   ├── security.md
│   ├── phases.md
│   ├── ai.md
│   ├── srs.md
│   ├── database_schema.md
│   └── api_specification.md
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── upload.py          # Multi-format ingestion endpoint
│   │   │   │   │   ├── bills.py           # CRUD, Review, Mark as Paid
│   │   │   │   │   ├── reminders.py       # Schedules & triggers
│   │   │   │   │   ├── calendar.py        # Google Calendar sync & auth
│   │   │   │   │   └── export.py          # CSV/JSON/XLSX export
│   │   │   │   └── api.py                 # Router aggregation
│   │   ├── core/
│   │   │   ├── config.py                  # Pydantic Settings & environment
│   │   │   ├── database.py                # Supabase client & connection pools
│   │   │   └── security.py                # Token encryption, safety guards
│   │   ├── services/
│   │   │   ├── ingestion/
│   │   │   │   ├── file_validator.py      # Magic bytes & extension validation
│   │   │   │   ├── pdf_processor.py       # PyMuPDF vector & raster extraction
│   │   │   │   └── spreadsheet_parser.py  # Pandas / openpyxl parser
│   │   │   ├── vision/
│   │   │   │   ├── quality_assessor.py    # Blur detection via Laplacian variance
│   │   │   │   └── ocr_engine.py          # Bilingual PaddleOCR pipeline
│   │   │   ├── ai/
│   │   │   │   ├── extractor.py           # Qwen2-VL / Vision-LLM client
│   │   │   │   ├── prompts.py             # Optimized bilingual extraction prompts
│   │   │   │   └── schemas.py             # Pydantic models for structured JSON
│   │   │   ├── validation/
│   │   │   │   ├── rules.py               # GST & arithmetic verification rules
│   │   │   │   └── evaluator.py           # Field confidence & error aggregation
│   │   │   ├── reminders/
│   │   │   │   ├── scheduler.py           # 10-day + 2-day policy engine
│   │   │   │   └── notification.py        # Dispatcher
│   │   │   └── calendar/
│   │   │       └── google_calendar.py     # Calendar API v3 synchronization
│   │   ├── schemas/                       # Pydantic request/response models
│   │   └── main.py                        # FastAPI application entrypoint
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/                    # Navbar, Modal, Button, Badges
│   │   │   ├── dashboard/                 # KPI cards, charts, recent bills
│   │   │   ├── upload/                    # Drag & drop upload zone
│   │   │   ├── review/                    # Split-screen doc viewer & editor
│   │   │   ├── bills/                     # Bills table, search, filters
│   │   │   └── calendar/                  # Calendar sync status widget
│   │   ├── hooks/                         # Custom React hooks (useBills, useAuth)
│   │   ├── services/                      # Axios API clients
│   │   ├── types/                         # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── index.css                      # Tailwind base & custom utilities
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

---

## 3. End-to-End Implementation Modules

### 3.1 Module 1: Multi-Format Ingestion & Quality Pre-Screening
- **Supported MIME Types:**
  - `application/pdf`
  - `image/jpeg`, `image/png`, `image/webp`
  - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (`.xlsx`)
  - `text/csv`
- **File Validation:**
  - Validates both file extension and magic byte headers using `python-magic` to prevent extension spoofing.
  - Rejects files larger than 25MB.
- **Image Quality Check (Laplacian Variance):**
  - Measures sharpness using OpenCV: $\text{Var}(\nabla^2 I) < 100 \implies \text{Flagged as Blurry}$.
  - Computes image brightness and contrast histograms. If the image is underexposed or excessively blurred, the bill is immediately pre-marked with `document_quality_status = 'POOR'` and routed to the Review Queue.

---

### 3.2 Module 2: Bilingual OCR & Multi-Modal Field Extraction

#### PaddleOCR Pipeline:
- Configured for multi-script support:
  ```python
  from paddleocr import PaddleOCR
  ocr_engine = PaddleOCR(use_angle_cls=True, lang='devanagari') # Supports Hindi & English
  ```
- Extracts text bounding boxes `[x1, y1, x2, y2]`, text content, and OCR confidence scores.

#### AI Reasoning & Extraction:
- **Vision-Language Model:** Ingests document images or extracted text tokens and adheres to a strict canonical Pydantic JSON schema:
  - Header: `bill_number`, `invoice_date`, `due_date`, `currency`
  - Parties: `supplier_name`, `supplier_address`, `supplier_gstin`, `buyer_name`, `buyer_gstin`
  - Items: List of `{ description, hsn_sac, quantity, unit_price, discount, tax_rate, line_total }`
  - Taxes: `taxable_subtotal`, `cgst_amount`, `sgst_amount`, `igst_amount`, `total_tax`, `round_off`, `total_amount`
  - Meta: `confidence_scores: Dict[str, float]`
- Schema enforcement uses Pydantic JSON schemas with deterministic zero-shot system prompts.

---

### 3.3 Module 3: Deterministic Financial Validation Engine

Every extracted JSON payload is passed to the validation engine. Rules are applied programmatically in Python:

```python
import re
from decimal import Decimal, ROUND_HALF_UP

class GSTValidator:
    GSTIN_REGEX = r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
    
    @classmethod
    def validate_gstin(cls, gstin: str) -> bool:
        if not gstin or not re.match(cls.GSTIN_REGEX, gstin.upper()):
            return False
        return True

    @classmethod
    def validate_arithmetic(cls, bill_data: dict) -> dict:
        errors = []
        warnings = []
        
        # 1. Line item arithmetic
        computed_subtotal = Decimal("0.00")
        for idx, item in enumerate(bill_data.get("items", [])):
            qty = Decimal(str(item.get("quantity", 0) or 0))
            price = Decimal(str(item.get("unit_price", 0) or 0))
            discount = Decimal(str(item.get("discount", 0) or 0))
            expected_line = (qty * price) - discount
            actual_line = Decimal(str(item.get("line_total", 0) or 0))
            
            if abs(expected_line - actual_line) > Decimal("0.50"): # Tolerating minor rounding
                warnings.append(f"Item #{idx+1} ({item.get('description')}): math mismatch. Expected {expected_line}, got {actual_line}")
            computed_subtotal += actual_line
        
        # 2. Subtotal check
        reported_subtotal = Decimal(str(bill_data.get("taxable_subtotal", 0) or 0))
        if abs(computed_subtotal - reported_subtotal) > Decimal("1.00") and len(bill_data.get("items", [])) > 0:
            warnings.append(f"Subtotal mismatch: Sum of items ({computed_subtotal}) != reported subtotal ({reported_subtotal})")
            
        # 3. Tax reconciliation
        cgst = Decimal(str(bill_data.get("cgst_amount", 0) or 0))
        sgst = Decimal(str(bill_data.get("sgst_amount", 0) or 0))
        igst = Decimal(str(bill_data.get("igst_amount", 0) or 0))
        total_tax = Decimal(str(bill_data.get("total_tax", 0) or 0))
        
        if abs((cgst + sgst + igst) - total_tax) > Decimal("0.50"):
            errors.append(f"Tax total mismatch: CGST({cgst}) + SGST({sgst}) + IGST({igst}) != Total Tax({total_tax})")
            
        # 4. Intra-state vs Inter-state logic
        if cgst > 0 and sgst > 0 and igst > 0:
            warnings.append("Both CGST/SGST and IGST are charged simultaneously. Usually mutually exclusive.")
        if cgst > 0 and sgst > 0 and abs(cgst - sgst) > Decimal("0.10"):
            warnings.append(f"CGST ({cgst}) and SGST ({sgst}) must be identical for intra-state transactions.")

        # 5. Final Grand Total check
        grand_total = Decimal(str(bill_data.get("total_amount", 0) or 0))
        round_off = Decimal(str(bill_data.get("round_off", 0) or 0))
        expected_grand_total = reported_subtotal + total_tax + round_off
        if abs(expected_grand_total - grand_total) > Decimal("1.00"):
            errors.append(f"Invoice Grand Total mismatch: Subtotal + Tax ({expected_grand_total}) != Reported Total ({grand_total})")

        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings
        }
```

---

### 3.4 Module 4: Human-in-the-Loop Review Required Flow

1. **Routing Rule:**
   $$\text{Review Required} \iff \begin{cases} 
   \text{document\_quality} == \text{'POOR'} \\
   \text{errors\_count} > 0 \\
   \text{confidence\_score}(\text{critical\_field}) < 0.75 \\
   \text{missing\_critical\_field} \in \{\text{bill\_number}, \text{total\_amount}, \text{supplier\_name}\}
   \end{cases}$$
2. **Frontend UI Experience:**
   - **Split Screen:** Left side renders PDF (via `react-pdf`) or zoomable high-res image (via canvas). Right side loads interactive form with field-specific warning badges.
   - Real-time client-side calculation triggers when the user updates a quantity or price, automatically recalculating totals and clearing the warning.
   - User clicks **"Verify & Accept"** $\to$ updates record state to `review_status = 'VERIFIED'`.

---

### 3.5 Module 5: Proactive Reminder Engine (10-Day + 2-Day Policy)

The scheduler handles automated billing follow-ups according to the strict business rules:

```
[Day 0: Upload]
       │
       ▼
[Calculate 1st Reminder]
   Due Date extracted?
   ├── YES ──> Scheduled at Due Date (09:00 AM)
   └── NO  ──> Scheduled at Upload Date + 10 Days (09:00 AM)
       │
       ▼
[Reminder Execution Worker (Every hour)]
   Query: Status == 'UNPAID' AND scheduled_at <= NOW()
       │
       ▼
   Fire Reminder Notification (Webhook/SMS/Email/In-App)
       │
       ▼
   Schedule Next Reminder:
   New scheduled_at = Previous scheduled_at + 2 Days
   Reminder counter: N + 1
       │
       ▼
[User Clicks "Mark as Paid"]
   Update: payment_status = 'PAID', paid_at = NOW()
   Cancel all pending reminders in DB
   Delete / update future Google Calendar entries
```

---

### 3.6 Module 6: Google Calendar API v3 Integration

- **Authentication:** Google OAuth 2.0 with offline access (`refresh_token` stored securely in the database).
- **Calendar Event Payload:**
  ```json
  {
    "summary": "Bill Due: [Supplier Name] - ₹[Total Amount]",
    "description": "Invoice #[Bill Number]\nAmount: ₹[Total Amount]\nStatus: UNPAID\nSupplier: [Supplier Name]\nLink: https://finsense.app/bills/[Bill ID]",
    "start": { "date": "2026-10-21" },
    "end": { "date": "2026-10-21" },
    "reminders": {
      "useDefault": false,
      "overrides": [
        { "method": "popup", "minutes": 1440 },
        { "method": "popup", "minutes": 120 }
      ]
    }
  }
  ```
- **Sync on Status Change:** When an invoice is marked as `PAID`, FinSense performs `calendar.events().delete()` or modifies summary to `[PAID] Bill: [Supplier Name]` based on user preference.

---

### 3.7 Module 7: Export Subsystem
- **JSON:** Complete canonical structure with line items and validation diagnostics.
- **CSV:** Two exports:
  1. `invoices_summary.csv`: Single row per bill with invoice #, date, supplier, GSTIN, subtotal, taxes, total, payment status.
  2. `invoice_line_items.csv`: Relational export linking `bill_id` to each individual purchased product/service.
- **Excel (`.xlsx`):** Formatted multi-tab workbook generated via `openpyxl` with styled headers, auto-adjusted column widths, and proper currency formatting.
