import { GoogleGenAI } from "@google/genai";
import { WorkoutLog, UserProfile } from "../types";

// 移除顶层的初始化，防止 App 启动时因缺 Key 崩溃
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); 

export const generateCoachingAdvice = async (
  query: string,
  recentLogs: WorkoutLog[],
  profile: UserProfile
): Promise<string> => {
  
  // 1. 安全获取 Key (防止 process 未定义导致的崩溃)
  // @ts-ignore
  const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : '';

  // 2. 检查 Key 是否存在
  if (!apiKey) {
    console.error("API Key is missing.");
    return profile.language === 'zh' 
      ? "系统提示：未检测到 API Key。请在 Vercel 环境变量中添加 VITE_API_KEY。" 
      : "System: API Key is missing. Please add VITE_API_KEY in Vercel settings.";
  }

  // 3. 在需要的时候才初始化 AI，而不是 App 启动时
  const ai = new GoogleGenAI({ apiKey });
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
      ? "抱歉，无法连接到 AI 服务器。请检查您的网络或 API Key 是否正确。" 
      : "Sorry, connection to AI server failed. Please check your network or API Key.";
  }
};
