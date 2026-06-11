import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Save, AlertCircle, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!password) {
      setMessage({ type: 'error', text: 'Password diperlukan untuk menyimpan.' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword: password,
          configData: config
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setMessage({ type: 'success', text: 'Konfigurasi berhasil disimpan!' });
        setIsAuthenticated(true);
      } else {
        setMessage({ type: 'error', text: result.error || 'Gagal menyimpan. Password salah?' });
        setIsAuthenticated(false);
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 5000);
  };

  const updateStoreSetting = (key: string, value: any) => {
    setConfig((prev: any) => ({
      ...prev,
      storeSettings: {
        ...prev.storeSettings,
        [key]: value
      }
    }));
  };

  if (loading || !config) {
    return <div className="min-h-screen flex items-center justify-center text-brand-black dark:text-brand-yellow">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-brand-yellow/30 dark:bg-brand-black pt-20 pb-12 px-4 md:px-8 text-brand-black dark:text-brand-yellow">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/')} className="p-2 bg-white dark:bg-white/10 rounded-full hover:bg-brand-orange hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl md:text-4xl font-display font-black uppercase">Admin Dashboard</h1>
        </div>

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl mb-6 flex items-center gap-3 font-bold ${message.type === 'success' ? 'bg-green-100 text-green-800 border-2 border-green-500' : 'bg-red-100 text-red-800 border-2 border-red-500'}`}
          >
            {message.type === 'success' ? <CheckCircle2 /> : <AlertCircle />}
            {message.text}
          </motion.div>
        )}

        <div className="bg-white dark:bg-white/5 rounded-3xl p-6 md:p-8 shadow-xl border-4 border-brand-black dark:border-brand-yellow/20 mb-8">
          <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
            <Lock className="w-6 h-6 text-brand-orange" />
            Autentikasi
          </h2>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow w-full">
              <label className="block text-sm font-bold mb-2 uppercase opacity-70">Admin Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-yellow/10 dark:bg-black/50 border-2 border-brand-black/20 dark:border-brand-yellow/20 rounded-xl p-3 focus:outline-none focus:border-brand-orange"
                placeholder="Masukkan password admin..."
              />
            </div>
            {!isAuthenticated && (
              <p className="text-xs opacity-60 max-w-xs pb-3">Password diperlukan setiap kali akan menyimpan perubahan ke Cloudflare KV.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* General Settings */}
          <div className="bg-white dark:bg-white/5 rounded-3xl p-6 md:p-8 shadow-xl border-4 border-brand-black dark:border-brand-yellow/20">
            <h2 className="text-2xl font-black uppercase mb-6">Status & Promo</h2>
            
            <div className="space-y-6">
              <label className="flex items-center justify-between cursor-pointer p-4 border-2 border-brand-black/10 dark:border-white/10 rounded-xl hover:border-brand-orange transition-colors">
                <span className="font-bold uppercase">Tutup Darurat Toko</span>
                <input 
                  type="checkbox" 
                  checked={config.storeSettings.isEmergencyClosed || false}
                  onChange={(e) => updateStoreSetting('isEmergencyClosed', e.target.checked)}
                  className="w-6 h-6 accent-brand-orange"
                />
              </label>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase opacity-70">Kode Promo Aktif</label>
                <input 
                  type="text" 
                  value={config.storeSettings.activePromoCode || ''}
                  onChange={(e) => updateStoreSetting('activePromoCode', e.target.value)}
                  className="w-full bg-brand-yellow/10 dark:bg-black/50 border-2 border-brand-black/20 dark:border-brand-yellow/20 rounded-xl p-3 focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase opacity-70">Diskon (%)</label>
                <input 
                  type="number" 
                  value={config.storeSettings.activePromoPercent || 0}
                  onChange={(e) => updateStoreSetting('activePromoPercent', Number(e.target.value))}
                  className="w-full bg-brand-yellow/10 dark:bg-black/50 border-2 border-brand-black/20 dark:border-brand-yellow/20 rounded-xl p-3 focus:outline-none focus:border-brand-orange"
                />
              </div>
            </div>
          </div>

          {/* Configuration JSON */}
          <div className="bg-white dark:bg-white/5 rounded-3xl p-6 md:p-8 shadow-xl border-4 border-brand-black dark:border-brand-yellow/20 flex flex-col">
            <h2 className="text-2xl font-black uppercase mb-6">Menu & Harga (JSON)</h2>
            <p className="text-sm opacity-70 mb-4">Edit struktur JSON menu untuk mengubah harga produk atau nama produk.</p>
            <textarea
              className="w-full flex-grow min-h-[300px] bg-brand-black text-brand-yellow p-4 rounded-xl font-mono text-sm border-2 border-transparent focus:border-brand-orange focus:outline-none"
              value={JSON.stringify({ menuSweet: config.menuSweet, menuSavory: config.menuSavory }, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  if (parsed.menuSweet) setConfig((prev: any) => ({ ...prev, menuSweet: parsed.menuSweet }));
                  if (parsed.menuSavory) setConfig((prev: any) => ({ ...prev, menuSavory: parsed.menuSavory }));
                } catch(err) {
                  // Ignore invalid JSON while typing
                }
              }}
            />
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-brand-orange text-white font-black uppercase text-xl rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : (
            <>
              <Save className="w-6 h-6" />
              Simpan Perubahan
            </>
          )}
        </button>
      </div>
    </div>
  );
};
