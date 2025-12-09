
import { Exercise, ExerciseType, MuscleGroup, UserProfile, WorkoutLog, WorkoutPlan, OneRepMax, ChatMessage } from '../types';
import { supabase } from './supabase';

// --- Constants ---

const LEGACY_KEYS = {
  PROFILE: 'ai_lift_profile',
  LOGS: 'ai_lift_logs',
  EXERCISES: 'ai_lift_exercises',
  PLAN: 'ai_lift_plan'
};

let currentUserId = 'default_user';

// --- SEED DATA (EXHAUSTIVE LIBRARY) ---
const SEED_EXERCISES: Exercise[] = [
  // --- A. CHEST (胸部) ---
  // A1. Barbell
  { id: 'chest_bb_bench_flat', name: 'Barbell Bench Press', name_zh: '平板杠铃卧推', target_muscle: MuscleGroup.CHEST, sub_category: 'Chest', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Lie on bench, lower bar to chest, press up.', tags: ['compound', 'push'] },
  { id: 'chest_bb_bench_incline', name: 'Incline Barbell Bench Press', name_zh: '上斜杠铃卧推', target_muscle: MuscleGroup.CHEST, sub_category: 'Upper Chest', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Incline bench 30-45 degrees. Press bar to upper chest.' },
  { id: 'chest_bb_bench_decline', name: 'Decline Barbell Bench Press', name_zh: '下斜杠铃卧推', target_muscle: MuscleGroup.CHEST, sub_category: 'Lower Chest', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Decline bench. Target lower pecs.' },
  { id: 'chest_bb_bench_wide', name: 'Wide Grip Bench Press', name_zh: '宽距平板卧推', target_muscle: MuscleGroup.CHEST, sub_category: 'Chest', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Grip wider than shoulder width. Limits range of motion, emphasizes chest stretch.' },
  { id: 'chest_bb_bench_close', name: 'Close Grip Bench Press', name_zh: '窄距平板卧推', target_muscle: MuscleGroup.CHEST, sub_category: 'Chest', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Hands inside shoulder width. Focus on triceps and inner chest.' },
  { id: 'chest_bb_guillotine', name: 'Guillotine Press', name_zh: '颈前断头台卧推', target_muscle: MuscleGroup.CHEST, sub_category: 'Upper Chest', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Lower bar to neck (carefully). Maximum chest stretch. Use spotter.' },
  { id: 'chest_bb_floor', name: 'Barbell Floor Press', name_zh: '地面杠铃卧推', target_muscle: MuscleGroup.CHEST, sub_category: 'Chest', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Lie on floor. Partial range of motion, focuses on lockout.' },
  { id: 'chest_bb_reverse', name: 'Reverse Grip Bench Press', name_zh: '反手杠铃卧推', target_muscle: MuscleGroup.CHEST, sub_category: 'Upper Chest', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Supinated grip. Significantly activates upper chest.' },

  // A2. Dumbbell
  { id: 'chest_db_press_flat', name: 'Flat Dumbbell Press', name_zh: '平板哑铃卧推', target_muscle: MuscleGroup.CHEST, sub_category: 'Chest', type: ExerciseType.DUMBBELL, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Press dumbbells up, converging at top.' },
  { id: 'chest_db_press_incline', name: 'Incline Dumbbell Press', name_zh: '上斜哑铃卧推', target_muscle: MuscleGroup.CHEST, sub_category: 'Upper Chest', type: ExerciseType.DUMBBELL, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Incline bench. Press up.' },
  { id: 'chest_db_press_decline', name: 'Decline Dumbbell Press', name_zh: '下斜哑铃卧推', target_muscle: MuscleGroup.CHEST, sub_category: 'Lower Chest', type: ExerciseType.DUMBBELL, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Decline bench press.' },
  { id: 'chest_db_fly_flat', name: 'Flat Dumbbell Fly', name_zh: '平板哑铃飞鸟', target_muscle: MuscleGroup.CHEST, sub_category: 'Chest', type: ExerciseType.DUMBBELL, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Wide arc motion, stretch chest at bottom.' },
  { id: 'chest_db_fly_incline', name: 'Incline Dumbbell Fly', name_zh: '上斜哑铃飞鸟', target_muscle: MuscleGroup.CHEST, sub_category: 'Upper Chest', type: ExerciseType.DUMBBELL, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Incline bench fly.' },
  { id: 'chest_db_squeeze', name: 'Hex Press / Squeeze Press', name_zh: '哑铃对握卧推', target_muscle: MuscleGroup.CHEST, sub_category: 'Inner Chest', type: ExerciseType.DUMBBELL, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Press dumbbells together throughout the movement.' },
  { id: 'chest_db_pullover', name: 'Dumbbell Pullover', name_zh: '哑铃直臂上拉', target_muscle: MuscleGroup.CHEST, sub_category: 'Chest', type: ExerciseType.DUMBBELL, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Lay across bench, lower DB behind head. Expands ribcage.' },

  // A3. Machine
  { id: 'chest_mach_press_seated', name: 'Seated Chest Press', name_zh: '坐姿推胸机', target_muscle: MuscleGroup.CHEST, sub_category: 'Chest', type: ExerciseType.MACHINE, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Machine press.' },
  { id: 'chest_smith_flat', name: 'Smith Machine Bench Press', name_zh: '史密斯平板卧推', target_muscle: MuscleGroup.CHEST, sub_category: 'Chest', type: ExerciseType.MACHINE, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Fixed path bench press.' },
  { id: 'chest_smith_incline', name: 'Smith Machine Incline Press', name_zh: '史密斯上斜卧推', target_muscle: MuscleGroup.CHEST, sub_category: 'Upper Chest', type: ExerciseType.MACHINE, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Fixed path incline press.' },
  { id: 'chest_mach_fly', name: 'Pec Deck / Machine Fly', name_zh: '蝴蝶机夹胸', target_muscle: MuscleGroup.CHEST, sub_category: 'Chest', type: ExerciseType.MACHINE, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Seated fly motion.' },
  { id: 'chest_hammer_press', name: 'Hammer Strength Press', name_zh: '悍马机推胸', target_muscle: MuscleGroup.CHEST, sub_category: 'Chest', type: ExerciseType.MACHINE, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Plate loaded independent arm press.' },

  // A4. Cable
  { id: 'chest_cable_fly_high', name: 'High-to-Low Cable Fly', name_zh: '高位绳索夹胸', target_muscle: MuscleGroup.CHEST, sub_category: 'Lower Chest', type: ExerciseType.CABLE, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Pull from high pulley down to waist.' },
  { id: 'chest_cable_fly_mid', name: 'Mid Cable Fly', name_zh: '中位绳索夹胸', target_muscle: MuscleGroup.CHEST, sub_category: 'Chest', type: ExerciseType.CABLE, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Pull from shoulder height.' },
  { id: 'chest_cable_fly_low', name: 'Low-to-High Cable Fly', name_zh: '低位绳索夹胸', target_muscle: MuscleGroup.CHEST, sub_category: 'Upper Chest', type: ExerciseType.CABLE, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Pull from low pulley up to chin height.' },

  // A5. Bodyweight
  { id: 'chest_bw_pushup', name: 'Push Up', name_zh: '标准俯卧撑', target_muscle: MuscleGroup.CHEST, sub_category: 'Chest', type: ExerciseType.BODYWEIGHT, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Standard pushup.' },
  { id: 'chest_bw_pushup_wide', name: 'Wide Grip Push Up', name_zh: '宽距俯卧撑', target_muscle: MuscleGroup.CHEST, sub_category: 'Chest', type: ExerciseType.BODYWEIGHT, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Wide hand placement.' },
  { id: 'chest_bw_pushup_diamond', name: 'Diamond Push Up', name_zh: '钻石俯卧撑', target_muscle: MuscleGroup.CHEST, sub_category: 'Chest', type: ExerciseType.BODYWEIGHT, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Hands touching in diamond shape. Tricep focus.' },
  { id: 'chest_bw_dips', name: 'Chest Dips', name_zh: '双杠臂屈伸-胸部版', target_muscle: MuscleGroup.CHEST, sub_category: 'Lower Chest', type: ExerciseType.BODYWEIGHT, image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=500&q=60', instructions: 'Lean forward to engage chest.' },

  // --- B. BACK (背部) ---
  // B1. Vertical Pull
  { id: 'back_pullup', name: 'Pull Up', name_zh: '引体向上', target_muscle: MuscleGroup.BACK, sub_category: 'Lats', type: ExerciseType.BODYWEIGHT, image_url: 'https://images.unsplash.com/photo-1598971639058-211a74a96dd4?auto=format&fit=crop&w=500&q=60', instructions: 'Overhand grip wide.' },
  { id: 'back_chinup', name: 'Chin Up', name_zh: '反手引体向上', target_muscle: MuscleGroup.BACK, sub_category: 'Lats', type: ExerciseType.BODYWEIGHT, image_url: 'https://images.unsplash.com/photo-1598971639058-211a74a96dd4?auto=format&fit=crop&w=500&q=60', instructions: 'Underhand grip. Bicep involvement.' },
  { id: 'back_pullup_neutral', name: 'Neutral Grip Pull Up', name_zh: '对握引体向上', target_muscle: MuscleGroup.BACK, sub_category: 'Lats', type: ExerciseType.BODYWEIGHT, image_url: 'https://images.unsplash.com/photo-1598971639058-211a74a96dd4?auto=format&fit=crop&w=500&q=60', instructions: 'Parallel grip.' },
  { id: 'back_lat_pulldown', name: 'Lat Pulldown (Wide)', name_zh: '高位下拉-宽握', target_muscle: MuscleGroup.BACK, sub_category: 'Lats', type: ExerciseType.CABLE, image_url: 'https://images.unsplash.com/photo-1598971639058-211a74a96dd4?auto=format&fit=crop&w=500&q=60', instructions: 'Pull bar to upper chest.' },
  { id: 'back_lat_pulldown_reverse', name: 'Reverse Grip Lat Pulldown', name_zh: '高位下拉-反手', target_muscle: MuscleGroup.BACK, sub_category: 'Lats', type: ExerciseType.CABLE, image_url: 'https://images.unsplash.com/photo-1598971639058-211a74a96dd4?auto=format&fit=crop&w=500&q=60', instructions: 'Underhand grip.' },
  { id: 'back_lat_pulldown_vbar', name: 'V-Bar Lat Pulldown', name_zh: '高位下拉-对握V把', target_muscle: MuscleGroup.BACK, sub_category: 'Lats', type: ExerciseType.CABLE, image_url: 'https://images.unsplash.com/photo-1598971639058-211a74a96dd4?auto=format&fit=crop&w=500&q=60', instructions: 'Close grip neutral.' },
  { id: 'back_cable_pulldown_straight', name: 'Straight Arm Pulldown', name_zh: '直臂下压', target_muscle: MuscleGroup.BACK, sub_category: 'Lats', type: ExerciseType.CABLE, image_url: 'https://images.unsplash.com/photo-1598971639058-211a74a96dd4?auto=format&fit=crop&w=500&q=60', instructions: 'Keep arms straight, push bar to thighs.' },

  // B2. Horizontal Row
  { id: 'back_bb_row', name: 'Barbell Bent Over Row', name_zh: '杠铃俯身划船', target_muscle: MuscleGroup.BACK, sub_category: 'Mid Back', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1598971639058-211a74a96dd4?auto=format&fit=crop&w=500&q=60', instructions: 'Bent over at 45 degrees, pull to waist.' },
  { id: 'back_pendlay_row', name: 'Pendlay Row', name_zh: '潘德勒划船', target_muscle: MuscleGroup.BACK, sub_category: 'Mid Back', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1598971639058-211a74a96dd4?auto=format&fit=crop&w=500&q=60', instructions: 'Explosive row from floor each rep.' },
  { id: 'back_yates_row', name: 'Yates Row', name_zh: '耶茨划船', target_muscle: MuscleGroup.BACK, sub_category: 'Lats', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1598971639058-211a74a96dd4?auto=format&fit=crop&w=500&q=60', instructions: 'Underhand grip, more upright posture.' },
  { id: 'back_db_row', name: 'Single Arm Dumbbell Row', name_zh: '哑铃单臂划船', target_muscle: MuscleGroup.BACK, sub_category: 'Lats', type: ExerciseType.DUMBBELL, image_url: 'https://images.unsplash.com/photo-1598971639058-211a74a96dd4?auto=format&fit=crop&w=500&q=60', instructions: 'Support on bench, row one arm.' },
  { id: 'back_seated_row', name: 'Seated Cable Row (V-Bar)', name_zh: '坐姿绳索划船-V把', target_muscle: MuscleGroup.BACK, sub_category: 'Mid Back', type: ExerciseType.CABLE, image_url: 'https://images.unsplash.com/photo-1598971639058-211a74a96dd4?auto=format&fit=crop&w=500&q=60', instructions: 'Row to stomach.' },
  { id: 'back_seated_row_wide', name: 'Seated Cable Row (Wide)', name_zh: '坐姿绳索划船-宽握', target_muscle: MuscleGroup.BACK, sub_category: 'Mid Back', type: ExerciseType.CABLE, image_url: 'https://images.unsplash.com/photo-1598971639058-211a74a96dd4?auto=format&fit=crop&w=500&q=60', instructions: 'Row to upper abs, target rear delts/traps.' },
  { id: 'back_tbar_row', name: 'T-Bar Row', name_zh: 'T杠划船', target_muscle: MuscleGroup.BACK, sub_category: 'Mid Back', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1598971639058-211a74a96dd4?auto=format&fit=crop&w=500&q=60', instructions: 'Use T-Bar landmine setup.' },
  { id: 'back_hammer_row', name: 'Hammer Strength Row', name_zh: '悍马机划船', target_muscle: MuscleGroup.BACK, sub_category: 'Lats', type: ExerciseType.MACHINE, image_url: 'https://images.unsplash.com/photo-1598971639058-211a74a96dd4?auto=format&fit=crop&w=500&q=60', instructions: 'Plate loaded row.' },

  // B3. Lower Back
  { id: 'back_deadlift_conventional', name: 'Conventional Deadlift', name_zh: '传统硬拉', target_muscle: MuscleGroup.BACK, sub_category: 'Lower Back', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1598971639058-211a74a96dd4?auto=format&fit=crop&w=500&q=60', instructions: 'Lift heavy off floor.' },
  { id: 'back_rack_pull', name: 'Rack Pull', name_zh: '架上硬拉', target_muscle: MuscleGroup.BACK, sub_category: 'Lower Back', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1598971639058-211a74a96dd4?auto=format&fit=crop&w=500&q=60', instructions: 'Deadlift from knee height.' },
  { id: 'back_hyperextension', name: 'Back Hyperextension', name_zh: '山羊挺身', target_muscle: MuscleGroup.BACK, sub_category: 'Lower Back', type: ExerciseType.BODYWEIGHT, image_url: 'https://images.unsplash.com/photo-1598971639058-211a74a96dd4?auto=format&fit=crop&w=500&q=60', instructions: 'Extend back on 45 degree bench.' },

  // --- C. SHOULDERS (肩部) ---
  // C1. Front Delt
  { id: 'shoulder_ohp_bb', name: 'Overhead Press', name_zh: '杠铃站姿推举', target_muscle: MuscleGroup.SHOULDERS, sub_category: 'Front Delt', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1532029837066-6e5cac75b638?auto=format&fit=crop&w=500&q=60', instructions: 'Strict press overhead.' },
  { id: 'shoulder_db_press_seated', name: 'Seated Dumbbell Press', name_zh: '坐姿哑铃推举', target_muscle: MuscleGroup.SHOULDERS, sub_category: 'Front Delt', type: ExerciseType.DUMBBELL, image_url: 'https://images.unsplash.com/photo-1532029837066-6e5cac75b638?auto=format&fit=crop&w=500&q=60', instructions: 'Back supported press.' },
  { id: 'shoulder_arnold_press', name: 'Arnold Press', name_zh: '阿诺德推举', target_muscle: MuscleGroup.SHOULDERS, sub_category: 'Front Delt', type: ExerciseType.DUMBBELL, image_url: 'https://images.unsplash.com/photo-1532029837066-6e5cac75b638?auto=format&fit=crop&w=500&q=60', instructions: 'Rotate palms during press.' },
  { id: 'shoulder_front_raise_db', name: 'Dumbbell Front Raise', name_zh: '哑铃前平举', target_muscle: MuscleGroup.SHOULDERS, sub_category: 'Front Delt', type: ExerciseType.DUMBBELL, image_url: 'https://images.unsplash.com/photo-1532029837066-6e5cac75b638?auto=format&fit=crop&w=500&q=60', instructions: 'Raise to front.' },

  // C2. Side Delt
  { id: 'shoulder_lat_raise', name: 'Dumbbell Lateral Raise', name_zh: '哑铃侧平举', target_muscle: MuscleGroup.SHOULDERS, sub_category: 'Side Delt', type: ExerciseType.DUMBBELL, image_url: 'https://images.unsplash.com/photo-1532029837066-6e5cac75b638?auto=format&fit=crop&w=500&q=60', instructions: 'Raise to sides.' },
  { id: 'shoulder_cable_lat_raise', name: 'Cable Lateral Raise', name_zh: '绳索侧平举', target_muscle: MuscleGroup.SHOULDERS, sub_category: 'Side Delt', type: ExerciseType.CABLE, image_url: 'https://images.unsplash.com/photo-1532029837066-6e5cac75b638?auto=format&fit=crop&w=500&q=60', instructions: 'Constant tension lateral raise.' },
  { id: 'shoulder_upright_row', name: 'Upright Row', name_zh: '宽握直立划船', target_muscle: MuscleGroup.SHOULDERS, sub_category: 'Side Delt', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1532029837066-6e5cac75b638?auto=format&fit=crop&w=500&q=60', instructions: 'Wide grip pull to chest.' },
  { id: 'shoulder_lu_raise', name: 'Lu Raise', name_zh: '吕小军侧平举', target_muscle: MuscleGroup.SHOULDERS, sub_category: 'Side Delt', type: ExerciseType.DUMBBELL, image_url: 'https://images.unsplash.com/photo-1532029837066-6e5cac75b638?auto=format&fit=crop&w=500&q=60', instructions: 'Full range of motion lateral raise to overhead.' },

  // C3. Rear Delt
  { id: 'shoulder_face_pull', name: 'Face Pull', name_zh: '绳索面拉', target_muscle: MuscleGroup.SHOULDERS, sub_category: 'Rear Delt', type: ExerciseType.CABLE, image_url: 'https://images.unsplash.com/photo-1532029837066-6e5cac75b638?auto=format&fit=crop&w=500&q=60', instructions: 'Pull rope to face with external rotation.' },
  { id: 'shoulder_reverse_fly_db', name: 'Dumbbell Reverse Fly', name_zh: '俯身哑铃飞鸟', target_muscle: MuscleGroup.SHOULDERS, sub_category: 'Rear Delt', type: ExerciseType.DUMBBELL, image_url: 'https://images.unsplash.com/photo-1532029837066-6e5cac75b638?auto=format&fit=crop&w=500&q=60', instructions: 'Bent over, fly backwards.' },
  { id: 'shoulder_reverse_pec_deck', name: 'Reverse Pec Deck', name_zh: '蝴蝶机反向飞鸟', target_muscle: MuscleGroup.SHOULDERS, sub_category: 'Rear Delt', type: ExerciseType.MACHINE, image_url: 'https://images.unsplash.com/photo-1532029837066-6e5cac75b638?auto=format&fit=crop&w=500&q=60', instructions: 'Reverse fly on machine.' },

  // C4. Traps
  { id: 'shoulder_shrug_bb', name: 'Barbell Shrug', name_zh: '杠铃耸肩', target_muscle: MuscleGroup.SHOULDERS, sub_category: 'Traps', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1532029837066-6e5cac75b638?auto=format&fit=crop&w=500&q=60', instructions: 'Shrug shoulders up.' },
  { id: 'shoulder_shrug_db', name: 'Dumbbell Shrug', name_zh: '哑铃耸肩', target_muscle: MuscleGroup.SHOULDERS, sub_category: 'Traps', type: ExerciseType.DUMBBELL, image_url: 'https://images.unsplash.com/photo-1532029837066-6e5cac75b638?auto=format&fit=crop&w=500&q=60', instructions: 'Shrug with dumbbells.' },

  // --- D. LEGS (腿部) ---
  // D1. Quads
  { id: 'legs_sq_highbar', name: 'High Bar Squat', name_zh: '颈后高杠深蹲', target_muscle: MuscleGroup.LEGS, sub_category: 'Quads', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=500&q=60', instructions: 'Bar on traps. Vertical torso.' },
  { id: 'legs_sq_front', name: 'Front Squat', name_zh: '颈前深蹲', target_muscle: MuscleGroup.LEGS, sub_category: 'Quads', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=500&q=60', instructions: 'Bar on front delts. Upright.' },
  { id: 'legs_goblet_squat', name: 'Goblet Squat', name_zh: '高脚杯深蹲', target_muscle: MuscleGroup.LEGS, sub_category: 'Quads', type: ExerciseType.KETTLEBELL, image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=500&q=60', instructions: 'Hold weight at chest.' },
  { id: 'legs_leg_press', name: 'Leg Press', name_zh: '倒蹬/腿举', target_muscle: MuscleGroup.LEGS, sub_category: 'Quads', type: ExerciseType.MACHINE, image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=500&q=60', instructions: 'Press sled away.' },
  { id: 'legs_hack_squat', name: 'Hack Squat', name_zh: '哈克深蹲', target_muscle: MuscleGroup.LEGS, sub_category: 'Quads', type: ExerciseType.MACHINE, image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=500&q=60', instructions: 'Machine squat.' },
  { id: 'legs_extension', name: 'Leg Extension', name_zh: '坐姿腿屈伸', target_muscle: MuscleGroup.LEGS, sub_category: 'Quads', type: ExerciseType.MACHINE, image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=500&q=60', instructions: 'Isolate quads.' },
  { id: 'legs_lunges', name: 'Walking Lunges', name_zh: '箭步蹲', target_muscle: MuscleGroup.LEGS, sub_category: 'Quads', type: ExerciseType.BODYWEIGHT, image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=500&q=60', instructions: 'Step forward.' },
  { id: 'legs_bulgarian', name: 'Bulgarian Split Squat', name_zh: '保加利亚分腿蹲', target_muscle: MuscleGroup.LEGS, sub_category: 'Quads', type: ExerciseType.DUMBBELL, image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=500&q=60', instructions: 'Rear foot elevated.' },

  // D2. Hamstrings
  { id: 'legs_rdl_bb', name: 'Romanian Deadlift', name_zh: '罗马尼亚硬拉', target_muscle: MuscleGroup.LEGS, sub_category: 'Hamstrings', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=500&q=60', instructions: 'Hinge hips back. Slight knee bend.' },
  { id: 'legs_curl_seated', name: 'Seated Leg Curl', name_zh: '坐姿腿弯举', target_muscle: MuscleGroup.LEGS, sub_category: 'Hamstrings', type: ExerciseType.MACHINE, image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=500&q=60', instructions: 'Curl legs under.' },
  { id: 'legs_curl_lying', name: 'Lying Leg Curl', name_zh: '俯卧腿弯举', target_muscle: MuscleGroup.LEGS, sub_category: 'Hamstrings', type: ExerciseType.MACHINE, image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=500&q=60', instructions: 'Lay prone, curl legs.' },
  { id: 'legs_nordic', name: 'Nordic Hamstring Curl', name_zh: '北欧挺身', target_muscle: MuscleGroup.LEGS, sub_category: 'Hamstrings', type: ExerciseType.BODYWEIGHT, image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=500&q=60', instructions: 'Kneel, lower torso slowly.' },

  // D3. Glutes
  { id: 'legs_hip_thrust_bb', name: 'Barbell Hip Thrust', name_zh: '杠铃臀推', target_muscle: MuscleGroup.LEGS, sub_category: 'Glutes', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=500&q=60', instructions: 'Thrust hips up with bar.' },
  { id: 'legs_glute_kickback', name: 'Cable Glute Kickback', name_zh: '绳索后踢', target_muscle: MuscleGroup.LEGS, sub_category: 'Glutes', type: ExerciseType.CABLE, image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=500&q=60', instructions: 'Kick leg back.' },
  { id: 'legs_abduction', name: 'Seated Hip Abduction', name_zh: '坐姿髋外展', target_muscle: MuscleGroup.LEGS, sub_category: 'Glutes', type: ExerciseType.MACHINE, image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=500&q=60', instructions: 'Push knees out.' },

  // D4. Calves
  { id: 'legs_calf_standing', name: 'Standing Calf Raise', name_zh: '站姿提踵', target_muscle: MuscleGroup.LEGS, sub_category: 'Calves', type: ExerciseType.MACHINE, image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=500&q=60', instructions: 'Raise heels.' },
  { id: 'legs_calf_seated', name: 'Seated Calf Raise', name_zh: '坐姿提踵', target_muscle: MuscleGroup.LEGS, sub_category: 'Calves', type: ExerciseType.MACHINE, image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=500&q=60', instructions: 'Target soleus.' },

  // --- E. ARMS (手臂) ---
  // E1. Biceps
  { id: 'arm_bicep_curl_bb', name: 'Barbell Curl', name_zh: '杠铃弯举', target_muscle: MuscleGroup.ARMS, sub_category: 'Biceps', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=500&q=60', instructions: 'Standard curl.' },
  { id: 'arm_hammer_curl', name: 'Hammer Curl', name_zh: '锤式弯举', target_muscle: MuscleGroup.ARMS, sub_category: 'Biceps', type: ExerciseType.DUMBBELL, image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=500&q=60', instructions: 'Neutral grip.' },
  { id: 'arm_preacher_curl', name: 'Preacher Curl', name_zh: '牧师椅弯举', target_muscle: MuscleGroup.ARMS, sub_category: 'Biceps', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=500&q=60', instructions: 'Arms supported on bench.' },
  { id: 'arm_incline_curl', name: 'Incline Dumbbell Curl', name_zh: '上斜哑铃弯举', target_muscle: MuscleGroup.ARMS, sub_category: 'Biceps', type: ExerciseType.DUMBBELL, image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=500&q=60', instructions: 'Stretch biceps on incline.' },
  { id: 'arm_bayesian_curl', name: 'Bayesian Curl', name_zh: '背向绳索弯举', target_muscle: MuscleGroup.ARMS, sub_category: 'Biceps', type: ExerciseType.CABLE, image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=500&q=60', instructions: 'Face away from cable, curl forward.' },

  // E2. Triceps
  { id: 'arm_tricep_pushdown', name: 'Tricep Pushdown (Rope)', name_zh: '绳索下压', target_muscle: MuscleGroup.ARMS, sub_category: 'Triceps', type: ExerciseType.CABLE, image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=500&q=60', instructions: 'Push rope down, split at bottom.' },
  { id: 'arm_skullcrusher', name: 'Skullcrusher', name_zh: '仰卧臂屈伸/碎颅者', target_muscle: MuscleGroup.ARMS, sub_category: 'Triceps', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=500&q=60', instructions: 'Lower bar to forehead.' },
  { id: 'arm_overhead_ext_db', name: 'Overhead DB Extension', name_zh: '坐姿哑铃颈后臂屈伸', target_muscle: MuscleGroup.ARMS, sub_category: 'Triceps', type: ExerciseType.DUMBBELL, image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=500&q=60', instructions: 'Extend DB overhead.' },
  { id: 'arm_dips_tricep', name: 'Tricep Dips', name_zh: '双杠臂屈伸-三头版', target_muscle: MuscleGroup.ARMS, sub_category: 'Triceps', type: ExerciseType.BODYWEIGHT, image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=500&q=60', instructions: 'Upright torso.' },

  // E3. Forearms
  { id: 'arm_wrist_curl', name: 'Wrist Curl', name_zh: '杠铃腕弯举', target_muscle: MuscleGroup.ARMS, sub_category: 'Forearms', type: ExerciseType.BARBELL, image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=500&q=60', instructions: 'Flex wrists.' },
  { id: 'arm_farmers_carry', name: 'Farmers Carry', name_zh: '农夫行走', target_muscle: MuscleGroup.ARMS, sub_category: 'Forearms', type: ExerciseType.DUMBBELL, image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=500&q=60', instructions: 'Walk with heavy weights.' },

  // --- F. CORE (核心) ---
  { id: 'core_plank', name: 'Plank', name_zh: '平板支撑', target_muscle: MuscleGroup.CORE, sub_category: 'Core', type: ExerciseType.BODYWEIGHT, image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=500&q=60', instructions: 'Hold.' },
  { id: 'core_leg_raise', name: 'Hanging Leg Raise', name_zh: '悬垂举腿', target_muscle: MuscleGroup.CORE, sub_category: 'Core', type: ExerciseType.BODYWEIGHT, image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=500&q=60', instructions: 'Raise legs to bar.' },
  { id: 'core_ab_wheel', name: 'Ab Wheel Rollout', name_zh: '健腹轮', target_muscle: MuscleGroup.CORE, sub_category: 'Core', type: ExerciseType.BODYWEIGHT, image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=500&q=60', instructions: 'Roll out and back.' },
  { id: 'core_woodchopper', name: 'Cable Woodchopper', name_zh: '绳索伐木', target_muscle: MuscleGroup.CORE, sub_category: 'Core', type: ExerciseType.CABLE, image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=500&q=60', instructions: 'Twist torso against resistance.' },
  { id: 'core_russian_twist', name: 'Russian Twist', name_zh: '俄罗斯转体', target_muscle: MuscleGroup.CORE, sub_category: 'Core', type: ExerciseType.BODYWEIGHT, image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=500&q=60', instructions: 'Twist torso seated.' },
];

const getKeys = () => {
  if (currentUserId === 'default_user') {
    return { ...LEGACY_KEYS, CHAT: 'ai_lift_chat' };
  }
  return {
    PROFILE: `ai_lift_profile_${currentUserId}`,
    LOGS: `ai_lift_logs_${currentUserId}`,
    EXERCISES: `ai_lift_exercises_${currentUserId}`,
    PLAN: `ai_lift_plan_${currentUserId}`,
    CHAT: `ai_lift_chat_${currentUserId}`
  };
};

const getLocal = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const setLocal = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// Re-exporting the storage object with new Chat methods
export const storage = {
  setStorageUser: (userId: string) => {
    currentUserId = userId;
  },

  getProfile: (): UserProfile => {
    const keys = getKeys();
    const profile = getLocal(keys.PROFILE, { 
      id: 'user_1', name: 'Lifter', weight: 75, height: 175, language: 'zh', 
      oneRepMaxes: [], goals: { target_weight: 0, target_body_fat: 0 } 
    } as UserProfile);
    
    // Ensure 1RM array exists
    if (!profile.oneRepMaxes) profile.oneRepMaxes = [];

    // MIGRATION: Update old default IDs to new strict IDs
    const ID_MAP: Record<string, string> = {
        'sq': 'legs_sq_highbar',
        'bp': 'chest_bb_bench_flat',
        'dl': 'back_deadlift_conventional'
    };
    
    let changed = false;
    profile.oneRepMaxes = profile.oneRepMaxes.map(rm => {
        if (ID_MAP[rm.id]) {
            changed = true;
            return { ...rm, id: ID_MAP[rm.id] };
        }
        return rm;
    });
    
    if (changed) {
        setLocal(keys.PROFILE, profile);
    }

    return profile;
  },
  
  saveProfile: (profile: UserProfile) => {
    const keys = getKeys();
    setLocal(keys.PROFILE, profile);
  },

  getExercises: (): Exercise[] => {
    return SEED_EXERCISES;
  },

  getWorkoutLogs: (): WorkoutLog[] => {
     const keys = getKeys();
     return getLocal(keys.LOGS, []);
  },

  saveWorkoutLog: (log: WorkoutLog) => {
    const keys = getKeys();
    const logs = getLocal<WorkoutLog[]>(keys.LOGS, []);
    setLocal(keys.LOGS, [...logs, log]);
  },
  
  deleteWorkoutLog: (id: string) => {
    const keys = getKeys();
    const logs = getLocal<WorkoutLog[]>(keys.LOGS, []);
    setLocal(keys.LOGS, logs.filter(l => l.id !== id));
  },
  
  getActivePlan: (): WorkoutPlan | null => {
    const keys = getKeys();
    return getLocal(keys.PLAN, null);
  },
  
  saveActivePlan: (plan: WorkoutPlan) => {
    const keys = getKeys();
    setLocal(keys.PLAN, plan);
  },
  
  deleteActivePlan: () => {
    const keys = getKeys();
    localStorage.removeItem(keys.PLAN);
  },

  // --- NEW CHAT HISTORY METHODS ---
  
  getChatHistory: (): ChatMessage[] => {
    const keys = getKeys();
    return getLocal<ChatMessage[]>(keys.CHAT, []);
  },

  saveChatHistory: (messages: ChatMessage[]) => {
    const keys = getKeys();
    // Keep last 50 messages to prevent storage bloat
    const trimmed = messages.slice(-50);
    setLocal(keys.CHAT, trimmed);
  },

  clearChatHistory: () => {
    const keys = getKeys();
    localStorage.removeItem(keys.CHAT);
  },

  syncFromSupabase: async () => {},
  clearAllUserData: async () => {
    localStorage.clear();
  }
};
