import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: '/school-climate-survey/',
  server: {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
    },
  },
  build: {
    outDir: 'docs'
  }
})
