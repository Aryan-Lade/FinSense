import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';
import { authLogin, authRegister, authMe, authLogout, getAuthConfig } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authConfig, setAuthConfig] = useState({
    supabase_configured: false,
    auth_mode: 'local_database'
  });

  // Load configuration & current session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Fetch backend auth & Supabase readiness
        try {
          const cfgRes = await getAuthConfig();
          setAuthConfig(cfgRes.data);
        } catch {
          setAuthConfig({
            supabase_configured: isSupabaseConfigured(),
            auth_mode: isSupabaseConfigured() ? 'supabase' : 'local_database'
          });
        }

        // 2. Check existing token in localStorage
        const storedToken = localStorage.getItem('finsense_auth_token');
        if (storedToken) {
          try {
            const meRes = await authMe();
            setUser(meRes.data);
          } catch {
            // Token invalid or expired
            localStorage.removeItem('finsense_auth_token');
            setUser(null);
          }
        } else if (isSupabaseConfigured() && supabase) {
          // Check active Supabase session
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            const supaUser = data.session.user;
            localStorage.setItem('finsense_auth_token', data.session.access_token);
            setUser({
              id: supaUser.id,
              email: supaUser.email,
              full_name: supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0],
              role: 'user',
              supabase_user_id: supaUser.id
            });
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 3. Supabase auth listener if client is configured
    if (isSupabaseConfigured() && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            localStorage.setItem('finsense_auth_token', session.access_token);
            setUser({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
              role: 'user',
              supabase_user_id: session.user.id
            });
          } else if (event === 'SIGNED_OUT') {
            localStorage.removeItem('finsense_auth_token');
            setUser(null);
          }
        }
      );
      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  const login = async (email, password) => {
    // If Supabase client configured directly in browser
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (!error && data?.session?.access_token) {
          localStorage.setItem('finsense_auth_token', data.session.access_token);
          const loggedUser = {
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
            role: 'user',
            supabase_user_id: data.user.id
          };
          setUser(loggedUser);
          return loggedUser;
        }
      } catch (supaErr) {
        console.warn('Supabase client login failed, trying backend direct auth:', supaErr);
      }
    }

    // Direct backend login (which handles Supabase REST or local DB)
    const res = await authLogin({ email, password });
    if (res.data?.access_token) {
      localStorage.setItem('finsense_auth_token', res.data.access_token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error('Authentication failed: No token received');
  };

  const register = async (email, password, fullName) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) {
          // If rate limit or other error, log and fallback to backend register
          console.warn('Supabase signUp error (e.g. rate limit):', error.message);
        } else if (data?.session?.access_token) {
          localStorage.setItem('finsense_auth_token', data.session.access_token);
          const newUser = {
            id: data.user.id,
            email: data.user.email,
            full_name: fullName || data.user.email?.split('@')[0],
            role: 'user',
            supabase_user_id: data.user.id
          };
          setUser(newUser);
          return newUser;
        }
      } catch (err) {
        console.warn('Supabase signUp exception, using backend registration fallback:', err);
      }
    }

    // Backend registration fallback (creates user record & JWT token immediately)
    const res = await authRegister({
      email,
      password,
      full_name: fullName
    });
    if (res.data?.access_token) {
      localStorage.setItem('finsense_auth_token', res.data.access_token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error('Registration failed: No session created');
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.auth.signOut();
      }
      await authLogout();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('finsense_auth_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        authConfig,
        isSupabase: isSupabaseConfigured() || authConfig.supabase_configured,
        login,
        register,
        logout
      }}
    >
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
