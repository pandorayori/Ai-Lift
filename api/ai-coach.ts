
import { GoogleGenAI } from "@google/genai";

export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.VITE_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'Server configuration error: API Key missing.' });
  }

  try {
    const { prompt, thinkingLevel, lang } = request.body;
    
    const isZh = lang === 'zh';
    const isHigh = thinkingLevel === 'high';

    // Base identity
    let systemInstruction = `
      You are an expert Strength & Conditioning Coach named "AI-Lift Coach".
      Your goal is to help the user increase strength (1RM) and muscle mass (Hypertrophy).
      Style: Professional, encouraging, data-driven.
    `;

    // Language constraint
    if (isZh) {
      systemInstruction += ` You MUST reply in Simplified Chinese (简体中文). Use professional fitness terminology.`;
    } else {
      systemInstruction += ` Reply in English.`;
    }

    // Thinking Mechanism (Chain of Thought)
    if (isHigh) {
      systemInstruction += `
        \nIMPORTANT: You are in 'Deep Thinking Mode'.
        Before answering the user, you MUST first analyze the user's data and question step-by-step.
        Wrap your thinking process inside <thinking> tags.
        Example format:
        <thinking>
        1. Analyze volume...
        2. Check recovery...
        3. Formulate strategy...
        </thinking>
        [Your actual helpful response here]
      `;
    } else {
      systemInstruction += `\nKeep your answers concise and direct.`;
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-2.5-flash"; // Flash is fast enough for both, 2.5 has good reasoning

    const result = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: isHigh ? 0.7 : 0.5, // Higher temp for creative thinking
      },
    });

    return response.status(200).json({ text: result.text });

  } catch (error: any) {
    console.error("Backend AI Error:", error);
    return response.status(500).json({ 
      error: 'AI Service Error',
      details: error.message 
    });
  }
}
