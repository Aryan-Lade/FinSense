import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  AlertCircle, 
  Users, 
  BarChart3, 
  Clock, 
  Sparkles, 
  Database,
  Menu,
  X,
  ArrowUpRight
} from 'lucide-react';
import { seedDemo, advanceClock, getInvoices } from '../api';

export default function Navbar() {
  const location = useLocation();
  const [reviewCount, setReviewCount] = useState(0);
  const [isSeeding, setIsSeeding] = useState(false);
  const [clockMsg, setClockMsg] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchBadge = () => {
    getInvoices()
      .then((res) => {
        const count = (res.data || []).filter((inv) => inv.review_status === 'needs_review').length;
        setReviewCount(count);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchBadge();
    const interval = setInterval(fetchBadge, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      await seedDemo();
      fetchBadge();
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClock = async () => {
    try {
      await advanceClock(2);
      setClockMsg('+2 Days');
      setTimeout(() => setClockMsg(''), 3000);
      fetchBadge();
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { name: 'Overview', path: '/' },
    { name: 'Bills', path: '/bills' },
    { 
      name: 'Review', 
      path: '/review', 
      badge: reviewCount > 0 ? reviewCount : null 
    },
    { name: 'Suppliers', path: '/suppliers' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Reminders', path: '/reminders' },
  ];

  return (
    <header className="sticky top-3 z-50 w-full max-w-6xl mx-auto px-4 transition-all">
      <div className="glass-nav rounded-[22px] px-5 sm:px-6 py-3 flex items-center justify-between border border-white/80 shadow-sm">
        {/* Logo matching Demo website */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-[9px] bg-black text-white flex items-center justify-center transform -rotate-12 group-hover:rotate-0 transition-transform duration-300 shadow-xs">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl sm:text-2xl font-bold font-heading tracking-tight text-black">
            FinSense
          </span>
          <span className="hidden lg:inline-block ml-1 text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-white border border-[#d9d9d9] text-neutral-600">
            GST Intelligence
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center space-x-1.5 ${
                  active
                    ? 'bg-black text-white shadow-xs'
                    : 'text-neutral-600 hover:text-black hover:bg-black/5'
                }`}
              >
                <span>{item.name}</span>
                {item.badge && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Tools & Call to Action (Demo website pill styling) */}
        <div className="flex items-center space-x-2">
          {clockMsg && (
            <span className="text-[11px] font-mono px-2 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-bounce">
              {clockMsg}
            </span>
          )}

          <button
            onClick={handleClock}
            title="Advance Demo Clock (+2 Days)"
            className="hidden sm:inline-flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-white hover:bg-neutral-100 border border-[#d9d9d9] text-neutral-800 transition shadow-2xs"
          >
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span>+2d Clock</span>
          </button>

          <button
            onClick={handleSeed}
            disabled={isSeeding}
            title="Seed 4 Test Bills"
            className="hidden sm:inline-flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-white hover:bg-neutral-100 border border-[#d9d9d9] text-neutral-800 transition shadow-2xs disabled:opacity-50"
          >
            <Database className="w-3.5 h-3.5 text-neutral-500" />
            <span>{isSeeding ? '...' : 'Seed'}</span>
          </button>

          <Link
            to="/upload"
            className="demo-btn-black inline-flex items-center space-x-1 px-4 py-2 text-xs font-semibold shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Bill</span>
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-full hover:bg-black/5 text-neutral-700"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 glass-nav rounded-[20px] p-4 border border-white/80 shadow-lg space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  location.pathname === item.path
                    ? 'bg-black text-white'
                    : 'bg-white/80 text-neutral-700 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-neutral-200 flex justify-between items-center">
            <button
              onClick={handleClock}
              className="text-xs px-3 py-1.5 rounded-full bg-white border border-[#d9d9d9] text-neutral-700"
            >
              +2 Days Demo
            </button>
            <button
              onClick={handleSeed}
              className="text-xs px-3 py-1.5 rounded-full bg-white border border-[#d9d9d9] text-neutral-700"
            >
              Seed Sample Bills
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
