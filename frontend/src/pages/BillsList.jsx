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
  RotateCcw,
  Upload,
  ArrowUpRight,
  ShieldCheck
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="reelo-pill py-0.5 px-3 text-xs bg-white">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0099FF]" />
              <span>Audit Ledger</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black font-heading">
            Bills &amp; Invoices
          </h1>
          <p className="text-sm font-ui text-[#696969] mt-1">
            View, inspect, validate, and manage settlement status across all processed bills.
          </p>
        </div>
        <Link
          to="/upload"
          className="reelo-btn-black px-6 py-3 text-sm font-semibold gap-2 shadow-sm"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Bill</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="reelo-card p-4 sm:p-5 bg-white flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        {/* Filter Tabs */}
        <div className="flex space-x-1 sm:space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Bills' },
            { id: 'unpaid', label: 'Unpaid' },
            { id: 'needs_review', label: 'Needs Review' },
            { id: 'paid', label: 'Paid' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-ui font-semibold transition ${
                filter === tab.id
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-[#F2F2F2] text-[#696969] hover:text-black hover:bg-[#E6E6E6]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999]" />
          <input
            type="text"
            placeholder="Search vendor or bill #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full border border-[#DBDBDB] bg-[#F2F2F2] text-xs font-ui text-black focus:outline-none focus:border-black focus:bg-white transition"
          />
        </div>
      </div>

      {/* Invoices List / Table */}
      <div className="reelo-card overflow-hidden bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-sm font-ui text-[#999999] flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            <span>Loading ledger entries...</span>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#F2F2F2] text-[#999999] flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold font-heading text-black">No bills found</h3>
            <p className="text-xs font-ui text-[#696969] max-w-sm mx-auto">
              {search || filter !== 'all'
                ? 'Try adjusting your search criteria or filter tags.'
                : 'No invoices processed yet. Upload your first PDF or image bill to start.'}
            </p>
            <Link
              to="/upload"
              className="reelo-btn-black px-6 py-2.5 text-xs font-semibold inline-flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Bill Now</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DBDBDB] bg-[#F2F2F2]/50 text-xs font-bold text-[#696969] uppercase font-ui">
                  <th className="py-4 px-6">Bill Number</th>
                  <th className="py-4 px-6">Supplier</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Review Status</th>
                  <th className="py-4 px-6">Payment</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DBDBDB] text-sm font-ui">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F2F2F2]/40 transition group">
                    <td className="py-4 px-6 font-mono font-bold text-black">
                      <Link to={`/bills/${inv.id}`} className="hover:text-[#0099FF] transition flex items-center gap-1.5">
                        <span>{inv.bill_number || 'N/A'}</span>
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                      </Link>
                    </td>
                    <td className="py-4 px-6 font-semibold text-black">
                      {inv.supplier_name || 'Unknown Supplier'}
                    </td>
                    <td className="py-4 px-6 text-xs text-[#696969] font-mono">
                      {inv.invoice_date || 'N/A'}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-black">
                      {formatINR(inv.total_amount)}
                    </td>
                    <td className="py-4 px-6">
                      {inv.review_status === 'needs_review' ? (
                        <span className="reelo-pill py-0.5 px-2.5 text-[10px] bg-amber-50 text-amber-700 border-amber-200 font-bold inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Needs Review
                        </span>
                      ) : (
                        <span className="reelo-pill py-0.5 px-2.5 text-[10px] bg-[#DCFFDB] text-[#4EA100] border-none font-bold inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-[#4EA100]" />
                          Verified
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {inv.payment_status === 'paid' ? (
                        <span className="reelo-pill py-0.5 px-2.5 text-[10px] bg-[#DCFFDB] text-[#4EA100] border-none font-bold">
                          Paid
                        </span>
                      ) : (
                        <span className="reelo-pill py-0.5 px-2.5 text-[10px] bg-red-50 text-[#FF4F4F] border-red-200 font-bold">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTogglePayment(inv)}
                          className="p-1.5 rounded-full hover:bg-[#E6E6E6] text-[#696969] hover:text-black transition"
                          title={inv.payment_status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                        >
                          {inv.payment_status === 'paid' ? (
                            <RotateCcw className="w-4 h-4" />
                          ) : (
                            <Check className="w-4 h-4 text-[#4EA100]" />
                          )}
                        </button>
                        <Link
                          to={`/bills/${inv.id}`}
                          className="reelo-btn-white px-3 py-1 text-xs font-semibold"
                        >
                          Details
                        </Link>
                      </div>
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
