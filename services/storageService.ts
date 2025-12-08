import { Exercise, ExerciseType, MuscleGroup, UserProfile, WorkoutLog, WorkoutExerciseLog } from '../types';

// Initial Seed Data (Only used if local storage is empty)
const SEED_EXERCISES: Exercise[] = [
  {
    id: 'ex_1',
    name: 'Barbell Squat',
    name_zh: '杠铃深蹲',
    target_muscle: MuscleGroup.LEGS,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1574680096141-1cddd32e01f5?auto=format&fit=crop&w=400&q=80',
    instructions: 'Keep your back straight, feet shoulder-width apart. Lower until thighs are parallel to floor.',
    instructions_zh: '保持背部挺直，双脚与肩同宽。下蹲至大腿与地面平行。'
  },
  {
    id: 'ex_2',
    name: 'Bench Press',
    name_zh: '平板卧推',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
    instructions: 'Lie on bench, lower bar to mid-chest, press up explosively.',
    instructions_zh: '仰卧在卧推凳上，将杠铃下放至胸部中线，爆发力推起。'
  },
  {
    id: 'ex_3',
    name: 'Deadlift',
    name_zh: '传统硬拉',
    target_muscle: MuscleGroup.BACK,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1517963879466-e825c2cbd99b?auto=format&fit=crop&w=400&q=80',
    instructions: 'Hinge at hips, keep bar close to shins, pull until standing straight.',
    instructions_zh: '髋部铰链运动，杠铃贴近小腿拉起，直至身体直立。'
  },
  {
    id: 'ex_4',
    name: 'Overhead Press',
    name_zh: '站姿推举',
    target_muscle: MuscleGroup.SHOULDERS,
    type: ExerciseType.BARBELL,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
    instructions: 'Press bar overhead from rack position, keeping core tight.',
    instructions_zh: '核心收紧，从架上位置将杠铃推过头顶。'
  },
  {
    id: 'ex_5',
    name: 'Pull Up',
    name_zh: '引体向上',
    target_muscle: MuscleGroup.BACK,
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://images.unsplash.com/photo-1598971639058-211a7219488b?auto=format&fit=crop&w=400&q=80',
    instructions: 'Pull chin over bar. Full range of motion.',
    instructions_zh: '下巴拉过单杠，保持全程动作。'
  },
  {
    id: 'ex_6',
    name: 'Dumbbell Incline Press',
    name_zh: '上斜哑铃卧推',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&q=80',
    instructions: 'Set bench to 30 degrees. Press dumbbells up and together.',
    instructions_zh: '椅背调整至30度，向上推起哑铃并靠拢。'
  }
];

const DEFAULT_PROFILE: UserProfile = {
  id: 'user_default',
  name: 'New User',
  height: 175,
  weight: 70,
  body_fat_percentage: 20,
  age: 25,
  gender: 'Male',
  language: 'en'
};

class StorageService {
  private EXERCISE_KEY = 'ailift_exercises';
  private LOGS_KEY = 'ailift_logs';
  private PROFILE_KEY = 'ailift_profile';

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem(this.EXERCISE_KEY)) {
        localStorage.setItem(this.EXERCISE_KEY, JSON.stringify(SEED_EXERCISES));
      }
      if (!localStorage.getItem(this.PROFILE_KEY)) {
        localStorage.setItem(this.PROFILE_KEY, JSON.stringify(DEFAULT_PROFILE));
      }
      // Note: We do NOT seed fake logs anymore. User starts with empty history.
      if (!localStorage.getItem(this.LOGS_KEY)) {
        localStorage.setItem(this.LOGS_KEY, JSON.stringify([]));
      }
    }
  }

  getExercises(): Exercise[] {
    if (typeof window === 'undefined') return SEED_EXERCISES;
    return JSON.parse(localStorage.getItem(this.EXERCISE_KEY) || '[]');
  }

  getWorkoutLogs(): WorkoutLog[] {
    if (typeof window === 'undefined') return [];
    const logs = JSON.parse(localStorage.getItem(this.LOGS_KEY) || '[]');
    // Ensure sorted by date (newest first)
    return logs.sort((a: WorkoutLog, b: WorkoutLog) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  saveWorkoutLog(log: WorkoutLog) {
    const logs = this.getWorkoutLogs();
    logs.unshift(log); // Add to beginning
    localStorage.setItem(this.LOGS_KEY, JSON.stringify(logs));
  }

  getProfile(): UserProfile {
    if (typeof window === 'undefined') return DEFAULT_PROFILE;
    const stored = localStorage.getItem(this.PROFILE_KEY);
    return stored ? { ...DEFAULT_PROFILE, ...JSON.parse(stored) } : DEFAULT_PROFILE;
  }

  saveProfile(profile: UserProfile) {
    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
  }

  // Real logic: Find the most recent log containing this exercise
  getLastLogForExercise(exerciseId: string): WorkoutExerciseLog | null {
    const allLogs = this.getWorkoutLogs();
    
    for (const log of allLogs) {
      const exerciseLog = log.exercises.find(e => e.exercise_id === exerciseId);
      if (exerciseLog) {
        return exerciseLog;
      }
    }
    return null;
  }
}

export const storage = new StorageService();