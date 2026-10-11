# FinSense Requirement Traceability Matrix (REQUIREMENT_TRACEABILITY.md)

| Requirement Description | Master Spec Section | Implemented Component | Verification / Test |
|---|---|---|---|
| **Interface Preservation Contract** | Section 1 | `frontend/src/` (No restyling, exact tokens) | `npm run build` clean, UI visual match |
| **PaddleOCR Reuse Behind Adapter** | Section 1.13, 10.0 | `backend/app/processors/ocr/paddle_adapter.py` | `tests/test_ocr_extractor.py`, `rapidocr` wrapped |
| **Deterministic Validation Core (R001-R052)** | Section 9 | `backend/app/validators/` | `tests/test_validators.py`, `test_gstin_validator.py` |
| **Modulus 36 Check Digit (R004)** | Section 9 | `backend/app/validators/gstin.py` | Tested on vector `27AAPFU0939F1ZV` |
| **Amount in Words Cross-Check (R028)** | Section 9, 26 | `backend/app/validators/arithmetic.py` | Unit tested in arithmetic validation |
| **Vision Extractor with Gemini Multimodal** | Section 10.4 | `backend/app/ai/vlm.py`, `frontend/src/ocrExtractor.js` | Live extraction tested on complex invoices |
| **Statutory Reminders (10d + 2d repeat)** | Section 13 | `backend/app/reminders/rules.py` | UTC / DST-safe zoneinfo tests |
| **Idempotent Scheduler & Event Records** | Section 13, 26 | `backend/app/reminders/scheduler.py` | `reminder_number`, `sent_at`, `missed_count` |
| **Google Calendar Sync & Preview** | Section 14 | `backend/app/adapters/calendar_google.py` | Hex digest ID, `RRULE:FREQ=DAILY;INTERVAL=2` |
| **Mark as Paid Cancellation** | Section 13 | `frontend/src/pages/BillDetail.jsx`, `api.js` | Stops reminders, cancels calendar event |
| **Safe ZIP Archive Batch Ingestion** | Section 15 | `backend/app/processors/zip_safe.py` | Zip-slip and decompression-bomb guards |
| **Omnichannel Intake (WhatsApp, Email)** | Section 16 | `backend/app/channels/`, `frontend/src/pages/Inbox.jsx` | HMAC-SHA256 verification, PII masking |
| **Export Profiles & CSV Injection Guard** | Section 19, 26 | `backend/app/exporters/csv_exporter.py` | Prefix `= + - @` with `'`, UTF-8 BOM |
| **Supabase Authentication & Storage** | Section 8, 21 | `frontend/src/context/AuthContext.jsx`, `storage_supabase.py` | Live login/signup/magic link, RLS |
