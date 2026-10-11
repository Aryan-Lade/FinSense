import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  supabase, 
  isSupabaseConfigured,
  signInWithEmail as sbSignInWithEmail,
  signUpWithEmail as sbSignUpWithEmail,
  signInWithMagicLink as sbSignInWithMagicLink,
  signInWithProvider as sbSignInWithProvider,
  signOutUser as sbSignOutUser,
  resetPasswordForEmail as sbResetPasswordForEmail,
  updatePassword as sbUpdatePassword
} from '../supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup' | 'forgot' | 'magic-link'

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // 1. Get initial active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!error && session) {
        setSession(session);
        setUser(session.user);
      }
      setLoading(false);
    }).catch((err) => {
      console.warn('Supabase getSession error:', err);
      setLoading(false);
    });

    // 2. Listen for auth state changes (login, logout, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signIn = async (email, password) => {
    return await sbSignInWithEmail(email, password);
  };

  const signUp = async (email, password, metadata = {}) => {
    return await sbSignUpWithEmail(email, password, metadata);
  };

  const signInWithMagicLink = async (email) => {
    return await sbSignInWithMagicLink(email);
  };

  const signInWithProvider = async (provider) => {
    return await sbSignInWithProvider(provider);
  };

  const signOut = async () => {
    const res = await sbSignOutUser();
    setUser(null);
    setSession(null);
    return res;
  };

  const resetPassword = async (email) => {
    return await sbResetPasswordForEmail(email);
  };

  const updatePassword = async (newPassword) => {
    return await sbUpdatePassword(newPassword);
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated: Boolean(user),
    isConfigured: isSupabaseConfigured,
    isAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    openAuthModal,
    closeAuthModal,
    signIn,
    signUp,
    signInWithMagicLink,
    signInWithProvider,
    signOut,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
