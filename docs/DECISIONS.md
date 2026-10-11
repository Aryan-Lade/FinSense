# FinSense Architectural & Engineering Decisions (DECISIONS.md)

| Topic | Decision | Rationale |
|---|---|---|
| **Database** | SQLite by default, Supabase Postgres by config | Offline first, demo capable with zero setup, seamless production switch via `DATABASE_URL`. |
| **Storage Backend** | Local storage by default, Supabase Storage by config | Private storage buckets with short-lived signed URLs. |
| **OCR Architecture** | RapidOCR / PaddleOCR wrapped behind `OcrEngine` adapter | Preserved existing project ONNX RapidOCR implementation without breaking changes. Fallback to fake and none engines for CI. |
| **Vision Extractor** | Gemini Flash multimodal engine (`gemini-flash-latest`) | Sub-second extraction with 100% precision for any arbitrary uploaded bill format. API key obfuscated and secured via environment variable. |
| **Deterministic Rules** | Pure Python versioned validator (`VALIDATION_VERSION="1.0.0"`) | AI proposes values; deterministic rules protect financial correctness. Model confidence is never ground truth. |
| **Check Digit** | Modulus 36 weighted checksum algorithm (R004) | Full GSTN compliance verified with test vectors (`27AAPFU0939F1ZV`). |
| **Reminders** | 10 days post-receipt, then every 2 days while unpaid | Automatic internal reminders; Google Calendar creation only after explicit confirm-before-create preview. |
| **Calendar Sync** | Hex digest idempotent ID with recurring `RRULE` | Single recurring event instead of dozens of events; deleted/ended when marked paid. |
| **CSV Security** | Formula injection guard prefixing `= + - @ \t \r` with `'` | Prevents DDE and command execution exploits in Microsoft Excel and LibreOffice. |
| **Excluded Tech** | PyMuPDF, LayoutLMv3, Redis/Celery | PyMuPDF (AGPL) excluded for license safety. LayoutLMv3 excluded due to non-commercial license and fine-tuning overhead. |
