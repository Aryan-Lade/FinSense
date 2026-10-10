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
  RefreshCw,
  CheckCircle,
  Database
} from 'lucide-react';
import { seedDemo, advanceClock, getInvoices } from '../api';

export default function Navbar() {
  const location = useLocation();
  const [reviewCount, setReviewCount] = useState(0);
  const [isSeeding, setIsSeeding] = useState(false);
  const [clockMsg, setClockMsg] = useState('');

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
      const res = await advanceClock(2);
      setClockMsg('+2 Days simulated');
      setTimeout(() => setClockMsg(''), 3000);
      fetchBadge();
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: FileText },
    { name: 'Bills', path: '/bills', icon: FileText },
    { 
      name: 'Review Queue', 
      path: '/review', 
      icon: AlertCircle, 
      badge: reviewCount > 0 ? reviewCount : null 
    },
    { name: 'Upload', path: '/upload', icon: Upload },
    { name: 'Suppliers', path: '/suppliers', icon: Users },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Reminders', path: '/reminders', icon: Clock },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                FS
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-gray-900 font-mono">
                  FinSense
                </span>
                <span className="hidden md:inline-block ml-2 text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                  GST Intelligence
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    active
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
              Local CPU • Demo Mode
            </span>

            {clockMsg && (
              <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded font-mono animate-bounce">
                {clockMsg}
              </span>
            )}

            <button
              onClick={handleClock}
              title="Simulate +2 Days (Demo Clock)"
              className="text-xs px-2.5 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition flex items-center space-x-1 border border-gray-300"
            >
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span>+2 Days</span>
            </button>

            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="text-xs px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition flex items-center space-x-1 shadow-sm disabled:opacity-50"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isSeeding ? 'Seeding...' : 'Seed Samples'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
