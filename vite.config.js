import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        join: resolve(__dirname, 'join.html'),
        profile: resolve(__dirname, 'profile.html'),
        events: resolve(__dirname, 'events.html'),
        eventGsoc: resolve(__dirname, 'event-gsoc.html'),
      },
    },
    // Ensure assets are copied
    assetsDir: 'assets',
  },
  server: {
    port: 5500,
    open: true,
  },
});

