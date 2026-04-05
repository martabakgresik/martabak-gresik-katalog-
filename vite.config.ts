import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.POLLINATIONS_API_KEY || env.VITE_POLLINATIONS_API_KEY;

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'local-api-mock',
        configureServer(server) {
          server.middlewares.use('/api/verify-turnstile', (req, res, next) => {
            if (req.method !== 'POST') { next(); return; }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, note: 'dev-mock' }));
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
      port: 3000,
      proxy: {
        // PROXY CHAT Professional
        '/api/chat': {
          target: 'https://gen.pollinations.ai',
          changeOrigin: true,
          headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
          rewrite: (path) => path.replace(/^\/api\/chat/, '/v1/chat/completions')
        },
        // PROXY IMAGE DOUBLE-SAFE (v11.0)
        '/api/generate-image': {
          target: 'https://gen.pollinations.ai',
          changeOrigin: true,
          bypass: (req, res, proxyOptions) => {
             // Jika ini adalah POST, gunakan jalur OpenAI-Compatible
             if (req.method === 'POST') return null;
             return null; // Biarkan proxy menangani
          },
          headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
          rewrite: (path) => {
            // Jalur Utama: POST base URL
            if (path === '/api/generate-image') {
              return '/v1/images/generations';
            }
            // Jalur Cadangan: Menangani browser yang masih menggunakan format GET /api/generate-image/{prompt}
            const cleanPath = path.replace(/^\/api\/generate-image/, '/image');
            const separator = cleanPath.includes('?') ? '&' : '?';
            return apiKey ? `${cleanPath}${separator}key=${apiKey}` : cleanPath;
          }
        },
        // PROXY DYNAMIC MODELS
        '/api/image-models': {
          target: 'https://gen.pollinations.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/image-models/, '/v1/models')
        }
      },
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
