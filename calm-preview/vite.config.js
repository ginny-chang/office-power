import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '/src-calm': fileURLToPath(new URL('../src-calm', import.meta.url))
    }
  },
  server: { fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] } }
});
