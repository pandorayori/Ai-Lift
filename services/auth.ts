import { supabase } from './supabase';

export const auth = {
  signUp: (email: string, password: string) => 
    supabase?.auth.signUp({ email, password }),
  
  signIn: (email: string, password: string) => 
    supabase?.auth.signInWithPassword({ email, password }),
  
  signOut: () => supabase?.auth.signOut(),
  
  getUser: () => supabase?.auth.getUser(),
  
  getSession: () => supabase?.auth.getSession(),

  onAuthStateChange: (callback: (event: any, session: any) => void) => 
    supabase?.auth.onAuthStateChange(callback)
};