import { createClient } from '@supabase/supabase-js';

// Access environment variables via process.env as configured in vite.config.ts define
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Ensure both URL and Key are present before creating the client
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;