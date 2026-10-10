-- ============================================================================
-- FinSense — Complete Production Supabase Database Schema
-- Run this entire script in the Supabase Dashboard: SQL Editor -> New Query -> Run
-- ============================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. USERS TABLE (Supports Supabase Auth & Local JWT)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    hashed_password VARCHAR(255),
    supabase_user_id VARCHAR(100) UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_supabase_user_id ON public.users(supabase_user_id);

-- ============================================================================
-- 3. DOCUMENTS TABLE (Ingestion, Multi-Format Files & Omnichannel)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.documents (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    original_filename VARCHAR(500) NOT NULL,
    stored_path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    sha256 VARCHAR(64) UNIQUE NOT NULL,
    pipeline VARCHAR(50),
    processing_status VARCHAR(20) NOT NULL DEFAULT 'completed',
    error_message TEXT,
    batch_id VARCHAR(36),
    source_channel VARCHAR(20) DEFAULT 'website',
    source_message_id VARCHAR(100),
    source_sender_masked VARCHAR(100),
    source_received_at TIMESTAMPTZ,
    source_attachment_name VARCHAR(255),
    source_attachment_hash VARCHAR(64),
    ingestion_status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_sha256 ON public.documents(sha256);
CREATE INDEX IF NOT EXISTS idx_documents_processing_status ON public.documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_documents_source_channel ON public.documents(source_channel);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

-- ============================================================================
-- 4. SUPPLIERS TABLE (GSTIN Profiles & Vendor Analytics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.suppliers (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    gstin VARCHAR(15) UNIQUE,
    legal_name VARCHAR(255),
    trade_name VARCHAR(255),
    state VARCHAR(50),
    address TEXT,
    first_invoice_date TIMESTAMPTZ,
    latest_invoice_date TIMESTAMPTZ,
    invoice_count INT DEFAULT 0,
    total_purchase_value DOUBLE PRECISION DEFAULT 0.0,
    average_purchase_value DOUBLE PRECISION DEFAULT 0.0,
    identity_history JSONB DEFAULT '{}'::jsonb,
    validation_failure_count INT DEFAULT 0,
    common_tax_rates JSONB DEFAULT '[]'::jsonb,
    common_hsn_codes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_gstin ON public.suppliers(gstin);
CREATE INDEX IF NOT EXISTS idx_suppliers_legal_name ON public.suppliers(legal_name);
CREATE INDEX IF NOT EXISTS idx_suppliers_first_invoice_date ON public.suppliers(first_invoice_date);
CREATE INDEX IF NOT EXISTS idx_suppliers_latest_invoice_date ON public.suppliers(latest_invoice_date);

-- ============================================================================
-- 5. INVOICES TABLE (Financial Records, GST Balances & Canonical Storage)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    document_id VARCHAR(36) NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    group_index INT DEFAULT 0,
    document_category VARCHAR(30) DEFAULT 'gst_invoice',
    bill_number VARCHAR(100),
    supplier_id VARCHAR(36) REFERENCES public.suppliers(id) ON DELETE SET NULL,
    supplier_name VARCHAR(255),
    buyer_name VARCHAR(255),
    invoice_date TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    currency VARCHAR(10) DEFAULT 'INR',
    subtotal DOUBLE PRECISION DEFAULT 0.0,
    tax_amount DOUBLE PRECISION DEFAULT 0.0,
    total_amount DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    processing_status VARCHAR(20) NOT NULL DEFAULT 'completed',
    validation_status VARCHAR(20) NOT NULL DEFAULT 'valid',
    review_status VARCHAR(30) NOT NULL DEFAULT 'approved',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid',
    paid_at TIMESTAMPTZ,
    payment_note TEXT,
    review_reasons JSONB DEFAULT '[]'::jsonb,
    priority_score INT DEFAULT 0,
    assignee VARCHAR(100),
    canonical_json JSONB DEFAULT '{}'::jsonb,
    provenance_json JSONB DEFAULT '{}'::jsonb,
    validation_json JSONB DEFAULT '{}'::jsonb,
    suggestions_json JSONB DEFAULT '[]'::jsonb,
    processing_info_json JSONB DEFAULT '{}'::jsonb,
    approved_with_override BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_invoice_document_group UNIQUE (document_id, group_index)
);

CREATE INDEX IF NOT EXISTS idx_invoices_document_id ON public.invoices(document_id);
CREATE INDEX IF NOT EXISTS idx_invoices_bill_number ON public.invoices(bill_number);
CREATE INDEX IF NOT EXISTS idx_invoices_supplier_name ON public.invoices(supplier_name);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON public.invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_total_amount ON public.invoices(total_amount);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON public.invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_review_status ON public.invoices(review_status);
CREATE INDEX IF NOT EXISTS idx_invoices_validation_status ON public.invoices(validation_status);
CREATE INDEX IF NOT EXISTS idx_invoices_priority_score ON public.invoices(priority_score);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at DESC);

-- ============================================================================
-- 6. INVOICE ITEMS TABLE (Line Items, HSN/SAC, Quantities & Rates)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    invoice_id VARCHAR(36) NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    line_no INT NOT NULL DEFAULT 1,
    description VARCHAR(500),
    hsn_code VARCHAR(30),
    quantity DOUBLE PRECISION DEFAULT 1.0,
    unit VARCHAR(50),
    unit_price DOUBLE PRECISION DEFAULT 0.0,
    tax_rate DOUBLE PRECISION DEFAULT 0.0,
    tax_amount DOUBLE PRECISION DEFAULT 0.0,
    line_total DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_line_no ON public.invoice_items(line_no);

-- ============================================================================
-- 7. REMINDERS TABLE (Automated 10-Day & Due-Date Rules)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reminders (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    invoice_id VARCHAR(36) NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    rule_type VARCHAR(30) NOT NULL DEFAULT 'after_receipt',
    interval_days INT DEFAULT 10,
    repeat_every_days INT DEFAULT 2,
    first_fire_at TIMESTAMPTZ NOT NULL,
    next_fire_at TIMESTAMPTZ,
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    calendar_sync_status VARCHAR(30) DEFAULT 'not_connected',
    notification_channels JSONB DEFAULT '["email", "popup"]'::jsonb,
    google_calendar_id VARCHAR(100),
    google_event_id VARCHAR(100),
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    last_sync_at TIMESTAMPTZ,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminders_invoice_id ON public.reminders(invoice_id);
CREATE INDEX IF NOT EXISTS idx_reminders_next_fire_at ON public.reminders(next_fire_at);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON public.reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_calendar_sync_status ON public.reminders(calendar_sync_status);
CREATE INDEX IF NOT EXISTS idx_reminders_idempotency_key ON public.reminders(idempotency_key);

-- ============================================================================
-- 8. REMINDER EVENTS TABLE (Execution & Audit History)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reminder_events (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    reminder_id VARCHAR(36) NOT NULL REFERENCES public.reminders(id) ON DELETE CASCADE,
    fire_at TIMESTAMPTZ NOT NULL,
    delivered_at TIMESTAMPTZ,
    channel VARCHAR(30) NOT NULL DEFAULT 'email',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_reminder_event_fire_at UNIQUE (reminder_id, fire_at)
);

CREATE INDEX IF NOT EXISTS idx_reminder_events_reminder_id ON public.reminder_events(reminder_id);
CREATE INDEX IF NOT EXISTS idx_reminder_events_fire_at ON public.reminder_events(fire_at);

-- ============================================================================
-- 9. REVIEW NOTES TABLE (Human Reviewer Comments & Flags)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.review_notes (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    invoice_id VARCHAR(36) NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    author VARCHAR(100),
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_notes_invoice_id ON public.review_notes(invoice_id);

-- ============================================================================
-- 10. AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    invoice_id VARCHAR(36) REFERENCES public.invoices(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    changed_by VARCHAR(100) DEFAULT 'system_owner',
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_invoice_id ON public.audit_logs(invoice_id);

-- ============================================================================
-- 11. COMPATIBILITY VIEWS (Exposes `bills` alias)
-- ============================================================================
CREATE OR REPLACE VIEW public.bills AS
SELECT 
    id,
    bill_number,
    supplier_name,
    buyer_name,
    invoice_date,
    due_date,
    upload_date,
    currency,
    subtotal AS taxable_subtotal,
    tax_amount AS total_tax,
    total_amount,
    payment_status,
    review_status,
    validation_status,
    paid_at,
    created_at,
    updated_at
FROM public.invoices;

-- ============================================================================
-- 12. ROW LEVEL SECURITY (RLS) & PUBLIC PERMISSIONS
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and anon access with valid API key
CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update users" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Allow public all documents" ON public.documents FOR ALL USING (true);
CREATE POLICY "Allow public all suppliers" ON public.suppliers FOR ALL USING (true);
CREATE POLICY "Allow public all invoices" ON public.invoices FOR ALL USING (true);
CREATE POLICY "Allow public all invoice_items" ON public.invoice_items FOR ALL USING (true);
CREATE POLICY "Allow public all reminders" ON public.reminders FOR ALL USING (true);
CREATE POLICY "Allow public all review_notes" ON public.review_notes FOR ALL USING (true);
CREATE POLICY "Allow public all audit_logs" ON public.audit_logs FOR ALL USING (true);

-- Grant privileges to anon and authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- ============================================================================
-- 13. STORAGE BUCKET FOR INVOICES (Supabase Storage)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public Invoice Objects Read"
ON storage.objects FOR SELECT
USING (bucket_id = 'invoices');

CREATE POLICY "Public Invoice Objects Insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'invoices');

CREATE POLICY "Public Invoice Objects Update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'invoices');

-- ============================================================================
-- 14. AUTH USER SYNCHRONIZATION TRIGGER (Optional automatic sync from Supabase Auth)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_supabase_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, supabase_user_id, role, is_active)
    VALUES (
        NEW.id::text,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.id::text,
        'user',
        TRUE
    )
    ON CONFLICT (email) DO UPDATE
    SET supabase_user_id = EXCLUDED.supabase_user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_supabase_user();
