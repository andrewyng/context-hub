import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../src/web',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/sse': 'http://localhost:3001',
      '/messages': 'http://localhost:3001',
      '/health': 'http://localhost:3001',
    },
  },
});
