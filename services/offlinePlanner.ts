
import { WorkoutPlan, PlanGoal, SplitType, Equipment, PlanDay, UserProfile, Gender } from '../types';

// Helper to create exercises
const mkEx = (id: string, name: string, sets: number, reps: string, note?: string) => ({
  exercise_id: id, name, sets, reps, rest_sec: 60, notes: note
});

// --- TEMPLATE DATABASE ---

// 1. Male Hypertrophy (PPL Focus) - 6 Day Logic
const TEMPLATE_PPL: PlanDay[] = [
  {
    day_number: 1, is_rest: false, focus: "Push (Chest/Shoulders/Triceps)",
    exercises: [
      mkEx('chest_bb_bench_flat', 'Barbell Bench Press', 4, '8-10', 'Heavy compound'),
      mkEx('shoulder_ohp_bb', 'Overhead Press', 3, '8-12', 'Strict form'),
      mkEx('chest_db_press_flat', 'DB Bench Press', 3, '10-12', 'Volume'),
      mkEx('shoulder_lat_raise', 'DB Lateral Raise', 4, '12-15', 'Pump'),
      mkEx('arm_tricep_pushdown', 'Tricep Pushdown', 3, '12-15', 'Squeeze at bottom')
    ]
  },
  {
    day_number: 2, is_rest: false, focus: "Pull (Back/Biceps)",
    exercises: [
      mkEx('back_pullup', 'Pull Ups', 4, 'AMRAP', 'Use assistance if needed'),
      mkEx('back_bb_row', 'Barbell Row', 4, '8-10', 'Control the eccentric'),
      mkEx('back_lat_pulldown', 'Lat Pulldown', 3, '10-12', 'Focus on lats'),
      mkEx('back_seated_row', 'Seated Cable Row', 3, '10-12', 'Squeeze shoulder blades'),
      mkEx('arm_bicep_curl_bb', 'Barbell Curl', 4, '10-12', 'Strict form')
    ]
  },
  {
    day_number: 3, is_rest: false, focus: "Legs",
    exercises: [
      mkEx('legs_sq_highbar', 'Barbell Squat', 4, '6-8', 'Deep range of motion'),
      mkEx('legs_rdl_bb', 'Romanian Deadlift', 4, '8-10', 'Feel hamstrings'),
      mkEx('legs_leg_press', 'Leg Press', 3, '10-12', 'Volume'),
      mkEx('legs_lunges', 'Walking Lunges', 3, '12 steps', 'Each leg'),
      mkEx('core_plank', 'Plank', 3, '60s', 'Core stability')
    ]
  },
  { day_number: 4, is_rest: true, focus: "Rest", exercises: [] },
  {
    day_number: 5, is_rest: false, focus: "Upper Body Hypertrophy",
    exercises: [
      mkEx('chest_bb_bench_incline', 'Incline Bench', 4, '8-12', 'Upper chest'),
      mkEx('back_lat_pulldown', 'Lat Pulldown', 4, '10-12', 'Width'),
      mkEx('shoulder_lat_raise', 'Side Delts', 4, '15-20', 'Volume'),
      mkEx('arm_bicep_curl_bb', 'Bicep Curls', 3, '12-15', 'Superset'),
      mkEx('arm_tricep_pushdown', 'Tricep Ext', 3, '12-15', 'Superset')
    ]
  },
  {
    day_number: 6, is_rest: false, focus: "Legs & Abs",
    exercises: [
      mkEx('legs_leg_press', 'Leg Press', 4, '10-12', 'Volume'),
      mkEx('legs_lunges', 'Lunges', 3, '15', 'High rep'),
      mkEx('core_leg_raise', 'Leg Raises', 3, '15', 'Abs'),
      mkEx('core_plank', 'Plank', 3, 'Max', 'Failure')
    ]
  },
  { day_number: 7, is_rest: true, focus: "Rest", exercises: [] }
];

