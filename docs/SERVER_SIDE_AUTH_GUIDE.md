/**
 * 🔐 SERVER-SIDE AUTHENTICATION WITH SUPABASE
 * 
 * Panduan lengkap migrasi dari client-side ke server-side authentication
 * WAJIB untuk production environment
 */

/*
╔════════════════════════════════════════════════════════════════════════════╗
║  PERBEDAAN CLIENT-SIDE VS SERVER-SIDE AUTHENTICATION                       ║
╚════════════════════════════════════════════════════════════════════════════╝

CLIENT-SIDE AUTHENTICATION (CURRENT - ⚠️ NOT SECURE FOR PRODUCTION):
┌─────────────────────────────────────────────────────────────────────────┐
│ ❌ Password hash diverifikasi di browser (JavaScript)                   │
│ ❌ Mudah di-inspect via DevTools (F12 → Console)                        │
│ ❌ User bisa fake authentication hanya dengan console command           │
│ ❌ Tidak ada server-side validation                                     │
│ ❌ Session bisa di-clear manually oleh hacker                           │
│                                                                          │
│ CONTOH ATTACK:                                                           │
│ > sessionStorage.setItem('dashboard_access_granted', 'true')            │
│ > // Boom! Sudah "login" tanpa password!                                │
│                                                                          │
│ ✅ GUNAKAN HANYA UNTUK: UI/UX testing, development, demo                 │
└─────────────────────────────────────────────────────────────────────────┘

SERVER-SIDE AUTHENTICATION (RECOMMENDED - ✅ SECURE):
┌─────────────────────────────────────────────────────────────────────────┐
│ ✅ Password diverifikasi di server (Supabase)                           │
│ ✅ Browser hanya menerima JWT token yang terenkripsi                    │
│ ✅ Session tersimpan di database (bisa di-invalidate kapan saja)        │
│ ✅ Setiap API request harus serah JWT token valid                       │
│ ✅ User TIDAK bisa fake authentication tanpa valid token                │
│ ✅ Rate limiting & brute force protection built-in di Supabase          │
│ ✅ Password TIDAK pernah dikirim di client-side                         │
│                                                                          │
│ FLOW:                                                                    │
│ 1. User submit password ke server                                       │
│ 2. Server verify password (NEVER di client)                             │
│ 3. Server generate JWT token jika valid                                 │
│ 4. Browser terima JWT token (bukan password!)                           │
│ 5. Setiap request ke server, JWT token di-sertakan                      │
│ 6. Server verify JWT token sebelum proses request                       │
│                                                                          │
│ ✅ GUNAKAN UNTUK: Production, staging, live deployment                 │
└─────────────────────────────────────────────────────────────────────────┘


╔════════════════════════════════════════════════════════════════════════════╗
║  STEP 1: SETUP SUPABASE AUTH TABLE                                         ║
╚════════════════════════════════════════════════════════════════════════════╝

Di Supabase → SQL Editor, jalankan:

────────────────────────────────────────────────────────────────────────────
-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL, -- Simpan hash, bukan plaintext!
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Admin Sessions Table (untuk track login sessions)
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  ip_address text,
  user_agent text,
  login_at timestamp DEFAULT now(),
  expires_at timestamp NOT NULL,
  is_active boolean DEFAULT true
);

-- Login Attempts (untuk rate limiting & brute force detection)
CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  ip_address text,
  success boolean DEFAULT false,
  attempted_at timestamp DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Hanya authenticated users yang bisa akses admin_users
CREATE POLICY "Enable read access for authenticated users"
ON admin_users
FOR SELECT
USING (auth.role() = 'authenticated'::text);

────────────────────────────────────────────────────────────────────────────

OPTIONAL: Insert initial admin user:

────────────────────────────────────────────────────────────────────────────
INSERT INTO admin_users (username, email, password_hash)
VALUES (
  'admin',
  'admin@martabakgresik.com',
  crypt('SayangkU99]-@-k', gen_salt('bf'))  -- bcrypt hashing
)
ON CONFLICT DO NOTHING;

────────────────────────────────────────────────────────────────────────────


╔════════════════════════════════════════════════════════════════════════════╗
║  STEP 2: CREATE BACKEND API FOR AUTHENTICATION                             ║
╚════════════════════════════════════════════════════════════════════════════╝

Buat file: backend/auth.ts (atau api/auth.ts di Vercel)

────────────────────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';
import * as jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role, bukan anon!
);

/**
 * 🔓 Login Endpoint
 * POST /api/auth/login
 * Body: { username: string, password: string }
 * Response: { token: string, expiresIn: number }
 */
