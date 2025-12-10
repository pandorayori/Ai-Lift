import { createClient } from '@supabase/supabase-js';

// Use import.meta.env which is the standard way in Vite to access environment variables
// This avoids runtime errors where 'process' might be undefined in the browser
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Ensure both URL and Key are present before creating the client
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;
