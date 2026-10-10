# FinSense — Hackathon Live Demonstration Guide

**Judges Presentation Script & Live Walkthrough Playbook**

---

## 1. Demo Narrative Arc (5 Minutes Total)

```
[00:00 - 01:00] The Hook: The $100B MSME Problem
[01:00 - 02:15] Demo 1: Multi-Format & Hindi GST Extraction
[02:15 - 03:15] Demo 2: The Review Gate (Blur & Math Validation)
[03:15 - 04:15] Demo 3: The 10+2 Reminder Policy & Google Calendar Sync
[04:15 - 05:00] Demo 4: Mark as Paid Lifecycle & Multi-Format Export
```

---

## 2. Step-by-Step Execution Playbook

### Step 1: The Hook (60 Seconds)
- **What to say:**
  > *"Every month, millions of small business owners and shopkeepers in India receive dozens of invoices across WhatsApp, emails, and physical paper. Some are in Hindi, some are blurry phone photos, and almost all of them get forgotten until a supplier cuts off credit or charges penalty fees. Existing tools either just scan images without understanding them, or hallucinate numbers without verifying GST mathematics. FinSense solves this with an end-to-end lifecycle: Upload once, understand bilingually, verify deterministically, and track through Google Calendar until paid."*

---

### Step 2: Live Ingestion & Bilingual AI Extraction (75 Seconds)
- **Action:**
  1. Open the FinSense Dashboard.
  2. Drag and drop a sample bilingual GST tax invoice (`sample_hindi_gst_invoice.pdf`).
  3. Show the real-time processing indicator.
- **What to highlight:**
  - Fast processing speed.
  - Automatic extraction of Devanagari Hindi text and English GSTIN.
  - Granular table line items extracted with HSN codes, unit prices, and quantities.
  - Green confidence badges ($>95\%$) across verified fields.

---

### Step 3: Deterministic Validation & Review Required Gate (60 Seconds)
- **Action:**
  1. Upload a blurry image or an invoice with an intentional math discrepancy (`blurry_vendor_slip.jpg`).
  2. Observe that the system **refuses to blindly accept the data as verified**.
  3. Show the red badge: **1 Bill in Review Required**.
  4. Click into the **Review Queue** to showcase the **Side-by-Side Split Screen**.
- **What to highlight:**
  - Left pane displays the zoomable document; right pane displays the editable form.
  - The exact validation error is surfaced: *"Line Item 1: Expected ₹1,200, got ₹1,500"*.
  - Show live recalculation: Change quantity from 1 to 2, watch totals update in real-time.
  - Click **"Verify & Accept"** to move the bill into verified records.

---

### Step 4: Proactive Reminders & Live Google Calendar Sync (60 Seconds)
- **Action:**
  1. Inspect the newly verified invoice details.
  2. Highlight the **Reminder Schedule**:
     - Upload Date: Oct 10.
     - Scheduled 1st Reminder: Oct 20 (exactly 10 days later).
     - Next recurring reminder: Oct 22 (2 days later).
  3. Switch browser tabs to **Google Calendar**.
  4. Show the newly created event: `Bill Due: Sharma Traders - ₹14,500` with the deep link back to FinSense.

---

### Step 5: Lifecycle Completion & Export (45 Seconds)
- **Action:**
  1. Return to the dashboard and click **"Mark as Paid"** on the invoice.
  2. Observe immediate status change to `PAID` and outstanding payables decrementing.
  3. Refresh Google Calendar: Show that the event has been updated or removed.
  4. Click **"Export to Excel"** and **"Export to JSON"**: Open the formatted `.xlsx` workbook showing both Summary and Line-Item sheets.
- **Closing punchline:**
  > *"FinSense doesn't stop at reading an invoice—it manages the invoice until the cash leaves the bank."*

---

## 3. Judge Q&A Anticipation & Answers

| Judge Question | Senior AI Engineer Answer |
| :--- | :--- |
| **"Why not just use ChatGPT or Claude directly?"** | LLMs are probabilistic text predictors—they hallucinate numbers and fail arithmetic checks. FinSense uses a hybrid architecture: AI is used strictly for perception and visual layout understanding; all calculations, GST checksums, and reminders are enforced by deterministic Python code. |
| **"How do you handle handwritten or Hindi bills?"** | We use PaddleOCR trained with Devanagari weights combined with a multimodal Vision-Language Model that analyzes the visual geometry of the document rather than flattening it to 1D text. |
| **"What happens if OCR fails completely?"** | Our computer vision pipeline detects low Laplacian variance ($<100$) and routes the document straight into the human-in-the-loop Review Queue with original images preserved in encrypted storage. No data is lost. |
| **"How does the reminder system scale?"** | Reminders run as an idempotent background job using PostgreSQL indexing on `(status, scheduled_at)`, capable of processing thousands of invoices with zero duplicate notifications. |
