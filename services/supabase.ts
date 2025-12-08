import { createClient } from '@supabase/supabase-js';

// Robustly get env variables (supports both standard Vite and configured process.env)
const getEnv = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    // @ts-ignore
    return process.env[key];
  }
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Log status for debugging (will show in browser console)
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing. Check your .env file.');
} else {
  console.log('Supabase client initialized.');
}

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;