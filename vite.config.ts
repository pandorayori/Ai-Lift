import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const cwd = (process as any).cwd ? (process as any).cwd() : '.';
  const env = loadEnv(mode, cwd, '');

  // =================================================================
  // 安全配置：仅保留 Supabase 公开 Key
  // Gemini Key 已移至后端 (Vercel Environment Variables)
  // =================================================================
  
  // 1. Supabase URL (数据库地址)
  const supabaseUrl = "https://xdlxnoimrzmbvcxybppr.supabase.co"; 

  // 2. Supabase Anon Key (数据库 Public Key)
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkbHhub2ltcnptYnZjeHlicHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDQ5ODEsImV4cCI6MjA4MDc4MDk4MX0.TvaRFveX4h2rs9-lcgp0_P84oeiWy6F4Q0MALHuDPwU";

  // =================================================================

  return {
    plugins: [react()],
    publicDir: 'public',
    build: {
      outDir: 'dist',
      sourcemap: true
    },
    define: {
      // 将 Supabase 变量注入到应用中
      'process.env': JSON.stringify({
        NODE_ENV: mode,
        VITE_SUPABASE_URL: supabaseUrl,
        VITE_SUPABASE_ANON_KEY: supabaseKey
      })
      // 注意：API_KEY 已被移除，前端无法访问
    }
  };
});