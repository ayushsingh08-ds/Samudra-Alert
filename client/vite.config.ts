import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import path from 'path';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Resolve the TS source of the workspace shared package (types + zero build friction in dev)
      '@samudra/shared': path.resolve(dirname, '../shared/index.ts'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          leaflet: ['leaflet', 'react-leaflet'],
        },
      },
    },
    chunkSizeWarningLimit: 1600,
    assetsDir: 'assets',
  },
  server: {
    port: 5174,
    host: true,
  },
  preview: {
    port: 5174,
    host: true,
  },
});
