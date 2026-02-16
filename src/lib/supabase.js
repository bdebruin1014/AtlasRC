import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

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