export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username dan password harus diisi' 
      });
    }

    // Log attempt
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent') || '';

    // Query admin user dari database
    const { data: adminUser, error: queryError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (queryError || !adminUser) {
      // Log failed attempt
      await supabase.from('login_attempts').insert({
        username,
        ip_address: ipAddress,
        success: false
      });

      return res.status(401).json({ 
        error: 'Username atau password salah' 
      });
    }

    // Verify password menggunakan bcrypt
    const bcrypt = require('bcrypt');
    const passwordMatch = await bcrypt.compare(password, adminUser.password_hash);

    if (!passwordMatch) {
      // Log failed attempt
      await supabase.from('login_attempts').insert({
        username,
        ip_address: ipAddress,
        success: false
      });

      return res.status(401).json({ 
        error: 'Username atau password salah' 
      });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { 
        sub: adminUser.id,
        username: adminUser.username,
        email: adminUser.email
      },
      jwtSecret,
      { expiresIn: '8h' } // Token berlaku 8 jam
    );

    // Simpan session ke database
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
    await supabase.from('admin_sessions').insert({
      admin_id: adminUser.id,
      token,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: expiresAt.toISOString()
    });

    // Log successful attempt
    await supabase.from('login_attempts').insert({
      username,
      ip_address: ipAddress,
      success: true
    });

    return res.json({
      token,
      expiresIn: 8 * 60 * 60, // 8 hours in seconds
      user: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}

/**
 * 🔒 Verify Token Middleware
 * Gunakan di semua protected routes
 */
export async function verifyToken(req: Request, res: Response, next: Function) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Missing or invalid authorization header' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

    // Verify JWT token
    const decoded = jwt.verify(token, jwtSecret);

    // Optional: Check session di database apakah masih aktif
    const { data: session } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (!session || new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ 
        error: 'Token expired or invalid' 
      });
    }

    // Attach user info ke request
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Invalid token',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * 🚪 Logout Endpoint
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7);

    if (!token) {
      return res.status(400).json({ 
        error: 'Missing token' 
      });
    }

    // Invalidate session di database
    await supabase
      .from('admin_sessions')
      .update({ is_active: false })
      .eq('token', token);

    return res.json({ 
      message: 'Logout berhasil' 
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Logout failed' 
    });
  }
}

────────────────────────────────────────────────────────────────────────────


╔════════════════════════════════════════════════════════════════════════════╗
║  STEP 3: UPDATE FRONTEND (REACT)                                           ║
╚════════════════════════════════════════════════════════════════════════════╝

File: src/lib/server-auth.ts

────────────────────────────────────────────────────────────────────────────
/**
 * Server-side authentication service
 * Komunikasi dengan backend API, bukan directly dengan Supabase
 */

export interface LoginResponse {
  token: string;
  expiresIn: number;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

/**
 * Login dengan server-side authentication
 */
export async function loginWithServer(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
}

/**
 * Simpan token ke localStorage (atau httpOnly cookie lebih baik)
 */
export function saveAuthToken(token: string): void {
  // BETTER: Gunakan httpOnly cookie dari server (automatic)
  // FALLBACK: Simpan di localStorage
  localStorage.setItem('auth_token', token);
}

/**
 * Get token yang disimpan
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Logout
 */
export async function logoutFromServer(): Promise<void> {
  const token = getAuthToken();

  if (!token) {
    localStorage.removeItem('auth_token');
    return;
  }

  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
  }

  localStorage.removeItem('auth_token');
}

/**
 * Get Authorization header untuk API requests
 */
export function getAuthHeader(): Record<string, string> {
  const token = getAuthToken();
  if (!token) {
    return {};
  }
  return {
    'Authorization': `Bearer ${token}`,
  };
}

────────────────────────────────────────────────────────────────────────────

Update File: src/components/AdminLogin.tsx

────────────────────────────────────────────────────────────────────────────
import { loginWithServer, saveAuthToken } from '../lib/server-auth';

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Login ke server (bukan client-side hash verification)
      const response = await loginWithServer('admin', password); // username bisa dari input juga
      
      // Simpan token JWT dari server
      saveAuthToken(response.token);
      
      // Notify parent component
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of component
}

────────────────────────────────────────────────────────────────────────────


╔════════════════════════════════════════════════════════════════════════════╗
║  STEP 4: SETUP VERCEL API ROUTES (Using Vercel Functions)                 ║
╚════════════════════════════════════════════════════════════════════════════╝

Struktur folder:
   api/
   └── auth/
       ├── login.ts
       ├── logout.ts
       └── verify.ts

File: api/auth/login.ts

