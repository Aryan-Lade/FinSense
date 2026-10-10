# Software Requirements Specification (SRS)

## FinSense — AI-Powered Invoice Intelligence & Bill Management Platform
**Document Version:** 1.0.0  
**Standard:** IEEE Std 830-1998 Conforming  
**Date:** October 2026  
**Status:** Approved / Engineering Baseline  

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for **FinSense**, an AI-powered invoice intelligence and bill lifecycle management system. It details the functional, non-functional, external interface, and validation requirements for engineering, quality assurance, and demonstration.

### 1.2 Scope
FinSense is an intelligent financial document processing and tracking system designed for small businesses, shopkeepers, freelancers, and enterprise accountants. The system ingests invoices in multiple formats (PDF, JPG, PNG, CSV, XLSX), extracts bilingual textual and tabular data (English & Hindi) using optical character recognition and multimodal vision-language models, applies deterministic GST and mathematical validation, provides a human review queue for uncertain records, and automates payment follow-ups using a proactive 10-day + 2-day reminder schedule synchronized with Google Calendar.

### 1.3 Definitions, Acronyms, and Abbreviations
- **AI:** Artificial Intelligence
- **API:** Application Programming Interface
- **CGST:** Central Goods and Services Tax (India)
- **CSV:** Comma-Separated Values
- **GSTIN:** Goods and Services Tax Identification Number (15-character statutory identifier)
- **IGST:** Integrated Goods and Services Tax (India)
- **MIME:** Multipurpose Internet Mail Extensions
- **MSME:** Micro, Small, and Medium Enterprises
- **OCR:** Optical Character Recognition
- **PII:** Personally Identifiable Information
- **RLS:** Row Level Security (PostgreSQL)
- **SGST:** State Goods and Services Tax (India)
- **SRS:** Software Requirements Specification
- **UI / UX:** User Interface / User Experience
- **VLM:** Vision-Language Model

---

## 2. Overall Description

### 2.1 Product Perspective
FinSense operates as an autonomous web-based platform with a modern client application communicating via RESTful APIs with an asynchronous processing backend. It interfaces with external services including Supabase (relational data & encrypted object storage), Google Calendar API (event management), and high-performance OCR/AI inference runtimes.

```
+--------------------------------------------------------------------+
|                         FinSense System Context                    |
|                                                                    |
|  [User] ──(Web Browser)──> [React Frontend]                        |
|                                  │ (HTTPS)                         |
|                                  ▼                                 |
|                         [FastAPI Backend]                          |
|                          │       │       │                         |
|             ┌────────────┘       │       └────────────┐            |
|             ▼                    ▼                    ▼            |
|     [PaddleOCR & VLM]   [Supabase Cloud]    [Google Calendar]      |
|     (AI Extraction)     (DB & Storage)      (OAuth2 Events)        |
+--------------------------------------------------------------------+
```

### 2.2 Product Functions
1. **Multi-Format Ingestion:** Ingests PDF, JPEG, PNG, CSV, and XLSX documents.
2. **Quality Assessment:** Programmatically detects blurriness, extreme shadows, and illegibility.
3. **Bilingual Extraction:** Recognizes English and Hindi printed/handwritten invoice fields and tables.
4. **Deterministic Validation:** Enforces GSTIN format syntax, line-item arithmetic, and tax balances.
5. **Confidence Scoring:** Assigns confidence scores to every extracted field.
6. **Human Review Gate:** Diverts uncertain documents to a split-screen review interface.
7. **Reminder Engine:** Automatically schedules a payment reminder 10 days post-upload, repeating every 2 days if unpaid.
8. **Calendar Synchronization:** Pushes reminder events to Google Calendar and clears them upon payment.
9. **Payment State Management:** Allows manual "Mark as Paid" actions that cancel future notifications.
10. **Data Export:** Exports structured data into JSON, CSV, and Excel workbooks.

### 2.3 User Classes and Characteristics
- **Owner / Merchant (Primary):** Individual proprietor or business manager with minimal accounting training who needs hands-free tracking and calendar reminders.
- **Accountant / Bookkeeper (Secondary):** Detail-oriented financial professional requiring strict GST compliance, line-item precision, and Excel/CSV export for accounting software.

### 2.4 Operating Environment
- **Server:** Linux/Windows containerized environment running Python 3.10+, FastAPI, and CUDA (optional for GPU OCR acceleration).
- **Client:** Modern web browsers supporting ES6+ (Google Chrome 110+, Mozilla Firefox 110+, Safari 16+, Microsoft Edge).
- **Database & Storage:** Supabase PostgreSQL 15+ with pgvector support and S3-compatible cloud storage.

### 2.5 Design and Implementation Constraints
- File uploads must not exceed 25 megabytes.
- Supabase Service-Role credentials must never be transmitted to the frontend.
- Google Calendar integration must use minimal OAuth scopes (`calendar.events`).
- AI inference must enforce strict Pydantic JSON schema output without free-form conversational text.

