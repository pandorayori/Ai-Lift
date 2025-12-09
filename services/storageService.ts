
import { Exercise, ExerciseType, MuscleGroup, UserProfile, WorkoutLog, WorkoutPlan, OneRepMax } from '../types';
import { supabase } from './supabase';

// --- Constants & Seed Data ---

const LEGACY_KEYS = {
  PROFILE: 'ai_lift_profile',
  LOGS: 'ai_lift_logs',
  EXERCISES: 'ai_lift_exercises',
  PLAN: 'ai_lift_plan'
};

let currentUserId = 'default_user';

// --- PROFESSIONAL EXERCISE LIBRARY SEED (NSCA-CPT Standard) ---
const SEED_EXERCISES: Exercise[] = [
  // --- CHEST ---
  {
    id: 'chest_bb_bench_flat',
    name: 'Barbell Bench Press',
    name_zh: '平板杠铃卧推',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Mid Chest',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    gif_url: '/assets/exercises/chest_bb_bench_flat.gif',
    tags: ['胸大肌', '自由器械', '复合动作'],
    notes: '五点接触（头、肩、臀、双脚），杠铃下放至乳头连线，肘部与躯干呈45-75度夹角。',
    instructions: 'Maintain 5 points of contact. Lower bar to nipple line. Keep elbows at 45-75 degrees.',
    instructions_zh: '保持头、肩、臀、双脚五点接触凳面和地面。杠铃下放至乳头连线位置。肘部内收。',
    ai_revision: true
  },
  {
    id: 'chest_bb_bench_incline',
    name: 'Incline Barbell Bench Press',
    name_zh: '上斜杠铃卧推',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Upper Chest',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80',
    gif_url: '/assets/exercises/chest_bb_bench_incline.gif',
    tags: ['上胸', '锁骨部', '自由器械'],
    notes: '凳面角度30-45度。落点位置比平板卧推略高（锁骨下方）。避免过度耸肩。',
    instructions: 'Bench angle 30-45 degrees. Lower bar to just below clavicle. Avoid shrugging.',
    instructions_zh: '将凳面调整至30-45度。杠铃落点在锁骨下方。避免过度耸肩。',
    ai_revision: true
  },
  {
    id: 'chest_db_press_flat',
    name: 'Dumbbell Bench Press',
    name_zh: '平板哑铃卧推',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Mid Chest',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80', // Placeholder
    gif_url: '/assets/exercises/chest_db_press_flat.gif',
    tags: ['单侧', '稳定性', '自由器械'],
    notes: '利用哑铃增加动作幅度。推起时略微内收但不相撞。保持手腕中立。',
    instructions: 'Use full range of motion. Converge slightly at top but do not clang weights.',
    instructions_zh: '充分下放哑铃以拉伸胸肌。推起时哑铃向中间靠拢但不相撞。',
    ai_revision: true
  },
  {
    id: 'chest_cable_fly_high',
    name: 'High-to-Low Cable Fly',
    name_zh: '高位绳索夹胸',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Lower Chest',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    gif_url: '/assets/exercises/chest_cable_fly_high.gif',
    tags: ['下胸', '孤立动作', '持续张力'],
    notes: '身体微前倾。手臂微屈固定角度，仅肩关节活动。向下拉向腰带前方。',
    instructions: 'Lean forward slightly. Keep elbows fixed. Pull handles down towards belt buckle.',
    instructions_zh: '身体微前倾。保持肘关节微屈固定。双手向下前方划弧，拉向腰带位置。',
    ai_revision: true
  },
  
  // --- BACK ---
  {
    id: 'back_pullup',
    name: 'Pull Up',
    name_zh: '引体向上',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Vertical Pull',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1598971639058-211a73287750?auto=format&fit=crop&w=800&q=80',
    gif_url: '/assets/exercises/back_pullup.gif',
    tags: ['背阔肌', '自重', '宽度'],
    notes: '沉肩（肩胛骨下回旋）。下巴过杠。核心收紧避免过度摆动。',
    instructions: 'Depress shoulders first. Pull chin over bar. Avoid excessive swinging.',
    instructions_zh: '先下沉肩胛骨，再用背部力量拉起身体。下巴过杠。核心收紧。',
    ai_revision: true
  },
  {
    id: 'back_lat_pulldown',
    name: 'Lat Pulldown',
    name_zh: '高位下拉',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Vertical Pull',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1598971639058-211a73287750?auto=format&fit=crop&w=800&q=80',
    gif_url: '/assets/exercises/back_lat_pulldown.gif',
    tags: ['背阔肌', '器械', '宽度'],
    notes: '躯干保持微后倾固定。下拉至上胸部。避免利用惯性后仰。',
    instructions: 'Keep torso fixed slightly back. Pull bar to upper chest. No momentum.',
    instructions_zh: '躯干微后倾并固定。将横杆拉至上胸部。不要借助惯性前后晃动。',
    ai_revision: true
  },
  {
    id: 'back_bb_row',
    name: 'Barbell Bent Over Row',
    name_zh: '杠铃俯身划船',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Horizontal Pull',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
    gif_url: '/assets/exercises/back_bb_row.gif',
    tags: ['厚度', '复合动作', '下背压力'],
    notes: '脊柱中立（不要龟背）。俯身角度约45度-平行。拉向小腹位置。',
    instructions: 'Neutral spine. Hinge at hips. Pull bar to lower abs/waist.',
    instructions_zh: '保持脊柱中立。髋部折叠俯身。将杠铃拉向小腹位置。',
    ai_revision: true
  },
  {
    id: 'back_seated_row',
    name: 'Seated Cable Row',
    name_zh: '坐姿绳索划船',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Horizontal Pull',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
    gif_url: '/assets/exercises/back_seated_row.gif',
    tags: ['中背', '菱形肌', '厚度'],
    notes: '膝盖微屈。拉起时挺胸挤压肩胛骨。回放时充分送肩。',
    instructions: 'Knees slightly bent. Chest up at contraction. Protract shoulders on release.',
    instructions_zh: '膝盖微屈。拉回时挺胸并挤压肩胛骨。回放时主动送肩拉伸背部。',
    ai_revision: true
  },

  // --- LEGS ---
  {
    id: 'legs_sq_highbar',
    name: 'Barbell Back Squat',
    name_zh: '杠铃颈后深蹲',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Quads',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e04ca?auto=format&fit=crop&w=800&q=80',
    gif_url: '/assets/exercises/legs_sq_highbar.gif',
    tags: ['力量之王', '股四头肌', '复合动作'],
    notes: '髋膝联动。膝盖指向脚尖方向（避免内扣）。下蹲至大腿至少平行地面。',
    instructions: 'Break at hips and knees simultaneously. Knees track over toes. Depth to parallel.',
    instructions_zh: '髋膝同时折叠。膝盖对准脚尖方向。下蹲至大腿平行或低于地面。',
    ai_revision: true
  },
  {
    id: 'legs_leg_press',
    name: 'Leg Press',
    name_zh: '腿举/倒蹬',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Quads',
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e04ca?auto=format&fit=crop&w=800&q=80',
    gif_url: '/assets/exercises/legs_leg_press.gif',
    tags: ['大重量', '股四头肌', '器械'],
    notes: '背部紧贴靠背（防止骨盆翻转）。推起时膝盖不要锁死。',
    instructions: 'Keep lower back flat against pad. Do not lock out knees at top.',
    instructions_zh: '下背部紧贴靠垫（避免屁股离座）。推起至顶端时膝盖保持微屈，不要锁死。',
    ai_revision: true
  },
  {
    id: 'legs_rdl_bb',
    name: 'Romanian Deadlift',
    name_zh: '罗马尼亚硬拉',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Hamstrings',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1567598508481-65985588e295?auto=format&fit=crop&w=800&q=80',
    gif_url: '/assets/exercises/legs_rdl_bb.gif',
    tags: ['腘绳肌', '后链', '伸髋'],
    notes: '微屈膝固定。核心收紧。屁股向后推（Hip Hinge）。杠铃贴腿上下。',
    instructions: 'Soft knees. Hinge hips back. Keep bar close to legs. Neutral spine.',
    instructions_zh: '膝盖微屈固定。核心收紧。通过屁股向后推来俯身。杠铃紧贴腿部。',
    ai_revision: true
  },
  {
    id: 'legs_lunges',
    name: 'Walking Lunge',
    name_zh: '箭步蹲行走',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Quads',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e04ca?auto=format&fit=crop&w=800&q=80',
    gif_url: '/assets/exercises/legs_lunges.gif',
    tags: ['单腿', '功能性', '臀腿'],
    notes: '躯干垂直。后膝下沉接近地面。前脚跟发力推起。',
    instructions: 'Torso upright. Rear knee close to ground. Drive through front heel.',
    instructions_zh: '躯干保持垂直。后腿膝盖下沉接近地面。用前脚后跟发力站起。',
    ai_revision: true
  },

  // --- SHOULDERS ---
  {
    id: 'shoulder_ohp_bb',
    name: 'Overhead Press',
    name_zh: '杠铃站姿推举',
    target_muscle: MuscleGroup.SHOULDERS,
    sub_category: 'Front Delt',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1532029837206-abbe2b7a4bdd?auto=format&fit=crop&w=800&q=80',
    gif_url: '/assets/exercises/shoulder_ohp_bb.gif',
    tags: ['前束', '核心', '力量'],
    notes: '夹臀收腹。杠铃直上直下（头部避让）。推至头顶上方锁定。',
    instructions: 'Squeeze glutes and abs. Bar path vertical (move head out of way). Lockout overhead.',
    instructions_zh: '夹紧臀部和腹部。杠铃垂直轨迹推起（头部前后避让）。在头顶上方锁定。',
    ai_revision: true
  },
  {
    id: 'shoulder_lat_raise',
    name: 'Dumbbell Lateral Raise',
    name_zh: '哑铃侧平举',
    target_muscle: MuscleGroup.SHOULDERS,
    sub_category: 'Side Delt',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1532029837206-abbe2b7a4bdd?auto=format&fit=crop&w=800&q=80',
    gif_url: '/assets/exercises/shoulder_lat_raise.gif',
    tags: ['中束', '宽肩', '孤立'],
    notes: '肘部微屈。以肘带手向侧上方举起。不要耸肩。小指略微高于拇指（倒水状）可加强刺激。',
    instructions: 'Lead with elbows. Slight bend in arms. Do not shrug. Lift to shoulder height.',
    instructions_zh: '肘部微屈。用肘部带动大臂向侧上方抬起。不要耸肩。',
    ai_revision: true
  },
  {
    id: 'shoulder_face_pull',
    name: 'Cable Face Pull',
    name_zh: '绳索面拉',
    target_muscle: MuscleGroup.SHOULDERS,
    sub_category: 'Rear Delt',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1532029837206-abbe2b7a4bdd?auto=format&fit=crop&w=800&q=80',
    gif_url: '/assets/exercises/shoulder_face_pull.gif',
    tags: ['后束', '肩袖健康', '体态'],
    notes: '拉向额头/眼睛位置。末端外旋手臂（双手向后）。控制回放。',
    instructions: 'Pull rope to forehead. Externally rotate at end range. Squeeze rear delts.',
    instructions_zh: '将绳索拉向额头位置。动作末端做外旋动作（双手向后打开）。',
    ai_revision: true
  },

  // --- ARMS ---
  {
    id: 'arm_bicep_curl_bb',
    name: 'Barbell Curl',
    name_zh: '杠铃弯举',
    target_muscle: MuscleGroup.ARMS,
    sub_category: 'Biceps',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    gif_url: '/assets/exercises/arm_bicep_curl_bb.gif',
    tags: ['二头肌', '基础', '自由器械'],
    notes: '大臂夹紧躯干。仅前臂移动。不要利用躯干晃动借力。',
    instructions: 'Pin elbows to sides. Only forearms move. No swinging.',
    instructions_zh: '大臂夹紧身体两侧。仅前臂移动。不要借助身体晃动发力。',
    ai_revision: true
  },
  {
    id: 'arm_tricep_pushdown',
    name: 'Cable Pushdown',
    name_zh: '绳索下压',
    target_muscle: MuscleGroup.ARMS,
    sub_category: 'Triceps',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    gif_url: '/assets/exercises/arm_tricep_pushdown.gif',
    tags: ['三头肌', '外侧头', '器械'],
    notes: '大臂垂直地面固定。向下压直至手臂伸直。控制回放至胸口高度。',
    instructions: 'Keep upper arms vertical. Extend elbows fully. Control negative.',
    instructions_zh: '大臂垂直地面且固定。用力下压至手臂完全伸直。',
    ai_revision: true
  },

  // --- CORE ---
  {
    id: 'core_plank',
    name: 'Plank',
    name_zh: '平板支撑',
    target_muscle: MuscleGroup.CORE,
    sub_category: 'Upper Abs',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&w=800&q=80',
    gif_url: '/assets/exercises/core_plank.gif',
    tags: ['核心稳定性', '抗伸展', '自重'],
    notes: '身体呈直线。收紧臀部和腹部（骨盆后倾）。不要塌腰或撅屁股。',
    instructions: 'Straight line head to heels. Squeeze glutes and abs. No sagging hips.',
    instructions_zh: '头背臀呈一条直线。用力收紧臀部和腹部。不要塌腰。',
    ai_revision: true
  },
  {
    id: 'core_leg_raise',
    name: 'Hanging Leg Raise',
    name_zh: '悬垂举腿',
    target_muscle: MuscleGroup.CORE,
    sub_category: 'Lower Abs',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&w=800&q=80',
    gif_url: '/assets/exercises/core_leg_raise.gif',
    tags: ['下腹', '悬垂', '高难度'],
    notes: '卷动骨盆（不仅仅是抬腿）。控制下放速度避免摆动。',
    instructions: 'Flex pelvis up (not just hip flexion). Control descent to avoid swinging.',
    instructions_zh: '主要靠卷动骨盆来带动腿部，而不仅仅是屈髋。控制下放避免摆动。',
    ai_revision: true
  }
];

