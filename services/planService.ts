
import { PlanGenerationParams, GeneratedPlan } from '../types';

/**
 * 调用后端 API 生成训练计划
 */
export const generateWorkoutPlan = async (params: PlanGenerationParams): Promise<GeneratedPlan | null> => {
  try {
    const response = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const data = await response.json();
    return data.status === 'ok' ? data.plan : null;
  } catch (error) {
    console.error("Plan Generation Failed:", error);
    return null;
  }
};

/**
 * 新增：调用后端 API 进行 AI 咨询 (替代原本的 geminiService)
 */
export const askAICoach = async (prompt: string, history: any[], profile: any): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, history, profile }),
    });
    if (!response.ok) throw new Error("Coach connection failed");
    const data = await response.json();
    return data.reply || "AI Coach is temporarily unavailable.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Connection error with AI service.";
  }
};
