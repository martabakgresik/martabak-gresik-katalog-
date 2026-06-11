import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Save, AlertCircle, CheckCircle2, Lock, ArrowLeft, Settings, Pizza, EggFried } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'umum' | 'sweet' | 'savory'>('umum');

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-yellow/10 dark:bg-brand-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-yellow/20 to-white dark:from-brand-black dark:to-zinc-900 pt-20 pb-24 px-4 md:px-8 text-brand-black dark:text-brand-yellow font-sans selection:bg-brand-orange selection:text-white">
      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <button onClick={() => navigate('/')} className="p-3 bg-white dark:bg-white/10 rounded-full hover:bg-brand-orange hover:text-white transition-all shadow-md hover:shadow-xl hover:-translate-x-1">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight">Admin <span className="text-brand-orange">Panel</span></h1>
            </div>
            <p className="text-lg opacity-60 md:ml-16 font-medium">Kelola pengaturan dan harga menu dengan mudah.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white/60 dark:bg-black/40 backdrop-blur-md p-2 pl-4 rounded-full border border-white/50 dark:border-white/10 shadow-sm">
            <Lock className="w-4 h-4 opacity-50" />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent border-none focus:outline-none font-bold placeholder:font-normal w-32 md:w-48"
              placeholder="Admin Password"
            />
          </div>
        </div>

        {/* Notifications */}
        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-2xl mb-8 flex items-center gap-3 font-bold shadow-lg backdrop-blur-md border ${message.type === 'success' ? 'bg-green-100/90 text-green-800 border-green-500/30' : 'bg-red-100/90 text-red-800 border-red-500/30'}`}
            >
              {message.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-3 pb-2 mb-6 scrollbar-hide">
          <button 
            onClick={() => setActiveTab('umum')}
            className={`px-6 py-3.5 rounded-2xl font-bold uppercase transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'umum' ? 'bg-brand-black dark:bg-white text-brand-yellow dark:text-brand-black shadow-xl scale-100' : 'bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-brand-black dark:text-white/70'}`}
          >
            <Settings className="w-5 h-5" /> Pengaturan Umum
          </button>
          <button 
            onClick={() => setActiveTab('sweet')}
            className={`px-6 py-3.5 rounded-2xl font-bold uppercase transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'sweet' ? 'bg-brand-black dark:bg-white text-brand-yellow dark:text-brand-black shadow-xl scale-100' : 'bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-brand-black dark:text-white/70'}`}
          >
            <Pizza className="w-5 h-5" /> Terang Bulan
          </button>
          <button 
            onClick={() => setActiveTab('savory')}
            className={`px-6 py-3.5 rounded-2xl font-bold uppercase transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'savory' ? 'bg-brand-black dark:bg-white text-brand-yellow dark:text-brand-black shadow-xl scale-100' : 'bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-brand-black dark:text-white/70'}`}
          >
            <EggFried className="w-5 h-5" /> Martabak Telor
          </button>
        </div>

        {/* Tab Content Area (Glassmorphism) */}
        <div className="backdrop-blur-2xl bg-white/70 dark:bg-black/60 rounded-[2rem] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 dark:border-white/10 relative overflow-hidden min-h-[500px]">
          
          {/* Ambient blobs */}
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-orange/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-brand-yellow/20 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10">
            {activeTab === 'umum' && (
              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
                <h2 className="text-2xl font-black uppercase mb-8 flex items-center gap-3">
                  <span className="w-2 h-8 bg-brand-orange rounded-full"></span>
                  Status & Promo
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                  {/* Emergency Toggle */}
                  <label className="flex items-center justify-between cursor-pointer p-6 bg-white/50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-brand-orange/30 transition-all shadow-sm group">
                    <div>
                      <span className="font-bold uppercase block mb-1">Tutup Darurat Toko</span>
                      <span className="text-xs opacity-60">Aktifkan untuk menutup toko di luar jadwal.</span>
                    </div>
                    <div className={`w-14 h-8 rounded-full p-1 transition-colors ${config.storeSettings.isEmergencyClosed ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                      <div className={`w-6 h-6 bg-white rounded-full transition-transform ${config.storeSettings.isEmergencyClosed ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                    {/* Hidden input to drive state */}
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={config.storeSettings.isEmergencyClosed || false}
                      onChange={(e) => updateStoreSetting('isEmergencyClosed', e.target.checked)}
                    />
                  </label>

                  {/* Promo Code */}
                  <div className="p-6 bg-white/50 dark:bg-white/5 rounded-2xl shadow-sm border border-transparent hover:border-brand-orange/30 transition-all">
                    <label className="block text-sm font-bold mb-3 uppercase opacity-70">Kode Promo Aktif</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={config.storeSettings.activePromoCode || ''}
                        onChange={(e) => updateStoreSetting('activePromoCode', e.target.value)}
                        className="flex-grow bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl p-4 font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
                        placeholder="Misal: MANIS2026"
                      />
                      <button onClick={handleSave} disabled={saving || !password} className="p-4 bg-brand-orange text-white rounded-xl hover:scale-105 transition-all disabled:opacity-50"><Save className="w-5 h-5" /></button>
                    </div>
                  </div>

                  {/* Promo Percent */}
                  <div className="p-6 bg-white/50 dark:bg-white/5 rounded-2xl shadow-sm border border-transparent hover:border-brand-orange/30 transition-all">
                    <label className="block text-sm font-bold mb-3 uppercase opacity-70">Diskon (%)</label>
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <input 
                          type="number" 
                          value={config.storeSettings.activePromoPercent === '' ? '' : (config.storeSettings.activePromoPercent || 0)}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => updateStoreSetting('activePromoPercent', e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl p-4 font-bold text-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all pr-12"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold opacity-50 text-xl">%</span>
                      </div>
                      <button onClick={handleSave} disabled={saving || !password} className="p-4 bg-brand-orange text-white rounded-xl hover:scale-105 transition-all disabled:opacity-50"><Save className="w-5 h-5" /></button>
                    </div>
                  </div>
                  
                  {/* Shipping Rate */}
                  <div className="p-6 bg-white/50 dark:bg-white/5 rounded-2xl shadow-sm border border-transparent hover:border-brand-orange/30 transition-all">
                    <label className="block text-sm font-bold mb-3 uppercase opacity-70">Tarif Ongkir / KM</label>
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold opacity-50 text-xl">Rp</span>
                        <input 
                          type="number" 
                          value={config.storeSettings.shippingRate === '' ? '' : (config.storeSettings.shippingRate || 0)}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => updateStoreSetting('shippingRate', e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl p-4 pl-14 font-bold text-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
                        />
                      </div>
                      <button onClick={handleSave} disabled={saving || !password} className="p-4 bg-brand-orange text-white rounded-xl hover:scale-105 transition-all disabled:opacity-50"><Save className="w-5 h-5" /></button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'sweet' && (
              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black uppercase flex items-center gap-3">
                    <span className="w-2 h-8 bg-brand-orange rounded-full"></span>
                    Harga Terang Bulan
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                  {config.menuSweet.map((cat: any, catIdx: number) => (
                    <div key={catIdx} className="bg-white/40 dark:bg-white/5 p-6 rounded-3xl border border-white/60 dark:border-white/5">
                      <h4 className="font-bold text-xl mb-5 opacity-90">{cat.category}</h4>
                      <div className="space-y-3">
                        {cat.items.map((item: any, itemIdx: number) => (
                          <div key={itemIdx} className="flex justify-between items-center gap-4 p-4 bg-white/60 dark:bg-black/40 rounded-2xl border border-transparent hover:border-brand-orange/30 transition-all shadow-sm group">
                            <div className="flex-1 font-bold text-sm leading-tight">{item.name}</div>
                            <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 rounded-xl p-1 pr-1">
                              <span className="text-xs font-bold opacity-50 pl-2">Rp</span>
                              <input
                                type="number"
                                value={item.price || ''}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                  const newMenu = [...config.menuSweet];
                                  newMenu[catIdx].items[itemIdx].price = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                                  setConfig({ ...config, menuSweet: newMenu });
                                }}
                                className="w-24 bg-white dark:bg-black/80 border-none rounded-lg p-2 font-bold focus:ring-2 focus:ring-brand-orange/50 outline-none text-right transition-all"
                              />
                              <button onClick={handleSave} disabled={saving || !password} className="p-2 bg-brand-orange text-white rounded-lg hover:scale-105 transition-all disabled:opacity-50" title="Simpan"><Save className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'savory' && (
              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black uppercase flex items-center gap-3">
                    <span className="w-2 h-8 bg-brand-orange rounded-full"></span>
                    Harga Martabak Telor
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                  {config.menuSavory.map((cat: any, catIdx: number) => (
                    <div key={catIdx} className="bg-white/40 dark:bg-white/5 p-6 rounded-3xl border border-white/60 dark:border-white/5">
                      <h4 className="font-bold text-xl mb-6 opacity-90">{cat.title}</h4>
                      <div className="space-y-8">
                        {cat.variants.map((variant: any, varIdx: number) => (
                          <div key={varIdx}>
                            <h5 className="font-bold text-sm mb-3 opacity-60 uppercase tracking-wider flex items-center gap-2">
                              <span className="w-4 h-[2px] bg-brand-orange/50"></span>
                              {variant.type}
                            </h5>
                            <div className="space-y-3">
                              {variant.prices.map((p: any, priceIdx: number) => (
                                <div key={priceIdx} className="flex justify-between items-center gap-4 p-4 bg-white/60 dark:bg-black/40 rounded-2xl border border-transparent hover:border-brand-orange/30 transition-all shadow-sm">
                                  <div className="flex-1 font-bold text-sm">{p.qty} Telor</div>
                                  <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 rounded-xl p-1 pr-1">
                                    <span className="text-xs font-bold opacity-50 pl-2">Rp</span>
                                    <input
                                      type="number"
                                      value={p.price || ''}
                                      onFocus={(e) => e.target.select()}
                                      onChange={(e) => {
                                        const newMenu = [...config.menuSavory];
                                        newMenu[catIdx].variants[varIdx].prices[priceIdx].price = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                                        setConfig({ ...config, menuSavory: newMenu });
                                      }}
                                      className="w-24 bg-white dark:bg-black/80 border-none rounded-lg p-2 font-bold focus:ring-2 focus:ring-brand-orange/50 outline-none text-right transition-all"
                                    />
                                    <button onClick={handleSave} disabled={saving || !password} className="p-2 bg-brand-orange text-white rounded-lg hover:scale-105 transition-all disabled:opacity-50" title="Simpan"><Save className="w-4 h-4" /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>



      </div>
    </div>
  );
};