// Default 1RMs
const DEFAULT_1RMS: OneRepMax[] = [
  { id: 'sq', name: 'Squat', weight: 0, goal_weight: 0, is_default: true },
  { id: 'bp', name: 'Bench Press', weight: 0, goal_weight: 0, is_default: true },
  { id: 'dl', name: 'Deadlift', weight: 0, goal_weight: 0, is_default: true }
];

const DEFAULT_PROFILE: UserProfile = {
  id: 'user_1',
  name: 'Lifter',
  weight: 75,
  height: 175,
  language: 'zh', // Default Chinese
  oneRepMaxes: DEFAULT_1RMS,
  goals: {
    target_weight: 0,
    target_body_fat: 0
  }
};

// --- Helper Functions ---

const getKeys = () => {
  if (currentUserId === 'default_user') {
    return LEGACY_KEYS;
  }
  return {
    PROFILE: `ai_lift_profile_${currentUserId}`,
    LOGS: `ai_lift_logs_${currentUserId}`,
    EXERCISES: `ai_lift_exercises_${currentUserId}`,
    PLAN: `ai_lift_plan_${currentUserId}`
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
    const previousUser = currentUserId;
    currentUserId = userId;

    if (previousUser === 'default_user' && userId !== 'default_user') {
      const newKeys = getKeys();
      const existingProfile = localStorage.getItem(newKeys.PROFILE);
      
      if (!existingProfile) {
        const legacyProfile = localStorage.getItem(LEGACY_KEYS.PROFILE);
        const legacyLogs = localStorage.getItem(LEGACY_KEYS.LOGS);
        const legacyPlan = localStorage.getItem(LEGACY_KEYS.PLAN);
        
        if (legacyProfile) localStorage.setItem(newKeys.PROFILE, legacyProfile);
        if (legacyLogs) localStorage.setItem(newKeys.LOGS, legacyLogs);
        if (legacyPlan) localStorage.setItem(newKeys.PLAN, legacyPlan);
      }
    }
  },

  getProfile: (): UserProfile => {
    const keys = getKeys();
    const profile = getLocal(keys.PROFILE, DEFAULT_PROFILE);
    
    // Migration: Ensure new fields exist if loading an old profile
    if (!profile.oneRepMaxes) {
      profile.oneRepMaxes = DEFAULT_1RMS;
    }
    if (!profile.goals) {
      profile.goals = { target_weight: 0, target_body_fat: 0 };
    }
    
    return profile;
  },
  
  saveProfile: async (profile: UserProfile) => {
    const keys = getKeys();
    setLocal(keys.PROFILE, profile);
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
    // Re-inject seed exercises if storage is empty to ensure library availability
    if (!localStorage.getItem(keys.EXERCISES)) {
       return SEED_EXERCISES;
    }
    const custom = getLocal<Exercise[]>(keys.EXERCISES, []);
    // Merge SEED with Custom, but prefer SEED for existing IDs to get updates
    const seedMap = new Map(SEED_EXERCISES.map(e => [e.id, e]));
    const customFiltered = custom.filter(c => !seedMap.has(c.id));
    return [...SEED_EXERCISES, ...customFiltered];
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
    const current = getLocal<WorkoutLog[]>(keys.LOGS, []);
    const updatedLogs = current.filter(l => l.id !== logId);
    setLocal(keys.LOGS, updatedLogs);

    if (supabase && currentUserId !== 'default_user') {
      try {
        await supabase.from('workout_logs').delete().eq('id', logId);
      } catch (e) {
        console.error("Supabase log delete error", e);
      }
    }
  },

  // --- Plan Methods ---

  getActivePlan: (): WorkoutPlan | null => {
    const keys = getKeys();
    return getLocal<WorkoutPlan | null>(keys.PLAN, null);
  },

  saveActivePlan: (plan: WorkoutPlan) => {
    const keys = getKeys();
    setLocal(keys.PLAN, plan);
  },

  deleteActivePlan: () => {
    const keys = getKeys();
    localStorage.removeItem(keys.PLAN);
  },

  syncFromSupabase: async () => {
    if (!supabase || currentUserId === 'default_user') return;
    const keys = getKeys();

    try {
      const { data: remoteProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserId)
        .single();

      if (remoteProfile) {
        setLocal(keys.PROFILE, remoteProfile.data);
      } else if (!remoteProfile && !profileError) {
        const localProfile = getLocal(keys.PROFILE, DEFAULT_PROFILE);
        await supabase.from('profiles').upsert({
          id: currentUserId,
          data: localProfile
        });
      }

      const { data: remoteLogs } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', currentUserId)
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
        const payload = localLogs.map(log => ({
          id: log.id,
          user_id: currentUserId,
          date: new Date(log.date).toISOString(),
          data: log
        }));
        await supabase.from('workout_logs').upsert(payload);
      }
    } catch (err) {
      console.error("Sync error:", err);
    }
  },

  clearAllUserData: async () => {
    const keys = getKeys();
    localStorage.removeItem(keys.PROFILE);
    localStorage.removeItem(keys.LOGS);
    localStorage.removeItem(keys.EXERCISES);
    localStorage.removeItem(keys.PLAN);
    localStorage.removeItem(LEGACY_KEYS.PROFILE);
    localStorage.removeItem(LEGACY_KEYS.LOGS);
    localStorage.removeItem(LEGACY_KEYS.EXERCISES);
    localStorage.removeItem(LEGACY_KEYS.PLAN);

    if (supabase && currentUserId !== 'default_user') {
      try {
        await supabase.from('workout_logs').delete().eq('user_id', currentUserId);
        await supabase.from('profiles').delete().eq('id', currentUserId);
      } catch (e) {
        console.error("Remote wipe failed", e);
      }
    }
  }
};
