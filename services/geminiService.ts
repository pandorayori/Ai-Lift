import { WorkoutLog, UserProfile, Language, ThinkingLevel, WorkoutPlan, Equipment, PlanGoal, SplitType, TrainingLevel, HiddenParams } from "../types";
import { storage } from "./storageService";

export const generateCoachingAdvice = async (
  query: string,
  recentLogs: WorkoutLog[],
  profile: UserProfile,
  thinkingLevel: ThinkingLevel = 'low'
): Promise<{ text: string, thought?: string }> => {
  const lang: Language = (profile.language as Language) || "en";

  const context = `
    User Profile: Height ${profile.height}cm, Weight ${profile.weight}kg, Age ${profile.age || "Unknown"}, Gender ${profile.gender || "Unknown"}.
    Recent Training History (Last 5 sessions):
    ${recentLogs
      .slice(-5)
      .map(
        (log) =>
          `- Date: ${log.date.split("T")[0]}, Volume: ${log.total_volume.toFixed(
            0
          )}, Duration: ${log.duration_minutes}m`
      )
      .join("\n")}
  `;

  // Base prompt construction
  const fullPrompt = `Context:\n${context}\n\nUser Query: ${query}`;

  try {
    const res = await fetch('/api/ai-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: fullPrompt,
        thinkingLevel: thinkingLevel, // Pass the level to backend
        lang: lang,
        mode: 'chat'
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Server Error');
    }
    
    let rawText = data.text || "";
    let thought = undefined;
    let finalText = rawText;

    // Parse <thinking> tags if present
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
      ? "抱歉，AI 服务暂时不可用。"
      : "Sorry, AI service is unavailable."
    };
  }
};

// --- PROFESSIONAL PLAN GENERATION ---

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
): Promise<WorkoutPlan | null> => {
  const lang: Language = (profile.language as Language) || "en";

  // 1. Gather Exercise Library (Lightweight version for tokens)
  const fullLibrary = storage.getExercises();
  const minimalLibrary = fullLibrary.map(ex => ({
    id: ex.id,
    name: lang === 'zh' && ex.name_zh ? ex.name_zh : ex.name,
    muscle: ex.target_muscle,
    sub_muscle: ex.sub_category || 'General',
    type: ex.type
  }));

  // 2. Construct Professional Payload for Backend
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

    // Parse JSON
    const cleanText = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanText);
    
    // Transform API result to internal WorkoutPlan format
    const workoutPlan: WorkoutPlan = {
      id: crypto.randomUUID(),
      name: result.plan_meta?.goal + " - " + result.plan_meta?.split_type,
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
          reps: e.reps, // API now returns 'reps' directly string/range
          rest_sec: e.rest_sec || 60,
          notes: e.notes
        })) : []
      })),
      current_day_index: 0,
      coach_notes: result.plan_meta?.coach_notes
    };

    return workoutPlan;

  } catch (error) {
    console.error("Plan Generation Error:", error);
    return null;
  }
};