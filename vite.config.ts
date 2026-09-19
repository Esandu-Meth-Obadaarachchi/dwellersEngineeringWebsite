import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    // The three.js chunk is deliberately large and lazy-loaded; it is
    // never on the critical path, so the default warning is noise.
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Keep the 3D engine in its own chunk so the page paints before it loads.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          // react-reconciler, its-fine and zustand come in with
          // react-three-fiber and are useless without it, so they
          // belong in the lazy chunk rather than the eager one.
          if (
            /[\\/]node_modules[\\/](three|@react-three|react-reconciler|its-fine|zustand|suspend-react)[\\/]/.test(id)
          ) {
            return 'three'
          }
          return 'vendor'
        },
      },
    },
  },
})
