import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React ecosystem
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'react-vendor';
          }
          // Animation libraries
          if (id.includes('framer-motion') || id.includes('motion')) {
            return 'animation-vendor';
          }
          // Three.js ecosystem - separate into smaller chunks
          if (id.includes('three') && !id.includes('@react-three')) {
            return 'three-core';
          }
          if (id.includes('@react-three/fiber')) {
            return 'react-three-fiber';
          }
          if (id.includes('@react-three/drei') || id.includes('maath')) {
            return 'react-three-helpers';
          }
          // UI and icons
          if (id.includes('react-icons')) {
            return 'icons-vendor';
          }
          if (id.includes('clsx') || id.includes('tailwind-merge')) {
            return 'ui-utils';
          }
          // Aceternity UI
          if (id.includes('aceternity-ui')) {
            return 'aceternity-vendor';
          }
          // Node modules catch-all for other vendors
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // Set chunk size warning limit to 150KB
    chunkSizeWarningLimit: 150,
  },
})
