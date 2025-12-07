import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, Language } from '../types';
import { storage } from '../services/storageService';
import { translations } from '../utils/i18n';

interface AppContextType {
  profile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: keyof typeof translations.en, key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile>(storage.getProfile());

  // Reload profile if local storage changes (optional, but good for multi-tab)
  useEffect(() => {
    setProfileState(storage.getProfile());
  }, []);

  const updateProfile = (updated: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updated };
    storage.saveProfile(newProfile);
    setProfileState(newProfile);
  };

  const setLanguage = (lang: Language) => {
    updateProfile({ language: lang });
  };

  // Translation helper
  const t = (section: keyof typeof translations.en, key: string): string => {
    const langData = translations[profile.language][section];
    // @ts-ignore
    return langData ? langData[key] || key : key;
  };

  return (
    <AppContext.Provider value={{ profile, updateProfile, language: profile.language, setLanguage, t }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};