import { Exercise, ExerciseType, MuscleGroup, UserProfile, WorkoutLog } from '../types';
import { supabase } from './supabase';

// --- Constants & Seed Data ---

const LEGACY_KEYS = {
  PROFILE: 'ai_lift_profile',
  LOGS: 'ai_lift_logs',
  EXERCISES: 'ai_lift_exercises'
};

let currentUserId = 'default_user';

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
  id: 'user_1',
  name: 'Lifter',
  weight: 75,
  height: 175,
  language: 'en'
};

// --- Helper Functions ---

const getKeys = () => {
  // If default user, use legacy keys to preserve data for users before auth was added
  // or simple fallback.
  // Actually, to support migration:
  // If we are logged in (UUID), we use `ai_lift_profile_${uuid}`
  if (currentUserId === 'default_user') {
    return LEGACY_KEYS;
  }
  return {
    PROFILE: `ai_lift_profile_${currentUserId}`,
    LOGS: `ai_lift_logs_${currentUserId}`,
    EXERCISES: `ai_lift_exercises_${currentUserId}`
  };
};

const getLocal = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const setLocal = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// --- Storage Service ---

export const storage = {
  setStorageUser: (userId: string) => {
    // If switching from default to a real user, we might want to migrate data locally first
    const previousUser = currentUserId;
    currentUserId = userId;

    if (previousUser === 'default_user' && userId !== 'default_user') {
      // Check if new user has data
      const newKeys = getKeys();
      const existingProfile = localStorage.getItem(newKeys.PROFILE);
      
      if (!existingProfile) {
        // New user has no local data, migrate legacy data if exists
        const legacyProfile = localStorage.getItem(LEGACY_KEYS.PROFILE);
        const legacyLogs = localStorage.getItem(LEGACY_KEYS.LOGS);
        
        if (legacyProfile) {
          console.log('Migrating legacy profile to user scope');
          localStorage.setItem(newKeys.PROFILE, legacyProfile);
        }
        if (legacyLogs) {
           console.log('Migrating legacy logs to user scope');
           localStorage.setItem(newKeys.LOGS, legacyLogs);
        }
      }
    }
  },

  getProfile: (): UserProfile => {
    const keys = getKeys();
    return getLocal(keys.PROFILE, DEFAULT_PROFILE);
  },
  
  saveProfile: async (profile: UserProfile) => {
    const keys = getKeys();
    // 1. Save Local
    setLocal(keys.PROFILE, profile);

    // 2. Save Remote
    if (supabase && currentUserId !== 'default_user') {
      try {
        await supabase.from('profiles').upsert({
          id: currentUserId,
          data: profile,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.error("Supabase profile save error", e);
      }
    }
  },

  getExercises: (): Exercise[] => {
    const keys = getKeys();
    const custom = getLocal<Exercise[]>(keys.EXERCISES, []);
    return [...SEED_EXERCISES, ...custom];
  },

  saveCustomExercise: (exercise: Exercise) => {
    const keys = getKeys();
    const current = getLocal<Exercise[]>(keys.EXERCISES, []);
    setLocal(keys.EXERCISES, [...current, exercise]);
  },

  getWorkoutLogs: (): WorkoutLog[] => {
    const keys = getKeys();
    return getLocal(keys.LOGS, []);
  },

  saveWorkoutLog: async (log: WorkoutLog) => {
    const keys = getKeys();
    // 1. Save Local
    const current = getLocal<WorkoutLog[]>(keys.LOGS, []);
    const index = current.findIndex(l => l.id === log.id);
    let updatedLogs;
    if (index >= 0) {
      updatedLogs = [...current];
      updatedLogs[index] = log;
    } else {
      updatedLogs = [...current, log];
    }
    setLocal(keys.LOGS, updatedLogs);

    // 2. Save Remote
    if (supabase && currentUserId !== 'default_user') {
      try {
        await supabase.from('workout_logs').upsert({
          id: log.id,
          user_id: currentUserId,
          date: new Date(log.date).toISOString(),
          data: log
        });
      } catch (e) {
         console.error("Supabase log save error", e);
      }
    }
  },

  deleteWorkoutLog: async (logId: string) => {
    const keys = getKeys();
    // 1. Delete Local
    const current = getLocal<WorkoutLog[]>(keys.LOGS, []);
    const updatedLogs = current.filter(l => l.id !== logId);
    setLocal(keys.LOGS, updatedLogs);

    // 2. Delete Remote
    if (supabase && currentUserId !== 'default_user') {
      try {
        await supabase.from('workout_logs').delete().eq('id', logId);
      } catch (e) {
        console.error("Supabase log delete error", e);
      }
    }
  },

  syncFromSupabase: async () => {
    if (!supabase || currentUserId === 'default_user') return;

    const keys = getKeys();

    try {
      // 1. Sync Profile
      const { data: remoteProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserId)
        .single();

      if (remoteProfile) {
        setLocal(keys.PROFILE, remoteProfile.data);
      } else if (!remoteProfile && !profileError) {
        // Remote empty, push local (Initial Sync)
        const localProfile = getLocal(keys.PROFILE, DEFAULT_PROFILE);
        await supabase.from('profiles').upsert({
          id: currentUserId,
          data: localProfile
        });
      }

      // 2. Sync Logs
      const { data: remoteLogs } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', currentUserId) // STRICTLY filter by user
        .order('date', { ascending: true });

      const localLogs = getLocal<WorkoutLog[]>(keys.LOGS, []);

      if (remoteLogs && remoteLogs.length > 0) {
        const mergedMap = new Map();
        localLogs.forEach(l => mergedMap.set(l.id, l));
        remoteLogs.forEach(r => {
           if (r.data) mergedMap.set(r.id, r.data);
        });

        const mergedList = Array.from(mergedMap.values());
        mergedList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setLocal(keys.LOGS, mergedList);
        
      } else if ((!remoteLogs || remoteLogs.length === 0) && localLogs.length > 0) {
        // Initial Migration for this specific user
        console.log(`Performing initial migration for user ${currentUserId}...`);
        
        const payload = localLogs.map(log => ({
          id: log.id,
          user_id: currentUserId,
          date: new Date(log.date).toISOString(),
          data: log
        }));

        const { error } = await supabase.from('workout_logs').upsert(payload);
        if (error) console.error("Migration failed", error);
        else console.log("Migration successful");
      }

    } catch (err) {
      console.error("Sync error:", err);
    }
  }
};