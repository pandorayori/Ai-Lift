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
  syncData: () => Promise<void>;
  isSyncing: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile>(storage.getProfile());
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initial load and Sync
  useEffect(() => {
    const initData = async () => {
      // 1. Load local data immediately for UI speed
      refreshData();
      
      // 2. Try to sync from Supabase in background
      await syncData();
    };

    initData();
  }, []);

  const refreshData = useCallback(() => {
    setProfileState(storage.getProfile());
    setLogs(storage.getWorkoutLogs());
    setExercises(storage.getExercises());
  }, []);

  const syncData = useCallback(async () => {
    setIsSyncing(true);
    try {
      await storage.syncFromSupabase();
      refreshData();
    } catch (error) {
      console.error("Sync failed", error);
    } finally {
      setIsSyncing(false);
    }
  }, [refreshData]);

  const updateProfile = (updated: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updated };
    storage.saveProfile(newProfile); // This now handles both LocalStorage and Supabase
    setProfileState(newProfile);
  };

  const setLanguage = (lang: Language) => {
    updateProfile({ language: lang });
  };

  const t = (section: keyof typeof translations.en, key: string): string => {
    const langData = translations[profile.language][section];
    // @ts-ignore
    return langData ? langData[key] || key : key;
  };

  return (
    <AppContext.Provider value={{ 
      profile, 
      updateProfile, 
      language: profile.language, 
      setLanguage, 
      t,
      logs,
      exercises,
      refreshData,
      syncData,
      isSyncing
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
