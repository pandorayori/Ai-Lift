import { GoogleGenAI } from "@google/genai";
import { WorkoutLog, UserProfile } from "../types";

// Avoid SSR crash: create client only inside function
function getAI() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Missing VITE_GEMINI_API_KEY environment variable");
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export const generateCoachingAdvice = async (
  query: string,
  recentLogs: WorkoutLog[],
  profile: UserProfile
): Promise<string> => {

  const ai = getAI();
  if (!ai) {
    return "API Key is missing. Please configure VITE_GEMINI_API_KEY.";
  }

  const model = "gemini-2.5-flash";
  const lang = profile.language || 'en';

  const context = `
    User Profile: Height ${profile.height}cm, Weight ${profile.weight}kg, 
    Age ${profile.age || 'Unknown'}, Gender ${profile.gender || 'Unknown'}.
    
    Recent Training History:
    ${recentLogs.slice(-5).map(log => 
      `- ${log.date.split('T')[0]}: Volume ${log.total_volume}, Duration ${log.duration_minutes}m`
    ).join('\n')}
  `;

  const languageInstruction = lang === 'zh'
    ? "Reply in professional Simplified Chinese."
    : "Reply in English.";

  const systemInstruction = `
    You are AI-Lift Coach, a Strength & Conditioning Expert.
    Give concise, data-driven training advice.
    ${languageInstruction}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Context:\n${context}\n\nUser Query: ${query}`,
      config: { systemInstruction, temperature: 0.7 }
    });

    return response.text || "I couldn't analyze that right now. Try again later.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return lang === 'zh'
      ? "抱歉，我现在无法连接到教练服务器，请稍后再试。"
      : "Connection error. Try again later.";
  }
};
