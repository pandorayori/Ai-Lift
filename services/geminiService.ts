import { GoogleGenAI } from "@google/genai";
import { WorkoutLog, UserProfile, Language } from "../types";

// 只从 Vite 注入的环境变量里取 key（浏览器可以用）
const apiKey = import.meta.env.VITE_API_KEY as string | undefined;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateCoachingAdvice = async (
  query: string,
  recentLogs: WorkoutLog[],
  profile: UserProfile
): Promise<string> => {
  const lang: Language = (profile.language as Language) || "en";

  if (!apiKey || !ai) {
    return lang === "zh"
      ? "后台没有配置 VITE_GEMINI_API_KEY，AI 教练暂时不可用，请联系开发者在 Vercel 环境变量中配置。"
      : "AI coach is not configured (missing VITE_GEMINI_API_KEY in environment).";
  }

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
      ? "抱歉，我现在无法连接到教练服务器，请稍后再试。"
      : "Sorry, I'm having trouble connecting to the coaching server right now.";
  }
};
