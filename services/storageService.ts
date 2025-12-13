
import { Exercise, ExerciseType, MuscleGroup, UserProfile, WorkoutLog, GeneratedPlan } from '../types.js';

// --- Constants & Seed Data ---

// Base keys (prefixes)
const BASE_KEYS = {
  PROFILE: 'ai_lift_profile',
  LOGS: 'ai_lift_logs',
  EXERCISES: 'ai_lift_exercises',
  ACTIVE_PLAN: 'ai_lift_active_plan'
};

const SEED_EXERCISES: Exercise[] = [
  // ==================== CHEST (A) ====================
  // --- A1. Barbell ---
  {
    id: 'chest_bb_flat_bench',
    name: 'Flat Barbell Bench Press',
    name_zh: '平板杠铃卧推',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80',
    instructions: 'Lie on bench, lower bar to mid-chest, press up until arms are locked.',
    instructions_zh: '平躺于卧推凳，下放杠铃至胸部中部，推起直至手臂伸直。'
  },
  {
    id: 'chest_bb_incline_bench',
    name: 'Incline Barbell Bench Press',
    name_zh: '上斜杠铃卧推',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80',
    instructions: 'Bench press on an incline bench to target upper chest.',
    instructions_zh: '在上斜凳上进行卧推，主要刺激上胸部。'
  },
  {
    id: 'chest_bb_decline_bench',
    name: 'Decline Barbell Bench Press',
    name_zh: '下斜杠铃卧推',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80',
    instructions: 'Bench press on a decline bench to target lower chest.',
    instructions_zh: '在下斜凳上进行卧推，主要刺激下胸部。'
  },
  {
    id: 'chest_bb_guillotine',
    name: 'Guillotine Press',
    name_zh: '颈前断头台卧推',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80',
    instructions: 'Lower bar to neck (carefully) with wide grip to maximize stretch.',
    instructions_zh: '宽握，小心地将杠铃下放至颈部位置，以最大化胸肌拉伸（注意安全）。'
  },
  {
    id: 'chest_bb_floor_press',
    name: 'Barbell Floor Press',
    name_zh: '地面杠铃卧推',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80',
    instructions: 'Bench press lying on the floor to limit range of motion and focus on lockout.',
    instructions_zh: '躺在地面上进行卧推，限制运动范围，侧重于锁定阶段。'
  },

  // --- A2. Dumbbell ---
  {
    id: 'chest_db_flat_press',
    name: 'Flat Dumbbell Press',
    name_zh: '平板哑铃卧推',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
    instructions: 'Press dumbbells up from chest level while lying flat.',
    instructions_zh: '平躺，将哑铃从胸部两侧推起。'
  },
  {
    id: 'chest_db_incline_press',
    name: 'Incline Dumbbell Press',
    name_zh: '上斜哑铃卧推',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
    instructions: 'Press dumbbells on an incline bench.',
    instructions_zh: '在上斜凳上推举哑铃。'
  },
  {
    id: 'chest_db_fly',
    name: 'Dumbbell Fly',
    name_zh: '平板哑铃飞鸟',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
    instructions: 'Wide arc movement to stretch the chest.',
    instructions_zh: '做宽弧线运动以拉伸胸肌。'
  },
  {
    id: 'chest_db_svend_press',
    name: 'Svend Press',
    name_zh: '斯文德推胸',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
    instructions: 'Squeeze a plate/dumbbell between palms and press forward standing.',
    instructions_zh: '双手掌心用力夹住杠铃片或哑铃，向前推出。'
  },
  {
    id: 'chest_db_pullover',
    name: 'Dumbbell Pullover',
    name_zh: '哑铃直臂上拉',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
    instructions: 'Lower dumbbell behind head while lying on bench.',
    instructions_zh: '仰卧于凳上，将哑铃下放至头后方。'
  },

  // --- A3. Machine ---
  {
    id: 'chest_machine_press',
    name: 'Seated Chest Press',
    name_zh: '坐姿推胸机',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80',
    instructions: 'Sit and press the handles forward.',
    instructions_zh: '坐姿，向前推动手柄。'
  },
  {
    id: 'chest_machine_pec_deck',
    name: 'Pec Deck Fly',
    name_zh: '蝴蝶机夹胸',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80',
    instructions: 'Bring arms together using the machine pads.',
    instructions_zh: '利用器械垫臂，将双臂向中间靠拢。'
  },
  {
    id: 'chest_machine_smith_incline',
    name: 'Smith Machine Incline Press',
    name_zh: '史密斯上斜卧推',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80',
    instructions: 'Incline press using the Smith machine for stability.',
    instructions_zh: '使用史密斯机进行上斜卧推，更稳定。'
  },

  // --- A4. Cable ---
  {
    id: 'chest_cable_high_fly',
    name: 'High-to-Low Cable Fly',
    name_zh: '高位绳索夹胸',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
    instructions: 'Pull cables from high position down and together.',
    instructions_zh: '从高位将绳索向下拉至身前汇合。'
  },
  {
    id: 'chest_cable_low_fly',
    name: 'Low-to-High Cable Fly',
    name_zh: '低位绳索夹胸',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
    instructions: 'Pull cables from low position up and together.',
    instructions_zh: '从低位将绳索向上拉至胸前汇合。'
  },

  // --- A5. Bodyweight ---
  {
    id: 'chest_bw_pushup',
    name: 'Push Up',
    name_zh: '标准俯卧撑',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
    instructions: 'Standard push up.',
    instructions_zh: '标准俯卧撑。'
  },
  {
    id: 'chest_bw_dips',
    name: 'Chest Dips',
    name_zh: '双杠臂屈伸(胸部)',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
    instructions: 'Lean forward while dipping to target chest.',
    instructions_zh: '下放时身体前倾以更多刺激胸部。'
  },

  // ==================== BACK (B) ====================
  // --- B1. Vertical Pull ---
  {
    id: 'back_bw_pullup',
    name: 'Pull Up',
    name_zh: '引体向上',
    target_muscle: MuscleGroup.BACK,
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=400&q=80',
    instructions: 'Wide grip pull up.',
    instructions_zh: '宽握引体向上。'
  },
  {
    id: 'back_bw_chinup',
    name: 'Chin Up',
    name_zh: '反手引体向上',
    target_muscle: MuscleGroup.BACK,
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=400&q=80',
    instructions: 'Underhand grip pull up.',
    instructions_zh: '反手握距引体向上。'
  },
  {
    id: 'back_cable_lat_pulldown',
    name: 'Lat Pulldown',
    name_zh: '高位下拉',
    target_muscle: MuscleGroup.BACK,
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1517963879466-e1b54ebd6694?auto=format&fit=crop&w=400&q=80',
    instructions: 'Pull bar down to upper chest.',
    instructions_zh: '将横杆拉至上胸部。'
  },
  {
    id: 'back_cable_straight_arm',
    name: 'Straight Arm Pulldown',
    name_zh: '直臂下压',
    target_muscle: MuscleGroup.BACK,
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1517963879466-e1b54ebd6694?auto=format&fit=crop&w=400&q=80',
    instructions: 'Keep arms straight, push bar down to hips.',
    instructions_zh: '保持手臂伸直，将横杆/绳索下压至髋部。'
  },

  // --- B2. Horizontal Row ---
  {
    id: 'back_bb_bent_row',
    name: 'Barbell Bent Over Row',
    name_zh: '杠铃俯身划船',
    target_muscle: MuscleGroup.BACK,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
    instructions: 'Bend over and pull barbell to waist.',
    instructions_zh: '俯身，将杠铃拉向腰部。'
  },
  {
    id: 'back_bb_pendlay_row',
    name: 'Pendlay Row',
    name_zh: '潘德勒划船',
    target_muscle: MuscleGroup.BACK,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
    instructions: 'Explosive row from the floor each rep.',
    instructions_zh: '每次动作都从地面开始，爆发性拉起。'
  },
  {
    id: 'back_db_single_row',
    name: 'One Arm Dumbbell Row',
    name_zh: '哑铃单臂划船',
    target_muscle: MuscleGroup.BACK,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
    instructions: 'Support on bench, pull dumbbell to hip.',
    instructions_zh: '单手支撑，将哑铃拉向髋部。'
  },
  {
    id: 'back_machine_seated_row',
    name: 'Seated Cable Row',
    name_zh: '坐姿绳索划船',
    target_muscle: MuscleGroup.BACK,
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1517963879466-e1b54ebd6694?auto=format&fit=crop&w=400&q=80',
    instructions: 'Sit and row handle to stomach.',
    instructions_zh: '坐姿，将手柄拉向腹部。'
  },
  {
    id: 'back_tbar_row',
    name: 'T-Bar Row',
    name_zh: 'T杠划船',
    target_muscle: MuscleGroup.BACK,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
    instructions: 'Straddle the bar and pull up.',
    instructions_zh: '跨立T杠，向上提拉。'
  },

  // --- B3. Lower Back ---
  {
    id: 'back_bb_deadlift',
    name: 'Conventional Deadlift',
    name_zh: '传统硬拉',
    target_muscle: MuscleGroup.BACK,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1517963879466-e1b54ebd6694?auto=format&fit=crop&w=400&q=80',
    instructions: 'Lift bar from floor extending hips and knees.',
    instructions_zh: '伸展髋膝将杠铃从地面拉起。'
  },
  {
    id: 'back_bb_rack_pull',
    name: 'Rack Pull',
    name_zh: '架上硬拉',
    target_muscle: MuscleGroup.BACK,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1517963879466-e1b54ebd6694?auto=format&fit=crop&w=400&q=80',
    instructions: 'Deadlift starting from rack height (knee level).',
    instructions_zh: '从深蹲架（通常膝盖高度）开始硬拉。'
  },
  {
    id: 'back_hyperextension',
    name: 'Back Hyperextension',
    name_zh: '山羊挺身',
    target_muscle: MuscleGroup.BACK,
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
    instructions: 'Extend back on the hyperextension bench.',
    instructions_zh: '在罗马椅上进行挺身动作。'
  },

  // ==================== SHOULDERS (C) ====================
  // --- C1. Front ---
  {
    id: 'shoulder_bb_ohp',
    name: 'Overhead Press',
    name_zh: '杠铃站姿推举',
    target_muscle: MuscleGroup.SHOULDERS,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1532029837066-805e451672a4?auto=format&fit=crop&w=400&q=80',
    instructions: 'Press bar overhead from standing position.',
    instructions_zh: '站姿将杠铃推过头顶。'
  },
  {
    id: 'shoulder_db_seated_press',
    name: 'Seated Dumbbell Press',
    name_zh: '坐姿哑铃推举',
    target_muscle: MuscleGroup.SHOULDERS,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1532029837066-805e451672a4?auto=format&fit=crop&w=400&q=80',
    instructions: 'Press dumbbells overhead while seated.',
    instructions_zh: '坐姿将哑铃推过头顶。'
  },
  {
    id: 'shoulder_db_arnold',
    name: 'Arnold Press',
    name_zh: '阿诺德推举',
    target_muscle: MuscleGroup.SHOULDERS,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1532029837066-805e451672a4?auto=format&fit=crop&w=400&q=80',
    instructions: 'Press with rotation, starting palms facing you.',
    instructions_zh: '带旋转的推举，起始时掌心朝向自己。'
  },
  {
    id: 'shoulder_db_front_raise',
    name: 'Dumbbell Front Raise',
    name_zh: '哑铃前平举',
    target_muscle: MuscleGroup.SHOULDERS,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1532029837066-805e451672a4?auto=format&fit=crop&w=400&q=80',
    instructions: 'Raise dumbbell forward.',
    instructions_zh: '向前方举起哑铃。'
  },

  // --- C2. Side ---
  {
    id: 'shoulder_db_lat_raise',
    name: 'Dumbbell Lateral Raise',
    name_zh: '哑铃侧平举',
    target_muscle: MuscleGroup.SHOULDERS,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1532029837066-805e451672a4?auto=format&fit=crop&w=400&q=80',
    instructions: 'Raise arms to the side.',
    instructions_zh: '向两侧举起手臂。'
  },
  {
    id: 'shoulder_cable_lat_raise',
    name: 'Cable Lateral Raise',
    name_zh: '绳索侧平举',
    target_muscle: MuscleGroup.SHOULDERS,
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
    instructions: 'One arm lateral raise using low cable.',
    instructions_zh: '使用低位绳索进行单臂侧平举。'
  },
  {
    id: 'shoulder_bb_upright_row',
    name: 'Upright Row',
    name_zh: '直立划船',
    target_muscle: MuscleGroup.SHOULDERS,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1532029837066-805e451672a4?auto=format&fit=crop&w=400&q=80',
    instructions: 'Pull bar vertically close to body.',
    instructions_zh: '贴近身体垂直上拉杠铃。'
  },

  // --- C3. Rear ---
  {
    id: 'shoulder_cable_face_pull',
    name: 'Face Pull',
    name_zh: '绳索面拉',
    target_muscle: MuscleGroup.SHOULDERS,
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
    instructions: 'Pull rope to face, elbows high.',
    instructions_zh: '将绳索拉向面部，手肘太高。'
  },
  {
    id: 'shoulder_db_reverse_fly',
    name: 'Dumbbell Reverse Fly',
    name_zh: '俯身哑铃飞鸟',
    target_muscle: MuscleGroup.SHOULDERS,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1532029837066-805e451672a4?auto=format&fit=crop&w=400&q=80',
    instructions: 'Bent over, raise arms to side targeting rear delts.',
    instructions_zh: '俯身，向后展臂，刺激三角肌后束。'
  },
  {
    id: 'shoulder_machine_reverse_fly',
    name: 'Reverse Pec Deck',
    name_zh: '蝴蝶机反向飞鸟',
    target_muscle: MuscleGroup.SHOULDERS,
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
    instructions: 'Sit facing machine, pull arms back.',
    instructions_zh: '面朝器械坐，向后展臂。'
  },

  // --- C4. Traps ---
  {
    id: 'shoulder_bb_shrug',
    name: 'Barbell Shrug',
    name_zh: '杠铃耸肩',
    target_muscle: MuscleGroup.SHOULDERS,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1532029837066-805e451672a4?auto=format&fit=crop&w=400&q=80',
    instructions: 'Shrug shoulders up towards ears.',
    instructions_zh: '将肩膀向上耸起靠近耳朵。'
  },

  // ==================== LEGS (D) ====================
  // --- D1. Quads ---
  {
    id: 'legs_bb_squat',
    name: 'Barbell Squat',
    name_zh: '杠铃深蹲',
    target_muscle: MuscleGroup.LEGS,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e01f5?auto=format&fit=crop&w=400&q=80',
    instructions: 'Standard high bar squat.',
    instructions_zh: '标准高杠深蹲。'
  },
  {
    id: 'legs_bb_front_squat',
    name: 'Front Squat',
    name_zh: '颈前深蹲',
    target_muscle: MuscleGroup.LEGS,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e01f5?auto=format&fit=crop&w=400&q=80',
    instructions: 'Hold bar on front delts, squat down.',
    instructions_zh: '杠铃置于三角肌前束，下蹲。'
  },
  {
    id: 'legs_machine_leg_press',
    name: 'Leg Press',
    name_zh: '腿举/倒蹬',
    target_muscle: MuscleGroup.LEGS,
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
    instructions: 'Press weight away with legs.',
    instructions_zh: '用双腿蹬起重量。'
  },
  {
    id: 'legs_db_goblet_squat',
    name: 'Goblet Squat',
    name_zh: '高脚杯深蹲',
    target_muscle: MuscleGroup.LEGS,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e01f5?auto=format&fit=crop&w=400&q=80',
    instructions: 'Hold dumbbell at chest, squat.',
    instructions_zh: '双手捧住哑铃置于胸前下蹲。'
  },
  {
    id: 'legs_machine_ext',
    name: 'Leg Extension',
    name_zh: '坐姿腿屈伸',
    target_muscle: MuscleGroup.LEGS,
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80',
    instructions: 'Extend legs to target quads.',
    instructions_zh: '伸展双腿，刺激股四头肌。'
  },
  {
    id: 'legs_db_lunge',
    name: 'Walking Lunge',
    name_zh: '箭步蹲行走',
    target_muscle: MuscleGroup.LEGS,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
    instructions: 'Walk forward lunging.',
    instructions_zh: '向前迈步进行箭步蹲。'
  },
  {
    id: 'legs_db_bulgarian',
    name: 'Bulgarian Split Squat',
    name_zh: '保加利亚分腿蹲',
    target_muscle: MuscleGroup.LEGS,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
    instructions: 'One foot elevated behind, squat with front leg.',
    instructions_zh: '后脚垫高，单腿下蹲。'
  },

  // --- D2. Hamstrings ---
  {
    id: 'legs_bb_rdl',
    name: 'Romanian Deadlift',
    name_zh: '罗马尼亚硬拉',
    target_muscle: MuscleGroup.LEGS,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1567598508481-65985588e295?auto=format&fit=crop&w=400&q=80',
    instructions: 'Hinge hips with slight knee bend.',
    instructions_zh: '髋部折叠，膝盖微屈。'
  },
  {
    id: 'legs_machine_curl_lying',
    name: 'Lying Leg Curl',
    name_zh: '俯卧腿弯举',
    target_muscle: MuscleGroup.LEGS,
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80',
    instructions: 'Curl legs up towards glutes.',
    instructions_zh: '将小腿向上弯举靠近臀部。'
  },
  {
    id: 'legs_machine_curl_seated',
    name: 'Seated Leg Curl',
    name_zh: '坐姿腿弯举',
    target_muscle: MuscleGroup.LEGS,
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80',
    instructions: 'Curl legs down under seat.',
    instructions_zh: '坐姿将小腿向下弯举。'
  },

  // --- D3. Glutes ---
  {
    id: 'legs_bb_hip_thrust',
    name: 'Barbell Hip Thrust',
    name_zh: '杠铃臀推',
    target_muscle: MuscleGroup.LEGS,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e01f5?auto=format&fit=crop&w=400&q=80',
    instructions: 'Thrust hips up with bar on lap.',
    instructions_zh: '将置于髋部的杠铃向上顶起。'
  },
  {
    id: 'legs_cable_pull_through',
    name: 'Cable Pull Through',
    name_zh: '绳索后拉',
    target_muscle: MuscleGroup.LEGS,
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
    instructions: 'Pull cable through legs by extending hips.',
    instructions_zh: '通过伸展髋部从双腿间拉出绳索。'
  },

  // --- D4. Calves ---
  {
    id: 'legs_machine_calf_raise',
    name: 'Standing Calf Raise',
    name_zh: '站姿提踵',
    target_muscle: MuscleGroup.LEGS,
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80',
    instructions: 'Raise heels standing on edge.',
    instructions_zh: '站姿踮起脚跟。'
  },
  {
    id: 'legs_seated_calf_raise',
    name: 'Seated Calf Raise',
    name_zh: '坐姿提踵',
    target_muscle: MuscleGroup.LEGS,
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80',
    instructions: 'Raise heels while seated.',
    instructions_zh: '坐姿踮起脚跟。'
  },

  // ==================== ARMS (E) ====================
  // --- E1. Biceps ---
  {
    id: 'arm_bb_curl',
    name: 'Barbell Curl',
    name_zh: '杠铃弯举',
    target_muscle: MuscleGroup.ARMS,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&q=80',
    instructions: 'Curl bar standing.',
    instructions_zh: '站姿弯举杠铃。'
  },
  {
    id: 'arm_db_curl',
    name: 'Alternating Dumbbell Curl',
    name_zh: '哑铃交替弯举',
    target_muscle: MuscleGroup.ARMS,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&q=80',
    instructions: 'Curl dumbbells alternately.',
    instructions_zh: '交替弯举哑铃。'
  },
  {
    id: 'arm_db_hammer',
    name: 'Hammer Curl',
    name_zh: '锤式弯举',
    target_muscle: MuscleGroup.ARMS,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&q=80',
    instructions: 'Neutral grip curl.',
    instructions_zh: '对握弯举。'
  },
  {
    id: 'arm_ez_preacher',
    name: 'Preacher Curl',
    name_zh: '牧师椅弯举',
    target_muscle: MuscleGroup.ARMS,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&q=80',
    instructions: 'Curl on preacher bench.',
    instructions_zh: '在牧师椅上进行弯举。'
  },
  {
    id: 'arm_db_incline_curl',
    name: 'Incline Dumbbell Curl',
    name_zh: '上斜哑铃弯举',
    target_muscle: MuscleGroup.ARMS,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&q=80',
    instructions: 'Curl while lying back on incline bench.',
    instructions_zh: '仰卧在上斜凳上进行弯举。'
  },
  {
    id: 'arm_cable_curl',
    name: 'Cable Curl',
    name_zh: '绳索弯举',
    target_muscle: MuscleGroup.ARMS,
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&q=80',
    instructions: 'Curl using low pulley.',
    instructions_zh: '使用低位滑轮进行弯举。'
  },

  // --- E2. Triceps ---
  {
    id: 'arm_cable_pushdown',
    name: 'Tricep Pushdown',
    name_zh: '绳索下压',
    target_muscle: MuscleGroup.ARMS,
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
    instructions: 'Push cable down keeping elbows tight.',
    instructions_zh: '夹紧手肘向下推压绳索。'
  },
  {
    id: 'arm_bb_skullcrusher',
    name: 'Skullcrusher',
    name_zh: '仰卧臂屈伸/碎颅者',
    target_muscle: MuscleGroup.ARMS,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
    instructions: 'Lower bar to forehead lying down.',
    instructions_zh: '仰卧将杠铃下放至额头。'
  },
  {
    id: 'arm_db_overhead',
    name: 'Seated Overhead Extension',
    name_zh: '坐姿颈后臂屈伸',
    target_muscle: MuscleGroup.ARMS,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
    instructions: 'Lower dumbbell behind head seated.',
    instructions_zh: '坐姿将哑铃下放至头后。'
  },
  {
    id: 'arm_bb_close_bench',
    name: 'Close Grip Bench Press',
    name_zh: '窄距卧推',
    target_muscle: MuscleGroup.ARMS,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80',
    instructions: 'Bench press with narrow grip.',
    instructions_zh: '窄握距进行卧推。'
  },
  {
    id: 'arm_bw_dips',
    name: 'Tricep Dips',
    name_zh: '双杠臂屈伸(三头)',
    target_muscle: MuscleGroup.ARMS,
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
    instructions: 'Keep body upright to target triceps.',
    instructions_zh: '保持身体直立以侧重三头肌。'
  },

  // ==================== CORE (F) ====================
  {
    id: 'core_plank',
    name: 'Plank',
    name_zh: '平板支撑',
    target_muscle: MuscleGroup.CORE,
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
    instructions: 'Hold straight body position.',
    instructions_zh: '保持身体呈一条直线。'
  },
  {
    id: 'core_leg_raise',
    name: 'Hanging Leg Raise',
    name_zh: '悬垂举腿',
    target_muscle: MuscleGroup.CORE,
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
    instructions: 'Hang from bar and lift legs.',
    instructions_zh: '悬挂于单杠并抬起双腿。'
  },
  {
    id: 'core_ab_wheel',
    name: 'Ab Wheel Rollout',
    name_zh: '健腹轮',
    target_muscle: MuscleGroup.CORE,
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
    instructions: 'Roll out forward and back.',
    instructions_zh: '向前滚出并收回。'
  },
  {
    id: 'core_cable_woodchop',
    name: 'Cable Woodchopper',
    name_zh: '绳索伐木',
    target_muscle: MuscleGroup.CORE,
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
    instructions: 'Rotate torso pulling cable diagonally.',
    instructions_zh: '通过转体沿对角线拉动绳索。'
  },
  {
    id: 'core_russian_twist',
    name: 'Russian Twist',
    name_zh: '俄罗斯转体',
    target_muscle: MuscleGroup.CORE,
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
    instructions: 'Sit and rotate torso side to side.',
    instructions_zh: '坐姿左右转动躯干。'
  }
];

