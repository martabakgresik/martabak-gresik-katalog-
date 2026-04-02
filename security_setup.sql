-- 🛡️ Row Level Security (RLS) Setup for Martabak Gresik
-- Jalankan perintah ini di SQL Editor Supabase untuk mengamankan tabel admin.

-- 1. Enable RLS pada tabel terkait
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- 2. Buat Policy untuk admin_users (Hanya bisa diakses oleh service role / backend)
-- Karena login dilakukan via API, client-side tidak butuh akses langsung ke tabel ini.
CREATE POLICY "Admin users only accessible by service role" 
ON admin_users 
FOR ALL 
USING (auth.role() = 'service_role');

-- 3. Buat Policy untuk login_attempts (Hanya bisa diakses oleh service role)
-- Digunakan untuk logging dan brute-force protection di sisi server.
CREATE POLICY "Login attempts only accessible by service role" 
ON login_attempts 
FOR ALL 
USING (auth.role() = 'service_role');

-- 4. Buat Policy untuk admin_sessions
CREATE POLICY "Admin sessions only accessible by service role" 
ON admin_sessions 
FOR ALL 
USING (auth.role() = 'service_role');

-- 💡 Catatan: 
-- Pastikan API backend menggunakan service_role key saat melakukan 
-- pengecekan password atau logging ke tabel-tabel di atas.
