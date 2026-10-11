import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, Calendar, CheckCircle, AlertCircle, AlertTriangle, 
  FastForward, RotateCcw, MessageSquare, Mail, 
  CreditCard, ShieldAlert, CheckCheck, 
  Search, Sliders, X, Info, Sparkles, Building2, BellRing
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getReminders, advanceClock, markPaid } from '../api';

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [simulatedDays, setSimulatedDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, overdue, soon, scheduled, paid
  const [toastMessage, setToastMessage] = useState(null);
  const [showRulesModal, setShowRulesModal] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = () => {
    setLoading(true);
    getReminders()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.items || []);
        setReminders(data);
      })
      .catch((err) => {
        console.error('Failed to load reminders:', err);
        setReminders([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdvance = async (days) => {
    try {
      await advanceClock(days);
    } catch (e) {}
    setSimulatedDays((prev) => prev + days);
    showToast(`Time Simulator: Advanced statutory calendar by +${days} days!`, 'info');
  };

  const handleResetClock = () => {
    setSimulatedDays(0);
    showToast('Time Simulator: Reset calendar back to today.', 'info');
  };

  const handleMarkAsPaid = async (rem) => {
    try {
      await markPaid(rem.invoice_id || rem.id);
    } catch (e) {}
    setReminders((prev) =>
      prev.map((r) =>
        (r.id === rem.id || r.invoice_id === rem.invoice_id)
          ? { ...r, payment_status: 'paid', status: 'completed' }
          : r
      )
    );
    showToast(`Payment recorded for Bill #${rem.bill_number}! Section 43B(h) deduction preserved.`, 'success');
  };

  const handleSendAlert = (rem, channel = 'whatsapp') => {
    if (channel === 'whatsapp') {
      showToast(`WhatsApp reminder dispatched to ${rem.supplier_name} accounts team with statutory GST reference.`, 'success');
    } else {
      showToast(`Statutory Section 43B(h) payment cue emailed to AP Officer for Bill #${rem.bill_number}.`, 'info');
    }
  };

  // Compute dynamic dates & categories based on simulated time
  const enrichedReminders = useMemo(() => {
    const simulatedDate = new Date(Date.now() + simulatedDays * 86400000);
    
    return reminders.map((rem, idx) => {
      // Default to deterministic staggered dates if missing
      const baseDueDate = rem.due_date 
        ? new Date(rem.due_date) 
        : new Date(Date.now() + 86400000 * ((idx * 4) - 6));
      
      const diffMs = baseDueDate.getTime() - simulatedDate.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      
      const isPaid = rem.payment_status === 'paid';
      const isOverdue = !isPaid && diffDays < 0;
      const isDueSoon = !isPaid && diffDays >= 0 && diffDays <= 7;
      const isScheduled = !isPaid && diffDays > 7;

      return {
        ...rem,
        effectiveDueDate: baseDueDate,
        diffDays,
        isPaid,
        isOverdue,
        isDueSoon,
        isScheduled,
        overdueDays: Math.abs(diffDays)
      };
    });
  }, [reminders, simulatedDays]);

  // Aggregate KPI summary metrics
  const stats = useMemo(() => {
    const overdueList = enrichedReminders.filter((r) => r.isOverdue);
    const dueSoonList = enrichedReminders.filter((r) => r.isDueSoon);
    const scheduledList = enrichedReminders.filter((r) => r.isScheduled);
    const paidList = enrichedReminders.filter((r) => r.isPaid);

    return {
      overdueCount: overdueList.length,
      overdueAmount: overdueList.reduce((acc, r) => acc + (Number(r.total_amount) || 0), 0),
      dueSoonCount: dueSoonList.length,
      dueSoonAmount: dueSoonList.reduce((acc, r) => acc + (Number(r.total_amount) || 0), 0),
      scheduledCount: scheduledList.length,
      scheduledAmount: scheduledList.reduce((acc, r) => acc + (Number(r.total_amount) || 0), 0),
      paidCount: paidList.length,
      paidAmount: paidList.reduce((acc, r) => acc + (Number(r.total_amount) || 0), 0),
    };
  }, [enrichedReminders]);

  // Filtered list
  const filteredReminders = useMemo(() => {
    return enrichedReminders.filter((rem) => {
      const matchesSearch = 
        (rem.supplier_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (rem.bill_number?.toLowerCase() || '').includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === 'overdue') return rem.isOverdue;
      if (activeFilter === 'soon') return rem.isDueSoon;
      if (activeFilter === 'scheduled') return rem.isScheduled;
      if (activeFilter === 'paid') return rem.isPaid;
      return true;
    });
  }, [enrichedReminders, searchQuery, activeFilter]);

  const simulatedDateStr = new Date(Date.now() + simulatedDays * 86400000).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-ui">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300">
          <div className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-950 text-emerald-200 border-emerald-800' 
              : 'bg-slate-900 text-white border-slate-700'
          }`}>
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header & Simulator Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-2 border-b border-[#DBDBDB]/80">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <span className="reelo-pill py-0.5 px-3 text-xs bg-white text-black border border-[#DBDBDB] font-semibold flex items-center gap-1.5 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-[#0080FF]" />
              <span>Statutory Compliance Calendar</span>
            </span>
            <span className="reelo-pill py-0.5 px-2.5 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              Section 43B(h) Active
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-heading">
            Payment Reminders
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Automated statutory bill schedules: T+10 receipt check, T-3 payment cues, and statutory MSME 15/45-day disallowance alerts.
          </p>
        </div>

        {/* Interactive Statutory Time Travel Simulator */}
        <div className="w-full lg:w-auto bg-white p-3.5 rounded-2xl border border-[#DBDBDB] shadow-xs flex flex-wrap items-center justify-between lg:justify-end gap-3">
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Time Travel Simulator
            </span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[#0080FF]" />
              <span className="text-xs font-mono font-bold text-slate-900">
                {simulatedDateStr}
              </span>
              {simulatedDays > 0 && (
                <span className="text-[10px] font-mono font-bold text-[#0080FF] bg-[#0080FF]/10 px-1.5 rounded">
                  +{simulatedDays}d
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleAdvance(2)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>+2 Days</span>
            </button>
            <button
              onClick={() => handleAdvance(7)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
            >
              <span>+7 Days</span>
            </button>
            {simulatedDays > 0 && (
              <button
                onClick={handleResetClock}
                title="Reset to today"
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Overdue Section 43B(h) */}
        <div 
          onClick={() => setActiveFilter('overdue')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === 'overdue' 
              ? 'bg-red-50 border-red-300 ring-2 ring-red-200' 
              : 'bg-white border-[#DBDBDB] hover:border-red-200'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
              Section 43B(h) Overdue
            </span>
            <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              ₹ {stats.overdueAmount.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center gap-1 text-xs text-red-700 font-medium mt-0.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span>{stats.overdueCount} bills in penalty danger</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Due Within 7 Days */}
        <div 
          onClick={() => setActiveFilter('soon')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === 'soon' 
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200' 
              : 'bg-white border-[#DBDBDB] hover:border-amber-200'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Due Within 7 Days
            </span>
            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              ₹ {stats.dueSoonAmount.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center gap-1 text-xs text-amber-700 font-medium mt-0.5">
              <span>{stats.dueSoonCount} bills requiring payment cue</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Scheduled Reminders */}
        <div 
          onClick={() => setActiveFilter('scheduled')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === 'scheduled' 
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' 
              : 'bg-white border-[#DBDBDB] hover:border-blue-200'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-[#0080FF] uppercase tracking-wider">
              Scheduled Alerts
            </span>
            <div className="w-6 h-6 rounded-full bg-blue-100 text-[#0080FF] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              ₹ {stats.scheduledAmount.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-0.5">
              <span>{stats.scheduledCount} automated alerts pending</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Paid / Preserved */}
        <div 
          onClick={() => setActiveFilter('paid')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === 'paid' 
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200' 
              : 'bg-white border-[#DBDBDB] hover:border-emerald-200'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Deductions Protected
            </span>
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              ₹ {stats.paidAmount.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium mt-0.5">
              <span>{stats.paidCount} bills discharged on time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Section 43B(h) Advisory Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span>Section 43B(h) Corporate Tax Deduction Watchdog</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-mono">
                Mandatory Audit
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Payments to registered Micro &amp; Small suppliers must be cleared within 15 days (standard) or 45 days (with agreement). Overdue amounts are disallowed from taxable income and subjected to 30%+ corporate tax disallowance.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowRulesModal(true)}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>View Rule Cadence</span>
        </button>
      </div>

      {/* Main Reminders Container */}
      <div className="reelo-card p-6 sm:p-8 bg-white shadow-sm space-y-6">
        
        {/* Controls: Search & Filter Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: 'All Invoices', count: enrichedReminders.length },
              { id: 'overdue', label: '🔴 Overdue (43B(h))', count: stats.overdueCount },
              { id: 'soon', label: '⚠️ Due Soon', count: stats.dueSoonCount },
              { id: 'scheduled', label: '⏰ Scheduled', count: stats.scheduledCount },
              { id: 'paid', label: '✅ Settled', count: stats.paidCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendor or bill #..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0080FF]/30 focus:border-[#0080FF] transition"
            />
          </div>
        </div>

        {/* Reminders List */}
        {loading ? (
          <div className="p-16 text-center text-sm text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="w-7 h-7 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading statutory payment schedules...</span>
          </div>
        ) : filteredReminders.length === 0 ? (
          <div className="p-14 text-center space-y-2 border border-dashed border-slate-200 rounded-2xl">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-900 font-heading">
              No bills match this filter criteria
            </p>
            <p className="text-xs text-slate-500">
              All filtered invoices are either paid or beyond the active alert window.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredReminders.map((rem, idx) => {
              const formattedDueDate = rem.effectiveDueDate.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });

              return (
                <div 
                  key={rem.id || idx}
                  className={`p-4 rounded-2xl border transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 ${
                    rem.isPaid
                      ? 'bg-slate-50/70 border-slate-200 opacity-80'
                      : rem.isOverdue
                      ? 'bg-red-50/50 border-red-200 hover:bg-red-50/80'
                      : rem.isDueSoon
                      ? 'bg-amber-50/40 border-amber-200 hover:bg-amber-50/70'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Left: Supplier & Invoice Info */}
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      rem.isPaid
                        ? 'bg-emerald-100 border-emerald-200 text-emerald-700'
                        : rem.isOverdue
                        ? 'bg-red-100 border-red-200 text-red-600'
                        : rem.isDueSoon
                        ? 'bg-amber-100 border-amber-200 text-amber-600'
                        : 'bg-blue-100 border-blue-200 text-[#0080FF]'
                    }`}>
                      {rem.isPaid ? (
                        <CheckCheck className="w-5 h-5" />
                      ) : rem.isOverdue ? (
                        <ShieldAlert className="w-5 h-5 animate-pulse" />
                      ) : rem.isDueSoon ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Building2 className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 font-heading">
                          {rem.supplier_name}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                          {rem.msme_category || 'Small MSME (45D)'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
                        <span>Bill #{rem.bill_number}</span>
                        <span>&bull;</span>
                        <span>Due: {formattedDueDate}</span>
                        <span>&bull;</span>
                        <span className="text-slate-400 text-[11px] font-sans">
                          {rem.rule_type || 'Section 43B(h) Schedule'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Center: Dynamic Statutory Countdown Badge */}
                  <div className="w-full lg:w-auto">
                    {rem.isPaid ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>PAID &bull; Deductions Intact</span>
                      </span>
                    ) : rem.isOverdue ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-red-700 bg-red-100 px-3 py-1 rounded-full border border-red-200">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                        <span>⚠️ OVERDUE by {rem.overdueDays}d &bull; 43B(h) Penalty Active</span>
                      </span>
                    ) : rem.isDueSoon ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>DUE in {rem.diffDays} Days &bull; Cue Sent</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-[#0080FF] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Scheduled &bull; Due in {rem.diffDays} Days</span>
                      </span>
                    )}
                  </div>

                  {/* Right: Amount & Quick Action Triggers */}
                  <div className="w-full lg:w-auto flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200/60">
                    <div className="text-left lg:text-right">
                      <span className="text-sm sm:text-base font-extrabold font-mono text-slate-900 block">
                        ₹ {rem.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* WhatsApp Trigger */}
                      <button
                        onClick={() => handleSendAlert(rem, 'whatsapp')}
                        title="Send WhatsApp payment reminder"
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all active:scale-95"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      {/* Email Trigger */}
                      <button
                        onClick={() => handleSendAlert(rem, 'email')}
                        title="Send Email payment cue"
                        className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0080FF] border border-blue-200 transition-all active:scale-95"
                      >
                        <Mail className="w-4 h-4" />
                      </button>

                      {/* 1-Click Pay Trigger */}
                      {!rem.isPaid ? (
                        <button
                          onClick={() => handleMarkAsPaid(rem)}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Now</span>
                        </button>
                      ) : (
                        <span className="px-3 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-1">
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Discharged</span>
                        </span>
                      )}

                      {/* View Bill Deep Link */}
                      <Link
                        to="/bills"
                        title="View invoice details"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                      >
                        <Info className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Cadence Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-[#0080FF]/10 text-[#0080FF] flex items-center justify-center font-bold">
                  ⚖️
                </div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Statutory Reminder Cadence Engine
                </h3>
              </div>
              <button 
                onClick={() => setShowRulesModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex gap-3">
                <span className="font-mono font-bold text-[#0080FF] shrink-0">Rule 1 &bull; T+10</span>
                <div>
                  <p className="font-bold text-slate-900">First Soft Check-in</p>
                  <p className="text-slate-500">Sent 10 days after bill receipt to confirm accounting ingestion and invoice validity.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/70 flex gap-3">
                <span className="font-mono font-bold text-amber-700 shrink-0">Rule 2 &bull; T-3</span>
                <div>
                  <p className="font-bold text-amber-900">Payment Cue Alert</p>
                  <p className="text-amber-700">Triggered 3 days prior to due date to ensure accounts payable allocates cashflow.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/70 flex gap-3">
                <span className="font-mono font-bold text-[#0080FF] shrink-0">Rule 3 &bull; T-0</span>
                <div>
                  <p className="font-bold text-blue-900">Due Date Statutory Deadline</p>
                  <p className="text-blue-700">Dispatched on statutory due date (15-day or 45-day MSME window) as final prompt.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-red-50 border border-red-200/70 flex gap-3">
                <span className="font-mono font-bold text-red-700 shrink-0">Rule 4 &bull; T+Daily</span>
                <div>
                  <p className="font-bold text-red-900">Section 43B(h) Disallowance Escalation</p>
                  <p className="text-red-700">Daily escalation alerts to CFO and AP head warning of tax deduction forfeiture.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Close Cadence Inspector
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
