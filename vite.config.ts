import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  define: {
    // CRITICAL: Defines process.env as an empty object so the app doesn't crash 
    // if any library tries to access 'process' in the browser.
    'process.env': {}
  }
});