---

## 3. External Interface Requirements

### 3.1 User Interfaces
- **Dashboard:** Displays financial summary KPIs (Total Payables, Unpaid, Overdue, Review Needed) and searchable bill lists.
- **Upload Zone:** Drag-and-drop file target supporting drag-hover states, progress bars, and format validation alerts.
- **Split-Screen Review Screen:** Left side renders document preview (zoom, pan, rotate); right side renders interactive form fields with color-coded confidence badges.

### 3.2 Hardware Interfaces
- No specialized hardware required. System utilizes standard client displays and server compute (CPU or GPU).

### 3.3 Software Interfaces
- **Supabase PostgreSQL & Storage:** REST/GraphQL and PostgREST protocol over HTTPS for document metadata and binary asset storage.
- **Google Calendar API v3:** HTTPS OAuth2 REST endpoint for creating (`events.insert`), updating (`events.patch`), and deleting (`events.delete`) calendar entries.
- **PaddleOCR & VLM Engine:** Python in-process binding or microservice REST API for document vision processing.

### 3.4 Communication Interfaces
- All client-to-server and server-to-external communication must occur over TLS 1.3 encrypted HTTPS.

---

## 4. System Features (Functional Requirements)

### 4.1 Multi-Format File Ingestion
- **FR-1.1:** The system shall accept files in `.pdf`, `.jpg`, `.jpeg`, `.png`, `.csv`, and `.xlsx` formats.
- **FR-1.2:** The system shall validate file magic bytes upon receipt and reject mismatched extensions.
- **FR-1.3:** The system shall reject files larger than 25 MB with an HTTP 413 payload.
- **FR-1.4:** The system shall compute the SHA-256 hash of each uploaded file to detect duplicate submissions.

### 4.2 Document Quality Assessment
- **FR-2.1:** The system shall compute the Laplacian variance on uploaded raster images.
- **FR-2.2:** If the variance is less than 100.0, the document quality shall be flagged as `POOR` (Blurry).
- **FR-2.3:** Blurry documents shall automatically be marked with `review_status = 'REVIEW_REQUIRED'`.

### 4.3 Bilingual OCR & AI Field Extraction
- **FR-3.1:** The system shall perform bilingual OCR supporting English and Devanagari (Hindi) scripts.
- **FR-3.2:** For digital/vector PDFs, the system shall extract embedded text layers using PyMuPDF before invoking OCR.
- **FR-3.3:** The system shall extract the following header fields: Invoice/Bill Number, Invoice Date, Due Date, Currency.
- **FR-3.4:** The system shall extract party information: Supplier Name, Supplier Address, Supplier GSTIN, Buyer Name, Buyer GSTIN.
- **FR-3.5:** The system shall extract line items: Description, HSN/SAC, Quantity, Unit Price, Discount, Tax Rate, Line Total.
- **FR-3.6:** The system shall extract tax summaries: Taxable Subtotal, CGST Amount, SGST Amount, IGST Amount, Total Tax, Round Off, Grand Total.
- **FR-3.7:** If a field is not present or illegible, the system shall assign `null` rather than generating simulated values.

### 4.4 Deterministic Financial & GST Validation
- **FR-4.1:** The system shall validate all extracted GSTIN strings against regex `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`.
- **FR-4.2:** The system shall verify for every line item that $|(\text{Quantity} \times \text{Unit Price} - \text{Discount}) - \text{Line Total}| \le 0.50$.
- **FR-4.3:** The system shall verify that $|\text{CGST} - \text{SGST}| \le 0.10$ whenever both are greater than zero.
- **FR-4.4:** The system shall verify that $|(\text{CGST} + \text{SGST} + \text{IGST}) - \text{Total Tax}| \le 0.50$.
- **FR-4.5:** The system shall verify that $|(\text{Taxable Subtotal} + \text{Total Tax} + \text{Round Off}) - \text{Grand Total}| \le 1.00$.
- **FR-4.6:** Any violation of FR-4.1 through FR-4.5 shall generate structured error messages and set `validation_status = 'FLAGGED'`.

### 4.5 Confidence Scoring & Review Queue Routing
- **FR-5.1:** The system shall assign a confidence score between 0.00 and 1.00 to every extracted field.
- **FR-5.2:** If any mandatory field (Invoice Number, Date, Total Amount) has confidence $< 0.75$, the bill shall be routed to `REVIEW_REQUIRED`.
- **FR-5.3:** If arithmetic errors are detected, the bill shall be routed to `REVIEW_REQUIRED`.

