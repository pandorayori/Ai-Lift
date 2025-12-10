import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserProfile, Language, WorkoutLog, Exercise } from '../types';
import { storage } from '../services/storageService';
import { translations } from '../utils/i18n';

interface AppContextType {
  profile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: keyof typeof translations.en, key: string) => string;
  logs: WorkoutLog[];
  exercises: Exercise[];
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Hardcoded ID for local-only mode
  const userId = 'local_user';

  const [profile, setProfileState] = useState<UserProfile>({ 
    id: userId, 
    name: 'User', 
    weight: 0, 
    height: 0, 
    language: 'en' 
  });
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Load data from local storage (fast path)
  const refreshData = useCallback(() => {
    const p = storage.getProfile(userId);
    const l = storage.getWorkoutLogs(userId);
    const e = storage.getExercises();
    
    setProfileState(p);
    setLogs(l);
    setExercises(e);
  }, [userId]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const updateProfile = async (updated: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updated };
    setProfileState(newProfile);
    storage.saveProfile(userId, newProfile);
  };

  const setLanguage = (lang: Language) => {
    updateProfile({ language: lang });
  };

  const t = (section: keyof typeof translations.en, key: string): string => {
    const lang = (profile.language as Language) || 'en';
    // @ts-ignore
    return translations[lang][section]?.[key] || translations['en'][section]?.[key] || key;
  };

  return (
    <AppContext.Provider value={{
      profile,
      updateProfile,
      language: (profile.language as Language) || 'en',
      setLanguage,
      t,
      logs,
      exercises,
      refreshData
    }}>
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