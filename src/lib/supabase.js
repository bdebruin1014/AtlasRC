import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Determine if we're in demo mode (no real Supabase credentials)
const isPlaceholderCreds = !import.meta.env.VITE_SUPABASE_URL || supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder');
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || isPlaceholderCreds;

// Chainable mock query builder — returns empty data for all operations
// so pages render an empty state rather than showing a network error.
function createMockQuery() {
  const chainMethod = () => mockQuery;
  const mockQuery = {
    select: chainMethod,
    eq: chainMethod,
    neq: chainMethod,
    gt: chainMethod,
    gte: chainMethod,
    lt: chainMethod,
    lte: chainMethod,
    like: chainMethod,
    ilike: chainMethod,
    or: chainMethod,
    not: chainMethod,
    is: chainMethod,
    in: chainMethod,
    contains: chainMethod,
    containedBy: chainMethod,
    overlaps: chainMethod,
    filter: chainMethod,
    match: chainMethod,
    order: chainMethod,
    limit: chainMethod,
    range: chainMethod,
    abortSignal: chainMethod,
    single: async () => ({ data: null, error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
    csv: async () => ({ data: '', error: null }),
    // Allow `await query` to resolve with empty result
    then: (resolve, reject) => Promise.resolve({ data: [], error: null }).then(resolve, reject),
    catch: (reject) => Promise.resolve({ data: [], error: null }).catch(reject),
    finally: (cb) => Promise.resolve({ data: [], error: null }).finally(cb),
  };
  return mockQuery;
}

// Full mock Supabase client used when no real credentials are configured
const mockSupabaseClient = {
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
    select: () => createMockQuery(),
    insert: () => createMockQuery(),
    update: () => createMockQuery(),
    delete: () => createMockQuery(),
    upsert: () => createMockQuery(),
  }),
  rpc: async () => ({ data: null, error: null }),
  channel: () => ({ on: () => ({ subscribe: () => ({}) }), unsubscribe: () => {} }),
  removeChannel: () => {},
};

// Create Supabase client with defensive error handling
let supabaseClient;

if (isDemoMode) {
  // No real credentials — use mock client so pages show empty state
  // instead of network errors.
  supabaseClient = mockSupabaseClient;
} else {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    supabaseClient = mockSupabaseClient;
  }
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
