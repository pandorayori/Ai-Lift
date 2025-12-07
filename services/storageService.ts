import { Exercise, ExerciseType, MuscleGroup, UserProfile, WorkoutLog, WorkoutExerciseLog } from '../types';

// Initial Mock Data
const MOCK_EXERCISES: Exercise[] = [
  {
    id: 'ex_1',
    name: 'Barbell Squat',
    name_zh: '杠铃深蹲',
    target_muscle: MuscleGroup.LEGS,
    type: ExerciseType.BARBELL,
    image_url: 'https://picsum.photos/400/300?random=1',
    instructions: 'Keep your back straight, feet shoulder-width apart. Lower until thighs are parallel to floor.',
    instructions_zh: '保持背部挺直，双脚与肩同宽。下蹲至大腿与地面平行。'
  },
  {
    id: 'ex_2',
    name: 'Bench Press',
    name_zh: '平板卧推',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.BARBELL,
    image_url: 'https://picsum.photos/400/300?random=2',
    instructions: 'Lie on bench, lower bar to mid-chest, press up explosively.',
    instructions_zh: '仰卧在卧推凳上，将杠铃下放至胸部中线，爆发力推起。'
  },
  {
    id: 'ex_3',
    name: 'Deadlift',
    name_zh: '传统硬拉',
    target_muscle: MuscleGroup.BACK,
    type: ExerciseType.BARBELL,
    image_url: 'https://picsum.photos/400/300?random=3',
    instructions: 'Hinge at hips, keep bar close to shins, pull until standing straight.',
    instructions_zh: '髋部铰链运动，杠铃贴近小拉起，直至身体直立。'
  },
  {
    id: 'ex_4',
    name: 'Overhead Press',
    name_zh: '站姿推举',
    target_muscle: MuscleGroup.SHOULDERS,
    type: ExerciseType.BARBELL,
    image_url: 'https://picsum.photos/400/300?random=4',
    instructions: 'Press bar overhead from rack position, keeping core tight.',
    instructions_zh: '核心收紧，从架上位置将杠铃推过头顶。'
  },
  {
    id: 'ex_5',
    name: 'Pull Up',
    name_zh: '引体向上',
    target_muscle: MuscleGroup.BACK,
    type: ExerciseType.BODYWEIGHT,
    image_url: 'https://picsum.photos/400/300?random=5',
    instructions: 'Pull chin over bar. Full range of motion.',
    instructions_zh: '下巴拉过单杠，保持全程动作。'
  },
  {
    id: 'ex_6',
    name: 'Dumbbell Incline Press',
    name_zh: '上斜哑铃卧推',
    target_muscle: MuscleGroup.CHEST,
    type: ExerciseType.DUMBBELL,
    image_url: 'https://picsum.photos/400/300?random=6',
    instructions: 'Set bench to 30 degrees. Press dumbbells up and together.',
    instructions_zh: '椅背调整至30度，向上推起哑铃并靠拢。'
  }
];

const MOCK_PROFILE: UserProfile = {
  id: 'u_1',
  name: 'Alex Lifter',
  height: 180,
  weight: 85,
  body_fat_percentage: 15,
  age: 28,
  gender: 'Male',
  language: 'en'
};

// Generate some history for charts
const generateMockHistory = (): WorkoutLog[] => {
  const logs: WorkoutLog[] = [];
  const now = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 2)); // Every other day
    
    // Simulate volume progression
    const baseVolume = 3000;
    const progression = 50 * (30 - i); 
    
    logs.push({
      id: `log_${i}`,
      user_id: 'u_1',
      name: i % 2 === 0 ? 'Upper Body A' : 'Lower Body B',
      date: date.toISOString(),
      duration_minutes: 60 + Math.floor(Math.random() * 15),
      total_volume: baseVolume + progression + Math.random() * 500,
      exercises: [] // Simplified for list, detailed data would be here in real app
    });
  }
  return logs.reverse();
};

class StorageService {
  private EXERCISE_KEY = 'ailift_exercises';
  private LOGS_KEY = 'ailift_logs';
  private PROFILE_KEY = 'ailift_profile';

  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(this.EXERCISE_KEY)) {
      localStorage.setItem(this.EXERCISE_KEY, JSON.stringify(MOCK_EXERCISES));
    }
    if (!localStorage.getItem(this.LOGS_KEY)) {
      localStorage.setItem(this.LOGS_KEY, JSON.stringify(generateMockHistory()));
    }
    if (!localStorage.getItem(this.PROFILE_KEY)) {
      localStorage.setItem(this.PROFILE_KEY, JSON.stringify(MOCK_PROFILE));
    }
  }

  getExercises(): Exercise[] {
    return JSON.parse(localStorage.getItem(this.EXERCISE_KEY) || '[]');
  }

  getWorkoutLogs(): WorkoutLog[] {
    return JSON.parse(localStorage.getItem(this.LOGS_KEY) || '[]');
  }

  saveWorkoutLog(log: WorkoutLog) {
    const logs = this.getWorkoutLogs();
    logs.push(log);
    localStorage.setItem(this.LOGS_KEY, JSON.stringify(logs));
  }

  getProfile(): UserProfile {
    const stored = localStorage.getItem(this.PROFILE_KEY);
    // Merge with defaults to ensure new fields exist for existing users
    return stored ? { ...MOCK_PROFILE, ...JSON.parse(stored) } : MOCK_PROFILE;
  }

  saveProfile(profile: UserProfile) {
    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
  }

  // Helper to get e1RM history for specific exercise
  getOneRMHistory(exerciseId: string) {
    // In a real app with SQL, this is a query. Here we mock it based on total volume trend for demo purposes
    // since we didn't populate deep nested set data in the mock history generator for brevity.
    const logs = this.getWorkoutLogs();
    return logs.map(log => ({
      date: log.date,
      value: Math.floor((log.total_volume / 20) * (0.8 + Math.random() * 0.4)) // Simulated 1RM
    }));
  }
  
  // Get history of a specific exercise for the Logger to show "Last Time"
  getLastLogForExercise(exerciseId: string): WorkoutExerciseLog | null {
      // Mock implementation: returns a static realistic previous set
      return {
          id: 'prev_1',
          exercise_id: exerciseId,
          sets: [
              { id: 's1', weight: 100, reps: 5, completed: true, timestamp: Date.now() },
              { id: 's2', weight: 100, reps: 5, completed: true, timestamp: Date.now() },
              { id: 's3', weight: 100, reps: 4, completed: true, timestamp: Date.now() }
          ]
      }
  }
}

export const storage = new StorageService();