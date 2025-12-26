
import { GoogleGenAI } from "@google/genai";
import { UserProfile, WorkoutLog } from "../types";

// Always initialize GoogleGenAI with the API key from process.env.API_KEY.
// Use 'gemini-3-flash-preview' for basic text-based coaching tasks.
export const generateCoachingAdvice = async (prompt: string, logs: WorkoutLog[], profile: UserProfile) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `You are a world-class strength and fitness coach. 
    User Profile: ${JSON.stringify(profile)}
    Recent Workout History: ${JSON.stringify(logs.slice(0, 5))}
    Answer the user's questions about training, form, and progress based on their unique data. 
    Keep advice concise, encouraging, and scientifically grounded.
    If the user asks in Chinese, respond in Chinese. If in English, respond in English.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    // response.text is a property, not a method.
    return response.text || "I'm sorry, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: AI coaching advice currently unavailable.";
  }
};
