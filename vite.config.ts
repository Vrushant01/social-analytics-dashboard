import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    // Proxy only for development - production uses VITE_API_URL env var
    ...(process.env.NODE_ENV !== 'production' && {
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    }),
  },
});
