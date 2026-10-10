import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Sparkles,
  ChevronRight,
  Layers,
  Calendar,
  Eye,
  Check,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { getInvoices, seedDemo, markPaid, markUnpaid } from '../api';

export default function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadData = () => {
    setLoading(true);
    getInvoices()
      .then((res) => {
        setInvoices(Array.isArray(res.data) ? res.data : (res.data?.items || []));
      })
      .catch((err) => {
        console.error('Failed to load invoices:', err);
        setInvoices([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalBills = invoices.length;
  const unpaidBills = invoices.filter((i) => i.payment_status === 'unpaid');
  const paidBills = invoices.filter((i) => i.payment_status === 'paid');
  const reviewBills = invoices.filter((i) => i.review_status === 'needs_review' || i.validation_status === 'invalid');

  const outstandingAmount = unpaidBills.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
  const paidAmount = paidBills.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
  const totalTax = invoices.reduce((acc, curr) => acc + (curr.tax_amount || 0), 0);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleTogglePayment = async (inv) => {
    try {
      if (inv.payment_status === 'paid') {
        await markUnpaid(inv.id);
      } else {
        await markPaid(inv.id);
      }
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === 'unpaid') return inv.payment_status === 'unpaid';
    if (filter === 'paid') return inv.payment_status === 'paid';
    if (filter === 'review') return inv.review_status === 'needs_review';
    return true;
  });

  return (
    <div className="space-y-16 pb-24">
      {/* ── 1. HERO SECTION (Clone of Demo Website Hero) ── */}
      <section className="pt-12 sm:pt-20 text-center px-4 max-w-5xl mx-auto space-y-6">
        {/* Animated Pill Tag */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white border border-[#d9d9d9] shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold uppercase tracking-wider text-black">
            AI-Powered GST Invoice Intelligence
          </span>
        </div>

        {/* Big H1 Typography matching Clash Grotesk */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-heading text-black tracking-tight leading-[1.08] max-w-4xl mx-auto">
          Invoice Intelligence That Works Every Single Time
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          FinSense turns messy invoices, handwritten bills, Hindi receipts, and spreadsheets into
          audit-ready financial records with 100% deterministic Indian GST verification.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/upload"
            className="demo-btn-black px-7 py-3.5 text-sm font-semibold flex items-center space-x-2 shadow-md"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Invoice</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/bills"
            className="demo-btn-white px-7 py-3.5 text-sm font-semibold flex items-center space-x-2"
          >
            <FileText className="w-4 h-4 text-neutral-500" />
            <span>Browse Bills ({totalBills})</span>
          </Link>
        </div>

        {/* Centerpiece Device Mockup with Notch (Bill Scanner Live Preview) */}
        <div className="pt-10 max-w-xl mx-auto">
          <div className="bg-[#1c1c1c] rounded-[48px] p-4 text-white shadow-2xl border border-neutral-800 relative overflow-hidden">
            {/* Phone Notch */}
            <div className="w-32 h-5 bg-black rounded-full mx-auto mb-4 flex items-center justify-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-800"></div>
              <div className="w-2 h-2 rounded-full bg-neutral-900"></div>
            </div>

            {/* Inner Scanning Screen */}
            <div className="bg-[#282828] rounded-[36px] p-6 text-left relative overflow-hidden space-y-4">
              {/* Laser Scanning Beam */}
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-400 to-emerald-500/0 animate-scan pointer-events-none shadow-[0_0_12px_rgba(52,211,153,0.8)]"></div>

              <div className="flex justify-between items-start border-b border-neutral-700 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 block">
                    PaddleOCR Live Inference
                  </span>
                  <h4 className="font-heading font-semibold text-lg text-white">
                    TechNova Solutions Pvt Ltd
                  </h4>
                  <p className="text-xs text-neutral-400 font-mono">GSTIN: 27AAPFU0939F1ZV</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  99.8% Match
                </span>
              </div>

              {/* Extracted Fields Matrix */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#1e1e1e] p-3 rounded-2xl border border-neutral-700">
                  <span className="text-neutral-400 block text-[10px] uppercase font-mono">Invoice No</span>
                  <span className="font-mono font-bold text-white">INV-2026-089</span>
                </div>
                <div className="bg-[#1e1e1e] p-3 rounded-2xl border border-neutral-700">
                  <span className="text-neutral-400 block text-[10px] uppercase font-mono">Tax Balance</span>
                  <span className="font-mono font-bold text-emerald-400">CGST + SGST (18%)</span>
                </div>
                <div className="bg-[#1e1e1e] p-3 rounded-2xl border border-neutral-700">
                  <span className="text-neutral-400 block text-[10px] uppercase font-mono">Taxable Subtotal</span>
                  <span className="font-mono font-bold text-white">₹1,00,000.00</span>
                </div>
                <div className="bg-[#1e1e1e] p-3 rounded-2xl border border-neutral-700">
                  <span className="text-neutral-400 block text-[10px] uppercase font-mono">Total Payable</span>
                  <span className="font-mono font-bold text-white text-sm">₹1,18,000.00</span>
                </div>
              </div>

              {/* Status Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-mono">
                  ✓ GSTIN Algorithmic Checksum
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-mono">
                  ✓ Arithmetic Reconciled
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-700 text-[10px] font-mono">
                  10-Day Reminder Scheduled
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TICKER RIBBON (Statistical Marquee Pills) ── */}
      <section className="overflow-hidden py-3 border-y border-[#d9d9d9] bg-white">
        <div className="animate-ticker space-x-3">
          {[
            '+99.4% Extraction Accuracy',
            'PaddleOCR Bilingual Devanagari & English',
            '100% Deterministic GST Checks',
            'Zero Tax Arithmetic Mismatches',
            'Instant Google Calendar Sync',
            'Automated 10-Day Payment Reminders',
            'Local Privacy-First Processing',
            '+99.4% Extraction Accuracy',
            'PaddleOCR Bilingual Devanagari & English',
            '100% Deterministic GST Checks',
            'Zero Tax Arithmetic Mismatches',
            'Instant Google Calendar Sync',
            'Automated 10-Day Payment Reminders',
            'Local Privacy-First Processing'
          ].map((pill, idx) => (
            <div
              key={idx}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#f2f2f2] border border-[#d9d9d9] text-xs font-semibold text-neutral-800 whitespace-nowrap shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>{pill}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. LIVE METRIC CARDS (Exact Demo Website Surface Styling) ── */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Outstanding */}
          <div className="demo-card p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs uppercase font-mono tracking-wider text-neutral-500">
                Outstanding Payables
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold font-heading text-neutral-900 block">
                {formatINR(outstandingAmount)}
              </span>
              <span className="text-xs text-neutral-500 mt-1 block">
                {unpaidBills.length} unpaid invoices pending
              </span>
            </div>
          </div>

          {/* Card 2: Settled Spend */}
          <div className="demo-card p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs uppercase font-mono tracking-wider text-neutral-500">
                Settled Invoices
              </span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold font-heading text-neutral-900 block">
                {formatINR(paidAmount)}
              </span>
              <span className="text-xs text-neutral-500 mt-1 block">
                {paidBills.length} paid and reconciled
              </span>
            </div>
          </div>

          {/* Card 3: Input Tax Credit (GST) */}
          <div className="demo-card p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs uppercase font-mono tracking-wider text-neutral-500">
                Total GST / Tax Credit
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold font-heading text-neutral-900 block">
                {formatINR(totalTax)}
              </span>
              <span className="text-xs text-neutral-500 mt-1 block">
                Eligible Input Tax Credit (ITC)
              </span>
            </div>
          </div>

          {/* Card 4: Review Queue */}
          <div className="demo-card p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs uppercase font-mono tracking-wider text-neutral-500">
                Review Gate
              </span>
              <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-300 flex items-center justify-center text-black">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold font-heading text-neutral-900 block">
                {reviewBills.length}
              </span>
              <Link
                to="/review"
                className="text-xs font-semibold text-black hover:underline flex items-center space-x-1 mt-1"
              >
                <span>Audit items in queue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. COMPARISON SECTION ("There is a better way to do finance") ── */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-mono tracking-wider text-neutral-500 block">
            Why FinSense
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-black">
            There is a better way to do invoice processing
          </h2>
          <p className="text-sm text-neutral-600 max-w-xl mx-auto">
            Traditional bookkeeping relies on manual keying and prone to expensive GST mismatch notices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Old way */}
          <div className="demo-card p-8 bg-neutral-100/70 border border-[#d9d9d9] space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-red-600 block">
              The Traditional Manual Way
            </span>
            <h3 className="text-xl font-bold font-heading text-neutral-800">
              Manual Data Entry & Costly Tax Notice Risks
            </h3>
            <ul className="space-y-3 text-xs text-neutral-600">
              <li className="flex items-start space-x-2">
                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>Hours spent copying invoice rows into spreadsheets with arithmetic mistakes.</span>
              </li>
              <li className="flex items-start space-x-2">
                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>Invalid or forged vendor GSTINs leading to blocked Input Tax Credit.</span>
              </li>
              <li className="flex items-start space-x-2">
                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>Vernacular and Hindi invoices discarded or mistranslated.</span>
              </li>
              <li className="flex items-start space-x-2">
                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>Missed supplier payment due dates leading to late fees and friction.</span>
              </li>
            </ul>
          </div>

          {/* FinSense way */}
          <div className="demo-card p-8 bg-white border-2 border-black space-y-4 shadow-sm">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 block">
              The FinSense Intelligence System
            </span>
            <h3 className="text-xl font-bold font-heading text-black">
              100% Deterministic Audit & Automated Workflows
            </h3>
            <ul className="space-y-3 text-xs text-neutral-700">
              <li className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Open-Source PaddleOCR:</strong> Bilingual Devanagari Hindi + English layout detection.</span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Mathematical Guard:</strong> Line-item math (Qty × Rate = Total) and Tax balancing checked deterministically.</span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Algorithmic GSTIN Validator:</strong> State code and check-digit checksum verification.</span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Autonomous Payment Reminders:</strong> Scheduled 10 days post-receipt with recurrence.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 5. LIVE BILLS MANAGEMENT WORKSPACE ── */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold font-heading text-black">Recent Invoices & Bills</h2>
            <p className="text-xs text-neutral-500">
              Live records parsed through PaddleOCR and validated by the deterministic rule engine.
            </p>
          </div>

          {/* Filter Pills matching Demo Website */}
          <div className="flex items-center space-x-1.5 bg-white p-1 rounded-full border border-[#d9d9d9]">
            {[
              { id: 'all', label: 'All Bills' },
              { id: 'unpaid', label: 'Unpaid' },
              { id: 'paid', label: 'Settled' },
              { id: 'review', label: 'Needs Review' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  filter === f.id
                    ? 'bg-black text-white shadow-2xs'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices Table Card */}
        <div className="demo-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              Loading invoices...
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText className="w-8 h-8 text-neutral-400 mx-auto" />
              <p className="text-xs text-neutral-500">No invoices matching current filter.</p>
              <Link to="/upload" className="demo-btn-black px-4 py-2 text-xs inline-flex items-center space-x-1">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload First Invoice</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f7f7f7] border-b border-[#d9d9d9] font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="px-6 py-3.5">Bill Number</th>
                    <th className="px-6 py-3.5">Supplier / Vendor</th>
                    <th className="px-6 py-3.5">Invoice Date</th>
                    <th className="px-6 py-3.5">Tax Amount</th>
                    <th className="px-6 py-3.5">Total Amount</th>
                    <th className="px-6 py-3.5">Validation</th>
                    <th className="px-6 py-3.5">Payment</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ebebeb]">
                  {filteredInvoices.slice(0, 8).map((inv) => (
                    <tr key={inv.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-black">
                        <Link to={`/bills/${inv.id}`} className="hover:underline flex items-center space-x-1">
                          <span>{inv.bill_number}</span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-medium text-neutral-800">
                        {inv.supplier_name}
                      </td>
                      <td className="px-6 py-4 font-mono text-neutral-500">
                        {inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-mono text-neutral-700">
                        {formatINR(inv.tax_amount)}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-black">
                        {formatINR(inv.total_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-mono ${
                            inv.validation_status === 'valid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {inv.validation_status === 'valid' ? '✓ Passed' : '! Flagged'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleTogglePayment(inv)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition ${
                            inv.payment_status === 'paid'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-neutral-100 text-neutral-700 border border-neutral-300 hover:bg-neutral-200'
                          }`}
                        >
                          {inv.payment_status === 'paid' ? 'Paid' : 'Unpaid (Mark Paid)'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/bills/${inv.id}`}
                          className="demo-btn-white px-3 py-1 text-[11px] inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3 text-neutral-500" />
                          <span>Inspect</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
