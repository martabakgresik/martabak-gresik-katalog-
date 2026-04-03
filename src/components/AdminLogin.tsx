import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Lock, Store, Eye, EyeOff, AlertCircle, Loader, ArrowLeft } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { verifyAdminCredentials, grantDashboardAccess } from '../lib/auth';
import { TURNSTILE_SITE_KEY } from '../data/config';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBack?: () => void;
}

export function AdminLogin({ onLoginSuccess, onBack }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!turnstileToken) {
      setError('Silakan selesaikan verifikasi Turnstile.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Verify Turnstile via API
      const verifyResponse = await fetch('/api/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken })
      });

      const verifyData = await verifyResponse.json();
      
      if (!verifyData.success) {
        setError('Verifikasi Turnstile gagal. Silakan coba lagi.');
        setTurnstileToken(null);
        turnstileRef.current?.reset();
        setIsLoading(false);
        return;
      }

      // 2. Verify Credentials via Supabase (auth.ts)
      const isValid = await verifyAdminCredentials(username, password);
      
      if (isValid) {
        grantDashboardAccess();
        onLoginSuccess();
      } else {
        setError('Username atau Password salah!');
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem. Coba lagi nanti.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        className="w-full max-w-md bg-zinc-900 border-4 border-zinc-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl text-center relative overflow-hidden"
      >
        {/* Decorative background pulse */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-orange/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-orange/5 rounded-full blur-3xl" />

        {/* Header Icon */}
        <div className="w-20 h-20 bg-brand-orange/10 border-2 border-brand-orange/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 relative z-10 shadow-inner">
          <Lock className="w-10 h-10 text-brand-orange" />
        </div>

        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2 relative z-10">Owner Access</h2>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8 opacity-60">Masukkan kredensial untuk melanjutkan</p>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-left"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-[10px] sm:text-xs font-black uppercase text-red-500 leading-tight">{error}</p>
            </motion.div>
          )}

          {/* Username Field */}
          <div className="space-y-2 text-left">
            <label className="text-[9px] font-black uppercase text-zinc-500 px-2 tracking-[0.2em] italic">Username</label>
            <div className="relative group">
               <Store className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-brand-orange transition-colors" />
               <input 
                 type="text" 
                 value={username} 
                 onChange={(e) => setUsername(e.target.value)} 
                 placeholder="Ketik username admin..."
                 className="w-full bg-black/50 border-2 border-zinc-800 rounded-2xl py-4.5 pl-14 pr-6 text-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all font-bold text-sm" 
                 autoFocus 
                 required
               />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2 text-left">
            <label className="text-[9px] font-black uppercase text-zinc-500 px-2 tracking-[0.2em] italic">Password</label>
            <div className="relative group">
               <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-brand-orange transition-colors" />
               <input 
                 type={showPassword ? "text" : "password"} 
                 value={password} 
                 onChange={(e) => setPassword(e.target.value)} 
                 placeholder="••••••••••••"
                 className="w-full bg-black/50 border-2 border-zinc-800 rounded-2xl py-4.5 pl-14 pr-14 text-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all font-bold text-sm" 
                 required
               />
               <button 
                 type="button" 
                 onClick={() => setShowPassword(!showPassword)} 
                 className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
               </button>
            </div>
          </div>

          {/* Turnstile Widget */}
          <div className="flex justify-center pt-2">
            <Turnstile
              ref={turnstileRef}
              siteKey={TURNSTILE_SITE_KEY}
              onSuccess={(token) => setTurnstileToken(token)}
              options={{ 
                theme: 'dark',
                size: 'normal'
              }}
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-brand-orange text-white py-4.5 rounded-2xl font-black uppercase italic text-sm tracking-widest hover:scale-[1.02] active:scale-98 transition-all shadow-xl shadow-brand-orange/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Validasi...
              </>
            ) : (
              'Masuk Sekarang'
            )}
          </button>
        </form>

        {onBack && (
          <button 
            onClick={onBack} 
            className="mt-10 text-zinc-600 hover:text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 mx-auto transition-colors group"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> 
            Kembali ke Katalog
          </button>
        )}
      </motion.div>
    </div>
  );
}
