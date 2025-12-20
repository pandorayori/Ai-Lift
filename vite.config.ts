
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const cwd = (process as any).cwd ? (process as any).cwd() : '.';
  const env = loadEnv(mode, cwd, '');
  
  return {
    plugins: [react()],
    publicDir: 'public',
    build: {
      outDir: 'dist',
      sourcemap: true
    },
    server: {
      proxy: {
        // 本地开发时，将 /api 请求转发到 3000 端口的 Node 服务
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    define: {
      // 移除 process.env.API_KEY，安全性提升，前端不再持有 Key
    }
  };
});