const DEFAULT_PROFILE: UserProfile = {
  id: 'local_user',
  name: 'Lifter',
  weight: 70,
  height: 175,
  language: 'en',
  strength_records: [
    { exercise_id: 'chest_bb_flat_bench', one_rep_max: 0 },
    { exercise_id: 'legs_bb_squat', one_rep_max: 0 },
    { exercise_id: 'back_bb_deadlift', one_rep_max: 0 },
  ]
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
  getProfile: (userId: string): UserProfile => {
    // Merge defaults to ensure new fields (like strength_records) exist for old users
    const stored = getLocal(getUserKey(BASE_KEYS.PROFILE, userId), {});
    return { ...DEFAULT_PROFILE, ...stored, id: userId };
  },
  
  saveProfile: (userId: string, profile: UserProfile) => {
    setLocal(getUserKey(BASE_KEYS.PROFILE, userId), profile);
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

  saveWorkoutLog: (userId: string, log: WorkoutLog) => {
    const key = getUserKey(BASE_KEYS.LOGS, userId);
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
  },

  saveActivePlan: (userId: string, plan: GeneratedPlan) => {
    setLocal(getUserKey(BASE_KEYS.ACTIVE_PLAN, userId), plan);
  },

  getActivePlan: (userId: string): GeneratedPlan | null => {
    return getLocal<GeneratedPlan | null>(getUserKey(BASE_KEYS.ACTIVE_PLAN, userId), null);
  }
};
