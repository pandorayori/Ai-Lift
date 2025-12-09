
export enum ExerciseType {
  BARBELL = 'Barbell',
  DUMBBELL = 'Dumbbell',
  MACHINE = 'Machine',
  BODYWEIGHT = 'Bodyweight',
  CABLE = 'Cable',
  KETTLEBELL = 'Kettlebell'
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
  type: ExerciseType;
  image_url: string;
  gif_url?: string; // URL for the animation GIF
  video_url?: string;
  instructions: string;
  instructions_zh?: string;
}

export type SetType = 'warmup' | 'working';

export interface SetLog {
  id: string;
  type: SetType; // Added set type
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
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  thought?: string; // Stores the AI's internal thinking process
  timestamp: number;
}

export type ThinkingLevel = 'low' | 'high';
