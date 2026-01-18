import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import compression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ command }) => {
  const isBuild = command === "build";

  return {
    plugins: [
      react(),

      // 🔹 PWA Plugin
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\./i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
                }
              }
            }
          ]
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: false, // Use existing manifest.json
      }),

      // 🔹 Enable compression ONLY during build
      isBuild &&
        compression({
          algorithm: "gzip",
          ext: ".gz",
        }),

      isBuild &&
        compression({
          algorithm: "brotliCompress",
          ext: ".br",
        }),

      // 🔹 Bundle analyzer ONLY during build
      isBuild &&
        visualizer({
          open: process.env.ANALYZE === "true",
          filename: "dist/stats.html",
          gzipSize: true,
          brotliSize: true,
        }),
    ].filter(Boolean),

    // 🔹 Base path ONLY for production
    base: "/",

    // 🔹 DEV SERVER (explicit)
    server: {
      host: true,
      port: 5173,
      strictPort: false,
      hmr: {
        protocol: "ws",
        host: "localhost",
        port: 5173,
        clientPort: 5173,
      },
    },

    // 🔹 BUILD-ONLY settings
    build: isBuild
      ? {
          rollupOptions: {
            output: {
              manualChunks: {
                react: ["react", "react-dom", "react-router-dom"],
                ui: ["lucide-react", "@iconify/react"],
                utils: ["axios", "immer", "use-immer"],
                socket: ["socket.io-client"],
              },
            },
          },
          chunkSizeWarningLimit: 500,
          minify: "terser",
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
          },
          sourcemap: false,
        }
      : {},

    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom"],
    },
  };
});