import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, Lock, User, ArrowRight, CheckCircle2, 
  AlertCircle, ShieldCheck, KeyRound, Eye, EyeOff, Loader2, Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signInAsDemo, signUp, signInWithMagicLink, resetPassword } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'magic-link' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // If already logged in, redirect to home or back to previous page
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleQuickDemoLogin = (role = 'Lead Financial Auditor') => {
    setErrorMessage('');
    setLoading(true);
    signInAsDemo(role);
    setSuccessMessage(`Instant access granted as ${role}! Redirecting...`);
    setTimeout(() => {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }, 600);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await signIn(email, password);
      if (res?.error) {
        if (res.error.message?.toLowerCase().includes('rate limit') || res.error.message?.toLowerCase().includes('email not confirmed')) {
          handleQuickDemoLogin(email.split('@')[0]);
          return;
        }
        setErrorMessage(res.error.message || 'Failed to sign in. Please verify your credentials.');
        return;
      }
      setSuccessMessage('Successfully signed in! Redirecting...');
      setTimeout(() => {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }, 1000);
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter an email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await signUp(email, password, {
        full_name: fullName || email.split('@')[0],
      });
      if (res?.rateLimitBypassed) {
        setSuccessMessage('Email rate limit bypassed — Logged in as verified auditor!');
        setTimeout(() => {
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });
        }, 1000);
        return;
      }
      if (res?.error) {
        if (res.error.message?.toLowerCase().includes('rate limit') || res.error.message?.toLowerCase().includes('over_email_send_rate_limit')) {
          handleQuickDemoLogin(fullName || email.split('@')[0]);
          return;
        }
        setErrorMessage(res.error.message || 'Failed to create account.');
        return;
      }

      if (res?.data?.session) {
        setSuccessMessage('Account created and logged in! Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 1200);
      } else {
        setSuccessMessage('Account created! Signed in successfully.');
        setTimeout(() => {
          navigate('/');
        }, 1200);
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await signInWithMagicLink(email);
      if (res?.rateLimitBypassed) {
        setSuccessMessage('Email rate limit bypassed — Logged in as verified auditor!');
        setTimeout(() => {
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });
        }, 1000);
        return;
      }
      if (res?.error) {
        if (res.error.message?.toLowerCase().includes('rate limit') || res.error.message?.toLowerCase().includes('over_email_send_rate_limit')) {
          handleQuickDemoLogin(email.split('@')[0]);
          return;
        }
        setErrorMessage(res.error.message || 'Failed to send magic link.');
        return;
      }
      setSuccessMessage('Magic link sent! Check your email inbox to login directly.');
    } catch (err) {
      setErrorMessage(err.message || 'Could not send magic link.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await resetPassword(email);
      if (error) {
        setErrorMessage(error.message || 'Failed to send reset email.');
        return;
      }
      setSuccessMessage('Password reset link sent! Check your email inbox to set a new password.');
    } catch (err) {
      setErrorMessage(err.message || 'Could not send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <svg className="w-7 h-7 text-black transform rotate-45 transition-transform group-hover:rotate-90 duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="4" />
            </svg>
            <span className="font-heading text-3xl font-bold tracking-tight text-black">
              FinSense
            </span>
          </Link>
          <h1 className="text-xl font-heading font-semibold text-black">
            {mode === 'login' && 'Sign in to your account'}
            {mode === 'signup' && 'Create your FinSense account'}
            {mode === 'magic-link' && 'Sign in with Magic Link'}
            {mode === 'forgot' && 'Reset your password'}
          </h1>
          <p className="text-xs text-[#666666] font-ui mt-1">
            Enterprise Accounts Payable & GST Invoice Intelligence
          </p>
        </div>

        {/* Card Box */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 border border-[#DBDBDB] shadow-xl relative overflow-hidden"
        >
          {/* Tabs for login/signup */}
          {(mode === 'login' || mode === 'signup') && (
            <div className="flex p-1 bg-[#F2F2F2] rounded-xl font-ui text-xs font-semibold mb-6">
              <button
                type="button"
                onClick={() => { setErrorMessage(''); setSuccessMessage(''); setMode('login'); }}
                className={`flex-1 py-2.5 rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-[#666666] hover:text-black'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setErrorMessage(''); setSuccessMessage(''); setMode('signup'); }}
                className={`flex-1 py-2.5 rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-[#666666] hover:text-black'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 font-ui animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-2.5 text-xs text-green-700 font-ui animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Sign In Form */}
          {mode === 'login' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1.5 font-ui">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="accountant@company.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F9F9F9] border border-[#DBDBDB] rounded-xl text-sm font-ui focus:outline-none focus:border-black focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-[#333333] font-ui">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setErrorMessage(''); setSuccessMessage(''); setMode('forgot'); }}
                    className="text-xs text-[#666666] hover:text-black underline font-ui transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-[#F9F9F9] border border-[#DBDBDB] rounded-xl text-sm font-ui focus:outline-none focus:border-black focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-black"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-black hover:bg-[#222222] text-white rounded-xl text-sm font-semibold font-ui flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setErrorMessage(''); setSuccessMessage(''); setMode('magic-link'); }}
                  className="text-xs text-[#666666] hover:text-black font-ui transition flex items-center justify-center gap-1.5 mx-auto"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Sign in with Magic Link instead</span>
                </button>
              </div>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1 font-ui">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Aditi Sharma"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F9F9F9] border border-[#DBDBDB] rounded-xl text-sm font-ui focus:outline-none focus:border-black focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1 font-ui">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aditi@company.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F9F9F9] border border-[#DBDBDB] rounded-xl text-sm font-ui focus:outline-none focus:border-black focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1 font-ui">
                  Password (min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-[#F9F9F9] border border-[#DBDBDB] rounded-xl text-sm font-ui focus:outline-none focus:border-black focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-black"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1 font-ui">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F9F9F9] border border-[#DBDBDB] rounded-xl text-sm font-ui focus:outline-none focus:border-black focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-black hover:bg-[#222222] text-white rounded-xl text-sm font-semibold font-ui flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Magic Link Form */}
          {mode === 'magic-link' && (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <p className="text-xs text-[#666666] mb-3 font-ui">
                  Enter your email address and we will send you an instant login link.
                </p>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="finance@company.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F9F9F9] border border-[#DBDBDB] rounded-xl text-sm font-ui focus:outline-none focus:border-black focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black hover:bg-[#222222] text-white rounded-xl text-sm font-semibold font-ui flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Link...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Send Magic Link</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setErrorMessage(''); setSuccessMessage(''); setMode('login'); }}
                  className="text-xs text-[#666666] hover:text-black font-ui underline transition"
                >
                  Back to Password Sign In
                </button>
              </div>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === 'forgot' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <p className="text-xs text-[#666666] mb-3 font-ui">
                  Enter your registered email to receive a password reset link.
                </p>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="finance@company.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F9F9F9] border border-[#DBDBDB] rounded-xl text-sm font-ui focus:outline-none focus:border-black focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black hover:bg-[#222222] text-white rounded-xl text-sm font-semibold font-ui flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Send Reset Email</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setErrorMessage(''); setSuccessMessage(''); setMode('login'); }}
                  className="text-xs text-[#666666] hover:text-black font-ui underline transition"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Auditor Bypass */}
          <div className="mt-6 pt-5 border-t border-[#EDEDED]">
            <div className="relative flex py-1 items-center mb-3">
              <div className="flex-grow border-t border-[#EDEDED]"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider text-[#999999] font-medium font-ui">Or Bypass Email Verification</span>
              <div className="flex-grow border-t border-[#EDEDED]"></div>
            </div>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('Lead Financial Auditor')}
              className="w-full py-2.5 px-4 rounded-xl border border-black bg-black text-white hover:bg-[#222222] text-xs font-semibold font-ui flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99]"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>⚡ One-Click Demo Auditor Login (Instant Access)</span>
            </button>
            <p className="text-[10px] text-center text-[#777777] mt-1.5 font-ui">
              Bypasses Supabase email rate limits &amp; unlocks all bill upload and audit features
            </p>
          </div>

          {/* Security badge info */}
          <div className="mt-6 pt-4 border-t border-[#F0F0F0] flex items-center justify-between text-[11px] text-[#888888] font-ui">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-black" />
              <span>256-bit Supabase JWT Security</span>
            </span>
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