// 2. Upper / Lower Split (4 Day)
const TEMPLATE_UPPER_LOWER: PlanDay[] = [
  {
    day_number: 1, is_rest: false, focus: "Upper Strength",
    exercises: [
      mkEx('chest_bb_bench_flat', 'Bench Press', 4, '5-6', 'Strength'),
      mkEx('back_bb_row', 'Bent Over Row', 4, '6-8', 'Heavy'),
      mkEx('shoulder_ohp_bb', 'Overhead Press', 3, '6-8', 'Shoulders'),
      mkEx('back_pullup', 'Weighted Pullups', 3, '6-8', 'Lats')
    ]
  },
  {
    day_number: 2, is_rest: false, focus: "Lower Strength",
    exercises: [
      mkEx('legs_sq_highbar', 'Squat', 4, '5-6', 'Strength'),
      mkEx('legs_rdl_bb', 'RDL', 3, '8-10', 'Posterior chain'),
      mkEx('legs_leg_press', 'Leg Press', 3, '10-12', 'Accessory'),
      mkEx('core_plank', 'Plank', 3, '60s', 'Core')
    ]
  },
  { day_number: 3, is_rest: true, focus: "Rest", exercises: [] },
  {
    day_number: 4, is_rest: false, focus: "Upper Hypertrophy",
    exercises: [
      mkEx('chest_db_press_flat', 'DB Incline Press', 3, '10-12', 'Chest'),
      mkEx('back_lat_pulldown', 'Lat Pulldown', 3, '10-12', 'Lats'),
      mkEx('shoulder_lat_raise', 'Lateral Raise', 4, '12-15', 'Delts'),
      mkEx('chest_cable_fly_high', 'Cable Fly', 3, '12-15', 'Chest Isolation'),
      mkEx('arm_bicep_curl_bb', 'Curls', 3, '12-15', 'Arms')
    ]
  },
  {
    day_number: 5, is_rest: false, focus: "Lower Hypertrophy",
    exercises: [
      mkEx('legs_sq_highbar', 'Front Squat / Goblet', 3, '10-12', 'Quads'),
      mkEx('legs_lunges', 'Lunges', 3, '12-15', 'Glutes/Quads'),
      mkEx('legs_leg_press', 'Calf Raises', 4, '15-20', 'Calves'),
      mkEx('core_leg_raise', 'Leg Raises', 3, '15', 'Abs')
    ]
  },
  { day_number: 6, is_rest: true, focus: "Rest", exercises: [] },
  { day_number: 7, is_rest: true, focus: "Rest", exercises: [] }
];

// 3. Full Body (3 Day) - Beginner Friendly
const TEMPLATE_FULL_BODY: PlanDay[] = [
  {
    day_number: 1, is_rest: false, focus: "Full Body A",
    exercises: [
      mkEx('legs_sq_highbar', 'Squat', 3, '8-10', 'Main Leg'),
      mkEx('chest_bb_bench_flat', 'Bench Press', 3, '8-10', 'Main Push'),
      mkEx('back_seated_row', 'Cable Row', 3, '10-12', 'Main Pull'),
      mkEx('core_plank', 'Plank', 3, '45s', 'Core')
    ]
  },
  { day_number: 2, is_rest: true, focus: "Rest", exercises: [] },
  {
    day_number: 3, is_rest: false, focus: "Full Body B",
    exercises: [
      mkEx('legs_rdl_bb', 'Deadlift / RDL', 3, '6-8', 'Hinge'),
      mkEx('shoulder_ohp_bb', 'Overhead Press', 3, '8-10', 'Vertical Push'),
      mkEx('back_lat_pulldown', 'Lat Pulldown', 3, '10-12', 'Vertical Pull'),
      mkEx('legs_lunges', 'Lunges', 2, '12', 'Accessory')
    ]
  },
  { day_number: 4, is_rest: true, focus: "Rest", exercises: [] },
  {
    day_number: 5, is_rest: false, focus: "Full Body C",
    exercises: [
      mkEx('legs_leg_press', 'Leg Press', 3, '10-12', 'Legs'),
      mkEx('chest_db_press_flat', 'DB Press', 3, '10-12', 'Chest'),
      mkEx('back_bb_row', 'DB Row', 3, '10-12', 'Back'),
      mkEx('arm_bicep_curl_bb', 'Arms', 3, '15', 'Fun')
    ]
  },
  { day_number: 6, is_rest: true, focus: "Rest", exercises: [] },
  { day_number: 7, is_rest: true, focus: "Rest", exercises: [] }
];

