

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

// --- PROFESSIONAL EXERCISE LIBRARY SEED (Xunji-Style Exhaustive) ---
const SEED_EXERCISES: Exercise[] = [
  // ==================== CHEST (胸部) ====================
  // --- Barbell ---
  {
    id: 'chest_bb_bench_flat',
    name: 'Flat Barbell Bench Press',
    name_zh: '平板杠铃卧推',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Mid Chest',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    tags: ['胸大肌', '力量', '三大项'],
    notes: '五点接触，沉肩，下放至乳头连线。',
    instructions: '5 points of contact. Lower to nipple line.',
    instructions_zh: '保持头、肩、臀、双脚接触。杠铃下放至乳头连线。',
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
    tags: ['上胸', '锁骨部'],
    notes: '30-45度椅背，落点锁骨下方。',
    instructions: '30-45 degree angle. Lower to just below clavicle.',
    instructions_zh: '调整椅背至30-45度。杠铃落点在锁骨下方。',
    ai_revision: true
  },
  {
    id: 'chest_bb_bench_decline',
    name: 'Decline Barbell Bench Press',
    name_zh: '下斜杠铃卧推',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Lower Chest',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    tags: ['下胸', '整体'],
    notes: '勾住腿部固定，落点下胸沿。',
    instructions: 'Secure legs. Lower bar to lower chest line.',
    instructions_zh: '双腿固定。杠铃下放至下胸肌边缘。',
    ai_revision: true
  },
  {
    id: 'chest_bb_bench_close',
    name: 'Close Grip Bench Press',
    name_zh: '窄距平板卧推',
    target_muscle: MuscleGroup.CHEST, // Primary Mover implies chest/tricep hybrid
    sub_category: 'Mid Chest',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    tags: ['三头肌', '中缝'],
    notes: '握距与肩同宽，手肘贴近身体。',
    instructions: 'Shoulder width grip. Keep elbows tucked.',
    instructions_zh: '握距与肩同宽。下放时手肘紧贴身体两侧。',
    ai_revision: true
  },
  {
    id: 'chest_bb_guillotine',
    name: 'Guillotine Press',
    name_zh: '颈前断头台卧推',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Upper Chest',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    tags: ['上胸', '拉伸'],
    notes: '落点颈部（需极度小心），手肘打开。',
    instructions: 'Lower to neck/upper chest. Flare elbows. CAUTION.',
    instructions_zh: '落点在颈部位置（需有人保护）。手肘充分打开以最大化拉伸。',
    ai_revision: true
  },
  {
    id: 'chest_bb_reverse',
    name: 'Reverse Grip Bench Press',
    name_zh: '反手杠铃卧推',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Upper Chest',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    tags: ['上胸', '三头肌'],
    notes: '掌心朝向头部，宽握。',
    instructions: 'Supinated grip. Slightly wider than shoulder width.',
    instructions_zh: '反手握杠（掌心朝头）。握距略宽于肩。',
    ai_revision: true
  },

  // --- Dumbbell ---
  {
    id: 'chest_db_press_flat',
    name: 'Flat Dumbbell Press',
    name_zh: '平板哑铃卧推',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Mid Chest',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    tags: ['自由器械', '单侧'],
    notes: '全幅度，推起时略微内收。',
    instructions: 'Full ROM. Converge slightly at top.',
    instructions_zh: '下放至最低点。推起时哑铃向中间靠拢。',
    ai_revision: true
  },
  {
    id: 'chest_db_press_incline',
    name: 'Incline Dumbbell Press',
    name_zh: '上斜哑铃卧推',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Upper Chest',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    tags: ['上胸'],
    notes: '30-45度，手肘不要过度外展。',
    instructions: '30-45 degree bench. Do not flare elbows excessively.',
    instructions_zh: '椅背30-45度。手肘与躯干呈60度左右。',
    ai_revision: true
  },
  {
    id: 'chest_db_fly_flat',
    name: 'Flat Dumbbell Fly',
    name_zh: '平板哑铃飞鸟',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Chest Fly Variations',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    tags: ['孤立', '拉伸'],
    notes: '手肘微屈固定，像抱树一样。',
    instructions: 'Slight bend in elbows. Hug a tree motion.',
    instructions_zh: '肘部微屈固定。做抱树状开合。感受胸肌拉伸。',
    ai_revision: true
  },
  {
    id: 'chest_db_hex_press',
    name: 'Hex Press',
    name_zh: '哑铃对握卧推',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Mid Chest',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    tags: ['中缝', '三头肌'],
    notes: '哑铃紧贴，用力互挤。',
    instructions: 'Press dumbbells together throughout movement.',
    instructions_zh: '双手掌心相对，哑铃紧贴。全程用力互挤推起。',
    ai_revision: true
  },
  {
    id: 'chest_db_pullover',
    name: 'Dumbbell Pullover',
    name_zh: '哑铃直臂上拉',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Upper Chest',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    tags: ['前锯肌', '扩胸'],
    notes: '仅肩关节运动，手肘微屈固定。',
    instructions: 'Movement at shoulders only. Keep elbows fixed.',
    instructions_zh: '仰卧，双手持哑铃过头顶。保持手肘固定，感受胸廓拉开。',
    ai_revision: true
  },

  // --- Machine ---
  {
    id: 'chest_mach_pec_deck',
    name: 'Pec Deck Fly',
    name_zh: '蝴蝶机夹胸',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Chest Fly Variations',
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    tags: ['孤立', '中缝'],
    notes: '大臂与地面平行，手肘微屈。',
    instructions: 'Upper arms parallel to floor. Squeeze chest.',
    instructions_zh: '大臂平行地面。利用胸肌力量内收，顶峰收缩。',
    ai_revision: true
  },
  {
    id: 'chest_mach_press_seated',
    name: 'Seated Chest Press',
    name_zh: '坐姿推胸机',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Mid Chest',
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    tags: ['固定器械'],
    notes: '把手高度对准中胸。',
    instructions: 'Align handles with mid-chest.',
    instructions_zh: '调整座椅，使把手对准胸部中线。',
    ai_revision: true
  },

  // --- Cable ---
  {
    id: 'chest_cable_fly_high',
    name: 'High-to-Low Cable Fly',
    name_zh: '高位绳索夹胸',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Lower Chest',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    tags: ['下胸', '轮廓'],
    notes: '由高向低拉，针对下胸。',
    instructions: 'Pull form high to low towards waist.',
    instructions_zh: '滑轮调高。双手向斜下方拉，针对下胸边缘。',
    ai_revision: true
  },
  {
    id: 'chest_cable_fly_mid',
    name: 'Mid Cable Fly',
    name_zh: '中位绳索夹胸',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Mid Chest',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    tags: ['中胸', '厚度'],
    notes: '水平内收。',
    instructions: 'Horizontal adduction.',
    instructions_zh: '滑轮齐肩高。水平向前环抱。',
    ai_revision: true
  },
  {
    id: 'chest_cable_fly_low',
    name: 'Low-to-High Cable Fly',
    name_zh: '低位绳索夹胸',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Upper Chest',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    tags: ['上胸', '前束'],
    notes: '由低向高拉，针对上胸。',
    instructions: 'Pull from low to high (eye level).',
    instructions_zh: '滑轮调低。双手向斜上方拉至视线高度。',
    ai_revision: true
  },

  // --- Bodyweight ---
  {
    id: 'chest_bw_pushup',
    name: 'Push Up',
    name_zh: '标准俯卧撑',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Mid Chest',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&w=800&q=80',
    tags: ['自重', '核心'],
    notes: '身体成直线，核心收紧。',
    instructions: 'Straight body line. Core tight.',
    instructions_zh: '头背臀呈直线。核心收紧。胸部贴近地面。',
    ai_revision: true
  },
  {
    id: 'chest_bw_dips',
    name: 'Chest Dips',
    name_zh: '双杠臂屈伸 (胸部)',
    target_muscle: MuscleGroup.CHEST,
    sub_category: 'Lower Chest',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&w=800&q=80',
    tags: ['下胸', '自重'],
    notes: '身体前倾，手肘外展。',
    instructions: 'Lean forward. Flare elbows slightly.',
    instructions_zh: '躯干前倾。屈肘下放，感受下胸拉伸。',
    ai_revision: true
  },

  // ==================== BACK (背部) ====================
  // --- Vertical Pull ---
  {
    id: 'back_pullup',
    name: 'Pull Up',
    name_zh: '正手引体向上',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Vertical Pull',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1598971639058-211a73287750?auto=format&fit=crop&w=800&q=80',
    tags: ['宽度', '背阔肌'],
    notes: '正手宽握，下巴过杠。',
    instructions: 'Pronated grip. Chin over bar.',
    instructions_zh: '正手宽握。沉肩，将下巴拉过单杠。',
    ai_revision: true
  },
  {
    id: 'back_chinup',
    name: 'Chin Up',
    name_zh: '反手引体向上',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Vertical Pull',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1598971639058-211a73287750?auto=format&fit=crop&w=800&q=80',
    tags: ['二头肌', '背阔肌'],
    notes: '反手窄握。',
    instructions: 'Supinated grip. Shoulder width.',
    instructions_zh: '反手握杠（掌心朝己）。',
    ai_revision: true
  },
  {
    id: 'back_lat_pulldown_wide',
    name: 'Lat Pulldown (Wide)',
    name_zh: '宽握高位下拉',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Vertical Pull',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1598971639058-211a73287750?auto=format&fit=crop&w=800&q=80',
    tags: ['宽度', '背阔肌'],
    notes: '宽握正手，拉至上胸。',
    instructions: 'Wide pronated grip. Pull to upper chest.',
    instructions_zh: '宽握。躯干微后倾。拉至锁骨位置。',
    ai_revision: true
  },
  {
    id: 'back_lat_pulldown_reverse',
    name: 'Lat Pulldown (Reverse)',
    name_zh: '反手高位下拉',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Vertical Pull',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1598971639058-211a73287750?auto=format&fit=crop&w=800&q=80',
    tags: ['下背阔', '二头肌'],
    notes: '反手与肩同宽，肘部内收。',
    instructions: 'Supinated grip. Tuck elbows.',
    instructions_zh: '反手握杆。下拉时肘部紧贴身体两侧。',
    ai_revision: true
  },
  {
    id: 'back_straight_arm_pulldown',
    name: 'Straight Arm Pulldown',
    name_zh: '直臂下压',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Vertical Pull',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1598971639058-211a73287750?auto=format&fit=crop&w=800&q=80',
    tags: ['孤立', '大圆肌'],
    notes: '手臂微屈固定，仅肩关节运动。',
    instructions: 'Fixed elbows. Hinge at shoulders only.',
    instructions_zh: '手臂微屈固定。利用背部力量将直杆压向大腿。',
    ai_revision: true
  },

  // --- Horizontal Pull ---
  {
    id: 'back_bb_row',
    name: 'Barbell Bent Over Row',
    name_zh: '杠铃俯身划船',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Horizontal Pull',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
    tags: ['厚度', '整体'],
    notes: '脊柱中立，俯身45度。',
    instructions: 'Neutral spine. 45 degree hinge. Pull to waist.',
    instructions_zh: '保持背部挺直。杠铃沿大腿拉向小腹。',
    ai_revision: true
  },
  {
    id: 'back_pendlay_row',
    name: 'Pendlay Row',
    name_zh: '潘德勒划船',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Horizontal Pull',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
    tags: ['爆发力', '厚度'],
    notes: '每次回落至地面，背部平行地面。',
    instructions: 'Reset on floor each rep. Back parallel to ground.',
    instructions_zh: '躯干平行地面。每次动作杠铃触底重置。',
    ai_revision: true
  },
  {
    id: 'back_db_row_one_arm',
    name: 'One Arm Dumbbell Row',
    name_zh: '哑铃单臂划船',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Horizontal Pull',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
    tags: ['单侧', '背阔肌'],
    notes: '手拉向臀部方向，不仅是向上。',
    instructions: 'Pull dumbbell towards hip pocket.',
    instructions_zh: '单手支撑。将哑铃划向臀部方向（划弧线）。',
    ai_revision: true
  },
  {
    id: 'back_cable_row_seated',
    name: 'Seated Cable Row',
    name_zh: '坐姿绳索划船',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Horizontal Pull',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
    tags: ['厚度', '中背'],
    notes: '挺胸，挤压肩胛骨。',
    instructions: 'Chest up. Squeeze shoulder blades.',
    instructions_zh: '背部挺直。拉回时挺胸夹背，回放时送肩。',
    ai_revision: true
  },
  {
    id: 'back_chest_supported_row',
    name: 'Chest Supported Row',
    name_zh: '上斜俯身哑铃划船',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Horizontal Pull',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
    tags: ['孤立', '下背保护'],
    notes: '胸部贴住上斜凳，减少借力。',
    instructions: 'Chest against incline bench. Isolate back.',
    instructions_zh: '胸部紧贴上斜椅背。双臂自然下垂后拉。',
    ai_revision: true
  },

  // --- Lower Back ---
  {
    id: 'back_deadlift_conventional',
    name: 'Conventional Deadlift',
    name_zh: '传统硬拉',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Lower Back',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1567598508481-65985588e295?auto=format&fit=crop&w=800&q=80',
    tags: ['力量', '后链'],
    notes: '杠铃贴腿，髋膝同动。',
    instructions: 'Bar close to shins. Hinge and drive.',
    instructions_zh: '双脚与髋同宽。脊柱中立。拉起时杠铃紧贴腿部。',
    ai_revision: true
  },
  {
    id: 'back_hyperextension',
    name: 'Back Hyperextension',
    name_zh: '山羊挺身',
    target_muscle: MuscleGroup.BACK,
    sub_category: 'Lower Back',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1567598508481-65985588e295?auto=format&fit=crop&w=800&q=80',
    tags: ['竖脊肌', '热身'],
    notes: '髋部折叠，不要过度反弓腰椎。',
    instructions: 'Hinge at hips. Do not hyperextend spine excessively.',
    instructions_zh: '以髋部为轴折叠。起身至身体成直线即可，不要过度后仰。',
    ai_revision: true
  },

  // ==================== SHOULDERS (肩部) ====================
  // --- Front Delt ---
  {
    id: 'shoulder_ohp_bb',
    name: 'Overhead Press',
    name_zh: '杠铃站姿推举',
    target_muscle: MuscleGroup.SHOULDERS,
    sub_category: 'Front Delt',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1532029837206-abbe2b7a4bdd?auto=format&fit=crop&w=800&q=80',
    tags: ['核心', '力量'],
    notes: '核心收紧，杠铃轨迹垂直。',
    instructions: 'Tight core. Vertical bar path.',
    instructions_zh: '核心收紧。杠铃垂直上推，头部前后避让。',
    ai_revision: true
  },
  {
    id: 'shoulder_db_press_seated',
    name: 'Seated Dumbbell Press',
    name_zh: '坐姿哑铃推举',
    target_muscle: MuscleGroup.SHOULDERS,
    sub_category: 'Front Delt',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1532029837206-abbe2b7a4bdd?auto=format&fit=crop&w=800&q=80',
    tags: ['前束', '稳定性'],
    notes: '椅背90度，手肘微内收。',
    instructions: '90 degree bench. Elbows slightly tucked.',
    instructions_zh: '坐姿，背部贴紧。双手持哑铃上推至手臂伸直。',
    ai_revision: true
  },
  {
    id: 'shoulder_arnold_press',
    name: 'Arnold Press',
    name_zh: '阿诺德推举',
    target_muscle: MuscleGroup.SHOULDERS,
    sub_category: 'Front Delt',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1532029837206-abbe2b7a4bdd?auto=format&fit=crop&w=800&q=80',
    tags: ['前束', '旋转'],
    notes: '起始掌心朝内，推起旋转至朝前。',
    instructions: 'Start palms facing you. Rotate to palms forward.',
    instructions_zh: '起始时掌心朝己。推起过程中旋转手腕至掌心朝前。',
    ai_revision: true
  },
  {
    id: 'shoulder_front_raise_db',
    name: 'Dumbbell Front Raise',
    name_zh: '哑铃前平举',
    target_muscle: MuscleGroup.SHOULDERS,
    sub_category: 'Front Delt',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1532029837206-abbe2b7a4bdd?auto=format&fit=crop&w=800&q=80',
    tags: ['孤立'],
    notes: '不要耸肩，举至视线高度。',
    instructions: 'No shrugging. Raise to eye level.',
    instructions_zh: '不要借助惯性。交替或同时举起哑铃至视线高度。',
    ai_revision: true
  },

  // --- Side Delt ---
  {
    id: 'shoulder_lat_raise_db',
    name: 'Dumbbell Lateral Raise',
    name_zh: '哑铃侧平举',
    target_muscle: MuscleGroup.SHOULDERS,
    sub_category: 'Side Delt',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1532029837206-abbe2b7a4bdd?auto=format&fit=crop&w=800&q=80',
    tags: ['中束', '宽度'],
    notes: '肘部微屈，以肘带手。',
    instructions: 'Lead with elbows. Slight bend.',
    instructions_zh: '肘部微屈。用肘部带动大臂向侧上方抬起。',
    ai_revision: true
  },
  {
    id: 'shoulder_lat_raise_cable',
    name: 'Cable Lateral Raise',
    name_zh: '绳索侧平举',
    target_muscle: MuscleGroup.SHOULDERS,
    sub_category: 'Side Delt',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1532029837206-abbe2b7a4bdd?auto=format&fit=crop&w=800&q=80',
    tags: ['持续张力'],
    notes: '绳索从身后或身前通过。',
    instructions: 'Cable behind or in front of body.',
    instructions_zh: '单手持绳索。向侧上方平举，保持张力。',
    ai_revision: true
  },
  {
    id: 'shoulder_upright_row',
    name: 'Upright Row',
    name_zh: '杠铃直立划船',
    target_muscle: MuscleGroup.SHOULDERS,
    sub_category: 'Side Delt',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1532029837206-abbe2b7a4bdd?auto=format&fit=crop&w=800&q=80',
    tags: ['中束', '斜方肌'],
    notes: '宽握（减少肩峰撞击），肘高于手。',
    instructions: 'Wide grip for safety. Elbows higher than hands.',
    instructions_zh: '采用宽握距。贴身拉起，肘部高于手腕。',
    ai_revision: true
  },
  
  // --- Rear Delt ---
  {
    id: 'shoulder_face_pull',
    name: 'Face Pull',
    name_zh: '绳索面拉',
    target_muscle: MuscleGroup.SHOULDERS,
    sub_category: 'Rear Delt',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1532029837206-abbe2b7a4bdd?auto=format&fit=crop&w=800&q=80',
    tags: ['后束', '肩袖'],
    notes: '拉向额头，外旋手臂。',
    instructions: 'Pull to forehead. Externally rotate.',
    instructions_zh: '拉向面部。末端做外旋动作（双手向后）。',
    ai_revision: true
  },
  {
    id: 'shoulder_reverse_fly',
    name: 'Reverse Dumbbell Fly',
    name_zh: '俯身哑铃飞鸟',
    target_muscle: MuscleGroup.SHOULDERS,
    sub_category: 'Rear Delt',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1532029837206-abbe2b7a4bdd?auto=format&fit=crop&w=800&q=80',
    tags: ['后束'],
    notes: '俯身，手臂向后展开。',
    instructions: 'Bend over. Open arms to sides.',
    instructions_zh: '俯身保持背部挺直。向后侧方举起哑铃。',
    ai_revision: true
  },
  {
    id: 'shoulder_reverse_pec_deck',
    name: 'Reverse Pec Deck',
    name_zh: '蝴蝶机反向飞鸟',
    target_muscle: MuscleGroup.SHOULDERS,
    sub_category: 'Rear Delt',
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1532029837206-abbe2b7a4bdd?auto=format&fit=crop&w=800&q=80',
    tags: ['后束', '固定'],
    notes: '反坐在蝴蝶机上。',
    instructions: 'Sit facing pad. Pull handles back.',
    instructions_zh: '面对椅背坐。手臂向后平拉。',
    ai_revision: true
  },

  // --- Traps ---
  {
    id: 'shoulder_shrug_db',
    name: 'Dumbbell Shrug',
    name_zh: '哑铃耸肩',
    target_muscle: MuscleGroup.SHOULDERS,
    sub_category: 'Side Delt', // Actually Traps, grouped under Shoulder usually
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1532029837206-abbe2b7a4bdd?auto=format&fit=crop&w=800&q=80',
    tags: ['斜方肌'],
    notes: '直上直下，不要旋转肩膀。',
    instructions: 'Straight up and down. No rolling.',
    instructions_zh: '双手持铃。垂直向上耸起肩膀，不要旋转。',
    ai_revision: true
  },

  // ==================== LEGS (腿部) ====================
  // --- Quads ---
  {
    id: 'legs_sq_highbar',
    name: 'Barbell Back Squat',
    name_zh: '杠铃颈后深蹲',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Quads',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e04ca?auto=format&fit=crop&w=800&q=80',
    tags: ['力量', '核心'],
    notes: '髋膝联动，膝盖对脚尖。',
    instructions: 'Hips and knees break together. Knees over toes.',
    instructions_zh: '杠铃置于斜方肌上。下蹲至大腿平行地面。',
    ai_revision: true
  },
  {
    id: 'legs_front_squat',
    name: 'Front Squat',
    name_zh: '颈前深蹲',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Quads',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e04ca?auto=format&fit=crop&w=800&q=80',
    tags: ['股四头肌', '核心'],
    notes: '肘部抬高，躯干垂直。',
    instructions: 'Elbows high. Torso vertical.',
    instructions_zh: '杠铃架在三角肌前束。保持肘部抬高，躯干垂直下蹲。',
    ai_revision: true
  },
  {
    id: 'legs_goblet_squat',
    name: 'Goblet Squat',
    name_zh: '高脚杯深蹲',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Quads',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e04ca?auto=format&fit=crop&w=800&q=80',
    tags: ['新手友好', '深蹲模式'],
    notes: '手持哑铃于胸前。',
    instructions: 'Hold weight at chest. Squat deep.',
    instructions_zh: '双手捧住哑铃一端置于胸前。下蹲时手肘在膝盖内侧。',
    ai_revision: true
  },
  {
    id: 'legs_leg_press',
    name: 'Leg Press',
    name_zh: '倒蹬/腿举',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Quads',
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e04ca?auto=format&fit=crop&w=800&q=80',
    tags: ['大重量', '安全'],
    notes: '屁股不要离开椅背，膝盖不锁死。',
    instructions: 'Glutes on pad. No lockout.',
    instructions_zh: '下背部紧贴靠背。推起至顶端膝盖微屈。',
    ai_revision: true
  },
  {
    id: 'legs_lunge_walking',
    name: 'Walking Lunge',
    name_zh: '箭步蹲行走',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Quads',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e04ca?auto=format&fit=crop&w=800&q=80',
    tags: ['单腿', '动态'],
    notes: '后膝接近地面，躯干直立。',
    instructions: 'Rear knee to ground. Torso upright.',
    instructions_zh: '向前迈步下蹲。后膝接近地面。',
    ai_revision: true
  },
  {
    id: 'legs_bulgarian_split',
    name: 'Bulgarian Split Squat',
    name_zh: '保加利亚分腿蹲',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Quads',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e04ca?auto=format&fit=crop&w=800&q=80',
    tags: ['单腿', '痛苦'],
    notes: '后脚搭在凳子上，前倾练臀，直立练腿。',
    instructions: 'Rear foot elevated. Drop hips down.',
    instructions_zh: '后脚背搭在训练凳上。单腿下蹲。',
    ai_revision: true
  },
  {
    id: 'legs_extension',
    name: 'Leg Extension',
    name_zh: '坐姿腿屈伸',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Quads',
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e04ca?auto=format&fit=crop&w=800&q=80',
    tags: ['孤立', '泵感'],
    notes: '膝盖对准轴心。',
    instructions: 'Align knee with pivot. Extend fully.',
    instructions_zh: '调整靠背使膝盖对准器械转轴。用力伸直小腿。',
    ai_revision: true
  },

  // --- Hamstrings ---
  {
    id: 'legs_rdl_bb',
    name: 'Romanian Deadlift',
    name_zh: '罗马尼亚硬拉',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Hamstrings',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1567598508481-65985588e295?auto=format&fit=crop&w=800&q=80',
    tags: ['后链', '伸髋'],
    notes: '微屈膝，屁股向后推。',
    instructions: 'Soft knees. Hinge hips back.',
    instructions_zh: '膝盖微屈固定。臀部向后推，杠铃沿腿部下放。',
    ai_revision: true
  },
  {
    id: 'legs_curl_lying',
    name: 'Lying Leg Curl',
    name_zh: '俯卧腿弯举',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Hamstrings',
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1567598508481-65985588e295?auto=format&fit=crop&w=800&q=80',
    tags: ['孤立'],
    notes: '髋部贴紧垫子。',
    instructions: 'Hips down. Curl to glutes.',
    instructions_zh: '俯卧。保持髋部不离开垫面。勾腿至臀部。',
    ai_revision: true
  },
  {
    id: 'legs_curl_seated',
    name: 'Seated Leg Curl',
    name_zh: '坐姿腿弯举',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Hamstrings',
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1567598508481-65985588e295?auto=format&fit=crop&w=800&q=80',
    tags: ['孤立'],
    notes: '压紧大腿固定垫。',
    instructions: 'Secure thigh pad. Curl under.',
    instructions_zh: '调整大腿压垫。向下弯举小腿。',
    ai_revision: true
  },

  // --- Glutes ---
  {
    id: 'legs_hip_thrust',
    name: 'Barbell Hip Thrust',
    name_zh: '杠铃臀推',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Glutes',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1567598508481-65985588e295?auto=format&fit=crop&w=800&q=80',
    tags: ['臀大肌'],
    notes: '肩胛骨下沿靠凳，下巴内收。',
    instructions: 'Scapula on bench. Chin tucked. Drive hips up.',
    instructions_zh: '背部靠凳。杠铃置于髋部。臀部发力顶起至水平。',
    ai_revision: true
  },
  {
    id: 'legs_cable_pullthrough',
    name: 'Cable Pull Through',
    name_zh: '绳索后拉/胯下绳索',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Glutes',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1567598508481-65985588e295?auto=format&fit=crop&w=800&q=80',
    tags: ['伸髋'],
    notes: '背向滑轮，从胯下向前推。',
    instructions: 'Face away. Hinge back. Drive hips forward.',
    instructions_zh: '背对龙门架。绳索从胯下穿过。臀部发力向前顶。',
    ai_revision: true
  },

  // --- Calves ---
  {
    id: 'legs_calf_standing',
    name: 'Standing Calf Raise',
    name_zh: '站姿提踵',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Calves',
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e04ca?auto=format&fit=crop&w=800&q=80',
    tags: ['腓肠肌'],
    notes: '膝盖微屈但不弯曲。',
    instructions: 'Knees straight but not locked. Full stretch.',
    instructions_zh: '膝盖伸直。下放至脚跟低于踏板，用力踮起。',
    ai_revision: true
  },
  {
    id: 'legs_calf_seated',
    name: 'Seated Calf Raise',
    name_zh: '坐姿提踵',
    target_muscle: MuscleGroup.LEGS,
    sub_category: 'Calves',
    type: ExerciseType.MACHINE,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e04ca?auto=format&fit=crop&w=800&q=80',
    tags: ['比目鱼肌'],
    notes: '屈膝90度。',
    instructions: 'Knees bent 90 degrees.',
    instructions_zh: '坐姿，大腿压垫。主要刺激比目鱼肌。',
    ai_revision: true
  },

  // ==================== ARMS (手臂) ====================
  // --- Biceps ---
  {
    id: 'arm_curl_bb',
    name: 'Barbell Curl',
    name_zh: '杠铃弯举',
    target_muscle: MuscleGroup.ARMS,
    sub_category: 'Biceps',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    tags: ['长头', '短头'],
    notes: '大臂夹紧，身体不晃动。',
    instructions: 'Elbows pinned. No swinging.',
    instructions_zh: '大臂夹紧身体。仅前臂移动，不要借力。',
    ai_revision: true
  },
  {
    id: 'arm_curl_db_alt',
    name: 'Alternating Dumbbell Curl',
    name_zh: '哑铃交替弯举',
    target_muscle: MuscleGroup.ARMS,
    sub_category: 'Biceps',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    tags: ['单侧', '旋转'],
    notes: '掌心朝上或旋转。',
    instructions: 'Supinate wrist at top.',
    instructions_zh: '交替进行。举起时旋转手腕至掌心朝上。',
    ai_revision: true
  },
  {
    id: 'arm_curl_hammer',
    name: 'Hammer Curl',
    name_zh: '锤式弯举',
    target_muscle: MuscleGroup.ARMS,
    sub_category: 'Biceps',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    tags: ['肱肌', '前臂'],
    notes: '掌心相对（对握）。',
    instructions: 'Neutral grip (thumbs up).',
    instructions_zh: '掌心相对（竖握哑铃）。像锤子一样举起。',
    ai_revision: true
  },
  {
    id: 'arm_curl_preacher',
    name: 'Preacher Curl',
    name_zh: '牧师椅弯举',
    target_muscle: MuscleGroup.ARMS,
    sub_category: 'Biceps',
    type: ExerciseType.BARBELL, // EZ Bar technically
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    tags: ['短头', '孤立'],
    notes: '大臂完全贴合垫子。',
    instructions: 'Triceps flat on pad. Full extension.',
    instructions_zh: '大臂紧贴斜板。下放至手臂伸直。',
    ai_revision: true
  },
  {
    id: 'arm_curl_incline',
    name: 'Incline Dumbbell Curl',
    name_zh: '上斜哑铃弯举',
    target_muscle: MuscleGroup.ARMS,
    sub_category: 'Biceps',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    tags: ['长头', '拉伸'],
    notes: '坐在上斜凳上，手臂自然垂直地面。',
    instructions: 'Seated incline. Arms hang back.',
    instructions_zh: '仰卧在上斜凳。手臂自然下垂。保持大臂不动弯举。',
    ai_revision: true
  },
  {
    id: 'arm_curl_cable',
    name: 'Cable Curl',
    name_zh: '绳索弯举',
    target_muscle: MuscleGroup.ARMS,
    sub_category: 'Biceps',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    tags: ['持续张力'],
    notes: '低位滑轮。',
    instructions: 'Low pulley. Constant tension.',
    instructions_zh: '使用低位绳索。动作全程保持肌肉张力。',
    ai_revision: true
  },

  // --- Triceps ---
  {
    id: 'arm_pushdown_rope',
    name: 'Tricep Rope Pushdown',
    name_zh: '绳索下压 (绳把)',
    target_muscle: MuscleGroup.ARMS,
    sub_category: 'Triceps',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    tags: ['外侧头'],
    notes: '底部把绳索拉开。',
    instructions: 'Spread rope at bottom.',
    instructions_zh: '大臂固定。下压到底部时向两侧拉开绳索。',
    ai_revision: true
  },
  {
    id: 'arm_pushdown_bar',
    name: 'Tricep Bar Pushdown',
    name_zh: '绳索下压 (直杆)',
    target_muscle: MuscleGroup.ARMS,
    sub_category: 'Triceps',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    tags: ['侧头', '大重量'],
    notes: '正手握杆。',
    instructions: 'Pronated grip. Push down.',
    instructions_zh: '正手握直杆。用力下压至手臂伸直。',
    ai_revision: true
  },
  {
    id: 'arm_skullcrusher',
    name: 'Skullcrusher',
    name_zh: '仰卧臂屈伸/碎颅者',
    target_muscle: MuscleGroup.ARMS,
    sub_category: 'Triceps',
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    tags: ['长头', '力量'],
    notes: '杠铃落向额头或头顶后方。',
    instructions: 'Lower bar to forehead/behind head. Elbows in.',
    instructions_zh: '仰卧。大臂微向后倾。屈肘将杠铃放至额头上方。',
    ai_revision: true
  },
  {
    id: 'arm_overhead_ext_db',
    name: 'Seated Overhead Extension',
    name_zh: '坐姿哑铃颈后臂屈伸',
    target_muscle: MuscleGroup.ARMS,
    sub_category: 'Triceps',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    tags: ['长头'],
    notes: '双手托住一个哑铃，肘部朝天。',
    instructions: 'Elbows up. Lower DB behind neck.',
    instructions_zh: '双手持一个哑铃置于颈后。伸直手臂将其推起。',
    ai_revision: true
  },
  {
    id: 'arm_kickback',
    name: 'Tricep Kickback',
    name_zh: '哑铃俯身臂屈伸',
    target_muscle: MuscleGroup.ARMS,
    sub_category: 'Triceps',
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    tags: ['孤立', '收缩'],
    notes: '大臂平行地面固定。',
    instructions: 'Upper arm parallel to floor. Extend back.',
    instructions_zh: '俯身，大臂夹紧并抬高。向后伸直手臂。',
    ai_revision: true
  },
  {
    id: 'arm_dips_bench',
    name: 'Bench Dips',
    name_zh: '板凳臂屈伸',
    target_muscle: MuscleGroup.ARMS,
    sub_category: 'Triceps',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    tags: ['自重'],
    notes: '背部贴近凳子边缘。',
    instructions: 'Hands on bench behind you. Lower hips.',
    instructions_zh: '双手撑在身后凳子上。屈肘下放身体。',
    ai_revision: true
  },

  // ==================== CORE (核心) ====================
  {
    id: 'core_plank',
    name: 'Plank',
    name_zh: '平板支撑',
    target_muscle: MuscleGroup.CORE,
    sub_category: 'Upper Abs',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&w=800&q=80',
    tags: ['静力'],
    notes: '骨盆后倾，不要塌腰。',
    instructions: 'Straight line. Posterior pelvic tilt.',
    instructions_zh: '肘撑地。收紧腹臀，身体呈直线。',
    ai_revision: true
  },
  {
    id: 'core_crunch',
    name: 'Crunch',
    name_zh: '卷腹',
    target_muscle: MuscleGroup.CORE,
    sub_category: 'Upper Abs',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&w=800&q=80',
    tags: ['上腹'],
    notes: '下背部不离地，卷起上背。',
    instructions: 'Lower back stays on floor. Curl up.',
    instructions_zh: '下背部紧贴地面。利用腹肌力量卷起上背部。',
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
    tags: ['下腹', '悬垂'],
    notes: '卷骨盆，避免惯性。',
    instructions: 'Flex pelvis up. Control swing.',
    instructions_zh: '悬垂。卷动骨盆将腿抬高。控制下放。',
    ai_revision: true
  },
  {
    id: 'core_russian_twist',
    name: 'Russian Twist',
    name_zh: '俄罗斯转体',
    target_muscle: MuscleGroup.CORE,
    sub_category: 'Obliques',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&w=800&q=80',
    tags: ['侧腹'],
    notes: 'V字支撑，左右转动躯干。',
    instructions: 'V-sit position. Rotate torso L/R.',
    instructions_zh: '坐姿V字支撑。双手交替触碰身体两侧地面。',
    ai_revision: true
  },
  {
    id: 'core_ab_wheel',
    name: 'Ab Wheel Rollout',
    name_zh: '健腹轮',
    target_muscle: MuscleGroup.CORE,
    sub_category: 'Upper Abs',
    type: ExerciseType.BODYWEIGHT, // Or Equipment
    image_url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&w=800&q=80',
    tags: ['进阶', '抗伸展'],
    notes: '收紧核心，不要塌腰。',
    instructions: 'Keep core tight. Do not sag hips.',
    instructions_zh: '跪姿。向前推出至身体伸直，核心收紧拉回。',
    ai_revision: true
  },
  {
    id: 'core_woodchopper',
    name: 'Cable Woodchopper',
    name_zh: '绳索伐木',
    target_muscle: MuscleGroup.CORE,
    sub_category: 'Obliques',
    type: ExerciseType.CABLE,
    image_url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&w=800&q=80',
    tags: ['旋转', '功能性'],
    notes: '模仿伐木动作，对角线拉动。',
    instructions: 'Diagonal pull across body. Rotate torso.',
    instructions_zh: '侧向站立。双手持绳索从高处向对侧膝盖方向砍下。',
    ai_revision: true
  },
  
  // --- Cardio / Functional ---
  {
    id: 'cardio_burpee',
    name: 'Burpee',
    name_zh: '波比跳',
    target_muscle: MuscleGroup.CARDIO,
    sub_category: 'HIIT',
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80',
    tags: ['燃脂', '全身'],
    notes: '深蹲-俯卧撑-跳跃。',
    instructions: 'Squat, plank, pushup, jump.',
    instructions_zh: '下蹲支撑，完成俯卧撑，收腿跳起。',
    ai_revision: true
  },
  {
    id: 'cardio_kettlebell_swing',
    name: 'Kettlebell Swing',
    name_zh: '壶铃摆荡',
    target_muscle: MuscleGroup.LEGS, // Or Cardio/Back
    sub_category: 'Hamstrings',
    type: ExerciseType.KETTLEBELL,
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80',
    tags: ['爆发力', '后链'],
    notes: '髋部发力（Hip Snap），不要用手举。',
    instructions: 'Hinge at hips. Snap hips forward. Arms are hooks.',
    instructions_zh: '利用伸髋爆发力将壶铃向前荡起。手臂仅起连接作用。',
    ai_revision: true
  }
];

