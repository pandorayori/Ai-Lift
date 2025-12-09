
import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { message, history, context, payload, thinkingLevel, lang, mode } = await req.json();
    const apiKey = process.env.VITE_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error: API Key missing.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const isZh = lang === 'zh';
    const isHigh = thinkingLevel === 'high';
    const isPlanGen = mode === 'plan_generation';
    
    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-2.5-flash"; 

    // --- CASE 1: PLAN GENERATION (Stateless) ---
    if (isPlanGen) {
      let systemInstruction = `
        Role: Strength & Conditioning System Designer for the App "AI-Lift".
        Objective: Design a 7-day Weekly Workout Microcycle.
        Output: JSON Only.
      `;
      if (isZh) systemInstruction += `\nOutput JSON values in Simplified Chinese.`;
      
      const result = await ai.models.generateContent({
        model,
        contents: JSON.stringify(payload),
        config: {
          systemInstruction,
          temperature: 0.2,
          responseMimeType: "application/json"
        },
      });

      let responseText = result.text || "";
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

      return new Response(JSON.stringify({ text: responseText }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // --- CASE 2: CHAT COACH (Context-Aware) ---
    
    let systemInstruction = `
      You are "Fit Coach Pro", an expert personal trainer.
      Your goal: Help the user improve strength, form, and health.
      Tone: Professional, encouraging, concise.
    `;
    
    // Inject dynamic user context into system instruction
    if (context) {
      systemInstruction += `
        \nUSER CONTEXT:
        - Stats: ${context.profile.height}cm, ${context.profile.weight}kg, ${context.profile.gender}.
        - Recent Logs: ${JSON.stringify(context.recent_workouts)}
      `;
    }

    if (isZh) systemInstruction += ` Reply in Simplified Chinese (简体中文).`;
    
    if (isHigh) {
      systemInstruction += `
        \nDEEP THINKING MODE ENABLED.
        Before answering, you must output your reasoning inside <thinking> tags.
        Analyze the user's history and metrics before advising.
        <thinking>
        1. Analysis...
        2. Plan...
        </thinking>
      `;
    }

    // Construct Multi-turn Chat History
    // Google GenAI expects: { role: 'user' | 'model', parts: [{ text: string }] }
    const contents = [];

    // 1. Add History
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        // Skip messages with empty text or just thoughts
        if (!msg.text) return;
        
        // Remove <thinking> tags from model history to save tokens/confusion
        const cleanText = msg.text.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim();
        
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: cleanText }]
        });
      });
    }

    // 2. Add Current Message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const result = await ai.models.generateContent({
      model,
      contents: contents, // Pass full history array
      config: {
        systemInstruction: systemInstruction,
        temperature: isHigh ? 0.7 : 0.5,
      },
    });

    return new Response(JSON.stringify({ text: result.text || "" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error: any) {
    console.error("Backend AI Error:", error);
    return new Response(JSON.stringify({ error: 'AI Service Error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
