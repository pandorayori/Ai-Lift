
import { WorkoutLog, UserProfile, Language, ThinkingLevel } from "../types";

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
        lang: lang
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Server Error');
    }

    // Parsing is now handled on the frontend if the backend returns raw text with tags,
    // or if the backend splits it. Let's assume backend returns raw text and we parse here
    // or backend returns structured.
    // Let's have the backend return raw text and parse it here for simplicity of transfer.
    
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
