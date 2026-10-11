import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Upload, LogIn, LogOut, User, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const { user, isAuthenticated, signOut, openAuthModal } = useAuth();

  const navLinks = [
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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await signOut();
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-4 z-40 w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
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

        {/* Right CTA & Auth Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) {
                openAuthModal('login');
              } else {
                navigate('/upload');
              }
            }}
            className="reelo-btn-black px-5 py-2.5 text-sm font-semibold gap-1.5 shadow-sm inline-flex items-center"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Bill</span>
          </button>

          {isAuthenticated ? (
            /* Logged In User Profile Pill */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#DBDBDB] bg-white hover:border-black transition text-sm font-ui"
              >
                <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                  {getUserInitials()}
                </div>
                <span className="max-w-[120px] truncate font-medium text-xs text-black">
                  {getUserDisplayName()}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#666666]" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#DBDBDB] p-2 z-50 animate-fadeIn">
                  <div className="p-3 border-b border-[#F0F0F0]">
                    <p className="font-heading font-semibold text-sm text-black truncate">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-[#666666] truncate font-ui">
                      {user?.email}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full w-fit">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Supabase Authenticated</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/bills"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-ui text-[#333333] hover:text-black hover:bg-[#F5F5F5] rounded-xl transition"
                    >
                      <span>My Documents & Bills</span>
                    </Link>
                    <Link
                      to="/batches"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-ui text-[#333333] hover:text-black hover:bg-[#F5F5F5] rounded-xl transition"
                    >
                      <span>Batch Processing</span>
                    </Link>
                    <Link
                      to="/inbox"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-ui text-[#333333] hover:text-black hover:bg-[#F5F5F5] rounded-xl transition"
                    >
                      <span>Omnichannel Inbox</span>
                    </Link>
                    <Link
                      to="/settings/integrations"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-ui text-[#333333] hover:text-black hover:bg-[#F5F5F5] rounded-xl transition"
                    >
                      <span>Settings & Integrations</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-[#F0F0F0]">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-ui text-red-600 hover:bg-red-50 rounded-xl transition font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Sign In Button */
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-black hover:text-white hover:bg-black rounded-full border border-black transition font-ui shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          {!isAuthenticated && (
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="sm:hidden flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full border border-black bg-black text-white"
            >
              <LogIn className="w-3 h-3" />
              <span>Sign In</span>
            </button>
          )}
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
          {isAuthenticated && (
            <div className="pb-3 border-b border-[#DBDBDB] flex items-center justify-between">
              <div>
                <p className="font-heading font-semibold text-sm text-black">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-[#666666]">
                  {user?.email}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-xs text-red-600 font-semibold px-2.5 py-1 bg-red-50 rounded-lg flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

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

          <Link
            to="/batches"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#333333] hover:text-black"
          >
            Batch Processing
          </Link>
          <Link
            to="/inbox"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#333333] hover:text-black"
          >
            Omnichannel Inbox
          </Link>
          <Link
            to="/settings/integrations"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#333333] hover:text-black"
          >
            Settings &amp; Integrations
          </Link>

          <div className="pt-3 border-t border-[#DBDBDB] space-y-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (!isAuthenticated) {
                  openAuthModal('login');
                } else {
                  navigate('/upload');
                }
              }}
              className="w-full reelo-btn-black py-3 text-sm justify-center gap-2 flex items-center"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Bill</span>
            </button>

            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-2xl border border-black text-black hover:bg-black hover:text-white transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Create Account</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
