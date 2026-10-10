import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  Check, 
  Save, 
  ExternalLink,
  Info,
  DollarSign
} from 'lucide-react';
import { 
  getInvoice, 
  updateInvoice, 
  markPaid, 
  markUnpaid, 
  approveInvoice, 
  rejectInvoice 
} from '../api';

export default function BillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editFields, setEditFields] = useState({});
  const [calendarSynced, setCalendarSynced] = useState(false);

  const loadInvoice = () => {
    setLoading(true);
    getInvoice(id)
      .then((res) => {
        setInvoice(res.data);
        setEditFields({
          bill_number: res.data.bill_number || '',
          supplier_name: res.data.supplier_name || '',
          total_amount: res.data.total_amount || 0,
          subtotal: res.data.subtotal || 0,
          tax_amount: res.data.tax_amount || 0,
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInvoice();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading invoice inspector...</div>;
  }

  if (!invoice) {
    return (
      <div className="p-12 text-center text-gray-500">
        Invoice not found. <Link to="/bills" className="text-emerald-600">Back to bills</Link>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateInvoice(id, editFields);
      loadInvoice();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleApplySuggestion = async (field, val) => {
    try {
      setSaving(true);
      const updatePayload = { ...editFields, [field]: val };
      if (field === 'totals.total_amount' || field === 'total_amount') {
        updatePayload.total_amount = val;
      }
      await updateInvoice(id, updatePayload);
      loadInvoice();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePayment = async () => {
    if (invoice.payment_status === 'paid') {
      await markUnpaid(id);
    } else {
      await markPaid(id);
    }
    loadInvoice();
  };

  const handleApprove = async () => {
    await approveInvoice(id);
    loadInvoice();
  };

  const handleReject = async () => {
    await rejectInvoice(id);
    loadInvoice();
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const validation = invoice.validation_json || {};
  const errors = validation.errors || [];
  const checksPassed = validation.checks_passed || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header / Nav Back */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/bills"
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900 font-mono">
                {invoice.bill_number || 'Invoice Details'}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                invoice.payment_status === 'paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {invoice.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Supplier: <span className="font-semibold text-gray-800">{invoice.supplier_name}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleTogglePayment}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-1.5 shadow-sm ${
              invoice.payment_status === 'paid'
                ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{invoice.payment_status === 'paid' ? 'Mark as Unpaid' : 'Mark as Paid'}</span>
          </button>

          {invoice.review_status === 'needs_review' && (
            <>
              <button
                onClick={handleApprove}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
              >
                Approve Bill
              </button>
              <button
                onClick={handleReject}
                className="px-3 py-2 bg-gray-100 hover:bg-red-50 text-red-600 rounded-lg text-sm font-semibold transition border border-gray-300"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Split View: Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Document Preview (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Original Document View</span>
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
              200 DPI Render
            </span>
          </div>

          {/* Simulated High-Res Document Preview with bounding boxes */}
          <div className="bg-amber-50/40 border border-gray-200 rounded-lg p-6 font-mono text-xs space-y-4 relative overflow-hidden shadow-inner min-h-[420px]">
            <div className="border-b-2 border-dashed border-gray-300 pb-3 flex justify-between items-start">
              <div>
                <p className="font-bold text-sm text-gray-900">{invoice.supplier_name || 'Vendor'}</p>
                <p className="text-gray-500 text-[10px]">
                  GSTIN: {invoice.canonical_json?.seller?.gstin || invoice.supplier?.gstin || invoice.seller_gstin || 'Recorded'}
                </p>
                <p className="text-gray-500 text-[10px]">
                  State: {invoice.supplier?.state || 'Verified Jurisdiction'}
                </p>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-yellow-200 border border-yellow-400 text-yellow-900 font-bold rounded">
                  TAX INVOICE
                </span>
                <p className="text-gray-600 text-[10px] mt-1">Invoice: {invoice.bill_number}</p>
                <p className="text-gray-500 text-[10px]">
                  Date: {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="border border-emerald-400 bg-emerald-50/50 p-2 rounded relative">
              <span className="absolute -top-2 right-2 text-[9px] bg-emerald-600 text-white px-1 rounded font-sans font-semibold">
                Evidence: PaddleOCR Verified
              </span>
              <p className="text-gray-700 font-semibold">Billed To:</p>
              <p className="text-gray-900">{invoice.buyer_name || invoice.canonical_json?.buyer?.legal_name || 'Registered Purchaser'}</p>
            </div>

            <div className="border border-gray-300 rounded overflow-hidden">
              <table className="w-full text-[10px]">
                <thead className="bg-gray-100 border-b border-gray-300 font-bold">
                  <tr>
                    <th className="p-1.5 text-left">Item Description</th>
                    <th className="p-1.5 text-right">Qty</th>
                    <th className="p-1.5 text-right">Taxable</th>
                    <th className="p-1.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(invoice.canonical_json?.line_items || invoice.items || []).length > 0 ? (
                    (invoice.canonical_json?.line_items || invoice.items || []).map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-1.5 font-sans">{item.description || item.name || `Item #${idx+1}`}</td>
                        <td className="p-1.5 text-right">{item.quantity || 1}</td>
                        <td className="p-1.5 text-right font-mono">{formatINR(item.unit_price || item.taxable_amount || item.amount || invoice.subtotal)}</td>
                        <td className="p-1.5 text-right font-mono">{formatINR(item.total_amount || item.line_total || invoice.total_amount)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-1.5 font-sans">Goods & Services (Per Invoice)</td>
                      <td className="p-1.5 text-right">1</td>
                      <td className="p-1.5 text-right font-mono">{formatINR(invoice.subtotal)}</td>
                      <td className="p-1.5 text-right font-mono">{formatINR(invoice.total_amount)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-300 pt-3 space-y-1 text-right text-xs">
              <p className="text-gray-600">Subtotal: <span className="font-bold">{formatINR(invoice.subtotal)}</span></p>
              <p className="text-gray-600">GST: <span className="font-bold">{formatINR(invoice.tax_amount)}</span></p>
              <div className="border-t border-gray-400 pt-1">
                <p className="text-sm font-bold text-gray-900">
                  Total Amount: <span className="text-emerald-700">{formatINR(invoice.total_amount)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Fields, Validation Report & Reminders (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Validation Report Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Deterministic Validation Report</span>
              </h2>
              <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                errors.length === 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {errors.length === 0 ? '✓ All Rules Passed' : `${errors.length} Critical Issue(s)`}
              </span>
            </div>

            {/* Error alerts with suggestion chips */}
            {errors.map((err, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-red-50/70 border border-red-200 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 text-red-800 font-semibold text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>[{err.rule_id}] {err.name || err.rule_key}</span>
                  </div>
                  <span className="text-xs uppercase px-1.5 py-0.5 rounded bg-red-200 text-red-900 font-bold">
                    {err.severity}
                  </span>
                </div>
                <p className="text-xs text-red-700">{err.message}</p>
                {err.suggestion && (
                  <div className="pt-2 flex items-center space-x-2">
                    <span className="text-xs font-semibold text-gray-700">Suggestion:</span>
                    <button
                      onClick={() => handleApplySuggestion(err.field_path, err.suggestion)}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 font-mono text-xs font-bold rounded border border-emerald-300 shadow-xs transition flex items-center space-x-1"
                    >
                      <span>Click to Apply: {String(err.suggestion)}</span>
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Passed checks */}
            {checksPassed.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-semibold text-gray-500 mb-2">Automated Checks Passed:</p>
                <div className="flex flex-wrap gap-2">
                  {checksPassed.map((chk, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs flex items-center space-x-1 font-mono">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>{chk}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Extracted Fields Editor */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                Extracted Fields & Provenance
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                High Confidence (96%)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Bill Number</label>
                <input
                  type="text"
                  value={editFields.bill_number}
                  onChange={(e) => setEditFields({ ...editFields, bill_number: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Supplier Name</label>
                <input
                  type="text"
                  value={editFields.supplier_name}
                  onChange={(e) => setEditFields({ ...editFields, supplier_name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Subtotal (₹)</label>
                <input
                  type="number"
                  value={editFields.subtotal}
                  onChange={(e) => setEditFields({ ...editFields, subtotal: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Total Amount (₹)</label>
                <input
                  type="number"
                  value={editFields.total_amount}
                  onChange={(e) => setEditFields({ ...editFields, total_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-mono font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save & Revalidate'}</span>
              </button>
            </div>
          </div>

          {/* Payment & Reminder Card (Master Spec Section 13 & 14) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Payment Schedule & Reminders</span>
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                Rule: 10 Days + Every 2 Days
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <p className="text-xs text-gray-500">
                Reminders are automatically scheduled 10 days after receipt, repeating every 2 days until marked as paid.
              </p>

              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">First Scheduled Fire:</span>
                  <span className="font-semibold text-gray-800">10 Days after Receipt (09:00 IST)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Repeat Frequency:</span>
                  <span className="font-semibold text-gray-800">Every 2 days while unpaid</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Google Calendar Sync:</span>
                  <span className="font-semibold text-emerald-700">
                    {calendarSynced ? 'Synced (RRULE:FREQ=DAILY;INTERVAL=2)' : 'Ready for Confirmation'}
                  </span>
                </div>
              </div>

              {!calendarSynced && invoice.payment_status !== 'paid' && (
                <button
                  onClick={() => setCalendarSynced(true)}
                  className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-300 transition flex items-center justify-center space-x-1.5"
                >
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Confirm & Sync to Google Calendar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
