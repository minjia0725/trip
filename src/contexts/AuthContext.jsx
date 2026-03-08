import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseEnabled } from '../lib/supabase';

const AuthContext = createContext(null);

const allowedEmailRaw = import.meta.env.VITE_ALLOWED_EMAIL ?? '';
export const allowedEmail = typeof allowedEmailRaw === 'string' ? allowedEmailRaw.trim().toLowerCase() : '';

function isUserAllowed(user) {
  if (!user?.email || !allowedEmail) return true;
  return user.email.trim().toLowerCase() === allowedEmail;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) {
      setLoading(false);
      return;
    }

    const applyUser = async (sessionUser) => {
      if (!sessionUser) {
        setUser(null);
        return;
      }
      if (allowedEmail && !isUserAllowed(sessionUser)) {
        await supabase.auth.signOut();
        setUser(null);
        return;
      }
      setUser(sessionUser);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      applyUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    if (!isSupabaseEnabled || !supabase) {
      return { error: { message: '尚未設定 Supabase，請設定 VITE_SUPABASE_URL 與 VITE_SUPABASE_ANON_KEY' } };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signUp = async (email, password) => {
    if (!isSupabaseEnabled || !supabase) {
      return { error: { message: '尚未設定 Supabase，請設定 VITE_SUPABASE_URL 與 VITE_SUPABASE_ANON_KEY' } };
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthEnabled: isSupabaseEnabled,
    allowedEmail,
    isRestrictedToSingleEmail: Boolean(allowedEmail),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth 必須在 AuthProvider 內使用');
  return ctx;
}
