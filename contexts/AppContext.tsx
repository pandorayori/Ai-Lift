import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserProfile, Language, WorkoutLog, Exercise } from '../types';
import { storage } from '../services/storageService';
import { translations } from '../utils/i18n';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();
  
  // Current active User ID (or 'temp' if guest)
  const userId = user ? user.id : 'temp';

  const [profile, setProfileState] = useState<UserProfile>({ 
    id: userId, 
    name: 'User', 
    weight: 0, 
    height: 0, 
    language: 'en' 
  });
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

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

  // Sync with Supabase when User ID changes (e.g., login)
  useEffect(() => {
    if (userId !== 'temp') {
      const initSync = async () => {
        setIsSyncing(true);
        await storage.syncFromSupabase(userId);
        refreshData();
        setIsSyncing(false);
      };
      initSync();
    }
  }, [userId, refreshData]);

  const updateProfile = async (updated: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updated };
    setProfileState(newProfile);
    await storage.saveProfile(userId, newProfile);
  };

  const setLanguage = (lang: Language) => {
    updateProfile({ language: lang });
  };

  const t = (section: keyof typeof translations.en, key: string): string => {
    const lang = (profile.language as Language) || 'en';
    // @ts-ignore
    return translations[lang][section]?.[key] || translations['en'][section]?.[key] || key;
  };

  const syncData = async () => {
    if (userId === 'temp') return;
    setIsSyncing(true);
    await storage.syncFromSupabase(userId);
    refreshData();
    setIsSyncing(false);
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
