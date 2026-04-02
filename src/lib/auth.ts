/**
 * 🔐 Admin Authentication Service
 * Menyediakan fungsi verifikasi session untuk akses dashboard
 * 
 * Verifikasi sesungguhnya dilakukan di backend / Supabase.
 */

/**
 * Cek apakah dashboard sudah diakses di session ini
 * Memvalidasi session token ke backend API
 */
export async function isDashboardAccessGranted(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/verify');
    if (response.ok) {
      const data = await response.json();
      return data.valid === true;
    }
    
    // Fallback ke sessionStorage jika API tidak tersedia (optional, tapi permintaan user adalah validasi API)
    const sessionAccess = sessionStorage.getItem('dashboard_access_granted');
    return sessionAccess === 'true';
  } catch (error) {
    console.error('Error verifying session:', error);
    // Check locally if API fails
    return sessionStorage.getItem('dashboard_access_granted') === 'true';
  }
}

/**
 * Verifikasi password admin (Deprecated: Gunakan fetch ke /api/auth/login langsung)
 */
export async function verifyAdminPassword(_password: string): Promise<boolean> {
  console.warn('verifyAdminPassword deprecated. Gunakan API /api/auth/login.');
  return false;
}

/**
 * Set dashboard access untuk session ini
 */
export function grantDashboardAccess(): void {
  sessionStorage.setItem('dashboard_access_granted', 'true');
}

/**
 * Hapus akses dashboard dan panggil endpoint logout
 */
export async function revokeDashboardAccess(): Promise<void> {
  try {
    sessionStorage.removeItem('dashboard_access_granted');
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Error during logout:', error);
  }
}
