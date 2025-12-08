import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载所有环境变量，第三个参数 '' 表示加载所有变量，不仅仅是 VITE_ 开头的
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: true
    },
    define: {
      // 这里的逻辑是：优先找 VITE_API_KEY，如果没有再找 API_KEY
      // 这样无论你在 Vercel 里怎么命名，代码都能读到
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY)
    }
  };
});