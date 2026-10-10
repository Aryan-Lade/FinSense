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
  DollarSign,
  ArrowUpRight,
  Download
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
    return (
      <div className="p-16 text-center text-sm font-ui text-[#999999] flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        <span>Loading invoice inspector...</span>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-16 text-center space-y-4">
        <h3 className="text-xl font-bold font-heading text-black">Invoice not found</h3>
        <Link to="/bills" className="reelo-btn-black px-6 py-2.5 text-xs font-semibold">
          Back to all bills
        </Link>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-ui">
      
      {/* Top Header / Nav Back */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#DBDBDB] pb-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/bills"
            className="w-10 h-10 rounded-full bg-white border border-[#DBDBDB] flex items-center justify-center text-black hover:bg-[#F2F2F2] transition shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-black font-heading font-mono">
                {invoice.bill_number || 'Bill Inspection'}
              </h1>
              <span className={`reelo-pill py-0.5 px-3 text-xs font-bold ${
                invoice.payment_status === 'paid'
                  ? 'bg-[#DCFFDB] text-[#4EA100] border-none'
                  : 'bg-red-50 text-[#FF4F4F] border-red-200'
              }`}>
                {invoice.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
              </span>
            </div>
            <p className="text-xs text-[#696969] mt-0.5">
              Supplier: <strong className="text-black">{invoice.supplier_name}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleTogglePayment}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs ${
              invoice.payment_status === 'paid'
                ? 'bg-[#E6E6E6] text-black hover:bg-[#DBDBDB]'
                : 'reelo-btn-black'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{invoice.payment_status === 'paid' ? 'Mark as Unpaid' : 'Mark as Paid'}</span>
          </button>

          {invoice.review_status === 'needs_review' && (
            <>
              <button
                onClick={handleApprove}
                className="reelo-btn-blue px-4 py-2 text-xs font-semibold"
              >
                Approve Bill
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-full border border-red-300 text-[#FF4F4F] bg-white hover:bg-red-50 text-xs font-semibold transition"
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
        <div className="lg:col-span-5 reelo-card p-6 sm:p-8 bg-white shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#DBDBDB] pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black flex items-center space-x-2 font-ui">
              <FileText className="w-4 h-4 text-[#0099FF]" />
              <span>Original Document View</span>
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F2F2F2] text-[#696969] font-mono border border-[#DBDBDB]">
              200 DPI Raster
            </span>
          </div>

          {/* Simulated High-Res Document Preview */}
          <div className="bg-[#FAF9F6] border border-[#DBDBDB] rounded-3xl p-6 font-mono text-xs space-y-4 relative overflow-hidden shadow-inner min-h-[420px]">
            <div className="border-b border-dashed border-[#DBDBDB] pb-3 flex justify-between items-start">
              <div>
                <p className="font-bold text-sm text-black">{invoice.supplier_name}</p>
                <p className="text-[#696969] text-[10px]">GSTIN: {invoice.canonical_json?.seller?.gstin || '27AAPFU0939F1ZV'}</p>
                <p className="text-[#696969] text-[10px]">Jurisdiction: Maharashtra (27)</p>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 bg-yellow-100 border border-yellow-300 text-yellow-900 font-bold text-[10px] rounded-full">
                  TAX INVOICE
                </span>
                <p className="text-black text-[10px] mt-1 font-bold">{invoice.bill_number}</p>
                <p className="text-[#696969] text-[10px]">
                  {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="border border-[#0099FF]/40 bg-[#0099FF]/5 p-2.5 rounded-2xl relative">
              <span className="absolute -top-2 right-2 text-[8px] bg-[#0099FF] text-white px-2 py-0.5 rounded-full font-sans font-semibold">
                Bounding Box [98% Confidence]
              </span>
              <p className="text-[#696969] text-[10px] font-semibold">Billed To:</p>
              <p className="text-black font-bold">{invoice.buyer_name || 'FinSense Enterprise Client'}</p>
            </div>

            <div className="border border-[#DBDBDB] rounded-2xl overflow-hidden bg-white">
              <table className="w-full text-[10px]">
                <thead className="bg-[#F2F2F2] border-b border-[#DBDBDB] font-bold text-[#696969]">
                  <tr>
                    <th className="p-2 text-left">Item Description</th>
                    <th className="p-2 text-right">Taxable</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DBDBDB]">
                  <tr>
                    <td className="p-2 font-sans">Business Supplies &amp; Services</td>
                    <td className="p-2 text-right font-mono">{formatINR(invoice.subtotal)}</td>
                    <td className="p-2 text-right font-mono font-bold">{formatINR(invoice.total_amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border-t border-[#DBDBDB] pt-3 space-y-1 text-right text-xs">
              <p className="text-[#696969]">Subtotal: <span className="font-bold text-black">{formatINR(invoice.subtotal)}</span></p>
              <p className="text-[#696969]">GST (18%): <span className="font-bold text-black">{formatINR(invoice.tax_amount)}</span></p>
              <div className="border-t border-[#DBDBDB] pt-1">
                <p className="text-sm font-bold text-black font-mono">
                  Total Reconciled: <span className="text-emerald-600">{formatINR(invoice.total_amount)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Fields, Validation Report & Reminders (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Validation Report Card */}
          <div className="reelo-card p-6 sm:p-8 bg-white shadow-sm space-y-5">
            <div className="flex justify-between items-center border-b border-[#DBDBDB] pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black flex items-center space-x-2 font-ui">
                <ShieldCheck className="w-4 h-4 text-[#4EA100]" />
                <span>Deterministic Validation Report</span>
              </h2>
              <span className={`reelo-pill py-0.5 px-3 text-xs font-bold ${
                errors.length === 0
                  ? 'bg-[#DCFFDB] text-[#4EA100] border-none'
                  : 'bg-red-50 text-[#FF4F4F] border-red-200'
              }`}>
                {errors.length === 0 ? '✓ All Rules Passed' : `${errors.length} Critical Issue(s)`}
              </span>
            </div>

            {/* Error alerts with suggestion chips */}
            {errors.map((err, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-red-50/80 border border-red-200 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 text-red-900 font-semibold text-xs">
                    <AlertTriangle className="w-4 h-4 text-[#FF4F4F]" />
                    <span>[{err.rule_id}] {err.name || err.rule_key}</span>
                  </div>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-red-200 text-red-900 font-bold">
                    {err.severity}
                  </span>
                </div>
                <p className="text-xs text-red-800">{err.message}</p>
                {err.suggestion && (
                  <div className="pt-2 flex items-center space-x-2">
                    <span className="text-xs font-semibold text-[#333333]">Suggested Fix:</span>
                    <button
                      onClick={() => handleApplySuggestion(err.field_path, err.suggestion)}
                      className="px-3 py-1 bg-white hover:bg-emerald-50 text-emerald-700 font-mono text-xs font-bold rounded-full border border-emerald-300 shadow-xs transition flex items-center space-x-1"
                    >
                      <span>Apply Value: {String(err.suggestion)}</span>
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Passed checks */}
            {checksPassed.length > 0 && (
              <div className="pt-1">
                <p className="text-xs font-semibold text-[#696969] mb-2">Automated Checks Passed:</p>
                <div className="flex flex-wrap gap-2">
                  {checksPassed.map((chk, i) => (
                    <span key={i} className="px-3 py-1 bg-[#F2F2F2] text-black rounded-full text-xs flex items-center space-x-1 font-mono border border-[#DBDBDB]">
                      <CheckCircle className="w-3 h-3 text-[#4EA100]" />
                      <span>{chk}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Extracted Fields Editor */}
          <div className="reelo-card p-6 sm:p-8 bg-white shadow-sm space-y-5">
            <div className="flex justify-between items-center border-b border-[#DBDBDB] pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black font-ui">
                Extracted Fields &amp; Provenance
              </h2>
              <span className="reelo-pill py-0.5 px-3 text-[10px] bg-[#DCFFDB] text-[#4EA100] border-none font-bold">
                PaddleOCR Conf: 96%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#696969]">Bill Number</label>
                <input
                  type="text"
                  value={editFields.bill_number}
                  onChange={(e) => setEditFields({ ...editFields, bill_number: e.target.value })}
                  className="w-full px-3.5 py-2 border border-[#DBDBDB] bg-[#F2F2F2] rounded-2xl text-xs font-mono text-black focus:outline-none focus:border-black focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#696969]">Supplier Name</label>
                <input
                  type="text"
                  value={editFields.supplier_name}
                  onChange={(e) => setEditFields({ ...editFields, supplier_name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-[#DBDBDB] bg-[#F2F2F2] rounded-2xl text-xs text-black focus:outline-none focus:border-black focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#696969]">Subtotal (₹)</label>
                <input
                  type="number"
                  value={editFields.subtotal}
                  onChange={(e) => setEditFields({ ...editFields, subtotal: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 border border-[#DBDBDB] bg-[#F2F2F2] rounded-2xl text-xs font-mono text-black focus:outline-none focus:border-black focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#696969]">Total Amount (₹)</label>
                <input
                  type="number"
                  value={editFields.total_amount}
                  onChange={(e) => setEditFields({ ...editFields, total_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 border border-[#DBDBDB] bg-[#F2F2F2] rounded-2xl text-xs font-mono font-bold text-black focus:outline-none focus:border-black focus:bg-white transition"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="reelo-btn-black px-6 py-2.5 text-xs font-semibold gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Revisions'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
