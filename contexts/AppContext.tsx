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
  
  // Initialize state. Note: storage.getProfile() might return default first, 
  // but we refresh when user changes.
  const [profile, setProfileState] = useState<UserProfile>(storage.getProfile());
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshData = useCallback(() => {
    setProfileState(storage.getProfile());
    setLogs(storage.getWorkoutLogs());
    setExercises(storage.getExercises());
  }, []);

  // Watch for user changes to update storage context
  useEffect(() => {
    if (user) {
      storage.setStorageUser(user.id);
    } else {
      storage.setStorageUser('default_user');
    }
    
    // Refresh local data immediately based on the new user context
    refreshData();

    // Trigger cloud sync if user is logged in
    if (user) {
      syncData();
    }
  }, [user, refreshData]);

  const syncData = useCallback(async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await storage.syncFromSupabase();
      refreshData();
    } catch (error) {
      console.error("Sync failed", error);
    } finally {
      setIsSyncing(false);
    }
  }, [user, refreshData]);

  const updateProfile = (updated: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updated };
    storage.saveProfile(newProfile); 
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
