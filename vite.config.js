import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  // GitHub Pages serves this repo under /office-power/; the workflow sets
  // BASE_PATH so local builds and the dev server stay at the root.
  base: process.env.BASE_PATH || '/',
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        v2: fileURLToPath(new URL('./v2.html', import.meta.url)),
        v0911: fileURLToPath(new URL('./0911.html', import.meta.url)),
        production: fileURLToPath(new URL('./production.html', import.meta.url)),
        dashboard: fileURLToPath(new URL('./dashboard.html', import.meta.url)),
        chat: fileURLToPath(new URL('./chat.html', import.meta.url)),
        apps: fileURLToPath(new URL('./apps.html', import.meta.url)),
        calmAgent: fileURLToPath(new URL('./calm-agent.html', import.meta.url)),
      },
    },
  },
});
