import { createClient } from '@supabase/supabase-js';

/**
 * 🗄️ Supabase Client Configuration
 * 
 * ⚠️ ENVIRONMENT VARIABLES REQUIRED (di .env.local atau Vercel Dashboard):
 *   - VITE_SUPABASE_URL: URL API dari Supabase project (https://xxx.supabase.co)
 *   - VITE_SUPABASE_ANON_KEY: Anon Public Key dari Supabase
 * 
 * 💡 SETUP GUIDE:
 *   1. Buka: https://app.supabase.com
 *   2. Pilih project Anda
 *   3. Masuk ke Settings → API
 *   4. Copy URL dan anon key ke .env.local atau environment variables
 * 
 * 📋 Untuk Vercel:
 *   - Buka: https://vercel.com/dashboard/[project]/settings/environment-variables
 *   - Tambah: VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY
 */

// Safe fallback approach - coba berbagai cara load env variable
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL ||
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  '';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  '';

/**
 * Validasi environment variables
 */
function validateSupabaseConfig() {
  const errors: string[] = [];

  if (!supabaseUrl) {
    errors.push('❌ VITE_SUPABASE_URL tidak ditemukan');
  } else if (!supabaseUrl.includes('supabase.co')) {
    errors.push('⚠️ VITE_SUPABASE_URL tidak terlihat valid (harus mengandung "supabase.co")');
  }

  if (!supabaseAnonKey) {
    errors.push('❌ VITE_SUPABASE_ANON_KEY tidak ditemukan');
  }

  return errors;
}

// Jalankan validasi dan tampilkan warnings/errors
const validationErrors = validateSupabaseConfig();
if (validationErrors.length > 0) {
  console.warn(
    '⚠️ SUPABASE CONFIGURATION WARNING:\n' + 
    validationErrors.join('\n') +
    '\n\n📚 Lihat komentar di src/lib/supabase.ts untuk setup guide'
  );
}

/**
 * Buat Supabase client
 * Akan berkomunikasi dengan Supabase tapi dengan graceful fallback jika credentials tidak valid
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

/**
 * Type-safe wrapper untuk query Supabase dengan error handling
 * 
 * @example
 * const { data, error } = await supabaseQuery(async () => {
 *   return supabase.from('table').select('*');
 * });
 */
export async function supabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  fallbackData?: T
): Promise<{ data: T | null; error: string | null }> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase credentials missing. Using fallback data.');
      return {
        data: fallbackData || null,
        error: 'Supabase credentials not configured'
      };
    }

    const { data, error } = await queryFn();

    if (error) {
      console.error('Supabase query error:', error);
      return {
        data: fallbackData || null,
        error: error.message || 'Unknown database error'
      };
    }

    return { data, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Supabase query exception:', errorMessage);
    return {
      data: fallbackData || null,
      error: errorMessage
    };
  }
}

/**
 * Health check untuk Supabase connection
 */
export async function checkSupabaseHealth(): Promise<boolean> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return false;
    }

    const { error } = await supabase.from('store_settings').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

