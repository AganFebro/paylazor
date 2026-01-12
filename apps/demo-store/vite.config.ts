import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import Mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [
    react(),
    Mkcert({
      hosts: ['localhost', '127.0.0.1'],
    }),
  ],
  resolve: {
    alias: {
      buffer: 'buffer/',
    },
  },
  envDir: '../..',
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['buffer'],
  },
  server: {
    port: 5173,
    host: true,
    https: {},
  },
});
