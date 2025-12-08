import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量，第三个参数 '' 表示加载所有前缀的变量
  const env = loadEnv(mode, process.cwd(), '');
  
  // 优先读取 VITE_API_KEY，其次是 API_KEY，最后为空字符串
  const apiKey = env.VITE_API_KEY || env.API_KEY || '';

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: true
    },
    define: {
      // 1. 定义 process.env.API_KEY 具体的值
      'process.env.API_KEY': JSON.stringify(apiKey),
      // 2. 关键：定义一个空的 process.env 对象，防止代码中直接访问 process.env 时报错 "process is not defined"
      'process.env': JSON.stringify({ API_KEY: apiKey }) 
    }
  };
});
