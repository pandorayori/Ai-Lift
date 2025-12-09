import { WorkoutLog, UserProfile, Language } from "../types";

export const generateCoachingAdvice = async (
  query: string,
  recentLogs: WorkoutLog[],
  profile: UserProfile
): Promise<string> => {
  const lang: Language = (profile.language as Language) || "en";

  // 1. 构建上下文 (Context)
  // 我们将数据处理留在前端，只将最终的文本 Prompt 发给后端
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

  const fullPrompt = `Context:\n${context}\n\nUser Query: ${query}`;

  try {
    // 2. 调用我们自己的后端 API (Vercel Function)
    // 浏览器 -> /api/ai-coach -> Vercel Backend (持有 Key) -> Google Gemini
    const res = await fetch('/api/ai-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: fullPrompt,
        systemInstruction: systemInstruction
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Server Error');
    }

    return data.text || (lang === "zh"
      ? "我现在无法给出建议，请稍后再试。"
      : "I couldn't analyze that right now. Please try again later.");

  } catch (error) {
    console.error("AI Coach API Error:", error);
    return lang === "zh"
      ? "抱歉，AI 服务暂时不可用 (请检查 Vercel 环境变量 GEMINI_API_KEY)。"
      : "Sorry, AI service is unavailable (Please check Vercel Env Var GEMINI_API_KEY).";
  }
};