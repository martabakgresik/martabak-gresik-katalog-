/**
 * 🔐 Admin Authentication Service
 * Menyediakan fungsi verifikasi kredensial untuk akses dashboard
 */
import { supabase } from './supabase';

/**
 * Generate SHA-256 hash dari password (client-side only)
 * Digunakan untuk perbandingan dengan hash yang disimpan di .env
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifikasi kredensial admin melalui Supabase
 */
export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  try {
    const { data: settings, error } = await supabase
      .from('store_settings')
      .select('admin_username, admin_password')
      .eq('id', 'main_config')
      .single();

    if (error || !settings) {
      console.error('Gagal mengambil kredensial admin:', error);
      return false;
    }

    // Pengecekan username dan password (plain text sesuai implementasi Dashboard terbaru)
    return username === settings.admin_username && password === settings.admin_password;
  } catch (error) {
    console.error('Error verifying admin credentials:', error);
    return false;
  }
}

/**
 * Verifikasi password admin (Deprecated - gunakan verifyAdminCredentials)
 */
export async function verifyAdminPassword(inputPassword: string): Promise<boolean> {
  // Fallback ke pengecekan hash untuk kompatibilitas lama jika diperlukan
  const adminPasswordHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH;
  if (!adminPasswordHash) return false;
  const inputHash = await hashPassword(inputPassword);
  return inputHash === adminPasswordHash;
}

/**
 * Cek apakah dashboard sudah diakses di session ini
 * Gunakan sessionStorage agar session hilang ketika browser ditutup
 */
export function isDashboardAccessGranted(): boolean {
  // Cek sessionStorage (hilang ketika browser/tab ditutup)
  const sessionAccess = sessionStorage.getItem('dashboard_access_granted');
  if (sessionAccess === 'true') {
    return true;
  }
  
  return false;
}

/**
 * Set dashboard access untuk session ini
 */
export function grantDashboardAccess(): void {
  sessionStorage.setItem('dashboard_access_granted', 'true');
}

/**
 * Hapus akses dashboard
 */
export function revokeDashboardAccess(): void {
  sessionStorage.removeItem('dashboard_access_granted');
}
