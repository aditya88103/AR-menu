import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('[Supabase] Initializing with URL:', supabaseUrl);

if (!supabaseAnonKey) {
  console.warn('[Supabase] ⚠️ No anonymous key configured! Check VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Health check on initialization
supabase.from('dishes').select('id').limit(1).then(
  ({ data, error }) => {
    if (error) {
      console.warn('[Supabase] Connection error:', error.message);
    } else {
      console.log('[Supabase] ✓ Connected successfully');
    }
  }
).catch(err => {
  console.error('[Supabase] Init error:', err);
});
