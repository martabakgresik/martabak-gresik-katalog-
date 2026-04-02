import React, { useState } from 'react';
import { Lock, AlertCircle, Loader } from 'lucide-react';
import { verifyAdminPassword, grantDashboardAccess } from '../lib/auth';
import { TURNSTILE_SITE_KEY } from '../data/config';

declare global {
  interface Window {
    onloadTurnstileCallback: () => void;
    turnstile: any;
  }
}

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    // @ts-ignore
    window.onTurnstileSuccess = (token: string) => {
      setTurnstileToken(token);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password,
          turnstileToken,
        }),
      });

      if (response.ok) {
        grantDashboardAccess();
        onLoginSuccess();
      } else {
        const data = await response.json().catch(() => ({}));
        const errorMessage = data.error || (response.status >= 500 ? 'Kesalahan server. Silakan coba lagi nanti.' : 'Password tidak sesuai. Coba lagi.');
        setError(errorMessage);
        setPassword('');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi. Coba lagi nanti.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-full">
            <Lock className="w-6 h-6 text-amber-600 dark:text-amber-300" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Dashboard Admin
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Masukkan password untuk akses dashboard
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password admin"
              disabled={isLoading}
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              autoFocus
            />
          </div>

          {/* Turnstile Widget */}
          <div className="flex justify-center py-2">
            <div 
              className="cf-turnstile" 
              data-sitekey={TURNSTILE_SITE_KEY}
              data-callback="onTurnstileSuccess"
              data-theme="light"
            ></div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !password.trim() || !turnstileToken}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Verifikasi...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Masuk
              </>
            )}
          </button>
        </form>


      </div>
    </div>
  );
}
