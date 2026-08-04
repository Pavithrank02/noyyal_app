import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    watch: {
      // OneDrive sometimes locks/duplicates zip files mid-sync (e.g. "dist (2).zip"),
      // which crashes Vite's fs watcher with EBUSY if it's left in the project root.
      ignored: ['**/*.zip'],
    },
    // Mirrors the Netlify redirect proxy in netlify.toml, so local dev also
    // hits the API same-origin (relative /auth, /api paths in src/lib/api.ts).
    proxy: {
      '/auth': { target: 'http://localhost:4000', changeOrigin: true },
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
})
