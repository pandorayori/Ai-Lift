import { Exercise, ExerciseType, MuscleGroup, UserProfile, WorkoutLog } from '../types';
import { supabase } from './supabase';

// --- Constants & Seed Data ---

// Base keys (prefixes)
const BASE_KEYS = {
  PROFILE: 'ai_lift_profile',
  LOGS: 'ai_lift_logs',
  EXERCISES: 'ai_lift_exercises'
};

const SEED_EXERCISES: Exercise[] = [
  {
    id: 'ex_1',
    name: 'Barbell Squat',
    name_zh: '杠铃深蹲',
    target_muscle: MuscleGroup.LEGS,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e01f5?auto=format&fit=crop&w=400&q=80',
    instructions: 'Keep your back straight, feet shoulder-width apart. Lower until thighs are parallel to floor.',
    instructions_zh: '保持背部挺直，双脚与肩同宽。下蹲至大腿与地面平行。'
  },
  {
    id: 'ex_2',
    name: 'Bench Press',
    name_zh: '平板卧推',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80',
    instructions: 'Lie on bench, lower bar to mid-chest, press up until arms are locked.',
    instructions_zh: '平躺于卧推凳，下放杠铃至胸部中部，推起直至手臂伸直。'
  },
  {
    id: 'ex_3',
    name: 'Deadlift',
    name_zh: '硬拉',
    target_muscle: MuscleGroup.BACK,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1517963879466-e1b54ebd6694?auto=format&fit=crop&w=400&q=80',
    instructions: 'Hinge at hips, keep back flat, lift bar by extending hips and knees.',
    instructions_zh: '髋部铰链运动，保持背部平直，通过伸展髋部和膝盖提起杠铃。'
  },
  {
    id: 'ex_4',
    name: 'Overhead Press',
    name_zh: '站姿推举',
    target_muscle: MuscleGroup.SHOULDERS,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1532029837066-805e451672a4?auto=format&fit=crop&w=400&q=80',
    instructions: 'Press bar overhead from shoulder level until arms are fully extended.',
    instructions_zh: '将杠铃从肩部位置推过头顶，直至手臂完全伸直。'
  },
  {
    id: 'ex_5',
    name: 'Dumbbell Row',
    name_zh: '哑铃划船',
    target_muscle: MuscleGroup.BACK,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
    instructions: 'Pull dumbbell towards hip while keeping back parallel to ground.',
    instructions_zh: '保持背部与地面平行，将哑铃拉向髋部。'
  }
];

const DEFAULT_PROFILE: UserProfile = {
  id: 'temp',
  name: 'Lifter',
  weight: 70,
  height: 175,
  language: 'en'
};

// --- Helper Functions ---

// Generate user-scoped key
const getUserKey = (baseKey: string, userId: string) => `${baseKey}_${userId}`;

const getLocal = <T>(key: string, defaultVal: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setLocal = (key: string, val: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error("LocalStorage save failed", e);
  }
};

// --- Storage Service ---

