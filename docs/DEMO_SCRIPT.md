# FinSense Live Demo Script (DEMO_SCRIPT.md)

## Opening Pitch (30 Seconds)
> "Businesses do not receive clean database rows. They receive blurry photos, handwritten bills, PDFs, spreadsheets, WhatsApp messages, and email attachments. FinSense turns messy invoices and bills into validated, audit-friendly financial records, tells the owner exactly what needs human review, tracks payment status, and reminds them about unpaid bills until they are marked paid."

---

## Live Walkthrough Steps

### Step 1: Ingestion & Autonomous OCR Extraction
1. Navigate to **Upload Bill** (`/upload`).
2. Drag and drop any invoice (e.g. `Surabhi Hardwares` or `Darshan Engineering` or `Gujarat Freight Tools`).
3. Point out:
   - Instant file type detection & route assignment.
   - High-precision extraction showing **Exact Bill Number**, **Supplier Name**, **Line Items Table**, and **Amounts** down to the paisa.
   - Clean badge: **PaddleOCR Conf: 96%** / **98%**.

### Step 2: Deterministic Validation Report
1. Open the uploaded bill in **Bill Detail** (`/bills/:id`).
2. Point out the **Deterministic Validation Report**:
   - `✓ 15-Digit Seller GSTIN (29AACCT3705E000 - Karnataka) Verified`
   - `✓ Buyer GSTIN Validated`
   - `✓ Intrastate Tax (9% CGST + 9% SGST) Reconciled`
   - `✓ Grand Total Chargeable Matches Subtotal + Tax`
   - `✓ Amount in Words Verified`
3. Point out that rules are pure Python mathematical checks — AI never certifies its own correctness.

### Step 3: Human-in-the-Loop Review Queue
1. Open **Review Queue** (`/review`).
2. Show deterministic priority sorting:
   - Critical tax mismatch (+100 points) appears first.
   - Duplicate suspects (+80 points) flagged immediately.
   - Clear rationale badge: *"Why is this first?"*

### Step 4: Omnichannel Intake
1. Open **Omnichannel Inbox** (`/inbox`).
2. Point out real-time inbound streams: WhatsApp Business Cloud API & Inbound Email.
3. Click **"Simulate WhatsApp Inbound Bill"**:
   - Demonstrates instant ingestion of a bill received over WhatsApp with sender PII masked (`+91 98*** **789`).

### Step 5: Calendar Sync & Payment Tracking
1. Open **Upcoming Reminders** (`/reminders`).
2. Show the statutory cadence: First reminder in 10 days, repeating every 2 days while unpaid.
3. Show Google Calendar synchronization with dedicated "FinSense Reminders" calendar.
4. Click **Mark as Paid**:
   - Reminders stop immediately.
   - Calendar recurring event deleted/completed.
   - Bill moves to paid history.

### Step 6: Accounting-Ready Exports
1. Export the ledger via **CSV / Excel**:
   - Show the 4 export profiles: `finsense`, `flat_csv`, `accounting_generic`, and `gstn_aligned`.
   - Point out CSV-injection security guard prefixing special characters with `'`.

---

## Closing Statement
> "FinSense meets businesses where invoices already arrive. AI understands the invoice; deterministic rules protect the numbers; and it keeps tracking until the bill is paid."
