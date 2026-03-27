/**
 * 🔐 Admin Authentication Service
 * Menyediakan fungsi verifikasi password untuk akses dashboard
 * 
 * CLIENT-SIDE WARNING: Jangan relai hanya pada validasi client-side!
 * Ini hanya untuk UX. Verifikasi sesungguhnya harus di backend/Supabase.
 */

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
 * Verifikasi password admin
 * PENTING: Untuk production, implementasikan server-side authentication!
 */
export async function verifyAdminPassword(inputPassword: string): Promise<boolean> {
  try {
    const adminPasswordHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH;
    
    if (!adminPasswordHash) {
      console.error('VITE_ADMIN_PASSWORD_HASH tidak ditemukan di environment');
      return false;
    }

    const inputHash = await hashPassword(inputPassword);
    return inputHash === adminPasswordHash;
  } catch (error) {
    console.error('Error verifying admin password:', error);
    return false;
  }
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
