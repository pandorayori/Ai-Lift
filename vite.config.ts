import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Prioritize VITE_API_KEY (Vercel standard for frontend), fallback to API_KEY
  const apiKey = env.VITE_API_KEY || env.API_KEY || '';

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: true
    },
    define: {
      // 1. Polyfill the 'process' object to prevent "ReferenceError: process is not defined"
      'process.env': JSON.stringify({
        API_KEY: apiKey,
        NODE_ENV: mode
      }),
      // 2. Explicitly define the key for direct replacement
      'process.env.API_KEY': JSON.stringify(apiKey)
    }
  };
});