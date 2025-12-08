import { GoogleGenAI } from "@google/genai";
import { WorkoutLog, UserProfile } from "../types";

const apiKey =
  import.meta.env.VITE_GEMINI_API_KEY ||
  import.meta.env.VITE_API_KEY ||
  "";

export const generateCoachingAdvice = async (
  query: string,
  recentLogs: WorkoutLog[],
  profile: UserProfile
): Promise<string> => {
  if (!apiKey) {
    // 没配置 key 的时候给个友好的提示
    return profile.language === "zh"
      ? "系统提示：未检测到 VITE_GEMINI_API_KEY，请在环境变量中配置。"
      : "System: VITE_GEMINI_API_KEY is missing. Please set it in env.";
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash";
  const lang = profile.language || "en";

  const context = `
    User Profile: Height ${profile.height}cm, Weight ${profile.weight}kg,
    Age ${profile.age || "Unknown"}, Gender ${profile.gender || "Unknown"}.
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

    return (response as any).text || // genai SDK 这里类型有点松
      (lang === "zh"
        ? "抱歉，我现在无法分析你的训练数据，请稍后重试。"
        : "Sorry, I couldn't analyze your training data. Please try again later.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return lang === "zh"
      ? "抱歉，我现在无法连接到教练服务器，请稍后再试。"
      : "Sorry, I'm having trouble connecting to the coaching server right now.";
  }
};