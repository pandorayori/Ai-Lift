import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

// 读取百炼 API Key
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
if (!DASHSCOPE_API_KEY) {
  console.warn('⚠️ 没有设置 DASHSCOPE_API_KEY 环境变量！');
}

// 统一请求通义千问接口
async function callTongyiChat(messages) {
  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "qwen-max",
      input: {
        messages
      }
    })
  });

  const result = await response.json();
  return result.output.text;
}

// API 路由
app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    const reply = await callTongyiChat(messages);

    res.json({
      success: true,
      reply
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// 启动服务器
app.listen(3001, () => {
  console.log('🚀 AI API 服务已启动：http://localhost:3001');
});
