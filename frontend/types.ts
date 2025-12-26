
export enum ExerciseType {
  BARBELL = 'Barbell',
  DUMBBELL = 'Dumbbell',
  MACHINE = 'Machine',
  BODYWEIGHT = 'Bodyweight',
  CABLE = 'Cable'
}

export enum MuscleGroup {
  CHEST = 'Chest',
  BACK = 'Back',
  LEGS = 'Legs',
  SHOULDERS = 'Shoulders',
  ARMS = 'Arms',
  CORE = 'Core'
}

export interface Exercise {
  id: string;
  name: string;
  name_zh?: string;
  target_muscle: MuscleGroup;
  type: ExerciseType;
  image_url: string;
  video_url?: string;
  instructions: string;
  instructions_zh?: string;
}

export interface SetLog {
  id: string;
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

export interface StrengthRecord {
  exercise_id: string;
  one_rep_max: number;
}

export interface UserProfile {
  id: string;
  name: string;
  weight: number;
  height: number;
  body_fat_percentage?: number;
  age?: number;
  gender?: Gender;
  language: Language;
  strength_records: StrengthRecord[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// --- Smart Plan Generator Types ---

export interface PlanGenerationParams {
  gender: string;
  age: number;
  height: number;
  weight: number;
  experience: 'Beginner' | 'Intermediate' | 'Advanced';
  goals: string[];
  split: string;
  frequency: number;
  duration: number;
  injuries: string[];
}

export interface GeneratedExerciseItem {
  name: string;
  sets: number;
  reps: string;
  rest: string;
}

export interface GeneratedDailyPlan {
  day: string;
  focus: string;
  exercises: GeneratedExerciseItem[];
}

export interface GeneratedPlan {
  plan_meta: {
    goal: string;
    split: string;
    weekly_frequency: number;
    session_duration: string;
    level: string;
  };
  weekly_plan: GeneratedDailyPlan[];
  notes: string[];
  fallback_used: boolean;
}
