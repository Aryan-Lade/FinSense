# FinSense Integrations Architecture (integrations.md)

## 1. Supabase Cloud Database & Storage
- **Database:** Connect via standard PostgreSQL connection string in `DATABASE_URL`.
- **Row Level Security (RLS):** Enabled on all tables (`invoices`, `documents`, `reminders`, `suppliers`, `batches`, `audit_log`).
- **Storage:** Private bucket `invoices` accessed through backend service role key or 60-second signed URLs.
- **Client Auth:** Frontend uses `@supabase/supabase-js` for user authentication, passing `Authorization: Bearer <token>` to FastAPI.

## 2. Google Calendar Synchronization
- **Provider Interface:** `CalendarProvider` with live `GoogleCalendarProvider` and `CalendarSimulator`.
- **Confirm-Before-Create:** Internal reminders are created automatically; Google Calendar events are synchronized only upon explicit user confirmation from the UI preview modal.
- **Recurring Schedule:** Uses `RRULE:FREQ=DAILY;INTERVAL=2` for repeat statutory reminders until marked paid.
- **Idempotency:** Hex digest event ID `sha256(invoice_id|rule|first_fire_at).hexdigest()[:32]` ensures retry safety.
- **Mark as Paid:** Automatically deletes or ends the recurring calendar event.

## 3. WhatsApp Business Cloud API
- **Endpoint:** `/api/channels/whatsapp/webhook`
- **Verification:**
  - GET: Handles `hub.mode` and `hub.verify_token` challenge.
  - POST: Validates `X-Hub-Signature-256` HMAC-SHA256 signature against `WHATSAPP_APP_SECRET`.
- **Privacy:** Phone numbers are masked (`+91 98*** **412`) before display.

## 4. Inbound Email Processing
- Supported via SendGrid/Mailgun webhook or IMAP listener.
- Attachments are sanitized and scanned before ingestion into the document router.
