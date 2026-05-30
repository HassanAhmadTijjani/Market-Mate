import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  tailwindcss(),
  ],
  server: {
    port: 3000
  },
  build: {
    // Disable sourcemaps to hide original source code in production
    sourcemap: false,
    
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Group React and routing
            if (id.includes('react') || id.includes('react-router')) {
              return 'vendor-core';
            }
            // Group database and query logic
            if (id.includes('@supabase') || id.includes('@tanstack')) {
              return 'vendor-utils';
            }
            // Group UI and animations
            if (id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'vendor-ui';
            }
          }
        }
      }
    },
    // Increase the warning limit slightly to 600kB for modern apps
    chunkSizeWarningLimit: 600,
  }
})