### 4.6 Human Review Interface
- **FR-6.1:** The system shall provide an endpoint `GET /api/v1/bills/review-queue` returning all bills with `review_status = 'REVIEW_REQUIRED'`.
- **FR-6.2:** The UI shall display the original document alongside an editable form populated with extracted values.
- **FR-6.3:** Fields with errors or low confidence shall be highlighted visually in red and amber.
- **FR-6.4:** When a user modifies an amount or line item, the client shall recalculate subtotals and totals in real time.
- **FR-6.5:** Submitting the review form shall trigger backend re-validation and set `review_status = 'VERIFIED'`.

### 4.7 Automated Payment Reminder Engine
- **FR-7.1:** Upon bill verification, the system shall schedule the first payment reminder:
  - If a valid `due_date` is extracted, schedule for `due_date at 09:00 AM`.
  - Otherwise, schedule for `upload_date + 10 calendar days at 09:00 AM`.
- **FR-7.2:** If a bill remains `UNPAID` when a reminder fires, the system shall automatically schedule a follow-up reminder for `previous_reminder + 2 calendar days at 09:00 AM`.
- **FR-7.3:** The system shall continue 2-day repeat scheduling until the bill is marked as `PAID`.

### 4.8 Google Calendar Integration
- **FR-8.1:** The system shall support Google OAuth2 consent and token exchange.
- **FR-8.2:** When a reminder is scheduled, the system shall create a Google Calendar event containing supplier, amount, invoice number, and link.
- **FR-8.3:** When a bill is marked as `PAID`, the system shall delete or update the corresponding Google Calendar event.

### 4.9 Payment State Lifecycle
- **FR-9.1:** Each bill shall have a `payment_status` initialized to `UNPAID`.
- **FR-9.2:** The system shall provide a `POST /api/v1/bills/{id}/mark-paid` action.
- **FR-9.3:** Marking a bill as paid shall set `payment_status = 'PAID'`, record `paid_at = NOW()`, cancel pending reminders, and update dashboard payables.

### 4.10 Multi-Format Data Export
- **FR-10.1:** The system shall support exporting bills to normalized JSON.
- **FR-10.2:** The system shall support exporting bills and line items to CSV format.
- **FR-10.3:** The system shall generate multi-tab Microsoft Excel (`.xlsx`) workbooks containing formatted summaries and line-item sheets.

---

## 5. Non-Functional Requirements

### 5.1 Performance & Latency
- **NFR-1.1:** Digital vector PDF extraction shall complete within 3.0 seconds.
- **NFR-1.2:** Scanned image OCR and AI extraction shall complete within 8.0 seconds on standard compute.
- **NFR-1.3:** Dashboard queries and search filters shall respond within 300 milliseconds for datasets up to 10,000 records.

### 5.2 Security & Privacy
- **NFR-2.1:** All data in transit must be encrypted with TLS 1.3.
- **NFR-2.2:** Supabase Service-Role keys must never be exposed to frontend code or client bundles.
- **NFR-2.3:** Invoices stored in Supabase Storage must be stored in private, unguessable paths and accessed only via signed URLs.
- **NFR-2.4:** Google OAuth refresh tokens must be encrypted at rest using AES-GCM-256.

### 5.3 Reliability & Availability
- **NFR-3.1:** Database transactions must be atomic; failure during extraction shall not corrupt original file storage records.
- **NFR-3.2:** The reminder scheduler must be idempotent to prevent duplicate notifications during process restarts.

### 5.4 Usability
- **NFR-4.1:** The user interface must be fully responsive across mobile, tablet, and desktop viewports.
- **NFR-4.2:** Field review forms must provide clear error tooltips explaining the exact validation rule that failed.

---

## 6. Verification & Traceability Matrix

| Requirement ID | Description | Verification Method | Pass Criteria |
| :--- | :--- | :--- | :--- |
| **FR-1.1 - 1.3** | Multi-format upload & size guard | Automated Integration Test | Successful parse of 6 formats; 413 on >25MB |
| **FR-2.1 - 2.3** | Blur detection via Laplacian | OpenCV Unit Test | Variance < 100 flags as POOR quality |
| **FR-3.1 - 3.7** | Bilingual OCR & AI extraction | Model Test Suite | Correct JSON fields from English & Hindi samples |
| **FR-4.1 - 4.6** | Deterministic GST & Math validation| Rule Engine Test Suite | 100% detection of invalid GSTIN and math mismatches |
| **FR-6.1 - 6.5** | Review queue & split screen | End-to-End Cypress / Playwright | Edit field updates totals; verification persists |
| **FR-7.1 - 7.3** | 10-day + 2-day reminder engine | Scheduler Mock Test | Reminder 1 @ Day 10, Reminder 2 @ Day 12 |
| **FR-8.1 - 8.3** | Google Calendar sync & cleanup | API Mock Test | Event created on schedule; deleted on mark-paid |
| **FR-9.1 - 9.3** | Mark as paid lifecycle | State Machine Test | Status changes to PAID; reminders cancelled |
| **FR-10.1 - 10.3**| Multi-format export (JSON/CSV/XLSX)| Export Unit Test | Generated files open cleanly in Excel/Tally |
