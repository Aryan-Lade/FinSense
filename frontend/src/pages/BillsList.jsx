import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Filter,
  Check,
  RotateCcw
} from 'lucide-react';
import { getInvoices, markPaid, markUnpaid } from '../api';

export default function BillsList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, unpaid, paid, needs_review

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
    const matchesSearch = 
      (inv.bill_number || '').toLowerCase().includes(search.toLowerCase()) ||
      (inv.supplier_name || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'unpaid') return inv.payment_status === 'unpaid';
    if (filter === 'paid') return inv.payment_status === 'paid';
    if (filter === 'needs_review') return inv.review_status === 'needs_review';
    return true;
  });

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bills & Invoices</h1>
          <p className="text-sm text-gray-500">
            View, inspect, validate, and manage payments across all processed bills.
          </p>
        </div>
        <Link
          to="/upload"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition shadow-sm"
        >
          + Upload Bill
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Filter Tabs */}
        <div className="flex space-x-1 sm:space-x-2 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Bills' },
            { id: 'unpaid', label: 'Unpaid' },
            { id: 'needs_review', label: 'Needs Review' },
            { id: 'paid', label: 'Paid' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                filter === tab.id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search bill # or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading bills...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No bills match your current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Bill #</th>
                  <th className="px-6 py-3">Supplier Name</th>
                  <th className="px-6 py-3">Invoice Date</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Total Amount</th>
                  <th className="px-6 py-3">Validation Status</th>
                  <th className="px-6 py-3">Payment</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">
                      <Link to={`/bills/${inv.id}`} className="hover:text-emerald-600">
                        {inv.bill_number || 'N/A'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {inv.supplier_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'}
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
                          {inv.validation_status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePayment(inv)}
                        title="Click to toggle Paid/Unpaid"
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                          inv.payment_status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {inv.payment_status === 'paid' ? (
                          <>
                            <Check className="w-3 h-3 mr-1" /> Paid
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" /> Mark Paid
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/bills/${inv.id}`}
                        className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium transition"
                      >
                        Inspect
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
