import { GoogleGenAI } from "@google/genai";

// Vercel Serverless Function Handler
// 这个文件运行在服务端，拥有访问 process.env 的权限
export default async function handler(request: any, response: any) {
  // 1. 安全检查：只允许 POST 请求
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. 获取服务端环境变量中的 Key
  // 用户请求更改为 VITE_API_KEY
  const apiKey = process.env.VITE_API_KEY;

  if (!apiKey) {
    console.error("Server Error: VITE_API_KEY is not set in Vercel Environment Variables.");
    return response.status(500).json({ 
      error: 'Server configuration error: API Key missing.' 
    });
  }

  try {
    // 3. 解析前端传来的参数
    const { prompt, systemInstruction } = request.body;

    if (!prompt) {
      return response.status(400).json({ error: 'Prompt is required' });
    }

    // 4. 初始化 Gemini (服务端)
    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-2.5-flash";

    // 5. 调用 Google API
    // 注意：这里使用 generateContent，因为这是服务端单次调用
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    // 6. 返回结果给前端
    return response.status(200).json({ text: result.text });

  } catch (error: any) {
    console.error("Gemini API Error on Backend:", error);
    return response.status(500).json({ 
      error: 'AI Service Error',
      details: error.message 
    });
  }
}