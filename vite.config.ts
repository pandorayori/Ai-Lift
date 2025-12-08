import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Try to find the key in various common names
  const apiKey = env.VITE_API_KEY || env.API_KEY || '';

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: true
    },
    define: {
      // Polyfill process.env for the browser
      'process.env': JSON.stringify({
        API_KEY: apiKey,
        ...env
      }),
      // Explicitly define the key for direct access
      'process.env.API_KEY': JSON.stringify(apiKey)
    }
  };
});
