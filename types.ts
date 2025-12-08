// Add global type definition for process to avoid needing @types/node
declare global {
  var process: {
    env: {
      API_KEY?: string;
      [key: string]: string | undefined;
    }
  };
}

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
  name_zh?: string; // Chinese name
  target_muscle: MuscleGroup;
  type: ExerciseType;
  image_url: string;
  video_url?: string;
  instructions: string;
  instructions_zh?: string; // Chinese instructions
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
  name: string; // e.g., "Pull Day"
  date: string; // ISO String
  duration_minutes: number;
  exercises: WorkoutExerciseLog[];
  total_volume: number;
}

export type Language = 'en' | 'zh';
export type Gender = 'Male' | 'Female' | 'Other';

export interface UserProfile {
  id: string;
  name: string;
  weight: number; // kg
  height: number; // cm
  body_fat_percentage?: number;
  age?: number;
  gender?: Gender;
  language: Language;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
