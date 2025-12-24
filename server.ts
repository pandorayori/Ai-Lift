
import express from 'express';
import cors from 'cors';
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = process.env.PORT || 3000;

// Fix: Explicitly cast middleware to any to handle potential @types/express version mismatches
app.use(cors() as any);
app.use(express.json() as any);

/**
 * Initialize Google GenAI with the system-provided API key.
 * Strictly following @google/genai initialization rules.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Route: Generate a structured workout plan.
 * Uses 'gemini-3-pro-preview' for complex reasoning and structured JSON output.
 */
// Fix: Use express.Request and express.Response explicitly to avoid conflict with global Fetch types
app.post('/api/generate-plan', async (req: express.Request, res: express.Response) => {
  const params = req.body;
  const systemInstruction = `You are a world-class strength and conditioning coach (NSCA-CSCS). 
    Your task is to generate a highly personalized, scientifically-backed workout plan in JSON format.
    Adapt the plan based on the user's experience level, split preference, and any injuries mentioned.
    If the user has an injury (e.g., 'Knee'), avoid high-impact or direct heavy loading on that joint.
    Provide actionable notes in the user's preferred language.`;

  const userPrompt = `Generate a training plan for: ${JSON.stringify(params)}. 
    Return a JSON object matching the required schema.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plan_meta: {
              type: Type.OBJECT,
              properties: {
                goal: { type: Type.STRING },
                split: { type: Type.STRING },
                weekly_frequency: { type: Type.NUMBER },
                session_duration: { type: Type.STRING },
                level: { type: Type.STRING },
              },
              required: ["goal", "split", "weekly_frequency", "session_duration", "level"],
            },
            weekly_plan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        sets: { type: Type.NUMBER },
                        reps: { type: Type.STRING },
                        rest: { type: Type.STRING },
                      },
                      required: ["name", "sets", "reps", "rest"],
                    }
                  }
                },
                required: ["day", "focus", "exercises"],
              }
            },
            notes: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            fallback_used: { type: Type.BOOLEAN }
          },
          required: ["plan_meta", "weekly_plan", "notes", "fallback_used"],
        },
      },
    });

    // Extracting text output directly from property as per guidelines
    const content = response.text;
    res.json({ status: 'ok', plan: content ? JSON.parse(content) : null });
  } catch (error: any) {
    console.error("Plan Generation Error:", error.message);
    res.status(500).json({ status: 'error', message: "Failed to generate training plan." });
  }
});

/**
 * Route: AI Coach Chat.
 * Uses 'gemini-3-flash-preview' for low-latency, conversational coaching advice.
 */
// Fix: Use express.Request and express.Response explicitly to avoid conflict with global Fetch types
app.post('/api/chat', async (req: express.Request, res: express.Response) => {
  const { prompt, profile, history } = req.body;
  const systemInstruction = `You are a supportive and expert AI Strength Coach. 
    User Profile: ${JSON.stringify(profile)}. 
    Provide encouraging, evidence-based training advice. 
    Keep responses concise (max 2-3 short paragraphs).
    Respond in the user's language preference (English or Chinese).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
      },
    });
    
    // Accessing .text property directly
    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Chat API Error:", error.message);
    res.status(500).json({ reply: "I'm having a technical glitch. Let's try chatting again in a moment." });
  }
});

app.listen(PORT, () => {
  console.log(`AI-Lift Backend active on port ${PORT}`);
});
