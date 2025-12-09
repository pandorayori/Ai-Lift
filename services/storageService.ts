
import { Exercise, ExerciseType, MuscleGroup, UserProfile, WorkoutLog, WorkoutPlan } from '../types';
import { supabase } from './supabase';

// --- Constants & Seed Data ---

const LEGACY_KEYS = {
  PROFILE: 'ai_lift_profile',
  LOGS: 'ai_lift_logs',
  EXERCISES: 'ai_lift_exercises',
  PLAN: 'ai_lift_plan'
};

let currentUserId = 'default_user';

// --- PROFESSIONAL EXERCISE LIBRARY SEED (Comprehensive) ---
const SEED_EXERCISES: Exercise[] = [
  // ==================== CHEST ====================
  // Upper Chest
  {
    id: 'chest_incline_bb',
    name: 'Incline Barbell Bench Press',
    name_zh: '上斜杠铃卧推',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Upper Chest',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80',
    instructions: 'Bench at 30-45 degrees. Lower bar to upper chest, press up vertically.',
    instructions_zh: '将卧推凳调整至30-45度。将杠铃下放至上胸部，垂直推起。'
  },
  {
    id: 'chest_incline_db',
    name: 'Incline Dumbbell Press',
    name_zh: '上斜哑铃卧推',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Upper Chest',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80',
    instructions: 'Press dumbbells overhead on incline bench, converging slightly at top.',
    instructions_zh: '在上斜凳上推举哑铃，顶端微微向内收缩，针对上胸发力。'
  },
  {
    id: 'chest_reverse_grip_db',
    name: 'Reverse Grip Dumbbell Press',
    name_zh: '反握哑铃卧推',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Upper Chest',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80',
    instructions: 'Palms facing you. Heavily recruits upper chest.',
    instructions_zh: '掌心朝向自己。这种握法能极大地刺激上胸。'
  },
  
  // Mid Chest
  {
    id: 'chest_flat_bb',
    name: 'Barbell Bench Press',
    name_zh: '平板杠铃卧推',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Mid Chest',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80',
    instructions: 'Classic compound movement. Lower to mid-chest, drive up with feet planted.',
    instructions_zh: '经典复合动作。杠铃落至乳头连线处，双脚踩实地面，发力推起。'
  },
  {
    id: 'chest_flat_db',
    name: 'Dumbbell Bench Press',
    name_zh: '平板哑铃卧推',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Mid Chest',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80',
    instructions: 'Allows greater range of motion than barbell. Keep elbows at 45 degrees.',
    instructions_zh: '比杠铃卧推有更大的活动范围。保持手肘与身体呈45度夹角。'
  },
  {
    id: 'chest_pushup',
    name: 'Push-Up',
    name_zh: '俯卧撑',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Mid Chest',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1598971639058-211a74a96ded?auto=format&fit=crop&w=600&q=80',
    instructions: 'Keep core tight, body straight. Chest to floor.',
    instructions_zh: '核心收紧，身体呈直线。胸部贴近地面后推起。'
  },
  {
    id: 'chest_machine_press',
    name: 'Chest Press Machine',
    name_zh: '坐姿推胸机',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Mid Chest',
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    instructions: 'Stable movement. Focus on the squeeze.',
    instructions_zh: '动作稳定。专注于胸肌的挤压感。'
  },

  // Lower Chest
  {
    id: 'chest_dips',
    name: 'Chest Dips',
    name_zh: '胸肌双杠臂屈伸',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Lower Chest',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1598971639058-211a74a96ded?auto=format&fit=crop&w=600&q=80',
    instructions: 'Lean forward to target chest. Lower until shoulders below elbows.',
    instructions_zh: '身体前倾以侧重胸肌。下放至肩部低于肘部。'
  },
  {
    id: 'chest_decline_bb',
    name: 'Decline Bench Press',
    name_zh: '下斜杠铃卧推',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Lower Chest',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80',
    instructions: 'Target lower pecs. Be careful with racking/unracking.',
    instructions_zh: '针对下胸部。起落杠时需注意安全。'
  },
  {
    id: 'chest_high_cable_fly',
    name: 'High-to-Low Cable Fly',
    name_zh: '高位绳索夹胸',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Lower Chest',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1534367347848-9635e98544a8?auto=format&fit=crop&w=600&q=80',
    instructions: 'Pull down towards waist. Emphasize lower chest.',
    instructions_zh: '向下拉向腰间。着重刺激下胸。'
  },

  // Chest Fly Variations
  {
    id: 'chest_cable_fly_mid',
    name: 'Cable Fly (Middle)',
    name_zh: '绳索夹胸 (中位)',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Chest Fly Variations',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1534367347848-9635e98544a8?auto=format&fit=crop&w=600&q=80',
    instructions: 'Constant tension. Bring handles together in front of chest.',
    instructions_zh: '保持持续张力。将把手在胸前汇合。'
  },
  {
    id: 'chest_pec_deck',
    name: 'Pec Deck Machine',
    name_zh: '蝴蝶机夹胸',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Chest Fly Variations',
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1534367347848-9635e98544a8?auto=format&fit=crop&w=600&q=80',
    instructions: 'Keep elbows high. Squeeze pads together.',
    instructions_zh: '保持肘部抬高。向内挤压垫子直至接触。'
  },
  {
    id: 'chest_db_fly',
    name: 'Dumbbell Fly',
    name_zh: '哑铃飞鸟',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Chest Fly Variations',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80',
    instructions: 'Wide arc, slight bend in elbows. Feel the stretch.',
    instructions_zh: '做大的圆弧轨迹，手肘微屈。感受胸肌的拉伸。'
  },

  // ==================== BACK ====================
  // Vertical Pull
  {
    id: 'back_pullup',
    name: 'Pull-Up',
    name_zh: '引体向上',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Vertical Pull',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=600&q=80',
    instructions: 'Pronated grip (palms away). Pull chest to bar.',
    instructions_zh: '正握（掌心朝外）。将胸部拉向横杠，收紧背阔肌。'
  },
  {
    id: 'back_chinup',
    name: 'Chin-Up',
    name_zh: '反手引体向上',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Vertical Pull',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=600&q=80',
    instructions: 'Supinated grip. Hits lats and biceps.',
    instructions_zh: '反握。同时刺激背阔肌和肱二头肌。'
  },
  {
    id: 'back_lat_pulldown',
    name: 'Lat Pulldown',
    name_zh: '高位下拉',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Vertical Pull',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=600&q=80',
    instructions: 'Lean back slightly. Pull bar to upper chest.',
    instructions_zh: '身体微后仰。将横杆拉至上胸。'
  },
  
  // Horizontal Pull
  {
    id: 'back_bb_row',
    name: 'Bent Over Barbell Row',
    name_zh: '杠铃俯身划船',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Horizontal Pull',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1603287681836-e174ce5b7c4d?auto=format&fit=crop&w=600&q=80',
    instructions: 'Torso at 45 degrees. Pull bar to waist.',
    instructions_zh: '躯干前倾45度。将杠铃拉向腰腹部，背部挺直。'
  },
  {
    id: 'back_seated_row',
    name: 'Seated Cable Row',
    name_zh: '坐姿绳索划船',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Horizontal Pull',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=600&q=80',
    instructions: 'Retract scapula first, then pull handle to stomach.',
    instructions_zh: '先收缩肩胛骨，再将把手拉向腹部。'
  },
  {
    id: 'back_db_row',
    name: 'Single Arm Dumbbell Row',
    name_zh: '单臂哑铃划船',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Horizontal Pull',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?auto=format&fit=crop&w=600&q=80',
    instructions: 'Support on bench. Pull dumbbell to hip pocket.',
    instructions_zh: '单手支撑。将哑铃拉向髋部口袋位置。'
  },
  {
    id: 'back_tbar_row',
    name: 'T-Bar Row',
    name_zh: 'T型杠划船',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Horizontal Pull',
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1603287681836-e174ce5b7c4d?auto=format&fit=crop&w=600&q=80',
    instructions: 'Chest supported or standing. Thick back builder.',
    instructions_zh: '胸部支撑或站姿。打造背部厚度的利器。'
  },

  // Lower Back
  {
    id: 'back_deadlift',
    name: 'Deadlift',
    name_zh: '传统硬拉',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Lower Back',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1603287681836-e174ce5b7c4d?auto=format&fit=crop&w=600&q=80',
    instructions: 'Hinge at hips, keep spine neutral. Pull from floor.',
    instructions_zh: '髋部折叠，保持脊柱中立。从地面拉起重量。'
  },
  {
    id: 'back_extension',
    name: 'Back Extension',
    name_zh: '山羊挺身 (背屈伸)',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Lower Back',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=600&q=80',
    instructions: 'Pivot at hips. Squeeze glutes and lower back.',
    instructions_zh: '以髋部为轴。收缩臀部和下背部抬起上身。'
  },
  {
    id: 'back_superman',
    name: 'Superman',
    name_zh: '超人式',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Lower Back',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&w=600&q=80',
    instructions: 'Lie on stomach, lift arms and legs.',
    instructions_zh: '俯卧，同时抬起手臂和腿部。'
  },

  // ==================== SHOULDERS ====================
  // Front Delt
  {
    id: 'shoulder_ohp',
    name: 'Overhead Press',
    name_zh: '杠铃站姿推举',
    target_muscle: MuscleGroup.SHOULDERS,
    sub_category: 'Front Delt',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1532029837066-805e451672a4?auto=format&fit=crop&w=600&q=80',
    instructions: 'Strict press from collarbone to lockout.',
    instructions_zh: '从锁骨严格推至手臂锁定。'
  },
  {
    id: 'shoulder_db_press',
    name: 'Seated Dumbbell Press',
    name_zh: '坐姿哑铃推举',
    target_muscle: MuscleGroup.SHOULDERS,
    sub_category: 'Front Delt',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80',
    instructions: 'Back support helps lift heavier. Press overhead.',
    instructions_zh: '背部支撑有助于推起更大重量。向上推举。'
  },
  
  // Side Delt
  {
    id: 'shoulder_lat_raise',
    name: 'Dumbbell Lateral Raise',
    name_zh: '哑铃侧平举',
    target_muscle: MuscleGroup.SHOULDERS,
    sub_category: 'Side Delt',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80',
    instructions: 'Raise to sides, lead with elbows.',
    instructions_zh: '向两侧举起，手肘引导。'
  },
  {
    id: 'shoulder_cable_lat_raise',
    name: 'Cable Lateral Raise',
    name_zh: '绳索侧平举',
    target_muscle: MuscleGroup.SHOULDERS,
    sub_category: 'Side Delt',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&w=600&q=80',
    instructions: 'Constant tension on side delts.',
    instructions_zh: '对中束保持持续张力。'
  },
  {
    id: 'shoulder_upright_row',
    name: 'Upright Row',
    name_zh: '直立划船',
    target_muscle: MuscleGroup.SHOULDERS,
    sub_category: 'Side Delt',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1532029837066-805e451672a4?auto=format&fit=crop&w=600&q=80',
    instructions: 'Pull bar to chest level, elbows high.',
    instructions_zh: '将杠铃拉至胸部高度，肘部抬高。'
  },

  // Rear Delt
  {
    id: 'shoulder_face_pull',
    name: 'Face Pull',
    name_zh: '绳索面拉',
    target_muscle: MuscleGroup.SHOULDERS,
    sub_category: 'Rear Delt',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&w=600&q=80',
    instructions: 'Pull to forehead, externally rotate.',
    instructions_zh: '拉向额头，配合外旋。'
  },
  {
    id: 'shoulder_reverse_fly',
    name: 'Reverse Pec Deck',
    name_zh: '反向蝴蝶机',
    target_muscle: MuscleGroup.SHOULDERS,
    sub_category: 'Rear Delt',
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1534367347848-9635e98544a8?auto=format&fit=crop&w=600&q=80',
    instructions: 'Sit facing pad. Pull arms back.',
    instructions_zh: '面朝椅背坐。手臂伸直向后打开。'
  },

  // ==================== LEGS ====================
  // Quads
  {
    id: 'legs_squat',
    name: 'Barbell Back Squat',
    name_zh: '杠铃颈后深蹲',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Quads',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e01f5?auto=format&fit=crop&w=600&q=80',
    instructions: 'Squat deep, keeping chest up.',
    instructions_zh: '深度下蹲，保持挺胸。'
  },
  {
    id: 'legs_front_squat',
    name: 'Front Squat',
    name_zh: '颈前深蹲',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Quads',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e01f5?auto=format&fit=crop&w=600&q=80',
    instructions: 'Bar on front delts. Upright torso.',
    instructions_zh: '杠铃置于前束。躯干垂直。'
  },
  {
    id: 'legs_goblet_squat',
    name: 'Goblet Squat',
    name_zh: '高脚杯深蹲',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Quads',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e01f5?auto=format&fit=crop&w=600&q=80',
    instructions: 'Hold dumbbell at chest. Squat down.',
    instructions_zh: '在胸前持哑铃。下蹲。'
  },
  {
    id: 'legs_press',
    name: 'Leg Press',
    name_zh: '腿举倒蹬',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Quads',
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    instructions: 'Press weight up without locking knees.',
    instructions_zh: '蹬起重量但不要锁死膝盖。'
  },
  {
    id: 'legs_extension',
    name: 'Leg Extension',
    name_zh: '坐姿腿屈伸',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Quads',
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    instructions: 'Isolate quads. Squeeze at top.',
    instructions_zh: '孤立股四头肌。顶端收缩。'
  },
  {
    id: 'legs_lunge',
    name: 'Walking Lunge',
    name_zh: '行走箭步蹲',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Quads',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e01f5?auto=format&fit=crop&w=600&q=80',
    instructions: 'Step forward, lower knee to ground.',
    instructions_zh: '向前迈步，后膝下沉触地。'
  },

  // Hamstrings / Glutes
  {
    id: 'legs_rdl',
    name: 'Romanian Deadlift',
    name_zh: '罗马尼亚硬拉',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Hamstrings',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1567598508481-65985588e295?auto=format&fit=crop&w=600&q=80',
    instructions: 'Push hips back as far as possible.',
    instructions_zh: '尽可能向后推髋，感受腘绳肌拉伸。'
  },
  {
    id: 'legs_curl',
    name: 'Lying Leg Curl',
    name_zh: '俯身腿弯举',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Hamstrings',
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    instructions: 'Curl heels to butt.',
    instructions_zh: '将脚跟勾向臀部。'
  },
  {
    id: 'legs_hip_thrust',
    name: 'Barbell Hip Thrust',
    name_zh: '杠铃臀推',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Glutes',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e01f5?auto=format&fit=crop&w=600&q=80',
    instructions: 'Drive hips up squeezing glutes.',
    instructions_zh: '用力向上顶髋，收缩臀部。'
  },
  {
    id: 'legs_glute_bridge',
    name: 'Glute Bridge',
    name_zh: '臀桥',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Glutes',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e01f5?auto=format&fit=crop&w=600&q=80',
    instructions: 'Lie on back, lift hips.',
    instructions_zh: '仰卧，抬起臀部。'
  },

  // Calves
  {
    id: 'legs_calf_raise',
    name: 'Standing Calf Raise',
    name_zh: '站姿提踵',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Calves',
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    instructions: 'Full stretch at bottom, high peak.',
    instructions_zh: '底部完全拉伸，顶部高高踮起。'
  },
  {
    id: 'legs_seated_calf',
    name: 'Seated Calf Raise',
    name_zh: '坐姿提踵',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Calves',
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    instructions: 'Targets the soleus muscle.',
    instructions_zh: '针对比目鱼肌。'
  },

  // ==================== ARMS ====================
  // Biceps
  {
    id: 'arm_bb_curl',
    name: 'Barbell Curl',
    name_zh: '杠铃弯举',
    target_muscle: MuscleGroup.ARMS,
    sub_category: 'Biceps',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
    instructions: 'Classic mass builder. Keep elbows tucked.',
    instructions_zh: '经典增肌动作。保持大臂夹紧。'
  },
  {
    id: 'arm_db_curl',
    name: 'Dumbbell Curl',
    name_zh: '哑铃弯举',
    target_muscle: MuscleGroup.ARMS,
    sub_category: 'Biceps',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
    instructions: 'Supinate wrists at top.',
    instructions_zh: '顶端外旋手腕。'
  },
  {
    id: 'arm_hammer_curl',
    name: 'Hammer Curl',
    name_zh: '锤式弯举',
    target_muscle: MuscleGroup.ARMS,
    sub_category: 'Biceps',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
    instructions: 'Palms facing each other.',
    instructions_zh: '掌心相对。'
  },
  {
    id: 'arm_preacher_curl',
    name: 'Preacher Curl',
    name_zh: '牧师凳弯举',
    target_muscle: MuscleGroup.ARMS,
    sub_category: 'Biceps',
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
    instructions: 'Eliminates cheating.',
    instructions_zh: '杜绝借力。'
  },

  // Triceps
  {
    id: 'arm_pushdown',
    name: 'Triceps Pushdown',
    name_zh: '绳索下压',
    target_muscle: MuscleGroup.ARMS,
    sub_category: 'Triceps',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    instructions: 'Keep elbows locked at sides.',
    instructions_zh: '大臂夹紧身体两侧。'
  },
  {
    id: 'arm_skullcrusher',
    name: 'Skullcrusher',
    name_zh: '仰卧臂屈伸',
    target_muscle: MuscleGroup.ARMS,
    sub_category: 'Triceps',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
    instructions: 'Lower bar to forehead.',
    instructions_zh: '杠铃下放至额头。'
  },
  {
    id: 'arm_overhead_ext',
    name: 'Overhead Extension',
    name_zh: '颈后臂屈伸',
    target_muscle: MuscleGroup.ARMS,
    sub_category: 'Triceps',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
    instructions: 'Stretch the long head.',
    instructions_zh: '充分拉伸肱三头肌长头。'
  },
  {
    id: 'arm_dips',
    name: 'Bench Dips',
    name_zh: '板凳臂屈伸',
    target_muscle: MuscleGroup.ARMS,
    sub_category: 'Triceps',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1598971639058-211a74a96ded?auto=format&fit=crop&w=600&q=80',
    instructions: 'Lower hips towards floor.',
    instructions_zh: '臀部向下放。'
  },
  
  // Forearms
  {
    id: 'arm_wrist_curl',
    name: 'Wrist Curl',
    name_zh: '腕弯举',
    target_muscle: MuscleGroup.ARMS,
    sub_category: 'Forearms',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
    instructions: 'Curl wrists upwards.',
    instructions_zh: '向上卷曲手腕。'
  },

  // ==================== CORE ====================
  {
    id: 'core_crunch',
    name: 'Crunch',
    name_zh: '卷腹',
    target_muscle: MuscleGroup.CORE,
    sub_category: 'Upper Abs',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&w=600&q=80',
    instructions: 'Lift shoulders off floor.',
    instructions_zh: '将肩部抬离地面。'
  },
  {
    id: 'core_leg_raise',
    name: 'Hanging Leg Raise',
    name_zh: '悬垂举腿',
    target_muscle: MuscleGroup.CORE,
    sub_category: 'Lower Abs',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=600&q=80',
    instructions: 'Lift legs to horizontal.',
    instructions_zh: '将腿抬至水平。'
  },
  {
    id: 'core_plank',
    name: 'Plank',
    name_zh: '平板支撑',
    target_muscle: MuscleGroup.CORE,
    sub_category: 'Abs',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&w=600&q=80',
    instructions: 'Isometric hold.',
    instructions_zh: '静力支撑。'
  },
  {
    id: 'core_russian_twist',
    name: 'Russian Twist',
    name_zh: '俄罗斯转体',
    target_muscle: MuscleGroup.CORE,
    sub_category: 'Obliques',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&w=600&q=80',
    instructions: 'Rotate torso side to side.',
    instructions_zh: '左右旋转躯干。'
  },
  {
    id: 'core_cable_crunch',
    name: 'Cable Crunch',
    name_zh: '绳索卷腹',
    target_muscle: MuscleGroup.CORE,
    sub_category: 'Upper Abs',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&w=600&q=80',
    instructions: 'Kneel and crunch downwards.',
    instructions_zh: '跪姿向下卷腹。'
  },

  // ==================== CARDIO/HIIT ====================
  {
    id: 'cardio_burpee',
    name: 'Burpee',
    name_zh: '波比跳',
    target_muscle: MuscleGroup.CARDIO,
    sub_category: 'HIIT',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80',
    instructions: 'Full body explosive movement.',
    instructions_zh: '全身爆发力动作。'
  },
  {
    id: 'cardio_jump_rope',
    name: 'Jump Rope',
    name_zh: '跳绳',
    target_muscle: MuscleGroup.CARDIO,
    sub_category: 'HIIT',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80',
    instructions: 'Jump over rope.',
    instructions_zh: '跳过绳子。'
  }
];

const DEFAULT_PROFILE: UserProfile = {
  id: 'user_1',
  name: 'Lifter',
  weight: 75,
  height: 175,
  language: 'zh' // Default Chinese
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
    return getLocal(keys.PROFILE, DEFAULT_PROFILE);
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
