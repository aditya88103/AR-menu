import { createClient } from '@supabase/supabase-js';

const defaultUrl = 'https://placeholder-domain-restaurant.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummyPlaceholderKey';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL.startsWith('http')) 
  ? import.meta.env.VITE_SUPABASE_URL 
  : defaultUrl;

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultKey;

let client;

try {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      timeout: 2000,
    }
  });
} catch (err) {
  console.warn('Safe fallback client initialized:', err);
  client = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null }),
    }),
    channel: () => ({
      on: function() { return this; },
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
    removeChannel: () => {},
  };
}

export const supabase = client;
