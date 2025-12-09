
export enum ExerciseType {
  BARBELL = 'Barbell',
  DUMBBELL = 'Dumbbell',
  MACHINE = 'Machine',
  BODYWEIGHT = 'Bodyweight',
  CABLE = 'Cable',
  KETTLEBELL = 'Kettlebell',
  BAND = 'Band'
}

export enum MuscleGroup {
  CHEST = 'Chest',
  BACK = 'Back',
  LEGS = 'Legs',
  SHOULDERS = 'Shoulders',
  ARMS = 'Arms',
  CORE = 'Core',
  CARDIO = 'Cardio'
}

export interface Exercise {
  id: string;
  name: string;
  name_zh?: string;
  target_muscle: MuscleGroup;
  sub_category?: string;
  type: ExerciseType;
  image_url: string;
  gif_url?: string;
  video_url?: string;
  instructions: string;
  instructions_zh?: string;
}

export type SetType = 'warmup' | 'working';

export interface SetLog {
  id: string;
  type: SetType;
  weight: number;
  reps: number;
  rpe?: number;
  completed: boolean;
  timestamp: number;
}

export interface WorkoutExerciseLog {
  id: string;
  exercise_id: string;
  sets: SetLog[];
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  name: string;
  date: string;
  duration_minutes: number;
  exercises: WorkoutExerciseLog[];
  total_volume: number;
}

export type Language = 'en' | 'zh';
export type Gender = 'Male' | 'Female' | 'Other';

export interface UserProfile {
  id: string;
  name: string;
  weight: number;
  height: number;
  body_fat_percentage?: number;
  age?: number;
  gender?: Gender;
  language: Language;
  injuries?: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  thought?: string;
  timestamp: number;
}

export type ThinkingLevel = 'low' | 'high';

// --- NEW PROFESSIONAL PLAN TYPES ---

export type PlanGoal = 
  | 'hypertrophy' | 'strength' | 'power' | 'posture' 
  | 'fat_loss' | 'conditioning' | 'sport_specific' | 'rehab';

export type TrainingLevel = 
  | 'novice' | 'novice_plus' | 'intermediate' | 'advanced' | 'elite';

export type SplitType = 
  | 'full_body' | 'upper_lower' | 'ppl' | 'bro_split' | 'ppl_6' 
  | 'ul_hybrid' | 'weak_point' | 'powerlifting' | 'ant_post' 
  | 'torso_legs' | 'crossfit' | 'active_recovery';

export type Equipment = 
  | 'free_weights' | 'machines' | 'cables' | 'bodyweight' 
  | 'bands' | 'kettlebells' | 'squat_rack' | 'cardio_machine';

export interface PlanExercise {
  exercise_id: string;
  name: string;
  sets: number;
  reps: string;
  rest_sec: number;
  notes?: string;
}

export interface PlanDay {
  day_number: number; // 1-7
  is_rest: boolean;
  focus: string; // e.g. "Chest & Back" or "Active Recovery"
  exercises: PlanExercise[];
}

export interface HiddenParams {
  session_duration_min: number;
  max_dumbbell_weight_kg?: number;
  has_spotter: boolean;
  weak_point_focus?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  goal: PlanGoal;
  level: TrainingLevel;
  split: SplitType;
  days_per_week: number;
  equipment: Equipment[];
  injuries: string[];
  hidden_params: HiddenParams;
  
  created_at: number;
  schedule: PlanDay[]; // Fixed 7 items
  current_day_index: number; // 0-6 (Maps to Monday-Sunday effectively)
  coach_notes?: string;
}
