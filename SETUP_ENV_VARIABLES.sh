#!/usr/bin/env bash
# 🚀 SETUP ENVIRONMENT VARIABLES - GUIDE PRAKTIS
# Jalankan manual steps di bawah ini untuk setup sesuai environment Anda

echo "════════════════════════════════════════════════════════════════"
echo "  🔧 MARTABAK GRESIK - ENVIRONMENT SETUP GUIDE"
echo "════════════════════════════════════════════════════════════════"
echo ""

##############################################################################
# 📋 STEP 1: LOCAL DEVELOPMENT (.env.local)
##############################################################################

cat << 'EOF'
📝 STEP 1: Setup untuk Local Development
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1.1️⃣ Generate SHA-256 Hash untuk Admin Password:

    node -e "const crypto = require('crypto'); console.log(crypto.createHash('sha256').update('PASSWORD_ANDA').digest('hex'))"

    Contoh:
    - Password: "admin-rahasia-2024"
    - Output: 7f8a3c5b9e2d1f4a8c6b3e0d9f2c5a8b7f1e4d9c7a3b5e8f0d2c5a7f9b1e4a

1.2️⃣ Generate Node.js crypto (jika tidak bisa langsung dari CLI):

    node << 'HASH_EOF'
    const crypto = require('crypto');
    const pass = "PASSWORD_ANDA";
    const hash = crypto.createHash('sha256').update(pass).digest('hex');
    console.log('Password:', pass);
    console.log('SHA-256 Hash:', hash);
    HASH_EOF

1.3️⃣ Buat file .env.local (di root project):

    Buka: /workspaces/martabak-gresik-katalog-/.env.local
    
    COPY & PASTE KOD INI:
    
    ────────────────────────────────────────────────────────────
    # 🔐 Admin Authentication
    VITE_ADMIN_PASSWORD_HASH=PASTE_YOUR_SHA256_HASH_HERE

    # 🗄️ Supabase Configuration
    VITE_SUPABASE_URL=https://your-project.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-key-here

    # 🤖 Turnstile (Cloudflare)
    VITE_TURNSTILE_SITE_KEY=0x4AAAAAACwdrus7K-Tn9Gd-
    ────────────────────────────────────────────────────────────

1.4️⃣ Dapatkan Supabase Credentials:

    a. Buka: https://app.supabase.com
    b. Pilih project Anda
    c. Klik: Settings → API (di sidebar kiri)
    d. Copy:
       - Project URL → VITE_SUPABASE_URL
       - Anon public key → VITE_SUPABASE_ANON_KEY

1.5️⃣ Test Setup di Local:

    npm run dev
    
    - Akses: http://localhost:3000?admin=true
    - Masukkan password yang Anda set
    - Seharusnya masuk ke dashboard

EOF

##############################################################################
# 🚀 STEP 2: DEPLOY KE VERCEL
##############################################################################

cat << 'EOF'

🚀 STEP 2: Setup di Vercel (Production)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2.1️⃣ Buka Vercel Project Settings:

    a. Buka: https://vercel.com/dashboard
    b. Pilih project: martabak-gresik-katalog-
    c. Klik: Settings (tab di atas)
    d. Di sidebar: Environment Variables

2.2️⃣ Tambahkan Environment Variables:

    PRODUCTION:
    ├─ VITE_ADMIN_PASSWORD_HASH: [hash dari step 1.1]
    ├─ VITE_SUPABASE_URL: [dari Supabase dashboard]
    ├─ VITE_SUPABASE_ANON_KEY: [dari Supabase dashboard]
    └─ VITE_TURNSTILE_SITE_KEY: 0x4AAAAAACwdrus7K-Tn9Gd-

    PREVIEW (opsional, untuk branch testing):
    ├─ Same variables as above

2.3️⃣ Format pengisian:

    Name: VITE_ADMIN_PASSWORD_HASH
    Value: 7f8a3c5b9e2d1f4a8c6b3e0d9f2c5a8b7f1e4d9c7a3b5e8f0d2c5a7f9b1e4a
    Environments: Production, Preview, Development (pilih mana yang perlu)
    
    Klik: Save

2.4️⃣ Deploy ulang:

    a. Di Vercel dashboard
    b. Klik: Deployments
    c. Klik deployment terbaru
    d. Klik: Redeploy

2.5️⃣ Test di Production:

    a. Buka: https://your-domain.com?admin=true
    b. Masukkan password yang sama
    c. Seharusnya masuk ke dashboard

EOF

##############################################################################
# 🔒 STEP 3: SUPABASE SETUP
##############################################################################

cat << 'EOF'

🔒 STEP 3: Setup Database di Supabase
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3.1️⃣ Pastikan Supabase project sudah dibuat:

    a. Buka: https://app.supabase.com
    b. Klik: New Project (jika belum ada)
    c. Atau pilih project yang sudah ada

