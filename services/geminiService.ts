
import { GoogleGenAI } from "@google/genai";
import { WorkoutLog, UserProfile, Language, PlanGenerationParams, GeneratedPlan } from "../types";

const API_KEY = process.env.API_KEY;

export const generateCoachingAdvice = async (
  query: string,
  recentLogs: WorkoutLog[],
  profile: UserProfile
): Promise<string> => {
  const lang: Language = (profile.language as Language) || "en";

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = "gemini-2.5-flash";

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

  const languageInstruction =
    lang === "zh"
      ? "You MUST reply in simplified Chinese (简体中文). Use professional but accessible fitness terminology suitable for a Chinese user."
      : "Reply in English.";

  const systemInstruction = `
    You are an expert Strength & Conditioning Coach named "AI-Lift Coach".
    Your goal is to help the user increase strength (1RM) and muscle mass (Hypertrophy).
    Keep your answers concise, motivating, and data-driven.
    Analyze the provided context to give specific advice.
    If the user asks about a plateau, look at their volume.
    Style: Professional, concise, minimalist.
    ${languageInstruction}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Context:\n${context}\n\nUser Query: ${query}`,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || (lang === "zh"
      ? "我现在无法给出建议，请稍后再试。"
      : "I couldn't analyze that right now. Please try again later.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return lang === "zh"
      ? "抱歉，无法连接到 AI 服务器。请检查网络或 API Key。"
      : "Sorry, connection to AI server failed. Please check your network or API Key.";
  }
};

export const generateWorkoutPlan = async (
  params: PlanGenerationParams,
  lang: Language
): Promise<GeneratedPlan | null> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = "gemini-2.5-flash";

  // Prompt logic as requested
  const systemInstruction = `
    You are a professional Strength & Conditioning Coach (NSCA-CPT / CSCS level).
    Your task is to generate an executable, structured workout plan based on user data.
    
    IMPORTANT CONSTRAINTS:
    1. Prioritize using PRE-MADE TEMPLATES as a base, then adjust.
    2. Output strict JSON format. No markdown, no explanations outside JSON.
    3. If injuries exist, exclude risky exercises.
    4. If inference takes too long, fallback to the closest template.
    5. Language: ${lang === 'zh' ? 'Simplified Chinese (简体中文)' : 'English'}.

    Internal Template Pool (Concept):
    1. Beginner Full Body 3x
    2. Beginner Upper/Lower 4x
    3. Intermediate PPL 5x
    4. Hypertrophy Upper/Lower
    5. Fat Loss Circuit
    6. Strength 5x5
    7. Power/Athletic
  `;

  const userPrompt = `
    User Data:
    - Gender: ${params.gender}
    - Age: ${params.age}
    - Height: ${params.height}cm
    - Weight: ${params.weight}kg
    - Experience: ${params.experience}
    - Goals: ${params.goals.join(', ')}
    - Split Preference: ${params.split}
    - Frequency: ${params.frequency} days/week
    - Session Duration: ${params.duration} mins
    - Injuries: ${params.injuries.length > 0 ? params.injuries.join(', ') : 'None'}

    Output the plan in this JSON structure:
    {
      "plan_meta": { "goal": "", "split": "", "weekly_frequency": 0, "session_duration": "", "level": "" },
      "weekly_plan": [
        { "day": "Day 1", "focus": "", "exercises": [{ "name": "", "sets": 0, "reps": "", "rest": "" }] }
      ],
      "notes": ["note1", "note2"],
      "fallback_used": false
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.5, // Lower temperature for more structured/stable output
      },
    });

    const text = response.text;
    if (!text) return null;

    // Parse JSON safely
    try {
      const json = JSON.parse(text);
      return json as GeneratedPlan;
    } catch (e) {
      console.error("Failed to parse JSON plan", e);
      return null;
    }

  } catch (error) {
    console.error("Gemini Plan Generation Error:", error);
    return null;
  }
};
