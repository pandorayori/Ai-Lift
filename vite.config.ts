import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
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
    define: {
      // Safely map env vars without overwriting the entire process object
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY || ''),
    }
  };
});