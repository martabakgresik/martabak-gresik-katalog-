## 🔐 CLIENT-SIDE VS SERVER-SIDE AUTHENTICATION

Mari saya jelaskan perbedaan dan kenapa server-side AUTH penting untuk production:

---

## ⚠️ Masalah dengan CLIENT-SIDE Authentication (Current)

**Current Implementation:**
```
Frontend (React)
  ↓
Masukkan password
  ↓
Generate SHA-256 hash di browser (JavaScript)
  ↓
Compare dengan hash yang disimpan di localStorage/sessionStorage
  ↓
Jika match → set sessionStorage['dashboard_access_granted'] = 'true'
  ↓
Bisa akses dashboard
```

**Masalah Keamanan:**

| Masalah | Detail |
|---------|--------|
| **User bisa fake login** | Buka DevTools (F12) → Console → `sessionStorage.setItem('dashboard_access_granted', 'true')` → SELESAI LOGIN! |
| **Password terlihat di network** | Jika hardcoded di kode, bisa dilihat di source code via `curl` atau view-source |
| **Tidak ada server validation** | Client bisa memanipulasi localStorage sesuka hati |
| **Session tidak bisa di-invalidate** | Tidak ada cara server untuk "kick out" user dari browser lain |
| **Vulnerable to XSS attacks** | Jika ada XSS vulnerability, attacker bisa steal localStorage |

**Test sendiri:**
```javascript
// Buka console di http://localhost:3000
// Jalankan:
sessionStorage.setItem('dashboard_access_granted', 'true');

// Boom! Sudah bisa akses dashboard tanpa password!
```

---

## ✅ Solusi: SERVER-SIDE Authentication

**Secure Implementation:**
```
Frontend (React)
  ↓
User input password di form
  ↓
SEND password ke server (HTTPS only)
  ↓
Server (Vercel API)
  ├─ Query admin user dari Supabase
  ├─ Compare password dengan bcrypt (bukan SHA256!)
  ├─ Generate JWT token jika valid
  └─ Simpan session ke database (admin_sessions table)
  ↓
Server return JWT token ke browser
  ↓
Browser simpan token di httpOnly cookie (auto, bukan JS)
  ↓
Setiap request ke protected resource
  ├─ Browser auto kirim token via cookie
  ├─ Server verify token
  └─ Jika valid, process request
```

**Keuntungan:**

| Keuntungan | Detail |
|-----------|--------|
| **JavaScript NOT bisa fake** | DevTools tidak bisa set httpOnly cookie |
| **Password aman** | Hanya transit via HTTPS, tidak pernah disimpan di client |
| **Server validation** | Setiap request harus verify token di server |
| **Session control** | Server bisa invalidate token kapan saja |
| **Brute force protection** | Server track login attempts dan block IP |
| **Audit trail** | Server log semua login attempts (success & failed) |

---

## 📊 Implementation Status

### CURRENT (Client-Side - ⚠️ DEV ONLY)
- ✅ File: `src/lib/auth.ts`
- ✅ File: `src/components/AdminLogin.tsx`
- ⚠️ Status: **HANYA UNTUK DEVELOPMENT**
- ⚠️ Jangan gunakan di production!

### NEXT STEPS (Server-Side - ✅ PRODUCTION READY)
- ✅ File: `src/lib/server-auth.ts` (Frontend service)
- ✅ File: `api/auth/login.ts` (Backend route)
- ✅ File: `api/auth/verify.ts` (Backend route)
- ✅ File: `api/auth/logout.ts` (Backend route)
- ✅ File: `docs/SERVER_SIDE_AUTH_GUIDE.md` (Full documentation)

---

## 🚀 Quick Migration Guide

### STEP 1: Install Dependencies
```bash
npm install jsonwebtoken bcrypt
```

### STEP 2: Setup Supabase Tables
Buka Supabase SQL Editor, jalankan:

```sql
-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

-- Admin Sessions Table
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

-- Insert initial admin user (ganti password)
INSERT INTO admin_users (username, email, password_hash)
VALUES (
  'admin',
  'admin@martabakgresik.com',
  crypt('SayangkU99]-@-k', gen_salt('bf'))
);
```

### STEP 3: Set Environment Variables

**.env.local (Local Development):**
```env
# API URL untuk calls dari browser
VITE_API_URL=http://localhost:3000

# Existing Supabase vars
VITE_SUPABASE_URL=https://qohvacfwdsceoyvjtbdg.supabase.co
VITE_SUPABASE_ANON_KEY=...

# Backend only vars (jangan expose di browser!)
SUPABASE_SERVICE_ROLE_KEY=... (dari Supabase Settings → API)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```

