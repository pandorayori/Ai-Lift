
import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // 1. Handle CORS Preflight (OPTIONS)
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

  // 2. Validate Method
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { prompt, payload, thinkingLevel, lang, mode } = await req.json();
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

    // --- SYSTEM INSTRUCTION BUILDER ---
    let systemInstruction = ``;

    if (isPlanGen) {
      // PROFESSIONAL SYSTEM DESIGNER MODE
      systemInstruction = `
        Role: Strength & Conditioning System Designer for the App "AI-Lift".
        
        # Objective
        Design a complete, 7-day Weekly Workout Microcycle based strictly on the provided configuration.
        
        # Input Data Structure (Payload)
        - user_profile (Height, Weight, Gender)
        - training_goal (e.g., Hypertrophy, Power, Rehab)
        - level (Novice to Elite)
        - split (e.g., PPL, Upper/Lower, Bro Split)
        - equipment (List of available tools)
        - constraints (Injuries list)
        - hidden_params (Session duration, Spotter availability, max_dumbbell_weight_kg, weak_point_focus)
        - available_days (1-7 days per week)
        - exercise_library (Only use IDs/Names from here)

        # Logic & Rules (STRICT)
        1. **Schedule Structure:** You MUST return an array of exactly 7 days (Monday to Sunday equivalent).
           - If 'available_days' is 4, then 3 days MUST be marked as "is_rest": true.
           - Distribute rest days intelligently based on the 'split'.
        2. **Equipment Validity:** 
           - If 'equipment' does NOT contain 'cables', do NOT use cable exercises.
           - If 'equipment' is 'bodyweight', do NOT use barbell/dumbbell exercises.
        3. **Injury Safety:**
           - Shoulder injury -> No Overhead Press.
           - Knee injury -> Careful with deep squats/plyometrics.
           - No Spotter -> Avoid heavy Barbell Bench Press to failure (Suggest Dumbbell or Machine).
        4. **Advanced Params:**
           - **Weak Point Focus**: If defined (e.g., "Upper Chest"), prioritize exercises hitting this area early in the session or add isolation volume.
           - **Max Dumbbell Weight**: If user's max DB is low (e.g., <20kg) and they need Strength, specify higher reps (15-20) or tempo/pauses in the 'notes' to ensure stimulus, or substitute with Bodyweight progressions.
        5. **Library Adherence:** Use exact IDs from the provided library.
        6. **Volume:**
           - Novice: 10-12 sets/muscle/week.
           - Advanced: 16-20 sets/muscle/week.
           - Adjust based on 'session_duration_min'.

        # Output Format
        Return ONLY valid JSON.
        {
          "plan_meta": {
            "split_type": "string",
            "sessions_per_week": integer,
            "goal": "string",
            "coach_notes": "string (Brief system overview)"
          },
          "week_schedule": [
            {
              "day_number": 1,
              "is_rest": boolean,
              "focus": "string (e.g. Push A or Rest)",
              "exercises": [
                 // If is_rest is true, this array is empty
                {
                  "exercise_id": "string",
                  "exercise_name": "string",
                  "sets": integer,
                  "reps": "string",
                  "rest_sec": integer,
                  "notes": "string"
                }
              ]
            },
            ... (up to day_number 7)
          ]
        }
      `;
      if (isZh) systemInstruction += `\nOutput JSON values (names/notes/focus) in Simplified Chinese where appropriate, but keep keys in English.`;

    } else {
      // CHAT MODE
      systemInstruction = `
        You are an expert Strength & Conditioning Coach named "AI-Lift Coach".
        Your goal is to help the user increase strength (1RM) and muscle mass (Hypertrophy).
        Style: Professional, encouraging, data-driven.
      `;
      if (isZh) systemInstruction += ` Reply in Simplified Chinese (简体中文).`;
      
      if (isHigh) {
        systemInstruction += `
          \nIMPORTANT: Deep Thinking Mode.
          Wrap your thinking process inside <thinking> tags.
          <thinking>
          1. Analyze...
          2. Strategy...
          </thinking>
        `;
      }
    }

    // --- GEMINI CALL ---
    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-2.5-flash"; 

    let userContent = "";
    if (isPlanGen) {
      userContent = JSON.stringify(payload);
    } else {
      userContent = prompt;
    }

    const result = await ai.models.generateContent({
      model,
      contents: userContent,
      config: {
        systemInstruction: systemInstruction,
        temperature: isPlanGen ? 0.2 : (isHigh ? 0.7 : 0.5),
        responseMimeType: isPlanGen ? "application/json" : "text/plain"
      },
    });

    let responseText = result.text || "";

    // Robust JSON Cleaning (Backend Side)
    if (isPlanGen) {
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    return new Response(JSON.stringify({ text: responseText }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Enable CORS for the response
      }
    });

  } catch (error: any) {
    console.error("Backend AI Error:", error);
    return new Response(JSON.stringify({ 
      error: 'AI Service Error',
      details: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
