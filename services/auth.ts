import { supabase } from './supabase';

const notConfiguredError = {
  data: { user: null, session: null },
  error: { message: "Supabase is not configured. Please connect your project." }
};

export const auth = {
  signUp: async (email: string, password: string) => 
    supabase ? await supabase.auth.signUp({ email, password }) : notConfiguredError,
  
  signIn: async (email: string, password: string) => 
    supabase ? await supabase.auth.signInWithPassword({ email, password }) : notConfiguredError,
  
  signOut: async () => supabase ? await supabase.auth.signOut() : { error: null },
  
  getUser: async () => supabase ? await supabase.auth.getUser() : { data: { user: null }, error: null },
  
  getSession: async () => supabase ? await supabase.auth.getSession() : { data: { session: null }, error: null },

  onAuthStateChange: (callback: (event: any, session: any) => void) => {
    if (supabase) {
      return supabase.auth.onAuthStateChange(callback);
    }
    // Return dummy subscription if no supabase to prevent crash
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
};