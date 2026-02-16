import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client with defensive error handling
let supabaseClient;
try {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: !isDemoMode,
      persistSession: !isDemoMode,
      detectSessionInUrl: !isDemoMode,
    },
  });
} catch (err) {
  console.error('Failed to create Supabase client:', err);
  // Create a minimal mock client so the app doesn't crash
  supabaseClient = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: null }),
      updateUser: async () => ({ data: null, error: new Error('Supabase not configured') }),
      resetPasswordForEmail: async () => ({ data: null, error: null }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }), data: [], error: null }), in: () => ({ data: [], error: null }), limit: async () => ({ data: [], error: null, count: 0 }), data: [], error: null }),
      insert: async () => ({ data: null, error: null }),
      update: async () => ({ data: null, error: null }),
      delete: async () => ({ data: null, error: null }),
      upsert: async () => ({ data: null, error: null }),
    }),
    channel: () => ({ on: () => ({ subscribe: () => ({}) }), unsubscribe: () => {} }),
    removeChannel: () => {},
  };
}

export const supabase = supabaseClient;

// Helper to check connection
export async function checkConnection() {
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1);
    if (error) throw error;
    return { connected: true };
  } catch (error) {
    console.warn('Supabase connection check failed:', error.message);
    return { connected: false, error: error.message };
  }
}

export default supabase;
