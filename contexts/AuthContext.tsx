import React, { createContext, useContext, ReactNode } from 'react';

// Dummy AuthContext for Local-Only Mode
interface AuthContextType {
  user: any | null;
  isGuest: boolean;
  signOut: () => void;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Always Guest, No Logic
  return (
    <AuthContext.Provider value={{ 
      user: null, 
      isGuest: true, 
      signOut: () => {}, 
      continueAsGuest: () => {} 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return { 
    user: null, 
    isGuest: true, 
    signOut: () => {}, 
    continueAsGuest: () => {} 
  };
};