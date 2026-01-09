import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import Mkcert from 'vite-plugin-mkcert';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    Mkcert({
      hosts: ['localhost', '127.0.0.1'],
    }),
    tailwindcss(),
  ],
  envDir: '../..',
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['buffer'],
  },
  server: {
    port: 5174,
    host: true,
    https: true,
  },
});
