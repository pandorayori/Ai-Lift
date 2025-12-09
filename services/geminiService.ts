
import { WorkoutLog, UserProfile, Language, ThinkingLevel, WorkoutPlan, Equipment, PlanGoal, SplitType, TrainingLevel, HiddenParams, ChatMessage } from "../types";
import { storage } from "./storageService";
import { getPresetPlan } from "./offlinePlanner";

export const generateCoachingAdvice = async (
  query: string,
  recentLogs: WorkoutLog[],
  profile: UserProfile,
  thinkingLevel: ThinkingLevel = 'low',
  history: ChatMessage[] = []
): Promise<{ text: string, thought?: string }> => {
  const lang: Language = (profile.language as Language) || "en";

  // Build Context for System Instruction (Not user prompt)
  const contextData = {
    profile: {
      height: profile.height,
      weight: profile.weight,
      age: profile.age,
      gender: profile.gender,
      goals: profile.goals
    },
    recent_workouts: recentLogs.slice(-3).map(log => ({
      date: log.date.split("T")[0],
      name: log.name,
      volume: log.total_volume
    }))
  };

  try {
    const res = await fetch('/api/ai-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: query,
        history: history, // Send previous chat history
        context: contextData, // Send user context
        thinkingLevel: thinkingLevel, 
        lang: lang,
        mode: 'chat'
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server Error');
    
    let rawText = data.text || "";
    let thought = undefined;
    let finalText = rawText;

    const thinkMatch = rawText.match(/<thinking>([\s\S]*?)<\/thinking>/);
    if (thinkMatch) {
      thought = thinkMatch[1].trim();
      finalText = rawText.replace(/<thinking>[\s\S]*?<\/thinking>/, '').trim();
    }

    return {
       text: finalText || (lang === "zh" ? "无法生成建议" : "No advice generated"),
       thought: thought
    };

  } catch (error) {
    console.error("AI Coach API Error:", error);
    return {
      text: lang === "zh"
      ? "抱歉，AI 服务暂时不可用。请稍后再试。"
      : "Sorry, AI service is unavailable."
    };
  }
};

// ... (Rest of the file: generateWorkoutPlan remains unchanged)
interface ProfessionalPlanConfig {
  goal: PlanGoal;
  level: TrainingLevel;
  split: SplitType;
  days: number;
  equipment: Equipment[];
  injuries: string[];
  hiddenParams: HiddenParams;
}

export const generateWorkoutPlan = async (
  config: ProfessionalPlanConfig,
  profile: UserProfile
): Promise<{ plan: WorkoutPlan, source: 'ai' | 'preset' }> => {
  const lang: Language = (profile.language as Language) || "en";

  const basePreset = getPresetPlan(
    { goal: config.goal, split: config.split, days: config.days }, 
    profile
  );

  const fullLibrary = storage.getExercises ? storage.getExercises() : [];
  const minimalLibrary = fullLibrary.map((ex: any) => ({
    id: ex.id,
    name: lang === 'zh' && ex.name_zh ? ex.name_zh : ex.name,
    muscle: ex.target_muscle,
    sub_muscle: ex.sub_category || 'General',
    type: ex.type
  }));

  const payload = {
    user_profile: {
      weight: profile.weight,
      height: profile.height,
      age: profile.age,
      gender: profile.gender,
      level: config.level,
      available_days: config.days
    },
    training_goal: config.goal,
    split: config.split,
    equipment: config.equipment,
    constraints: {
      injuries: config.injuries
    },
    hidden_params: config.hiddenParams,
    base_template: basePreset.schedule,
    exercise_library: minimalLibrary
  };

  try {
    const res = await fetch('/api/ai-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payload: payload,
        lang: lang,
        mode: 'plan_generation'
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server Error');

    const cleanText = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanText);
    
    const workoutPlan: WorkoutPlan = {
      id: crypto.randomUUID(),
      name: result.plan_meta?.goal + " (AI Customized)",
      goal: config.goal,
      level: config.level,
      split: config.split,
      days_per_week: config.days,
      equipment: config.equipment,
      injuries: config.injuries,
      hidden_params: config.hiddenParams,
      created_at: Date.now(),
      schedule: result.week_schedule.map((d: any) => ({
        day_number: d.day_number,
        is_rest: d.is_rest,
        focus: d.focus,
        exercises: d.exercises ? d.exercises.map((e: any) => ({
          exercise_id: e.exercise_id,
          name: e.exercise_name,
          sets: e.sets,
          reps: e.reps, 
          rest_sec: e.rest_sec || 60,
          notes: e.notes
        })) : []
      })),
      current_day_index: 0,
      coach_notes: result.plan_meta?.coach_notes
    };

    return { plan: workoutPlan, source: 'ai' };

  } catch (error) {
    console.error("AI Generation Failed, using Preset:", error);
    return { plan: basePreset, source: 'preset' };
  }
};