**Vercel Environment Variables (Production):**
- `VITE_API_URL` → `https://your-domain.com`
- `VITE_SUPABASE_URL` → (sama seperti local)
- `VITE_SUPABASE_ANON_KEY` → (sama seperti local)
- `SUPABASE_SERVICE_ROLE_KEY` → (hanya di production!)
- `JWT_SECRET` → (hanya di production!)

### STEP 4: Update AdminLogin Component

```tsx
import { loginWithServer, saveAuthToken } from '../lib/server-auth';

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // User input username dari form
      const response = await loginWithServer(username, password);
      
      // Simpan token
      saveAuthToken(response.token);
      
      // Success
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of component
}
```

### STEP 5: Test di Local
```bash
npm run dev

# Akses: http://localhost:3000?admin=true
# Try login dengan password: SayangkU99]-@-k
```

---

## 🔒 Security Checklist

- [ ] ✅ Install jsonwebtoken dan bcrypt
- [ ] ✅ Setup Supabase tables (admin_users, admin_sessions)
- [ ] ✅ Set environment variables (.env.local)
- [ ] ✅ Create API routes (api/auth/login.ts, verify.ts, logout.ts)
- [ ] ✅ Update AdminLogin component
- [ ] ✅ Test pada local development
- [ ] ✅ Test password hashing dengan bcrypt (bukan SHA256!)
- [ ] ✅ Verify JWT token generation & verification
- [ ] ✅ Test token expiration (8 hours)
- [ ] ✅ Test logout (invalidate session)
- [ ] ✅ Add environment variables ke Vercel
- [ ] ✅ Deploy & test di production
- [ ] ✅ Verify httpOnly cookie diset dengan benar
- [ ] ✅ Test brute force protection
- [ ] ✅ Monitor login attempts di Supabase

---

## 📝 Important Notes

### WHY NOT SHA256 for Passwords?
- ❌ SHA256 is fast (BAD for password hashing!)
- ❌ Vulnerable to brute force & rainbow table attacks
- ✅ Use bcrypt instead (slow + salt = secure)

### WHY Not localStorage for JWT?
- ❌ Vulnerable to XSS attacks (JavaScript bisa read)
- ✅ Use httpOnly cookies (JavaScript TIDAK bisa read)
- ✅ Auto sent dengan setiap request
- ✅ Auto cleared saat clear cookies

### Password Hashing Comparison:
```
SHA256:   "password123" → "482c811da5d5b4bc6d497ffa98491e38" (instant, fast) ❌
Bcrypt:   "password123" → "$2b$10$..." (1 second, slow) ✅

Attacker dengan 10M guesses/sec:
- SHA256: Could crack dalam hitungan jam
- Bcrypt: Would take YEARS
```

---

## 🎯 Timeline untuk Implementasi

**PHASE 1: SETUP (2-3 jam)**
- [ ] Setup Supabase tables
- [ ] Create API routes
- [ ] Set environment variables

**PHASE 2: MIGRATION (1-2 jam)**
- [ ] Update AdminLogin component
- [ ] Update App.tsx untuk pakai server-auth
- [ ] Update router.tsx

**PHASE 3: TESTING (1-2 jam)**
- [ ] Test login/logout
- [ ] Test token expiration
- [ ] Test brute force protection
- [ ] Test pada different browsers

**PHASE 4: DEPLOYMENT (30 min)**
- [ ] Add env vars ke Vercel
- [ ] Deploy
- [ ] Test di production

**Total Time: 4-7 jam**

---

## 🆘 Troubleshooting

**Error: "Cannot find module 'jsonwebtoken'"**
```bash
npm install jsonwebtoken bcrypt
```

**Error: "SUPABASE_SERVICE_ROLE_KEY not set"**
- Buka: https://app.supabase.com → Settings → API
- Copy "Service Role Secret" (bukan "Anon public key"!)
- Paste ke SUPABASE_SERVICE_ROLE_KEY di .env.local

**Token keeps expiring**
- Extend expiresIn dari 8h menjadi 24h atau lebih
- Implement refresh token mechanism

**Login always fails**
- Verify password hash dengan: `node -e "const crypto = require('crypto'); console.log(crypto.createHash('sha256').update('password').digest('hex'))"`
- Make sure user exist di database
- Check browser console untuk error message

---

## 📚 Related Files

- `docs/SERVER_SIDE_AUTH_GUIDE.md` - Detailed documentation
- `src/lib/server-auth.ts` - Frontend authentication service
- `api/auth/login.ts` - Login endpoint
- `api/auth/verify.ts` - Token verification endpoint
- `api/auth/logout.ts` - Logout endpoint
- `.env.example` - Environment variables template

---

**Status: READY TO IMPLEMENT** ✅

Semua file sudah siap di-copy paste. Silakan ikuti timeline dan checklist di atas!
