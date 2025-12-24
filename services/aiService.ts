
import { PlanGenerationParams, GeneratedPlan, ChatMessage, UserProfile } from '../types';

/**
 * Unified AI Service Layer
 * Handles communication with the backend AI endpoints.
 */
export const aiService = {
  /**
   * Generates a custom workout plan based on user parameters.
   */
  async generateWorkoutPlan(params: PlanGenerationParams): Promise<GeneratedPlan | null> {
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error(`Plan generation failed: ${response.status}`);
      const data = await response.json();
      return data.status === 'ok' ? data.plan : null;
    } catch (error) {
      console.error("AI Service Error (Plan):", error);
      return null;
    }
  },

  /**
   * Sends a message to the AI coach and receives a text response.
   */
  async askCoach(prompt: string, history: ChatMessage[], profile: UserProfile): Promise<string> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, history, profile }),
      });
      if (!response.ok) throw new Error(`Coach chat failed: ${response.status}`);
      const data = await response.json();
      return data.reply || "I'm sorry, I'm having trouble thinking right now.";
    } catch (error) {
      console.error("AI Service Error (Chat):", error);
      return "Connection error with AI service.";
    }
  }
};
