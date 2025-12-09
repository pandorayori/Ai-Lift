import { Exercise, ExerciseType, MuscleGroup, UserProfile, WorkoutLog } from '../types';
import { supabase } from './supabase';

// --- Constants & Seed Data ---

const LEGACY_KEYS = {
  PROFILE: 'ai_lift_profile',
  LOGS: 'ai_lift_logs',
  EXERCISES: 'ai_lift_exercises'
};

let currentUserId = 'default_user';

// --- PROFESSIONAL EXERCISE LIBRARY SEED ---
// Images are sourced from Unsplash. 
// gif_url is reserved. To enable animation, replace the empty string with a valid URL.
const SEED_EXERCISES: Exercise[] = [
  // --- CHEST ---
  {
    id: 'chest_1',
    name: 'Barbell Bench Press',
    name_zh: '杠铃平板卧推',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80',
    gif_url: '', 
    instructions: 'Lie on bench, retract scapula. Lower bar to mid-chest with control, press up until arms extended.',
    instructions_zh: '仰卧于卧推凳，肩胛骨后收。控制杠铃下放至胸部中部，发力推起直至手臂伸直。'
  },
  {
    id: 'chest_2',
    name: 'Incline Dumbbell Press',
    name_zh: '上斜哑铃卧推',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80',
    gif_url: '',
    instructions: 'Set bench to 30-45 degrees. Press dumbbells overhead, focusing on upper chest.',
    instructions_zh: '将凳面调整至30-45度。向上推举哑铃，集中意念感受上胸发力。'
  },
  {
    id: 'chest_3',
    name: 'Push-Up',
    name_zh: '俯卧撑',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1598971639058-211a74a96ded?auto=format&fit=crop&w=600&q=80',
    gif_url: '',
    instructions: 'Keep body in a straight line. Lower chest to floor, push back up.',
    instructions_zh: '保持身体呈一条直线。屈肘下放胸部贴近地面，然后推起。'
  },
  {
    id: 'chest_4',
    name: 'Cable Fly',
    name_zh: '绳索夹胸',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1534367347848-9635e98544a8?auto=format&fit=crop&w=600&q=80',
    gif_url: '',
    instructions: 'Stand with split stance. Bring handles together in a hugging motion.',
    instructions_zh: '弓步站立。手臂微屈，做类似拥抱的动作将把手拉至胸前。'
  },

  // --- BACK ---
  {
    id: 'back_1',
    name: 'Deadlift',
    name_zh: '传统硬拉',
    target_muscle: MuscleGroup.BACK,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1603287681836-e174ce5b7c4d?auto=format&fit=crop&w=600&q=80',
    gif_url: '',
    instructions: 'Hinge at hips, flat back. Drive through heels to stand up straight.',
    instructions_zh: '髋部折叠，背部挺直。脚跟发力站起，完全伸展髋部。'
  },
  {
    id: 'back_2',
    name: 'Pull-Up',
    name_zh: '引体向上',
    target_muscle: MuscleGroup.BACK,
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=600&q=80',
    gif_url: '',
    instructions: 'Grip bar wider than shoulders. Pull chest to bar, squeezing lats.',
    instructions_zh: '宽握单杠。将胸部拉向横杠，顶峰收缩背阔肌。'
  },
  {
    id: 'back_3',
    name: 'Seated Cable Row',
    name_zh: '坐姿绳索划船',
    target_muscle: MuscleGroup.BACK,
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=600&q=80', // Placeholder
    gif_url: '',
    instructions: 'Keep back straight, pull handle to abdomen, retract scapula.',
    instructions_zh: '保持背部挺直，将把手拉至腹部，收缩肩胛骨。'
  },
  {
    id: 'back_4',
    name: 'Single Arm Dumbbell Row',
    name_zh: '单臂哑铃划船',
    target_muscle: MuscleGroup.BACK,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?auto=format&fit=crop&w=600&q=80',
    gif_url: '',
    instructions: 'Support on bench. Pull dumbbell to hip, keeping elbow close to body.',
    instructions_zh: '支撑于凳面。将哑铃拉向髋部，手肘紧贴身体。'
  },

  // --- LEGS ---
  {
    id: 'legs_1',
    name: 'Barbell Back Squat',
    name_zh: '杠铃颈后深蹲',
    target_muscle: MuscleGroup.LEGS,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e01f5?auto=format&fit=crop&w=600&q=80',
    gif_url: '',
    instructions: 'Feet shoulder-width. Break at hips and knees, squat deep, drive up.',
    instructions_zh: '双脚与肩同宽。屈髋屈膝下蹲，蹲至大腿低于水平面，发力站起。'
  },
  {
    id: 'legs_2',
    name: 'Leg Press',
    name_zh: '腿举倒蹬',
    target_muscle: MuscleGroup.LEGS,
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    gif_url: '',
    instructions: 'Place feet on platform. Lower weight until knees are 90 degrees, push back.',
    instructions_zh: '双脚置于踏板。下放重量至膝盖呈90度，蹬起（膝盖不要锁死）。'
  },
  {
    id: 'legs_3',
    name: 'Romanian Deadlift',
    name_zh: '罗马尼亚硬拉',
    target_muscle: MuscleGroup.LEGS,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1567598508481-65985588e295?auto=format&fit=crop&w=600&q=80',
    gif_url: '',
    instructions: 'Slight knee bend. Hinge at hips pushing butt back, feel stretch in hamstrings.',
    instructions_zh: '膝盖微屈。屈髋向后推臀部，感受腘绳肌的拉伸感。'
  },
  {
    id: 'legs_4',
    name: 'Walking Lunge',
    name_zh: '行走箭步蹲',
    target_muscle: MuscleGroup.LEGS,
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1434608519344-49d77a699ded?auto=format&fit=crop&w=600&q=80',
    gif_url: '',
    instructions: 'Step forward, lower back knee to ground. Keep torso upright.',
    instructions_zh: '向前跨步，下蹲至后膝贴近地面。保持躯干挺直。'
  },

  // --- SHOULDERS ---
  {
    id: 'shoulder_1',
    name: 'Overhead Press',
    name_zh: '杠铃站姿推举',
    target_muscle: MuscleGroup.SHOULDERS,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1532029837066-805e451672a4?auto=format&fit=crop&w=600&q=80',
    gif_url: '',
    instructions: 'Press bar vertically from collarbone to full extension overhead.',
    instructions_zh: '将杠铃从锁骨位置垂直推过头顶至手臂伸直。'
  },
  {
    id: 'shoulder_2',
    name: 'Dumbbell Lateral Raise',
    name_zh: '哑铃侧平举',
    target_muscle: MuscleGroup.SHOULDERS,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80',
    gif_url: '',
    instructions: 'Raise dumbbells to sides until arms are parallel to floor. Lead with elbows.',
    instructions_zh: '向身体两侧举起哑铃至手臂平行于地面。手肘引导发力。'
  },
  {
    id: 'shoulder_3',
    name: 'Face Pull',
    name_zh: '面拉',
    target_muscle: MuscleGroup.SHOULDERS,
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&w=600&q=80', // generic gym
    gif_url: '',
    instructions: 'Pull rope to forehead, driving elbows back and externally rotating shoulders.',
    instructions_zh: '将绳索拉向额头，手肘向后打开，做肩外旋动作。'
  },

  // --- ARMS ---
  {
    id: 'arms_1',
    name: 'Barbell Curl',
    name_zh: '杠铃弯举',
    target_muscle: MuscleGroup.ARMS,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
    gif_url: '',
    instructions: 'Keep elbows at sides. Curl bar up towards chest, squeeze biceps.',
    instructions_zh: '大臂紧贴身体两侧。向上弯举杠铃至胸前，收缩肱二头肌。'
  },
  {
    id: 'arms_2',
    name: 'Triceps Pushdown',
    name_zh: '绳索下压',
    target_muscle: MuscleGroup.ARMS,
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80', // generic gym
    gif_url: '',
    instructions: 'Keep elbows locked at sides. Push handle down until arms straight.',
    instructions_zh: '大臂固定于身体两侧。向下压把手直至手臂完全伸直。'
  },
  {
    id: 'arms_3',
    name: 'Hammer Curl',
    name_zh: '锤式弯举',
    target_muscle: MuscleGroup.ARMS,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80', // generic
    gif_url: '',
    instructions: 'Neutral grip (palms facing each other). Curl dumbbells up.',
    instructions_zh: '中立握法（掌心相对）。向上弯举哑铃。'
  },

  // --- CORE ---
  {
    id: 'core_1',
    name: 'Plank',
    name_zh: '平板支撑',
    target_muscle: MuscleGroup.CORE,
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&w=600&q=80',
    gif_url: '',
    instructions: 'Hold straight body position supported by forearms and toes.',
    instructions_zh: '以前臂和脚尖支撑，保持身体呈一条直线静止。'
  },
  {
    id: 'core_2',
    name: 'Hanging Leg Raise',
    name_zh: '悬垂举腿',
    target_muscle: MuscleGroup.CORE,
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=600&q=80',
    gif_url: '',
    instructions: 'Hang from bar. Lift legs until parallel to floor or higher.',
    instructions_zh: '悬垂于横杠。向上举起双腿直至平行于地面或更高。'
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