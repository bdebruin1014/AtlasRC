import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isDemoMode } from '@/lib/supabase';

const AuthContext = createContext({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Demo user for testing without Supabase
const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@atlasdev.com',
  user_metadata: {
    name: 'Demo User',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If in demo mode, auto-login with demo user
    if (isDemoMode) {
      console.log('Running in demo mode - using demo user');
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    // Check active sessions
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error checking auth session:', error);
        // Fall back to demo mode on error
        setUser(DEMO_USER);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    if (isDemoMode) {
      // Demo mode - accept any credentials
      setUser(DEMO_USER);
      return { user: DEMO_USER };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, metadata = {}) => {
    if (isDemoMode) {
      // Demo mode - accept any credentials
      setUser(DEMO_USER);
      return { user: DEMO_USER };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    if (isDemoMode) {
      setUser(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isDemoMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
