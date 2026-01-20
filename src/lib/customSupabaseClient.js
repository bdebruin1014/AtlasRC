// Re-export the main supabase client for backward compatibility
// Some pages import from customSupabaseClient
export { supabase, isDemoMode, checkConnection } from './supabase';
export { supabase as default } from './supabase';
