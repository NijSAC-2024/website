import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: process?.env?.REMOTE_API ?? 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    watch: {
      usePolling: true,
    },
  },
  plugins: [react(), tailwindcss(), cloudflare()],
});