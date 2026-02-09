import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: undefined,
      babel: {
        plugins: []
      }
    }),
    tailwindcss()
  ],
  server: {
    port: 3000,
    // Suppress non-critical warnings from third-party packages
    hmr: {
      overlay: true
    }
  },
  base: process.env.NODE_ENV === "production" ? "/College_Media/" : "/",
  build: {
    // Code splitting optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          react: ["react", "react-dom", "react-router-dom"],
          ui: ["lucide-react", "@iconify/react"],
          utils: ["axios", "immer", "use-immer"],
          socket: ["socket.io-client"],
        },
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 500,
    // Minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Source maps for production debugging
    sourcemap: false,
  },
  // Performance optimizations
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
});
