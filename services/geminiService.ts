import { GoogleGenAI } from "@google/genai";
import { WorkoutLog, UserProfile, Language } from "../types";

// CRITICAL FIX FOR BLACK SCREEN:
// In Vite/Browser environments, 'process' is not defined. We must use 'import.meta.env'.
// We also use a safe fallback to empty string to prevent crashing if env is missing.
const apiKey = import.meta.env.VITE_API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const generateCoachingAdvice = async (
  query: string,
  recentLogs: WorkoutLog[],
  profile: UserProfile
): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please add VITE_API_KEY to your Vercel Environment Variables.";
  }

  const model = "gemini-2.5-flash";
  const lang = profile.language || 'en';
  
  // Construct context from user data
  const context = `
    User Profile: Height ${profile.height}cm, Weight ${profile.weight}kg, Age ${profile.age || 'Unknown'}, Gender ${profile.gender || 'Unknown'}.
    Recent Training History (Last 5 sessions):
    ${recentLogs.slice(-5).map(log => 
      `- Date: ${log.date.split('T')[0]}, Volume: ${log.total_volume.toFixed(0)}, Duration: ${log.duration_minutes}m`
    ).join('\n')}
  `;

  // Dynamic system instruction based on language
  const languageInstruction = lang === 'zh' 
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
      model: model,
      contents: `Context:\n${context}\n\nUser Query: ${query}`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "I couldn't analyze that right now. Try again later.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return lang === 'zh' 
      ? "抱歉，我现在无法连接到教练服务器，请稍后再试。" 
      : "Sorry, I'm having trouble connecting to the coaching server right now.";
  }
};