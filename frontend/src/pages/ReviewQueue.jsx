import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ShieldAlert, 
  Filter, 
  ArrowRight,
  Eye
} from 'lucide-react';
import { getInvoices, approveInvoice, rejectInvoice } from '../api';

export default function ReviewQueue() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    getInvoices()
      .then((res) => {
        // Sort by priority score descending
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900">Prioritized Review Queue</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
              {invoices.length} Pending
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Human-in-the-loop queue sorted by deterministic risk priority. Critical validation errors and duplicates appear first.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading review queue...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-semibold text-gray-900">Review Queue Clear</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              All processed invoices have passed deterministic validation rules or have already been approved.
            </p>
            <Link
              to="/bills"
              className="inline-block mt-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold"
            >
              View All Bills
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Priority Score</th>
                  <th className="px-6 py-3">Bill #</th>
                  <th className="px-6 py-3">Supplier Name</th>
                  <th className="px-6 py-3">Total Amount</th>
                  <th className="px-6 py-3">Flagged Reasons</th>
                  <th className="px-6 py-3 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded bg-red-100 text-red-800 font-mono font-bold text-xs">
                        +{inv.priority_score || 100}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">
                      <Link to={`/bills/${inv.id}`} className="hover:text-emerald-600">
                        {inv.bill_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {inv.supplier_name}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">
                      {formatINR(inv.total_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(inv.review_reasons || ['validation_error']).map((r, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200"
                          >
                            {r.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/bills/${inv.id}`}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold transition inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>
                      <button
                        onClick={() => handleApprove(inv.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
