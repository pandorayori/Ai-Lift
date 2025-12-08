import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const cwd = (process as any).cwd ? (process as any).cwd() : '.';
  const env = loadEnv(mode, cwd, '');

  // =================================================================
  // 【重要】请在下方引号中直接填入你的 Key
  // =================================================================
  
  // 1. Gemini API Key (用于 AI 教练)
  // 获取地址: https://aistudio.google.com/app/apikey
  const apiKey = "AIzaSyCHHYVqcAcen_ygmXNZdYtMMLePI_CB0WM"; 

  // 2. Supabase URL (数据库地址)
  // 获取地址: Supabase后台 -> Project Settings -> API -> Project URL
  const supabaseUrl = "https://xdlxnoimrzmbvcxybppr.supabase.co"; 

  // 3. Supabase Anon Key (数据库 Public Key)
  // 获取地址: Supabase后台 -> Project Settings -> API -> Project API Keys (anon/public)
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
      // 将上面的变量注入到应用中
      'process.env': JSON.stringify({
        API_KEY: apiKey,
        NODE_ENV: mode,
        VITE_SUPABASE_URL: supabaseUrl,
        VITE_SUPABASE_ANON_KEY: supabaseKey
      }),
      'process.env.API_KEY': JSON.stringify(apiKey)
    }
  };
});