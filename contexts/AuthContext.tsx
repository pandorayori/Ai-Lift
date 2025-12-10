import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { auth } from '../services/auth';
import { supabase } from '../services/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Persist guest mode so refresh doesn't kick user out
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('ai_lift_guest_mode') === 'true';
  });

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Check active session
    auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsGuest(false);
        localStorage.removeItem('ai_lift_guest_mode');
      }
      setLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsGuest(false);
        localStorage.removeItem('ai_lift_guest_mode');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await auth.signOut();
    setSession(null);
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem('ai_lift_guest_mode');
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('ai_lift_guest_mode', 'true');
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, isGuest, continueAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}