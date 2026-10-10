# FinSense — Security & Data Protection Architecture

**Enterprise-Grade Security, Compliance, and Threat Mitigation Blueprint**

---

## 1. Security Philosophy & Threat Model

Financial documents contain sensitive personal and business information (Personally Identifiable Information - PII, corporate tax identification numbers, bank account numbers, trade volumes, customer lists, and pricing terms). Inadvertent disclosure or tampering poses severe business and legal risks.

FinSense follows the **Principle of Least Privilege (PoLP)** and **Zero Trust Architecture**.

### 1.1 Threat Model (STRIDE Analysis)

| Threat Category | Potential Attack Vector | FinSense Mitigation |
| :--- | :--- | :--- |
| **Spoofing** | Forged user identity accessing financial bills | Strong API key / OAuth2 token verification; isolated sessions |
| **Tampering** | Man-in-the-middle altering extracted tax amounts or storage links | TLS 1.3 strictly enforced; deterministic cryptographic checksums (SHA-256) on raw files; immutable audit trails |
| **Repudiation** | User denies marking a bill as paid or editing extracted amounts | Audit log recording timestamp, previous value, new value, and origin IP |
| **Information Disclosure** | Public exposure of Supabase Storage URLs leaking supplier bills | Private storage buckets; time-bound pre-signed URLs (15-min expiry); strict RLS |
| **Denial of Service** | Uploading 2GB files, ZIP bombs, or recursive PDF payloads | Strict file size ceiling (25MB); magic-byte header validation; stream buffer limits |
| **Elevation of Privilege** | Frontend abusing Supabase Service-Role key to bypass backend validation | Service-role key isolated exclusively to server-side memory; frontend only communicates via backend gateway |

---

## 2. Infrastructure & Data Protection

### 2.1 Encryption at Rest and in Transit
- **In Transit:** All communications between client, FastAPI backend, Supabase, Google Calendar, and AI inference engines are enforced via **TLS 1.3** with modern cipher suites. Plain HTTP is rejected.
- **At Rest:** 
  - Supabase PostgreSQL data is encrypted using **AES-256** storage encryption.
  - Supabase Storage objects (PDFs, JPGs, scans) are encrypted using server-side **AES-256**.
  - Sensitive secrets (Google OAuth refresh tokens, external API keys) stored in the database are encrypted at the application layer using **AES-GCM-256 / Fernet**.

### 2.2 Storage Bucket Privacy & Access Control
- Invoices are stored in a dedicated Supabase bucket named `invoices`.
- **Public access is disabled.**
- Document viewing in the frontend is mediated either via:
  1. A backend proxy endpoint (`/api/v1/bills/{id}/document`) which streams the bytes after verifying user entitlement, OR
  2. Time-limited pre-signed URLs generated server-side with a strict **TTL of 900 seconds (15 minutes)**.

```sql
-- Supabase Storage Security Policy
CREATE POLICY "Deny Public Access to Invoices"
ON storage.objects FOR SELECT
USING (bucket_id = 'invoices' AND auth.role() = 'service_role');
```

---

## 3. Supabase Database Security & RLS

### 3.1 Service-Role Key Separation
- **Critical Rule:** The `SUPABASE_SERVICE_ROLE_KEY` bypasses all Row Level Security (RLS) policies. It must **NEVER** be packaged into frontend JavaScript bundles, exposed in `.env` files committed to Git, or returned in API responses.
- The React frontend connects **only** to the FastAPI backend API endpoints. It never initiates direct database operations.

### 3.2 Row Level Security (RLS) Baseline
Even in a single-owner hackathon architecture, RLS is enabled by default to prevent accidental data leaks during future multi-tenant expansion:

```sql
-- Enable RLS on all tables
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Backend Service Role Full Access
CREATE POLICY "Service Role Full Access" ON public.bills
FOR ALL TO service_role USING (true) WITH CHECK (true);
```

---

## 4. File Upload & Ingestion Security

File uploads represent one of the most critical attack surfaces for server-side vulnerabilities (Remote Code Execution, Path Traversal, Cross-Site Scripting).

