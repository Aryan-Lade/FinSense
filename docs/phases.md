# FinSense — Project Roadmap & Implementation Phases

**Complete Execution Plan from Zero to Production & Hackathon Winning Demo**

---

## Roadmap Overview

```
[Phase 1] ───> [Phase 2] ───> [Phase 3] ───> [Phase 4] ───> [Phase 5]
Foundations    Ingestion      OCR & AI       Validation     Review Gate
                                                                 │
[Phase 10] <── [Phase 9] <─── [Phase 8] <─── [Phase 7] <─── [Phase 6]
Demo Script    E2E Testing    Dashboard      Google Cal     Reminders
```

---

## Phase 1: Foundations, Infrastructure & Environment Setup
**Objective:** Establish developer tooling, repository structure, Supabase database, and cloud storage buckets.

- **Tasks:**
  1. Initialize mono-repository with `backend/` (FastAPI), `frontend/` (React + Tailwind + Vite), and `docs/`.
  2. Provision Supabase project:
     - Execute relational schema migrations (`bills`, `bill_items`, `reminders`, `processing_results`, `audit_logs`).
     - Configure private storage bucket `invoices` with access policies.
  3. Set up environment variables and configuration management via Pydantic Settings (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_CLIENT_ID`, `ENCRYPTION_KEY`).
  4. Create base health-check and ping endpoints (`GET /api/v1/health`).
- **Deliverables:**
  - Running FastAPI server with OpenAPI Swagger UI at `/docs`.
  - Configured Supabase database and verified storage connection.

---

## Phase 2: Multi-Format Ingestion & Quality Pre-Screening
**Objective:** Accept raw files securely, validate formats, assess document readability, and persist raw assets.

- **Tasks:**
  1. Build multi-format upload endpoint (`POST /api/v1/upload`).
  2. Implement MIME detection and magic-byte inspection via `python-magic` for:
     - PDF (`application/pdf`)
     - Images (`image/jpeg`, `image/png`, `image/webp`)
     - Spreadsheets (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `text/csv`)
  3. Build computer vision document quality assessment:
     - Laplacian variance calculation for blurriness detection ($\text{Variance} < 100 \implies \text{Blurry}$).
     - Contrast and illumination histograms for low-light or washed-out scans.
  4. Persist raw files into Supabase Storage under unique UUID paths; record initial row in `bills` table with status `PENDING`.
- **Deliverables:**
  - Robust file uploader capable of accepting all 6 target formats.
  - Automated tagging of document quality (`GOOD`, `ACCEPTABLE`, `POOR`).

---

## Phase 3: Bilingual OCR & Multi-Modal AI Extraction
**Objective:** Extract full textual contents across English and Hindi documents, and translate visual layouts into structured JSON.

- **Tasks:**
  1. Implement **PaddleOCR** extraction engine:
     - Configure Devanagari model (`lang='devanagari'`) for Hindi & English support.
     - Extract bounding boxes, text content, and word-level confidence metrics.
  2. Implement **PyMuPDF** text extractor for vector/digital PDFs (bypassing OCR when direct text stream is available for 10x speedup).
  3. Implement **Spreadsheet Parser** using `pandas` and `openpyxl` to extract tabular rows from CSV/XLSX uploads.
  4. Build **AI Visual-Semantic Reasoning Engine**:
     - Integrate Vision-Language Model (Qwen2-VL-7B / LayoutLMv3 / Multimodal LLM API).
     - Construct bilingual system prompt with strict Pydantic JSON schema constraints.
     - Extract: Header (Invoice #, Date, Due Date), Parties (Supplier, Buyer, GSTINs), Line Items (Qty, Unit Price, Tax Rate, Line Total), and Tax Totals (CGST, SGST, IGST, Grand Total).
  5. Compute per-field confidence scores ($0.0 - 1.0$).
- **Deliverables:**
  - Normalized structured JSON payload for any uploaded document format.
  - Zero loss of line-item level granularity.

---

## Phase 4: Deterministic Financial & GST Validation Engine
**Objective:** Eliminate AI hallucinations through programmatic, non-negotiable mathematical and tax rule checks.

- **Tasks:**
  1. Implement **Indian GSTIN Validator**:
     - Validate 15-character alphanumeric format via regex.
     - Verify state code validity (01 to 38).
  2. Implement **Line-Item Arithmetic Reconciler**:
     - $\text{Line Total} = (\text{Quantity} \times \text{Unit Price}) - \text{Discount}$.
  3. Implement **Tax Balancing Engine**:
     - Intra-state logic: $\text{CGST} = \text{SGST}$, $\text{IGST} = 0$.
     - Inter-state logic: $\text{IGST} = \text{Subtotal} \times \text{Tax Rate}$, $\text{CGST} = \text{SGST} = 0$.
     - Reconcile $\text{CGST} + \text{SGST} + \text{IGST} = \text{Reported Total Tax}$.
  4. Implement **Invoice Grand Total Balance**:
     - $\text{Taxable Subtotal} + \text{Total Tax} + \text{Round Off} = \text{Invoice Grand Total}$.
  5. Build duplicate invoice detector (matching `supplier_name` + `bill_number` within a 12-month window).
  6. Store validation results (`errors`, `warnings`, `is_valid`) in `processing_results` table.
- **Deliverables:**
  - Deterministic validation report attached to every bill.
  - Automatic classification: `VALID` or `FLAGGED`.

---

## Phase 5: Human-in-the-Loop "Review Required" Interface
**Objective:** Provide a fast, intuitive side-by-side verification workflow for ambiguous or flagged invoices.

- **Tasks:**
  1. Build backend review endpoints:
     - `GET /api/v1/bills/review-queue` (List bills needing human intervention).
     - `PUT /api/v1/bills/{id}/review` (Submit corrections and re-validate).
  2. Build frontend split-screen review component:
     - **Left Pane:** Zoomable, pan-able document preview (PDF/Image renderer).
     - **Right Pane:** Editable form populated with extracted fields.
  3. Render dynamic visual error badges (e.g., Red: "Math Mismatch", Yellow: "Low Confidence GSTIN").
  4. Implement real-time client-side re-calculation on form input:
     - As user edits quantity or price, recalculate totals and clear errors in real time.
  5. Add "Approve & Verify" button that transitions status from `REVIEW_REQUIRED` to `VERIFIED`.
- **Deliverables:**
  - Working split-screen review UI ensuring no uncertain bill enters verified records unchecked.

---

## Phase 6: Proactive Payment Reminder Engine
**Objective:** Execute the core 10-day + 2-day reminder policy to eliminate forgotten vendor payables.

- **Tasks:**
  1. Implement reminder schedule generator:
     - If explicit `due_date` extracted $\to$ Schedule 1st reminder at `due_date 09:00 AM`.
     - Else $\to$ Fallback to `upload_date + 10 days 09:00 AM`.
  2. Insert initial reminder record in `reminders` table with `status = 'SCHEDULED'`.
  3. Build background task runner (APScheduler / Celery / Cron worker):
     - Periodic check (every 10 minutes) for due reminders where `status = 'SCHEDULED'` and `scheduled_at <= NOW()` and bill `payment_status = 'UNPAID'`.
  4. Trigger notification dispatcher (in-app banner, browser notification, or webhook).
  5. Generate subsequent recurring reminder:
     - Schedule next reminder at `NOW() + 2 days 09:00 AM` with `reminder_number = N + 1`.
  6. Implement "Mark as Paid" action:
     - Set `payment_status = 'PAID'`, `paid_at = NOW()`.
     - Cancel all pending reminders (`status = 'CANCELLED'`).
- **Deliverables:**
  - Fully automated, self-scheduling billing lifecycle daemon.

---

## Phase 7: Bi-Directional Google Calendar API v3 Integration
**Objective:** Synchronize bill reminders directly into the owner's Google Calendar for ambient visibility.

- **Tasks:**
  1. Implement Google OAuth2 authentication flow:
     - `GET /api/v1/calendar/auth-url` (Generate consent link).
     - `GET /api/v1/calendar/callback` (Exchange authorization code for tokens).
  2. Securely store and encrypt `refresh_token` in database.
  3. Implement event creator:
     - When bill reminder is scheduled, push Google Calendar event with title `Bill Due: [Supplier] - ₹[Amount]`.
     - Include invoice number, deep link to bill, and custom popup notifications.
     - Store returned Google `event_id` in `reminders` table.
  4. Implement event updater & purger:
     - When bill is marked as `PAID`, delete future reminder events or update title to `[PAID] Bill: [Supplier]`.
  5. Add sync retry mechanism for network or token expiration failures.
- **Deliverables:**
  - One-click Google Calendar integration keeping obligations visible on the user's phone calendar.

---

## Phase 8: Frontend Dashboard, Payables Analytics & Multi-Format Export
**Objective:** Provide an executive control center for business cash flow and seamless accounting exports.

- **Tasks:**
  1. Build KPI metric cards:
     - Total Bills Uploaded, Total Outstanding Payable (₹), Paid Amount, Overdue Amount.
     - Bills Needing Review badge counter.
  2. Build interactive bills table:
     - Full-text search by supplier, invoice number, or GSTIN.
     - Filters by payment status (`PAID`, `UNPAID`, `OVERDUE`) and review status (`VERIFIED`, `REVIEW_REQUIRED`).
     - Quick "Mark as Paid" button with optimistic UI update.
  3. Build Multi-Format Export service:
     - `GET /api/v1/export/json` (Full canonical payload).
     - `GET /api/v1/export/csv` (Summary and line-item CSVs).
     - `GET /api/v1/export/excel` (Formatted multi-tab `.xlsx` workbook).
- **Deliverables:**
  - Production-ready, responsive, glassmorphic UI dashboard.
  - Accounting-ready export downloads.

---

## Phase 9: End-to-End System Integration & Edge-Case Hardening
**Objective:** Stress-test the full pipeline across challenging real-world invoices.

- **Tasks:**
  1. Create test suite of real-world sample bills:
     - Clean English GST Tax Invoice.
     - Hindi billing slip (*कच्चा बिल* / Vyapar invoice).
     - Blurry mobile camera photo (testing Laplacian blur detection).
     - Invoice with intentional math error (testing arithmetic validator).
     - Multi-item CSV/Excel expense log.
  2. Verify edge-case resilience:
     - Corrupt file upload returns user-friendly error.
     - Missing invoice date gracefully defaults to upload date + 10-day policy.
     - Expired Google Calendar token automatically refreshes.
  3. Validate performance benchmarks:
     - End-to-end processing under 5 seconds for typical invoices.
- **Deliverables:**
  - Zero-crash stability across all document permutations.

---

## Phase 10: Hackathon Demo Script & Winning Presentation
**Objective:** Rehearse and package a compelling, flawless 5-minute live demonstration.

- **Demo Walkthrough Flow:**
  1. **The Hook (1 min):** Explain the $100B MSME problem: scattered bills, missed vendor dates, Hindi slips, accounting errors.
  2. **Happy Path — Bilingual Ingestion (1.5 min):** Drag-and-drop a Hindi/English GST invoice. Show instant OCR, structured line items, and green validation badges.
  3. **The Intelligence — Review Queue (1 min):** Upload an out-of-focus or mathematically altered bill. Show the system catch the blur and the math mismatch, routing it to Review. Correct it live on split-screen.
  4. **The Lifecycle — 10+2 Day Policy & Google Calendar (1 min):** Show auto-scheduled reminder for 10 days out, open Google Calendar live to show the created event. Click "Mark as Paid", show calendar update and metrics recalculate.
  5. **Export & Wrap-up (0.5 min):** Download Excel sheet, summarize impact and future roadmap.
- **Deliverables:**
  - Pre-seeded realistic demo data.
  - Bulletproof live walkthrough script.

---

## Future Roadmap (Post-Hackathon)
- **Phase 11:** WhatsApp & Telegram Ingestion Bot (Direct forward from chat to FinSense).
- **Phase 12:** Direct Accounting Integration (Two-way sync with TallyPrime, Zoho Books, and QuickBooks).
- **Phase 13:** Bank Account Reconciliation (Account Aggregator framework / UPI auto-debit integration).
