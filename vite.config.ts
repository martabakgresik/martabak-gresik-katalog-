import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// Test secret keys resmi dari Cloudflare
const CLOUDFLARE_TEST_SECRET_KEYS = [
  '1x0000000000000000000000000000000AA',
  '2x0000000000000000000000000000000AB',
  '3x0000000000000000000000000000000FF',
];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      // Dev-only: mock /api/verify-turnstile agar tidak perlu vercel dev
      {
        name: 'local-api-mock',
        configureServer(server) {
          server.middlewares.use('/api/verify-turnstile', (req, res, next) => {
            if (req.method !== 'POST') { next(); return; }
            const secretKey = env.TURNSTILE_SECRET_KEY;
            if (CLOUDFLARE_TEST_SECRET_KEYS.includes(secretKey)) {
              console.log('[Dev Mock] Turnstile bypass - test key detected');
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, note: 'dev-mock' }));
            } else {
              // Jika bukan test key, tetap pass di lokal (dev mode)
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, note: 'dev-passthrough' }));
            }
          });
        }
      }
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