// 4. Bro Split (5 Day)
const TEMPLATE_BRO_SPLIT: PlanDay[] = [
  { day_number: 1, is_rest: false, focus: "Chest", exercises: [mkEx('chest_bb_bench_flat', 'Bench', 4, '8'), mkEx('chest_db_press_flat', 'Incline DB', 3, '10'), mkEx('chest_cable_fly_high', 'Fly', 3, '12')] },
  { day_number: 2, is_rest: false, focus: "Back", exercises: [mkEx('back_pullup', 'Pullups', 4, 'Max'), mkEx('back_bb_row', 'Rows', 4, '8'), mkEx('back_seated_row', 'Cable Row', 3, '10')] },
  { day_number: 3, is_rest: false, focus: "Shoulders", exercises: [mkEx('shoulder_ohp_bb', 'OHP', 4, '8'), mkEx('shoulder_lat_raise', 'Lat Raise', 4, '15'), mkEx('shoulder_face_pull', 'Face Pull', 3, '15')] },
  { day_number: 4, is_rest: false, focus: "Legs", exercises: [mkEx('legs_sq_highbar', 'Squat', 4, '8'), mkEx('legs_leg_press', 'Leg Press', 3, '10'), mkEx('legs_rdl_bb', 'RDL', 3, '10')] },
  { day_number: 5, is_rest: false, focus: "Arms", exercises: [mkEx('arm_bicep_curl_bb', 'BB Curl', 4, '10'), mkEx('arm_tricep_pushdown', 'Pushdown', 4, '10'), mkEx('arm_bicep_curl_bb', 'Hammer Curl', 3, '12')] },
  { day_number: 6, is_rest: true, focus: "Rest", exercises: [] },
  { day_number: 7, is_rest: true, focus: "Rest", exercises: [] }
];

// 5. Female Toning/Hypertrophy (Glute Focused)
const FEMALE_GLUTE_FOCUS: PlanDay[] = [
  {
    day_number: 1, is_rest: false, focus: "Glutes & Hamstrings",
    exercises: [
      mkEx('legs_rdl_bb', 'Romanian Deadlift', 4, '10-12', 'Focus on stretch'),
      mkEx('legs_lunges', 'Reverse Lunges', 3, '12-15', 'Glute focus'),
      mkEx('back_seated_row', 'Cable Row', 3, '12-15', 'Posture'),
      mkEx('core_plank', 'Plank', 3, '45s', 'Core')
    ]
  },
  {
    day_number: 2, is_rest: false, focus: "Upper Body (Toning)",
    exercises: [
      mkEx('shoulder_ohp_bb', 'Overhead Press', 3, '10-12', 'Shoulder definition'),
      mkEx('back_lat_pulldown', 'Lat Pulldown', 4, '12-15', 'Hourglass shape'),
      mkEx('chest_db_press_flat', 'DB Press', 3, '12-15', 'Chest tone'),
      mkEx('shoulder_lat_raise', 'Lateral Raise', 3, '15-20', 'Delts'),
      mkEx('arm_tricep_pushdown', 'Tricep Pushdown', 3, '15', 'Arms')
    ]
  },
  { day_number: 3, is_rest: true, focus: "Rest", exercises: [] },
  {
    day_number: 4, is_rest: false, focus: "Quads & Glutes",
    exercises: [
      mkEx('legs_sq_highbar', 'Goblet Squat / BB Squat', 4, '10-12', 'Legs'),
      mkEx('legs_leg_press', 'Leg Press', 3, '12-15', 'High foot placement'),
      mkEx('legs_lunges', 'Walking Lunges', 3, '20 steps', 'Burnout'),
      mkEx('core_leg_raise', 'Leg Raises', 3, '15', 'Lower abs')
    ]
  },
  {
    day_number: 5, is_rest: false, focus: "Full Body HIIT",
    exercises: [
      mkEx('legs_sq_highbar', 'Bodyweight Squats', 3, '20', 'Fast pace'),
      mkEx('chest_db_press_flat', 'Pushups', 3, 'Max', 'Knees if needed'),
      mkEx('back_bb_row', 'DB Rows', 3, '15', 'Each arm'),
      mkEx('shoulder_ohp_bb', 'DB Press', 3, '15', 'Light weight')
    ]
  },
  { day_number: 6, is_rest: true, focus: "Rest", exercises: [] },
  { day_number: 7, is_rest: true, focus: "Rest", exercises: [] }
];

