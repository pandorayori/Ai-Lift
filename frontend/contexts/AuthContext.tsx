
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface AuthContextType {
  user: any | null;
  isGuest: boolean;
  isAuthorized: boolean;
  signOut: () => void;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // In this local-only version, we use localStorage to persist the "Authorized" state
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    return localStorage.getItem('ai_lift_authorized') === 'true';
  });
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('ai_lift_is_guest') === 'true';
  });

  const continueAsGuest = () => {
    setIsAuthorized(true);
    setIsGuest(true);
    localStorage.setItem('ai_lift_authorized', 'true');
    localStorage.setItem('ai_lift_is_guest', 'true');
  };

  const signOut = () => {
    setIsAuthorized(false);
    setIsGuest(false);
    localStorage.removeItem('ai_lift_authorized');
    localStorage.removeItem('ai_lift_is_guest');
  };

  return (
    <AuthContext.Provider value={{ 
      user: null, 
      isGuest, 
      isAuthorized,
      signOut, 
      continueAsGuest 
    }}>
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
};
