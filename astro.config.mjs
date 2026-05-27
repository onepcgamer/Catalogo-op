// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

export default defineConfig({
  // Sin output SSR — todo estático para Netlify
  output: 'static',

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    build: {
      // Chunk más grande permitido antes de warning
      chunkSizeWarningLimit: 1000,
    },
  },
});