// 6. Fat Loss (Full Body Circuit) - High Reps, Low Rest
const FAT_LOSS_CIRCUIT: PlanDay[] = [
  {
    day_number: 1, is_rest: false, focus: "Full Body A",
    exercises: [
      mkEx('legs_sq_highbar', 'Goblet Squat', 4, '15-20', 'Keep heart rate up'),
      mkEx('chest_db_press_flat', 'DB Bench Press', 4, '15', 'Superset with Squat'),
      mkEx('back_lat_pulldown', 'Lat Pulldown', 4, '15', 'Control'),
      mkEx('shoulder_ohp_bb', 'DB Press', 3, '15', 'Burnout'),
      mkEx('core_plank', 'Plank', 3, '60s', 'Active rest')
    ]
  },
  { day_number: 2, is_rest: true, focus: "Cardio / Rest", exercises: [] },
  {
    day_number: 3, is_rest: false, focus: "Full Body B",
    exercises: [
      mkEx('legs_rdl_bb', 'DB RDL', 4, '15', 'Hamstrings'),
      mkEx('back_bb_row', 'DB Row', 4, '15', 'Back'),
      mkEx('legs_lunges', 'Lunges', 3, '20', 'Total steps'),
      mkEx('chest_db_press_flat', 'Pushups', 3, 'Max', 'Burnout'),
      mkEx('core_leg_raise', 'Leg Raises', 3, '15', 'Abs')
    ]
  },
  { day_number: 4, is_rest: true, focus: "Cardio / Rest", exercises: [] },
  {
    day_number: 5, is_rest: false, focus: "Full Body C",
    exercises: [
      mkEx('legs_leg_press', 'Leg Press', 4, '20', 'High rep'),
      mkEx('shoulder_lat_raise', 'Lateral Raise', 4, '15-20', 'Delts'),
      mkEx('arm_bicep_curl_bb', 'Curls', 3, '15', 'Arms'),
      mkEx('arm_tricep_pushdown', 'Pushdowns', 3, '15', 'Arms'),
      mkEx('core_plank', 'Plank', 3, 'Max', 'Failure')
    ]
  },
  { day_number: 6, is_rest: true, focus: "Rest", exercises: [] },
  { day_number: 7, is_rest: true, focus: "Rest", exercises: [] }
];

// --- MAIN GENERATOR ---

export const getPresetPlan = (
  config: { goal: PlanGoal, split: SplitType, days: number }, 
  profile: UserProfile
): WorkoutPlan => {
  
  let selectedSchedule: PlanDay[] = [];
  let planName = "";

  // 1. Select Template Strategy based on Split & Goal
  if (config.goal === 'fat_loss' || config.goal === 'conditioning') {
    selectedSchedule = FAT_LOSS_CIRCUIT;
    planName = "Metabolic Fat Loss Circuit";
  } 
  else if (config.split === 'bro_split') {
    selectedSchedule = TEMPLATE_BRO_SPLIT;
    planName = "Classic Bro Split (5 Day)";
  }
  else if (config.split === 'upper_lower') {
    selectedSchedule = TEMPLATE_UPPER_LOWER;
    planName = "Upper/Lower Strength & Size";
  }
  else if (config.split === 'full_body') {
    selectedSchedule = TEMPLATE_FULL_BODY;
    planName = "Full Body Fundamentals";
  }
  else if (profile.gender === 'Female' && config.goal === 'hypertrophy') {
    selectedSchedule = FEMALE_GLUTE_FOCUS;
    planName = "Female Tone & Shape";
  } 
  else {
    // Default Fallback
    selectedSchedule = TEMPLATE_PPL;
    planName = "Classic PPL (Push Pull Legs)";
  }

  // 2. Adjust for Days Available
  // We simply mark days as rest if they exceed the user's available days
  // or cycle through the template if days match.
  // For simplicity in this offline mode, we map the template 1:1 up to 7 days.
  // If user selected 3 days but template is 5 days, they just skip days 4-5 in reality or we could filter.
  // Here we just return the full cycle plan.

  return {
    id: crypto.randomUUID(),
    name: planName + " (Preset)",
    goal: config.goal,
    level: 'intermediate',
    split: config.split,
    days_per_week: config.days,
    equipment: ['free_weights'], // Assumed default
    injuries: [],
    hidden_params: { session_duration_min: 60, has_spotter: true },
    created_at: Date.now(),
    schedule: selectedSchedule,
    current_day_index: 0,
    coach_notes: "This is an expert-designed preset plan. AI optimization was skipped or unavailable."
  };
};
