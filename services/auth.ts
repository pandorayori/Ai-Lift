import { supabase } from './supabase';

export const auth = {
  signUp: async (email: string, password: string) => {
    if (!supabase) throw new Error("Supabase not configured");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signIn: async (email: string, password: string) => {
    if (!supabase) throw new Error("Supabase not configured");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getSession: async () => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
  
  getUser: async () => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    return data.user;
  }
};
