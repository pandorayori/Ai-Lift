import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: true
    },
    define: {
      // Allow process.env.API_KEY to be used in the client code
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // CRITICAL: Defines process.env as an empty object so the app doesn't crash 
      // if any library tries to access 'process' in the browser.
      'process.env': {}
    }
  };
});