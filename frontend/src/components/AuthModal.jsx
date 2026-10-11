import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Mail, Lock, User, ArrowRight, CheckCircle2, 
  AlertCircle, Sparkles, KeyRound, Eye, EyeOff, Loader2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalMode, 
    setAuthModalMode,
    signIn, 
    signUp, 
    signInWithMagicLink, 
    resetPassword 
  } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setConfirmPassword('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleClose = () => {
    resetForm();
    closeAuthModal();
  };

  const handleSwitchMode = (mode) => {
    setErrorMessage('');
    setSuccessMessage('');
    setAuthModalMode(mode);
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
      const { data, error } = await signIn(email, password);
      if (error) {
        setErrorMessage(error.message || 'Failed to sign in. Please check your credentials.');
        return;
      }
      setSuccessMessage('Successfully signed in! Welcome back.');
      setTimeout(() => {
        handleClose();
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
      const { data, error } = await signUp(email, password, {
        full_name: fullName || email.split('@')[0],
      });
      if (error) {
        setErrorMessage(error.message || 'Failed to create account.');
        return;
      }

      // Check if session exists or confirmation email was sent
      if (data?.session) {
        setSuccessMessage('Account created and signed in successfully!');
        setTimeout(() => {
          handleClose();
        }, 1200);
      } else {
        setSuccessMessage('Account created! Please check your email inbox to confirm your account.');
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
      const { error } = await signInWithMagicLink(email);
      if (error) {
        setErrorMessage(error.message || 'Failed to send magic link.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#DBDBDB] overflow-hidden z-10"
      >
        {/* Top Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-[#F0F0F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-black">
                FinSense Portal
              </h3>
              <p className="text-xs text-[#666666] font-ui">
                Secured with Supabase Auth
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#666666] hover:text-black hover:bg-[#F2F2F2] transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Sign In / Sign Up) */}
        {(authModalMode === 'login' || authModalMode === 'signup') && (
          <div className="px-6 pt-4">
            <div className="flex p-1 bg-[#F2F2F2] rounded-xl font-ui text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  authModalMode === 'login'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-[#666666] hover:text-black'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('signup')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  authModalMode === 'signup'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-[#666666] hover:text-black'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Alerts */}
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

          {/* Form: Sign In */}
          {authModalMode === 'login' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#333333] mb-1.5 font-ui">
                  Email Address
                </label>
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

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-[#333333] font-ui">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('forgot')}
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
                  onClick={() => handleSwitchMode('magic-link')}
                  className="text-xs text-[#666666] hover:text-black font-ui transition flex items-center justify-center gap-1.5 mx-auto"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Sign in with Magic Link instead</span>
                </button>
              </div>
            </form>
          )}

          {/* Form: Sign Up */}
          {authModalMode === 'signup' && (
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
                  Password (min 6 characters)
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

          {/* Form: Magic Link */}
          {authModalMode === 'magic-link' && (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-black mb-1 font-heading">
                  Sign in with Magic Link
                </h4>
                <p className="text-xs text-[#666666] mb-3 font-ui">
                  We'll email you a one-click login link. No password required.
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
                  onClick={() => handleSwitchMode('login')}
                  className="text-xs text-[#666666] hover:text-black font-ui underline transition"
                >
                  Back to Password Sign In
                </button>
              </div>
            </form>
          )}

          {/* Form: Forgot Password */}
          {authModalMode === 'forgot' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-black mb-1 font-heading">
                  Reset Password
                </h4>
                <p className="text-xs text-[#666666] mb-3 font-ui">
                  Enter your email to receive instructions to reset your password.
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
                  onClick={() => handleSwitchMode('login')}
                  className="text-xs text-[#666666] hover:text-black font-ui underline transition"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info badge */}
        <div className="bg-[#FAFAFA] border-t border-[#F0F0F0] px-6 py-3 flex items-center justify-between text-[11px] text-[#888888] font-ui">
          <span>Connected to Supabase Cloud</span>
          <span className="flex items-center gap-1 font-medium text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Auth Active
          </span>
        </div>
      </motion.div>
    </div>
  );
}