export const storage = {
  /**
   * Migrate data from 'temp' user (guest) to actual authenticated user
   * This runs when a user logs in for the first time on a device with existing guest data.
   */
  migrateLegacyData: (userId: string) => {
    // Keys for Guest (legacy or temp)
    const guestProfileKey = getUserKey(BASE_KEYS.PROFILE, 'temp');
    const guestLogsKey = getUserKey(BASE_KEYS.LOGS, 'temp');
    
    // Keys for New User
    const userProfileKey = getUserKey(BASE_KEYS.PROFILE, userId);
    const userLogsKey = getUserKey(BASE_KEYS.LOGS, userId);

    // If new user has NO local data, but Guest HAS data, migrate it.
    if (!localStorage.getItem(userProfileKey) && localStorage.getItem(guestProfileKey)) {
      console.log('Migrating guest profile to user:', userId);
      const guestProfile = getLocal(guestProfileKey, DEFAULT_PROFILE);
      setLocal(userProfileKey, { ...guestProfile, id: userId });
    }

    if (!localStorage.getItem(userLogsKey) && localStorage.getItem(guestLogsKey)) {
       console.log('Migrating guest logs to user:', userId);
       const guestLogs = getLocal(guestLogsKey, []);
       const migratedLogs = guestLogs.map((l: any) => ({ ...l, user_id: userId }));
       setLocal(userLogsKey, migratedLogs);
    }
  },

  getProfile: (userId: string): UserProfile => {
    return getLocal(getUserKey(BASE_KEYS.PROFILE, userId), { ...DEFAULT_PROFILE, id: userId });
  },
  
  saveProfile: async (userId: string, profile: UserProfile) => {
    // 1. Save Local
    setLocal(getUserKey(BASE_KEYS.PROFILE, userId), profile);

    // 2. Save Remote (if Supabase is connected)
    if (supabase && userId !== 'temp') {
      try {
        await supabase.from('profiles').upsert({
          id: userId,
          data: profile,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.error("Supabase profile save error", e);
      }
    }
  },

  getExercises: (): Exercise[] => {
    const custom = getLocal<Exercise[]>(BASE_KEYS.EXERCISES, []);
    return [...SEED_EXERCISES, ...custom];
  },

  saveCustomExercise: (exercise: Exercise) => {
    const current = getLocal<Exercise[]>(BASE_KEYS.EXERCISES, []);
    setLocal(BASE_KEYS.EXERCISES, [...current, exercise]);
  },

  getWorkoutLogs: (userId: string): WorkoutLog[] => {
    return getLocal(getUserKey(BASE_KEYS.LOGS, userId), []);
  },

  saveWorkoutLog: async (userId: string, log: WorkoutLog) => {
    const key = getUserKey(BASE_KEYS.LOGS, userId);
    
    // 1. Save Local
    const current = getLocal<WorkoutLog[]>(key, []);
    const index = current.findIndex(l => l.id === log.id);
    let updatedLogs;
    if (index >= 0) {
      updatedLogs = [...current];
      updatedLogs[index] = log;
    } else {
      updatedLogs = [...current, log];
    }
    setLocal(key, updatedLogs);

    // 2. Save Remote
    if (supabase && userId !== 'temp') {
      try {
        await supabase.from('workout_logs').upsert({
          id: log.id,
          user_id: userId,
          date: new Date(log.date).toISOString(),
          data: log
        });
      } catch (e) {
         console.error("Supabase log save error", e);
      }
    }
  },

  /**
   * Sync logic: 
   * 1. Check if remote has data.
   * 2. If remote has data, overwrite local (simple sync strategy for v1).
   * 3. If remote is empty but local has data (just migrated), push local to remote.
   */
  syncFromSupabase: async (userId: string) => {
    if (!supabase || !userId || userId === 'temp') return;

    // Run local migration first to ensure 'guest' data moves to 'user' slot locally
    storage.migrateLegacyData(userId);

    const userProfileKey = getUserKey(BASE_KEYS.PROFILE, userId);
    const userLogsKey = getUserKey(BASE_KEYS.LOGS, userId);

    try {
      // --- Profile Sync ---
      const { data: remoteProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (remoteProfile) {
        // Remote exists -> update local
        setLocal(userProfileKey, remoteProfile.data);
      } else if (!remoteProfile) {
        // Remote empty -> push local (Initial Cloud Sync)
        const localProfile = getLocal(userProfileKey, { ...DEFAULT_PROFILE, id: userId });
        await supabase.from('profiles').upsert({
          id: userId,
          data: localProfile
        });
      }

      // --- Logs Sync ---
      const { data: remoteLogs } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userId);

      const localLogs = getLocal<WorkoutLog[]>(userLogsKey, []);

      if (remoteLogs && remoteLogs.length > 0) {
        // Remote exists -> Merge/Overwrite local
        // Using a Map to deduplicate by ID, preferring Remote version
        const logMap = new Map<string, WorkoutLog>();
        
        // Add local first
        localLogs.forEach(l => logMap.set(l.id, l));
        
        // Overwrite with remote
        remoteLogs.forEach(r => {
           if (r.data) logMap.set(r.id, r.data);
        });

        const mergedList = Array.from(logMap.values());
        // Sort by date descending for storage/display
        mergedList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setLocal(userLogsKey, mergedList);
        
      } else if ((!remoteLogs || remoteLogs.length === 0) && localLogs.length > 0) {
        // Remote empty, Local has data -> Push all to Cloud
        console.log("Pushing local logs to Supabase...");
        const payload = localLogs.map(log => ({
          id: log.id,
          user_id: userId,
          date: new Date(log.date).toISOString(),
          data: log
        }));

        const { error } = await supabase.from('workout_logs').upsert(payload);
        if (error) console.error("Migration failed", error);
      }

    } catch (err) {
      console.error("Sync error:", err);
    }
  }
};
