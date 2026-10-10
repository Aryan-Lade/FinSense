import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ShieldAlert, 
  Filter, 
  ArrowRight,
  Eye,
  Check,
  X,
  ArrowUpRight
} from 'lucide-react';
import { getInvoices, approveInvoice, rejectInvoice } from '../api';

export default function ReviewQueue() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    getInvoices()
      .then((res) => {
        const items = (res.data || [])
          .filter((i) => i.review_status === 'needs_review' || i.validation_status === 'invalid')
          .sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));
        setInvoices(items);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id) => {
    await approveInvoice(id);
    loadData();
  };

  const handleReject = async (id) => {
    await rejectInvoice(id);
    loadData();
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-ui">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="reelo-pill py-0.5 px-3 text-xs bg-white">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>Prioritized Queue</span>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black font-heading">
              Review Queue
            </h1>
            <span className="reelo-pill py-0.5 px-3 text-xs font-mono font-bold bg-black text-white border-none">
              {invoices.length} Bills Flagged
            </span>
          </div>
          <p className="text-sm text-[#696969] mt-1">
            Deterministic risk ranking: invoices flagged for GST math tolerance, invalid GSTIN, or missing fields.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="reelo-card overflow-hidden bg-white shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-sm text-[#999999] flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            <span>Evaluating ledger items...</span>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#DCFFDB] text-[#4EA100] flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold font-heading text-black">Review queue is empty</h3>
            <p className="text-xs text-[#696969] max-w-sm mx-auto">
              All parsed invoices have passed deterministic GST checks with 100% compliance.
            </p>
            <Link to="/bills" className="reelo-btn-black px-6 py-2.5 text-xs font-semibold inline-block">
              View All Invoices
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DBDBDB] bg-[#F2F2F2]/50 text-xs font-bold text-[#696969] uppercase font-ui">
                  <th className="py-4 px-6">Risk Score</th>
                  <th className="py-4 px-6">Bill Number</th>
                  <th className="py-4 px-6">Supplier</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Detected Issue</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DBDBDB] text-sm">
                {invoices.map((inv) => {
                  const errors = inv.validation_json?.errors || [];
                  const mainErr = errors[0]?.message || 'Review required by auditor';
                  const score = inv.priority_score || 75;

                  return (
                    <tr key={inv.id} className="hover:bg-[#F2F2F2]/40 transition group">
                      <td className="py-4 px-6">
                        <span className={`reelo-pill py-0.5 px-2.5 text-xs font-mono font-bold ${
                          score >= 80 
                            ? 'bg-red-50 text-[#FF4F4F] border-red-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          Risk {score}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-black">
                        <Link to={`/bills/${inv.id}`} className="hover:text-[#0099FF] transition flex items-center gap-1.5">
                          <span>{inv.bill_number || 'N/A'}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                        </Link>
                      </td>
                      <td className="py-4 px-6 font-semibold text-black">
                        {inv.supplier_name || 'Unknown Vendor'}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-black">
                        {formatINR(inv.total_amount)}
                      </td>
                      <td className="py-4 px-6 text-xs text-[#696969] max-w-xs truncate">
                        {mainErr}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(inv.id)}
                            className="p-1.5 rounded-full bg-[#DCFFDB] hover:bg-emerald-200 text-[#4EA100] transition"
                            title="Approve Bill"
                          >
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          </button>
                          <button
                            onClick={() => handleReject(inv.id)}
                            className="p-1.5 rounded-full bg-red-50 hover:bg-red-100 text-[#FF4F4F] transition"
                            title="Reject Bill"
                          >
                            <X className="w-4 h-4 stroke-[2.5]" />
                          </button>
                          <Link
                            to={`/bills/${inv.id}`}
                            className="reelo-btn-white px-3 py-1 text-xs font-semibold"
                          >
                            Inspect
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
