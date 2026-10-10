import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { getInvoices, seedDemo } from '../api';

export default function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    getInvoices()
      .then((res) => {
        setInvoices(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalBills = invoices.length;
  const unpaidBills = invoices.filter((i) => i.payment_status === 'unpaid');
  const paidBills = invoices.filter((i) => i.payment_status === 'paid');
  const reviewBills = invoices.filter((i) => i.review_status === 'needs_review');

  const outstandingAmount = unpaidBills.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
  const paidAmount = paidBills.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
  const totalTax = invoices.reduce((acc, curr) => acc + (curr.tax_amount || 0), 0);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-sm font-semibold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>PERCEIVE • UNDERSTAND • VALIDATE • TRUST</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              GST Invoice Intelligence & Bill Management
            </h1>
            <p className="text-gray-300 mt-2 max-w-2xl text-sm sm:text-base">
              Automated extraction, deterministic GST compliance verification, payment status tracking, and scheduled payment reminders.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/upload"
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg text-sm transition flex items-center space-x-2 shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Bill</span>
            </Link>
            <Link
              to="/review"
              className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg text-sm transition flex items-center space-x-2 border border-gray-600"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Review Queue ({reviewBills.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Outstanding */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-gray-500 text-sm font-medium">
            <span>Outstanding to Pay</span>
            <span className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 font-mono">
              {formatINR(outstandingAmount)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {unpaidBills.length} unpaid bill{unpaidBills.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* Paid Amount */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-gray-500 text-sm font-medium">
            <span>Total Paid (History)</span>
            <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 font-mono">
              {formatINR(paidAmount)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {paidBills.length} completed bill{paidBills.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* Needs Review */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-gray-500 text-sm font-medium">
            <span>Needs Human Review</span>
            <span className="p-2 bg-red-50 rounded-lg text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 font-mono">
              {reviewBills.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tax or GSTIN discrepancies flagged
            </p>
          </div>
        </div>

        {/* Total Processed */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center text-gray-500 text-sm font-medium">
            <span>Total Invoices</span>
            <span className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <FileText className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 font-mono">
              {totalBills}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total Tax: {formatINR(totalTax)}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Invoices Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Bills & Invoices</h2>
            <p className="text-xs text-gray-500">Live invoices with deterministic validation state</p>
          </div>
          <Link
            to="/bills"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <FileText className="w-12 h-12 text-gray-400 mx-auto" />
            <h3 className="text-base font-semibold text-gray-900">No invoices yet</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Get started by uploading an invoice or load the pre-configured demo samples.
            </p>
            <button
              onClick={() => seedDemo().then(loadData)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
            >
              Load Demo Invoices
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Bill #</th>
                  <th className="px-6 py-3">Supplier</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Total Amount</th>
                  <th className="px-6 py-3">Validation</th>
                  <th className="px-6 py-3">Payment</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.slice(0, 5).map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">
                      {inv.bill_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {inv.supplier_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">
                      {formatINR(inv.total_amount)}
                    </td>
                    <td className="px-6 py-4">
                      {inv.validation_status === 'valid' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Valid
                        </span>
                      ) : inv.validation_status === 'invalid' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Needs Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                          {inv.validation_status || 'Pending'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {inv.payment_status === 'paid' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/bills/${inv.id}`}
                        className="text-emerald-600 hover:text-emerald-800 font-medium text-sm"
                      >
                        Inspect →
                      </Link>
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
