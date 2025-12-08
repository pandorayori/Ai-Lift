import { GoogleGenAI } from "@google/genai";
import { WorkoutLog, UserProfile, Language } from "../types";

// 移除顶层初始化，防止 App 启动时因 Key 读取时机问题导致崩溃
// 我们将在 generateCoachingAdvice 函数内部动态初始化

export const generateCoachingAdvice = async (
  query: string,
  recentLogs: WorkoutLog[],
  profile: UserProfile
): Promise<string> => {
  const lang: Language = (profile.language as Language) || "en";

  // Use process.env.API_KEY as per guidelines
  const apiKey = process.env.API_KEY;

  // 检查 Key 是否存在
  if (!apiKey) {
    console.error("Gemini API Key is missing.");
    return lang === "zh"
      ? "系统提示：未检测到 API Key。请确保环境变量中配置了 API_KEY。"
      : "System: API Key is missing. Please check API_KEY in settings.";
  }

  // 动态初始化 AI (双保险：确保 Key 存在时才创建实例)
  const ai = new GoogleGenAI({ apiKey });
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
      ? "抱歉，无法连接到 AI 服务器。请检查 API Key 是否有效。"
      : "Sorry, connection to AI server failed. Please check your API Key.";
  }
};