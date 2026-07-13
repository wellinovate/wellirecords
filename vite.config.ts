import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 5173,
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Vendor: React core — cached separately, never changes
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react';
            }
            // Vendor: router
            if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run')) {
              return 'vendor-router';
            }
            // Vendor: charting / heavy libs
            if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) {
              return 'vendor-charts';
            }
          },
        },
      },
    },
  };
});

