
import express, { Request, Response } from 'express';
import cors from 'cors';
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// Fixed: Using express.json() instead of body-parser to resolve TypeScript overload resolution mismatch where the middleware function was being misidentified as a path parameter.
app.use(express.json());

// Fixed: Initialize GoogleGenAI exclusively using process.env.API_KEY as per coding guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- 路由 1：生成训练计划 ---
app.post('/api/generate-plan', async (req: Request, res: Response) => {
  const params = req.body;
  const systemInstruction = "You are a professional strength and fitness coach. Generate a comprehensive workout plan in JSON format based on user inputs.";
  const userPrompt = `User Details: ${JSON.stringify(params)}. Please generate a plan including plan_meta, weekly_plan, and notes. Ensure the output is valid JSON.`;

  try {
    // Fixed: Implemented plan generation using Gemini 3 Pro for complex reasoning and structured JSON output.
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

    const content = response.text;
    res.json({ status: 'ok', plan: content ? JSON.parse(content) : null });
  } catch (error: any) {
    console.error("Generate Plan Error:", error.message);
    res.json({ status: 'error', message: "Internal server error during plan generation" });
  }
});

// --- 路由 2：AI 教练对话 ---
app.post('/api/chat', async (req: Request, res: Response) => {
  const { prompt, profile, history } = req.body;
  const systemInstruction = `You are a world-class strength coach. User: ${profile?.name || 'Lifter'}, Weight: ${profile?.weight || 'Unknown'}kg. 
  Answer user questions with encouraging, scientifically-grounded advice. If history is provided, use it for context.`;

  try {
    // Fixed: Implemented coaching chat using Gemini 3 Flash for rapid response times.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
      },
    });
    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Chat Error:", error.message);
    res.status(500).json({ reply: "I'm having trouble connecting to my coaching logic. Please try again later." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend service running on port ${PORT}`);
});
