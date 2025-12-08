import { Exercise, ExerciseType, MuscleGroup, UserProfile, WorkoutLog } from '../types';
import { supabase } from './supabase';

// --- Constants & Seed Data ---

const KEYS = {
  PROFILE: 'ai_lift_profile',
  LOGS: 'ai_lift_logs',
  EXERCISES: 'ai_lift_exercises'
};

const USER_ID = 'default_user'; // For single-user mode with Anon key

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

const getLocal = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const setLocal = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// --- Storage Service ---

export const storage = {
  getProfile: (): UserProfile => getLocal(KEYS.PROFILE, DEFAULT_PROFILE),
  
  saveProfile: async (profile: UserProfile) => {
    // 1. Save Local (Fast)
    setLocal(KEYS.PROFILE, profile);

    // 2. Save Remote (Async)
    if (supabase) {
      try {
        await supabase.from('profiles').upsert({
          id: USER_ID,
          data: profile,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.error("Supabase profile save error", e);
      }
    }
  },

  getExercises: (): Exercise[] => {
    const custom = getLocal<Exercise[]>(KEYS.EXERCISES, []);
    return [...SEED_EXERCISES, ...custom];
  },

  saveCustomExercise: (exercise: Exercise) => {
    const current = getLocal<Exercise[]>(KEYS.EXERCISES, []);
    setLocal(KEYS.EXERCISES, [...current, exercise]);
    // Note: We are currently not syncing custom exercises definitions to keep it simple,
    // but they are stored in workout logs.
  },

  getWorkoutLogs: (): WorkoutLog[] => getLocal(KEYS.LOGS, []),

  saveWorkoutLog: async (log: WorkoutLog) => {
    // 1. Save Local
    const current = getLocal<WorkoutLog[]>(KEYS.LOGS, []);
    // Check if update or new
    const index = current.findIndex(l => l.id === log.id);
    let updatedLogs;
    if (index >= 0) {
      updatedLogs = [...current];
      updatedLogs[index] = log;
    } else {
      updatedLogs = [...current, log];
    }
    setLocal(KEYS.LOGS, updatedLogs);

    // 2. Save Remote
    if (supabase) {
      try {
        await supabase.from('workout_logs').upsert({
          id: log.id,
          user_id: USER_ID,
          date: new Date(log.date).toISOString(), // Ensure proper timestamp format for SQL
          data: log
        });
      } catch (e) {
         console.error("Supabase log save error", e);
      }
    }
  },

  // --- Hybrid Sync Logic ---
  syncFromSupabase: async () => {
    if (!supabase) return;

    try {
      // 1. Sync Profile
      const { data: remoteProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', USER_ID)
        .single();

      if (remoteProfile) {
        // Remote exists, update local
        setLocal(KEYS.PROFILE, remoteProfile.data);
      } else if (!remoteProfile && !profileError) {
        // Remote empty, push local (Initialization)
        const localProfile = getLocal(KEYS.PROFILE, DEFAULT_PROFILE);
        await supabase.from('profiles').upsert({
          id: USER_ID,
          data: localProfile
        });
      }

      // 2. Sync Logs
      const { data: remoteLogs, error: logsError } = await supabase
        .from('workout_logs')
        .select('*')
        .order('date', { ascending: true });

      const localLogs = getLocal<WorkoutLog[]>(KEYS.LOGS, []);

      if (remoteLogs && remoteLogs.length > 0) {
        // Merge strategy:
        // We trust remote as the source of truth for existing IDs, 
        // but we keep local-only logs (pending sync).
        // For simplicity in this v1: We merge lists based on ID.
        
        const mergedMap = new Map();
        
        // Add local first
        localLogs.forEach(l => mergedMap.set(l.id, l));
        
        // Overwrite/Add remote
        remoteLogs.forEach(r => {
           if (r.data) mergedMap.set(r.id, r.data);
        });

        const mergedList = Array.from(mergedMap.values());
        // Sort by date
        mergedList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setLocal(KEYS.LOGS, mergedList);
        
      } else if ((!remoteLogs || remoteLogs.length === 0) && localLogs.length > 0) {
        // --- INITIAL MIGRATION ---
        // Remote is empty, but Local has data. 
        // User just connected DB. Upload everything.
        console.log("Performing initial migration to Supabase...");
        
        const payload = localLogs.map(log => ({
          id: log.id,
          user_id: USER_ID,
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