// Default 1RMs with REAL Exercise IDs
const DEFAULT_1RMS: OneRepMax[] = [
  { id: 'legs_sq_highbar', name: 'Barbell Back Squat', weight: 0, goal_weight: 0 },
  { id: 'chest_bb_bench_flat', name: 'Flat Barbell Bench Press', weight: 0, goal_weight: 0 },
  { id: 'back_deadlift_conventional', name: 'Conventional Deadlift', weight: 0, goal_weight: 0 }
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
    } else {
      // 1RM ID MIGRATION logic for existing users with old keys
      let needsMigration = false;
      const migratedMaxes = profile.oneRepMaxes.map(rm => {
        if (rm.id === 'sq') { needsMigration = true; return { ...rm, id: 'legs_sq_highbar', name: 'Barbell Back Squat' }; }
        if (rm.id === 'bp') { needsMigration = true; return { ...rm, id: 'chest_bb_bench_flat', name: 'Flat Barbell Bench Press' }; }
        if (rm.id === 'dl') { needsMigration = true; return { ...rm, id: 'back_deadlift_conventional', name: 'Conventional Deadlift' }; }
        return rm;
      });
      if (needsMigration) {
        profile.oneRepMaxes = migratedMaxes;
        // Don't verify save here to avoid side effects during render, but data is corrected in memory
      }
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
    // IMPORTANT: For this massive update, we force SEED exercises to override potentially stale local data
    // based on IDs.
    const seedMap = new Map(SEED_EXERCISES.map(e => [e.id, e]));
    
    // Filter out custom exercises that conflict with seed IDs (to force update), 
    // then merge any TRULY custom exercises.
    const customUnique = custom.filter(c => !seedMap.has(c.id));
    
    return [...SEED_EXERCISES, ...customUnique];
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