3.2️⃣ Setup Tables yang diperlukan:

    a. Di Supabase: SQL Editor
    b. Copy & Paste:

    ────────────────────────────────────────────────────────────
    -- Store Settings Table (jika belum ada)
    CREATE TABLE IF NOT EXISTS store_settings (
      id text PRIMARY KEY DEFAULT 'main_config',
      store_name text,
      store_address text,
      store_phone text,
      open_hour integer,
      close_hour integer,
      promo_code text,
      promo_percent integer,
      shipping_rate_per_km integer,
      max_shipping_distance integer,
      is_emergency_closed boolean DEFAULT false,
      promo_start_at timestamp,
      promo_end_at timestamp,
      updated_at timestamp DEFAULT now()
    );

    -- Categories Table
    CREATE TABLE IF NOT EXISTS categories (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      type text NOT NULL, -- 'sweet' atau 'savory'
      display_order integer,
      created_at timestamp DEFAULT now()
    );

    -- Menu Items Table
    CREATE TABLE IF NOT EXISTS menu_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      category_id uuid REFERENCES categories(id),
      name text NOT NULL,
      price integer NOT NULL,
      description text,
      image text,
      is_best_seller boolean DEFAULT false,
      is_available boolean DEFAULT true,
      variant_type text, -- untuk savory menu
      qty integer, -- untuk savory menu
      display_order integer,
      created_at timestamp DEFAULT now()
    );
    ────────────────────────────────────────────────────────────

3.3️⃣ Dapatkan API Keys:

    a. Di Supabase: Settings → API
    b. Project URL → VITE_SUPABASE_URL
    c. Anon public key → VITE_SUPABASE_ANON_KEY
    d. Copy ke .env.local atau Vercel

EOF

##############################################################################
# ✅ STEP 4: VERIFICATION
##############################################################################

cat << 'EOF'

✅ STEP 4: Verification Checklist
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sebelum production, pastikan:

LOCAL DEVELOPMENT:
  ✅ npm run dev berjalan tanpa error
  ✅ Halaman home (/) bisa diakses
  ✅ Halaman blog (/blog) bisa diakses
  ✅ Admin login (?admin=true) muncul modal login
  ✅ Semua navigasi bekerja
  ✅ Console tidak ada error orange/merah

VERCEL DEPLOYMENT:
  ✅ Build berhasil tanpa error (lihat build logs)
  ✅ Website bisa diakses di domain Vercel
  ✅ Admin login (?admin=true) bekerja di domain production
  ✅ Database fetch dari Supabase berfungsi
  ✅ Console logs di browser tidak ada error

SECURITY:
  ✅ Password hash diset (bukan plaintext)
  ✅ Environment variables tidak di-commit ke git (check .gitignore)
  ✅ HTTPS aktif di production (Vercel default)
  ✅ Admin session clear saat browser ditutup
  ✅ Deep linking dari external URL bekerja

EOF

##############################################################################
# 🐛 TROUBLESHOOTING
##############################################################################

cat << 'EOF'

🐛 Troubleshooting
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROBLEM: "Supabase credentials missing"
SOLUTION:
  1. Pastikan .env.local ada di root project
  2. Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY terisi
  3. Restart npm run dev
  4. Check console browser (F12) untuk lebih jelas

PROBLEM: Admin login always fails
SOLUTION:
  1. Pastikan VITE_ADMIN_PASSWORD_HASH sudah di .env.local
  2. Pastikan hash SHA-256 benar
  3. Test hash dengan: node -e "console.log(require('crypto').createHash('sha256').update('PASSWORD').digest('hex'))"
  4. Pastikan password input tepat sama dengan yang di-hash

PROBLEM: Supabase connection error di production
SOLUTION:
  1. Verifikasi VITE_SUPABASE_URL format (harus https://xxx.supabase.co)
  2. Cek di Vercel Environment Variables sudah terisi
  3. Redeploy setelah update env vars
  4. Check Supabase project masih aktif (cek di dashboard)

PROBLEM: "Cannot find module react-router-dom"
SOLUTION:
  1. npm install react-router-dom (jika ingin menggunakan React Router)
  2. Ikuti docs/REACT_ROUTER_MIGRATION.md untuk setup

EOF

##############################################################################
# 📚 REFERENCES & DOCS
##############################################################################

cat << 'EOF'

📚 References & Documentation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 Files yang penting:
  • .env.example → Template env variables
  • src/lib/auth.ts → Admin authentication logic
  • src/lib/supabase.ts → Supabase client setup
  • PERBAIKAN_SUMMARY.md → Ringkasan semua perbaikan
  • docs/REACT_ROUTER_MIGRATION.md → Panduan React Router
  • docs/APP_REFACTORING_GUIDE.md → Panduan refactoring App.tsx

🔗 External Links:
  • Supabase Setup: https://app.supabase.com
  • Vercel Dashboard: https://vercel.com/dashboard
  • Vite Env Docs: https://vitejs.dev/guide/env-and-mode
  • React Router: https://reactrouter.com

EOF

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  ✅ Setup guide complete! Harap ikuti semua steps di atas"
echo "════════════════════════════════════════════════════════════════"
echo ""
