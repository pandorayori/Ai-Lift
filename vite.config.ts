import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const cwd = (process as any).cwd ? (process as any).cwd() : '.';
  const env = loadEnv(mode, cwd, '');
  const apiKey = env.VITE_API_KEY || env.API_KEY || '';
  const supabaseUrl = env.VITE_SUPABASE_URL || '';
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY || '';

  return {
    plugins: [react()],
    // 明确指定静态资源目录为 public (这是默认值，但显式写出来以防万一)
    publicDir: 'public',
    build: {
      outDir: 'dist',
      sourcemap: true
    },
    define: {
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