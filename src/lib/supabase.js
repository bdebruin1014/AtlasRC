import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if we're in demo mode
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_SUPABASE_URL;

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
  if (isDemoMode) {
    console.log('Running in demo mode - using mock data');
    return { connected: false, demoMode: true };
  }
  
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1);
    if (error) throw error;
    return { connected: true, demoMode: false };
  } catch (error) {
    console.warn('Supabase connection failed, falling back to demo mode:', error.message);
    return { connected: false, demoMode: true, error: error.message };
  }
}

export default supabase;
