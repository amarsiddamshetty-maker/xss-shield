import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendPort = process.env.PORT || env.PORT || '3000';
  return {
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5173, strictPort: true, proxy: { '/api': { target: `http://127.0.0.1:${backendPort}`, changeOrigin: true } } },
  build: { outDir: '../dist', emptyOutDir: true },
  };
});
