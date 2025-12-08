import { GoogleGenAI } from "@google/genai";
import { WorkoutLog, UserProfile } from "../types";

export const generateCoachingAdvice = async (
  query: string,
  recentLogs: WorkoutLog[],
  profile: UserProfile
): Promise<string> => {
  
  // 1. Safe access to API Key (polyfilled by vite.config.ts)
  // Using optional chaining and fallback
  const apiKey = process?.env?.API_KEY || '';

  // 2. Return error message if key is missing (instead of crashing)
  if (!apiKey) {
    console.warn("API Key is missing.");
    return profile.language === 'zh' 
      ? "⚠️ 系统提示：未配置 API Key。请在 Vercel 设置 -> Environment Variables 中添加键名为 VITE_API_KEY 的变量。" 
      : "⚠️ System: API Key missing. Please set VITE_API_KEY in Vercel settings -> Environment Variables.";
  }

  // 3. Initialize AI only when needed
  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-2.5-flash";
    const lang = profile.language || 'en';
    
    const context = `
      User Profile: Height ${profile.height}cm, Weight ${profile.weight}kg, Age ${profile.age || 'Unknown'}, Gender ${profile.gender || 'Unknown'}.
      Recent Training History (Last 5 sessions):
      ${recentLogs.slice(-5).map(log => 
        `- Date: ${log.date.split('T')[0]}, Volume: ${log.total_volume.toFixed(0)}, Duration: ${log.duration_minutes}m`
      ).join('\n')}
    `;

    const languageInstruction = lang === 'zh' 
      ? "You MUST reply in simplified Chinese (简体中文). Use professional but accessible fitness terminology suitable for a Chinese user." 
      : "Reply in English.";

    const systemInstruction = `
      You are an expert Strength & Conditioning Coach named "AI-Lift Coach".
      Your goal is to help the user increase strength (1RM) and muscle mass (Hypertrophy).
      Keep your answers concise, motivating, and data-driven.
      Analyze the provided context to give specific advice.
      Style: Professional, concise, minimalist.
      ${languageInstruction}
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: `Context:\n${context}\n\nUser Query: ${query}`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || (lang === 'zh' ? "AI 没有返回内容。" : "No response from AI.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    return profile.language === 'zh' 
      ? "抱歉，无法连接到 AI 服务器。请检查您的 API Key 是否正确配置为 VITE_API_KEY。" 
      : "Sorry, connection to AI server failed. Please check if VITE_API_KEY is correct.";
  }
};