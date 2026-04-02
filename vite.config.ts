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
          // Auth Login Mock
          server.middlewares.use('/api/auth/login', (req, res, next) => {
            if (req.method !== 'POST') { next(); return; }
            
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
              try {
                const { password } = JSON.parse(body);
                const adminHash = (env.VITE_ADMIN_PASSWORD_HASH || '').trim().toLowerCase();
                
                if (!adminHash) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ message: 'Error: VITE_ADMIN_PASSWORD_HASH tidak ditemukan di environment dev.' }));
                  return;
                }

                // SHA-256 Hashing
                const crypto = await import('crypto');
                const inputHash = crypto.createHash('sha256').update(password).digest('hex').toLowerCase();
                
                if (inputHash === adminHash) {
                  res.writeHead(200, { 
                    'Content-Type': 'application/json',
                    'Set-Cookie': 'auth_token=dummy_dev_token; HttpOnly; Path=/; Max-Age=28800; SameSite=Lax'
                  });
                  res.end(JSON.stringify({ success: true, token: 'dummy_dev_token' }));
                } else {
                  res.writeHead(401, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ message: 'Password salah (Lokal Mock)' }));
                }
              } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
              }
            });
          });

          // Auth Verify Mock
          server.middlewares.use('/api/auth/verify', (req, res, next) => {
            const cookies = req.headers.cookie || '';
            const isAuthenticated = cookies.includes('auth_token=dummy_dev_token');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ authenticated: isAuthenticated }));
          });

          // Auth Logout Mock
          server.middlewares.use('/api/auth/logout', (req, res, next) => {
            res.writeHead(200, { 
              'Content-Type': 'application/json',
              'Set-Cookie': 'auth_token=; HttpOnly; Path=/; Max-Age=0'
            });
            res.end(JSON.stringify({ success: true }));
          });

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
