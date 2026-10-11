# FinSense Existing UI & Architecture Audit (EXISTING_UI_AUDIT.md)

## 1. Frontend Audit
- **Framework:** React 19 + Vite 8.3.4
- **Styling:** Tailwind CSS v4 with custom tokens:
  - Surface: `#F2F2F2` (Warm Gray), White cards (`reelo-card`)
  - Primary Accent: `#000000` (`reelo-btn-black`), `#0099FF` (`reelo-btn-blue`)
  - Semantic Status:
    - Paid / Verified: `#4EA100` (`#DCFFDB`)
    - Warning / Needs Review: `#D97706` (Amber-600)
    - Error / Unpaid / Overdue: `#FF4F4F` (Red-50)
  - Typography: System sans-serif, Mono for numbers/GSTINs, clean tracking.
- **Icon Set:** Lucide React
- **Authentication:** Supabase Auth (Email/Password, Magic Link, Profile Pill)

## 2. Page Map & Route Inventory
| Route | Page | Purpose | Status |
|---|---|---|---|
| `/` | `Home.jsx` | Landing & Value Proposition | EXISTS-reuse-as-is |
| `/login` | `Login.jsx` | Authentication Gateway | EXISTS-reuse-as-is |
| `/reset-password` | `ResetPassword.jsx` | Password Recovery | EXISTS-reuse-as-is |
| `/bills` | `BillsList.jsx` | Ledger of Invoices & Status | EXISTS-reuse-as-is |
| `/bills/:id` | `BillDetail.jsx` | Split Document Inspector & Provenance | EXISTS-reuse-as-is |
| `/upload` | `Upload.jsx` | Drag-and-drop ingestion | EXISTS-reuse-as-is |
| `/review` | `ReviewQueue.jsx` | Prioritized human review queue | EXISTS-reuse-as-is |
| `/suppliers` | `Suppliers.jsx` | Supplier profiles & history | EXISTS-reuse-as-is |
| `/analytics` | `Analytics.jsx` | Tax & cash flow metrics | EXISTS-reuse-as-is |
| `/reminders` | `Reminders.jsx` | Statutory calendar watchdog | EXISTS-reuse-as-is |
| `/batches` | `Batches.jsx` | Safe ZIP multi-bill batches | NEW-page |
| `/inbox` | `Inbox.jsx` | Omnichannel WhatsApp/Email intake | NEW-page |
| `/settings/integrations` | `Integrations.jsx` | Calendar & webhook settings | NEW-page |

## 3. Existing OCR Implementation Audit
- **Location:** `backend/app/processors/ocr_processor.py`
- **Engine Type:** `rapidocr_onnxruntime` (PaddleOCR ONNX runtime model engine)
- **API Generation:** RapidOCR callable / `.ocr(img)`
- **Adapter Layer:** Wrapped cleanly by `backend/app/processors/ocr/paddle_adapter.py` adhering to `OcrEngine` protocol.
- **Fallbacks:** `FakeAdapter` (tests/offline), `TesseractAdapter` (system binary fallback), `NullAdapter` (no-op).
- **Latency:** ~250-450ms on CPU.
