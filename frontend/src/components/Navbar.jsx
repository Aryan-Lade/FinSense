import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight, Upload } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

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

  return (
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
          </Link>
        </div>

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
          </div>
        </div>
      )}
    </header>
  );
}