────────────────────────────────────────────────────────────────────────────
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username dan password diperlukan' 
      });
    }

    // Initialize Supabase dengan SERVICE ROLE KEY (bukan anon key!)
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Query admin user
    const { data: adminUser, error: queryError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (queryError || !adminUser) {
      // Log failed attempt
      await supabase.from('login_attempts').insert({
        username,
        ip_address: req.headers['x-forwarded-for'] || '',
        success: false
      });

      return res.status(401).json({ 
        error: 'Username atau password salah' 
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, adminUser.password_hash);

    if (!passwordMatch) {
      await supabase.from('login_attempts').insert({
        username,
        ip_address: req.headers['x-forwarded-for'] || '',
        success: false
      });

      return res.status(401).json({ 
        error: 'Username atau password salah' 
      });
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || 'change-this-secret';
    const token = jwt.sign(
      { 
        sub: adminUser.id,
        username: adminUser.username,
        email: adminUser.email
      },
      jwtSecret,
      { expiresIn: '8h' }
    );

    // Save session
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
    await supabase.from('admin_sessions').insert({
      admin_id: adminUser.id,
      token,
      ip_address: req.headers['x-forwarded-for'] || '',
      user_agent: req.headers['user-agent'] || '',
      expires_at: expiresAt.toISOString()
    });

    // Log success
    await supabase.from('login_attempts').insert({
      username,
      ip_address: req.headers['x-forwarded-for'] || '',
      success: true
    });

    // Set httpOnly cookie (RECOMMENDED untuk security)
    res.setHeader('Set-Cookie', `auth_token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${8 * 60 * 60}`);

    return res.json({
      token,
      expiresIn: 8 * 60 * 60,
      user: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

────────────────────────────────────────────────────────────────────────────

File: api/auth/verify.ts

────────────────────────────────────────────────────────────────────────────
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as jwt from 'jsonwebtoken';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Get token dari header atau cookie
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7) || 
                  (req.cookies?.auth_token ? req.cookies.auth_token : null);

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify JWT
    const jwtSecret = process.env.JWT_SECRET || 'change-this-secret';
    const decoded = jwt.verify(token, jwtSecret);

    return res.json({
      valid: true,
      user: decoded
    });
  } catch (error) {
    return res.status(401).json({ 
      error: 'Invalid or expired token' 
    });
  }
}

────────────────────────────────────────────────────────────────────────────


╔════════════════════════════════════════════════════════════════════════════╗
║  ENVIRONMENT VARIABLES YANG DIPERLUKAN                                     ║
╚════════════════════════════════════════════════════════════════════════════╝

.env.local (LOCAL DEVELOPMENT):
────────────────────────────────────────────────────────────────────────────
VITE_SUPABASE_URL=https://qohvacfwdsceoyvjtbdg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend only (jangan expose di browser!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (dari Supabase Settings)
JWT_SECRET=your-super-secret-jwt-key-change-this

────────────────────────────────────────────────────────────────────────────

Vercel Environment Variables:
────────────────────────────────────────────────────────────────────────────
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY (Production Only - di Vercel, bukan di .env.local)
JWT_SECRET (Production Only)

────────────────────────────────────────────────────────────────────────────


╔════════════════════════════════════════════════════════════════════════════╗
║  SECURITY BEST PRACTICES                                                   ║
╚════════════════════════════════════════════════════════════════════════════╝

✅ WAJIB DILAKUKAN:
  1. ✅ Simpan JWT token di httpOnly cookie (auto set dari server, bukan JS)
  2. ✅ NEVER expose service role key di browser/frontend
  3. ✅ Gunakan HTTPS saja (Vercel default)
  4. ✅ Set CORS policy yang ketat
  5. ✅ Implement rate limiting untuk login endpoint
  6. ✅ Hash password pakai bcrypt (jangan SHA256)
  7. ✅ Implement brute force protection
  8. ✅ Log semua login attempts (success & failed)
  9. ✅ Set token expiration (8h recommended)
  10. ✅ Implement refresh token untuk long-lived sessions

⚠️ JANGAN LAKUKAN:
  ❌ Simpan plaintext password di database
  ❌ Simpan JWT token di localStorage (vulnerable to XSS)
  ❌ Expose SERVICE_ROLE_KEY di frontend kode
  ❌ Gunakan SHA256 untuk password hashing (use bcrypt/argon2)
  ❌ Debug credentials di console.log
  ❌ Commit .env.local ke git

🔒 ADDITIONAL SECURITY LAYERS:
  • Implement 2FA (Two-Factor Authentication)
  • Setup IP whitelist untuk admin accounts
  • Implement session invalidation jika suspicious activity
  • Add CSRF token untuk form submissions
  • Setup audit logging untuk admin actions


╔════════════════════════════════════════════════════════════════════════════╗
║  IMPLEMENTATION TIMELINE                                                   ║
╚════════════════════════════════════════════════════════════════════════════╝

PHASE 1: IMMEDIATE (DAYS 1-2)
  □ Setup Supabase tables (auth, sessions, login_attempts)
  □ Create Vercel API routes (login, verify, logout)
  □ Setup JWT_SECRET di environment
  □ Update AdminLogin component untuk call server
  □ Test di local development

PHASE 2: TESTING (DAY 3)
  □ Test login with multiple users
  □ Test token expiration
  □ Test logout
  □ Test brute force protection
  □ Test dengan browser DevTools (verify sedang tidak bisa bypass)

PHASE 3: DEPLOYMENT (DAY 4)
  □ Add environment variables ke Vercel
  □ Deploy ke staging/production
  □ Test di live environment
  □ Monitor login attempts di Supabase

PHASE 4: OPTIMIZATION (WEEK 2)
  □ Implement 2FA
  □ Add audit logging
  □ Implement refresh tokens
  □ Setup IP whitelist


*/

export const SERVER_AUTH_GUIDE = `
Panduan lengkap untuk implementasi server-side authentication dengan Supabase.
Lihat dokumentasi di atas untuk implementasi step-by-step.
`;
