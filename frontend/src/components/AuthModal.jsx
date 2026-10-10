import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Database,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, isSupabase } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      if (isSignUp) {
        await register(email, password, fullName);
        setSuccess('Account created successfully! Welcome to FinSense.');
      } else {
        await login(email, password);
        setSuccess('Logged in successfully!');
      }
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Authentication failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-gray-100 bg-linear-to-b from-gray-50/80 to-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-gray-900">
                {isSignUp ? 'Create your Account' : 'Sign in to FinSense'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isSignUp ? 'Start managing GST invoices with deterministic intelligence' : 'Access your verified bills, vendors & payment schedules'}
              </p>
            </div>
          </div>

          {/* Engine indicator */}
          <div className="mt-3 flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200/60">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-gray-400" />
              Auth Gateway
            </span>
            <span className={`font-mono text-[11px] font-medium flex items-center gap-1 ${isSupabase ? 'text-emerald-700' : 'text-blue-700'}`}>
              <span className={`w-2 h-2 rounded-full ${isSupabase ? 'bg-emerald-500' : 'bg-blue-500'} animate-pulse`}></span>
              {isSupabase ? 'Supabase Auth' : 'Encrypted DB JWT'}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name / Organization
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required={isSignUp}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full pl-9.5 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-black focus:ring-1 focus:ring-black transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Business Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@enterprise.in"
                  className="w-full pl-9.5 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-black focus:ring-1 focus:ring-black transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9.5 pr-10 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-black focus:ring-1 focus:ring-black transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-hidden"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">
                Must be at least 6 characters
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Login and Signup */}
          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccess('');
                }}
                className="font-semibold text-black hover:underline focus:outline-hidden ml-1"
              >
                {isSignUp ? 'Sign In here' : 'Create an Account'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
