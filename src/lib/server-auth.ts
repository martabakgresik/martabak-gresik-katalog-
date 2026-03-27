/**
 * 🔐 Server-side Auth Service untuk Supabase
 * Gunakan untuk komunikasi dengan backend API
 * 
 * File: src/lib/server-auth.ts
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

export interface AuthError {
  message: string;
  code?: string;
}

/**
 * Login dengan server-side authentication
 * 
 * @param username Admin username
 * @param password Admin password
 * @returns JWT token dari server
 * 
 * @example
 * try {
 *   const response = await loginWithServer('admin', 'password123');
 *   saveAuthToken(response.token);
 *   // Redirect ke dashboard
 * } catch (error) {
 *   console.error('Login failed:', error.message);
 * }
 */
export async function loginWithServer(
  username: string,
  password: string
): Promise<LoginResponse> {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const endpoint = `${apiUrl}/api/auth/login`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include', // Include cookies if httpOnly
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Auth] Login error:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Verify bahwa token masih valid
 */
export async function verifyToken(token: string): Promise<boolean> {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const endpoint = `${apiUrl}/api/auth/verify`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('[Auth] Verify failed:', error);
    return false;
  }
}

/**
 * Logout dari server
 */
export async function logoutFromServer(token?: string): Promise<void> {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const endpoint = `${apiUrl}/api/auth/logout`;
  const authToken = token || getAuthToken();

  try {
    if (!authToken) {
      console.warn('[Auth] No token to logout');
      return;
    }

    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
  } catch (error) {
    console.error('[Auth] Logout error:', error);
  }
}

/**
 * Simpan JWT token ke localStorage
 * 
 * ℹ️ CATATAN: Untuk production yang lebih aman, gunakan httpOnly cookies
 * yang di-set otomatis oleh server (tidak perlu simpan di localStorage)
 */
export function saveAuthToken(token: string): void {
  try {
    localStorage.setItem('auth_token', token);
  } catch (error) {
    console.error('[Auth] Failed to save token:', error);
  }
}

/**
 * Ambil token yang sudah disimpan
 */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem('auth_token');
  } catch (error) {
    console.error('[Auth] Failed to get token:', error);
    return null;
  }
}

/**
 * Hapus token dari localStorage
 */
export function clearAuthToken(): void {
  try {
    localStorage.removeItem('auth_token');
  } catch (error) {
    console.error('[Auth] Failed to clear token:', error);
  }
}

/**
 * Get Authorization header untuk API requests
 * 
 * @example
 * const headers = {
 *   'Content-Type': 'application/json',
 *   ...getAuthHeader(),
 * };
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

/**
 * Check apakah user sudah authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  return !!token;
}

/**
 * Logout: clear token dan redirect to login
 */
export function logout(): void {
  const token = getAuthToken();
  
  // Notify server (async, tidak perlu menunggu)
  if (token) {
    logoutFromServer(token).catch(err => 
      console.error('[Auth] Server logout failed:', err)
    );
  }

  // Clear local state
  clearAuthToken();
  
  // Redirect to home
  window.location.href = '/';
}

/**
 * Decode JWT token untuk get user info (tanpa verify)
 * 
 * ℹ️ Untuk verify yang proper, gunakan endpoint /api/auth/verify
 */
export function decodeToken(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const decoded = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    return decoded;
  } catch (error) {
    console.error('[Auth] Failed to decode token:', error);
    return null;
  }
}

/**
 * Get logged-in user info dari token yang disimpan
 */
export function getCurrentUser(): any {
  const token = getAuthToken();
  if (!token) {
    return null;
  }

  try {
    return decodeToken(token);
  } catch (error) {
    console.error('[Auth] Failed to get current user:', error);
    return null;
  }
}

/**
 * Setup auth interceptor untuk semua fetch calls
 * (Optional - gunakan jika ingin auto-attach auth header)
 */
export function setupAuthInterceptor(): void {
  const originalFetch = window.fetch;

  (window as any).fetch = function(...args: any[]) {
    const [resource, config] = args;
    const isApiCall = typeof resource === 'string' && resource.includes('/api/');

    if (isApiCall && config) {
      const headers = config.headers || {};
      const authHeader = getAuthHeader();
      config.headers = { ...headers, ...authHeader };
    }

    return originalFetch.apply(this, args);
  };
}