### 4.1 Ingestion Hardening Checklist

```
[Incoming File Stream]
       │
       ▼
1. Size Check ─────────────> Fail if Content-Length > 25MB
       │
       ▼
2. Magic Header Byte Check ─> Validate real MIME via python-magic (not .extension)
       │
       ▼
3. Content Inspection ─────>
       ├── PDF: Reject executable JavaScript objects (/JavaScript, /Launch)
       ├── Images: Reject embedded EXIF script tags or SVG (prevent Stored XSS)
       └── Excel/CSV: Neutralize CSV Formula Injection (=, +, -, @ prefixes)
       │
       ▼
4. Filename Sanitization ──> Discard client filename; assign random UUID v4:
                            `{uuid4()}.{sanitized_ext}`
       │
       ▼
5. Safe Persistence ───────> Stream directly to cloud storage (isolated from local OS path)
```

### 4.2 Formula Injection Neutralization (CSV/Excel)
When generating or parsing CSV/Excel files, any text cell starting with `=`, `+`, `-`, or `@` can trigger malicious formula execution when opened in Microsoft Excel. FinSense sanitizes all exported fields by prefixing a single apostrophe (`'`) to any formulaic token.

---

## 5. Google Calendar OAuth 2.0 Security

FinSense integrates with Google Calendar while adhering to strict privacy controls:

### 5.1 Minimal Scope Enforcement
We request only the minimum required scope:
- `https://www.googleapis.com/auth/calendar.events` (Manage calendar events created by the application).
- We **do not** request full calendar access (`calendar` scope) or user drive/email access.

### 5.2 Token Storage & Rotation
- The OAuth `code` exchange is performed strictly on the backend.
- The `access_token` resides in ephemeral Redis/in-memory cache with an expiry of 3600 seconds.
- The `refresh_token` is encrypted using application-level `Fernet` (AES-128-CBC + HMAC-SHA256) before insertion into the database:
  ```python
  from cryptography.fernet import Fernet
  
  cipher_suite = Fernet(settings.ENCRYPTION_KEY.encode())
  encrypted_token = cipher_suite.encrypt(raw_refresh_token.encode()).decode()
  ```

---

## 6. Zero-Leak Logging & PII Redaction

### 6.1 Safe Logging Practice
Server logs must never record:
- Full supplier bank account numbers or IFSC codes.
- Complete 15-character GSTINs in plaintext unmasked formats in public logs.
- Raw file binary payloads or base64 streams.
- Cloud storage bearer tokens or Google refresh tokens.

### 6.2 Redaction Filter
Our custom Python logging filter sanitizes outputs before emission:
```python
import re
import logging

class PIIRedactionFilter(logging.Filter):
    GST_PATTERN = re.compile(r'\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b')
    
    def filter(self, record):
        if isinstance(record.msg, str):
            record.msg = self.GST_PATTERN.sub(lambda m: m.group()[:4] + "*******" + m.group()[-2:], record.msg)
        return True
```

---

## 7. Audit Logging & Non-Repudiation

To guarantee financial data integrity, all state mutations (especially status transitions such as `UNPAID` $\to$ `PAID` or manual review corrections) write an immutable record to the `audit_logs` table:

```sql
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID REFERENCES public.bills(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- e.g., 'MARK_PAID', 'MANUAL_EDIT', 'REVIEW_APPROVED'
    changed_by VARCHAR(100) DEFAULT 'system_owner',
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. Summary of Security Controls

| Domain | Control Implemented | Status |
| :--- | :--- | :--- |
| **Authentication** | Google OAuth2 Minimal Scope (`calendar.events`) | Enforced |
| **Data in Transit** | TLS 1.3 HTTPS & WSS only | Enforced |
| **Data at Rest** | PostgreSQL AES-256 + Fernet Token Encryption | Enforced |
| **File Safety** | Magic byte inspection + UUID naming + Size ceiling | Enforced |
| **Review Gate** | Strict access control; state-machine validation before accept | Enforced |
| **Auditability** | Immutable event ledger on all payment & review edits | Enforced |
