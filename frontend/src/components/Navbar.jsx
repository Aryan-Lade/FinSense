import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
<<<<<<< HEAD
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
  User as UserIcon,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { getInvoices } from '../api';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout, isSupabase } = useAuth();
  const [reviewCount, setReviewCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
    const interval = setInterval(fetchBadge, 8000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
=======
import { Menu, X, ArrowUpRight, Upload } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
>>>>>>> main
    { name: 'Overview', path: '/' },
    { name: 'Bills', path: '/bills' },
    { name: 'Review Queue', path: '/review' },
    { name: 'Suppliers', path: '/suppliers' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Reminders', path: '/reminders' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
<<<<<<< HEAD
    <>
      <header className="sticky top-3 z-40 w-full max-w-6xl mx-auto px-4 transition-all">
        <div className="glass-nav rounded-[22px] px-5 sm:px-6 py-3 flex items-center justify-between border border-white/80 shadow-sm">
          {/* Logo */}
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
=======
    <header className="sticky top-4 z-50 w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <nav className="reelo-nav px-5 sm:px-8 py-3.5 flex items-center justify-between">
        
        {/* Brand: FinSense */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <svg className="w-6 h-6 text-black transform rotate-45 transition-transform group-hover:rotate-90 duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="18" height="18" rx="4" />
          </svg>
          <span className="font-heading text-2xl font-bold tracking-tight text-black">
            FinSense
          </span>
        </Link>

        {/* Center Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-7 font-ui text-sm font-medium text-[#333333]">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors hover:text-black ${
                  active ? 'text-black font-semibold' : ''
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right CTA Button */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            to="/upload"
            className="reelo-btn-black px-6 py-2.5 text-sm font-semibold gap-1.5 shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Bill</span>
>>>>>>> main
          </Link>
        </div>

<<<<<<< HEAD
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

          {/* Right Tools & Call to Action */}
          <div className="flex items-center space-x-2">
            {/* Supabase & PaddleOCR Engine Status */}
            <div className="hidden lg:inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{isSupabase ? 'Supabase Connected' : 'PaddleOCR Active'}</span>
            </div>

            {/* Authentication Button / User Profile */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-1.5 pl-1">
                <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-medium text-gray-800">
                  <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">
                    {(user.full_name || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.full_name || user.email?.split('@')[0]}</span>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full border border-gray-300 hover:border-black bg-white hover:bg-gray-50 text-xs font-semibold text-gray-800 transition-all"
              >
                <UserIcon className="w-3.5 h-3.5 text-gray-500" />
                <span>Sign In</span>
              </button>
            )}

            {/* Upload CTA */}
            <Link
              to="/upload"
              className="demo-btn-black inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold shadow-xs"
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
=======
        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center transition"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 reelo-card p-6 space-y-3 font-ui text-base shadow-2xl bg-white">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2 ${
                isActive(link.path)
                  ? 'text-black font-bold'
                  : 'text-[#333333] hover:text-black'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-[#DBDBDB]">
            <Link
              to="/upload"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full reelo-btn-black py-3 text-sm justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Bill</span>
            </Link>
>>>>>>> main
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

            <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-xs">
              <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{isSupabase ? 'Supabase Connected' : 'PaddleOCR Active'}</span>
              </span>
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="px-3 py-1 rounded-full bg-red-50 text-red-700 font-semibold text-xs"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1 rounded-full bg-black text-white font-semibold text-xs"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
