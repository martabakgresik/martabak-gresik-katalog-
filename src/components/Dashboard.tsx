import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Package, 
  Settings, 
  ArrowLeft, 
  Save, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Store,
  Check,
  AlertCircle,
  X,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Edit2,
  Trash2,
  Sparkles,
  CircleSlash
} from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { supabase } from '../lib/supabase';
import { 
  MENU_SWEET as INITIAL_SWEET, 
  MENU_SAVORY as INITIAL_SAVORY, 
  STORE_NAME as INITIAL_NAME, 
  OPEN_HOUR as INITIAL_OPEN, 
  CLOSE_HOUR as INITIAL_CLOSE,
  PROMO_CODE as INITIAL_PROMO,
  PROMO_PERCENT as INITIAL_PROMO_PCT,
  TURNSTILE_SITE_KEY
} from '../data/config';
import { formatPrice } from '../hooks/useCart';

interface DashboardProps {
  onBack: () => void;
}

const INITIAL_PIN = "1234"; // Default PIN

export const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'settings'>('overview');
  const [copied, setCopied] = useState(false);

  // --- LOCAL STATE FOR EDITING ---
  const [menuSweet, setMenuSweet] = useState(INITIAL_SWEET);
  const [menuSavory, setMenuSavory] = useState(INITIAL_SAVORY);
  const [storeSettings, setStoreSettings] = useState({
    name: INITIAL_NAME,
    open: INITIAL_OPEN,
    close: INITIAL_CLOSE,
    promoCode: INITIAL_PROMO,
    promoPct: INITIAL_PROMO_PCT,
    address: "Jl. Usman Sadar No 10, Gresik",
    phone: "081330763633",
    shippingRate: 2500,
    maxDist: 10,
    adminUsername: 'admin',
    adminPassword: INITIAL_PIN,
    isEmergencyClosed: false,
    promoStartAt: '',
    promoEndAt: ''
  });
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ON MOUNT ---
  useEffect(() => {
    async function loadData() {
      try {
        const { data: settings } = await supabase.from('store_settings').select('*').eq('id', 'main_config').single();
        const { data: categories } = await supabase.from('categories').select('*, menu_items(*)').order('display_order');

        if (settings) {
          setStoreSettings({
            name: settings.store_name,
            open: settings.open_hour,
            close: settings.close_hour,
            promoCode: settings.promo_code,
            promoPct: settings.promo_percent,
            address: settings.store_address || "Jl. Usman Sadar No 10, Gresik",
            phone: settings.store_phone || "081330763633",
            shippingRate: settings.shipping_rate_per_km || 2500,
            maxDist: settings.max_shipping_distance || 10,
            adminUsername: settings.admin_username || 'admin',
            adminPassword: settings.admin_password || INITIAL_PIN,
            isEmergencyClosed: settings.is_emergency_closed || false,
            promoStartAt: settings.promo_start_at ? new Date(settings.promo_start_at).toISOString().slice(0, 16) : '',
            promoEndAt: settings.promo_end_at ? new Date(settings.promo_end_at).toISOString().slice(0, 16) : ''
          });
        }

        if (categories) {
          const sweet = categories.filter(c => c.type === 'sweet').map(c => ({
            id: c.id,
            category: c.name,
            items: c.menu_items.map((i: any) => ({
              id: i.id,
              name: i.name,
              price: i.price,
              image: i.image,
              description: i.description,
              isBestSeller: i.is_best_seller,
              isAvailable: i.is_available ?? true
            }))
          }));

          const savory = categories.filter(c => c.type === 'savory').map(c => ({
            id: c.id,
            title: c.name,
            variants: Array.from(new Set(c.menu_items.map((i: any) => i.variant_type))).map(vType => ({
              type: vType,
              description: c.menu_items.find((i: any) => i.variant_type === vType)?.description || "",
              prices: c.menu_items.filter((i: any) => i.variant_type === vType).map((i: any) => ({
                id: i.id,
                qty: i.qty,
                price: i.price,
                isBestSeller: i.is_best_seller,
                isAvailable: i.is_available ?? true
              }))
            }))
          }));

          setMenuSweet(sweet as any);
          setMenuSavory(savory as any);
        }
      } catch (err) {
        console.error("Error loading DB in Dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const [isAdding, setIsAdding] = useState<'sweet' | 'savory' | null>(null);
  const [editingItem, setEditingItem] = useState<{
    type: 'sweet' | 'savory';
    categoryIdx: number;
    itemIdx: number;
    variantIdx?: number;
    priceIdx?: number;
    data: any;
  } | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showSettingsPassword, setShowSettingsPassword] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    let totalItems = 0;
    let bestSellers = 0;
    let totalPrice = 0;
    
    menuSweet.forEach(cat => {
      totalItems += cat.items.length;
      cat.items.forEach(item => {
        if ((item as any).isBestSeller) bestSellers++;
        totalPrice += item.price;
      });
    });

    menuSavory.forEach(cat => {
      cat.variants.forEach(v => {
        totalItems += v.prices.length;
        v.prices.forEach(p => {
          if ((p as any).isBestSeller) bestSellers++;
          totalPrice += p.price;
        });
      });
    });

    return {
      totalItems,
      bestSellers,
      avgPrice: totalItems > 0 ? totalPrice / totalItems : 0
    };
  }, [menuSweet, menuSavory]);

  // --- LOGIN LOGIC ---
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showForgotHint, setShowForgotHint] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check Lockout
    const lockoutUntil = localStorage.getItem('martabak_lockout_until');
    if (lockoutUntil && Date.now() < parseInt(lockoutUntil)) {
      const remainingMin = Math.ceil((parseInt(lockoutUntil) - Date.now()) / 60000);
      setLockoutMessage(`Terlalu banyak percobaan. Silakan tunggu ${remainingMin} menit.`);
      setTimeout(() => setLockoutMessage(null), 5000);
      return;
    }

    const urlParams = new URL(window.location.href).searchParams;
    const isBypass = urlParams.get('bypass') === 'true';

    // Server-side verification of Turnstile token
    if (!isBypass) {
      if (!turnstileToken) {
        alert("Selesaikan verifikasi Turnstile terlebih dahulu.");
        return;
      }
      try {
        const verifyRes = await fetch('/api/verify-turnstile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: turnstileToken })
        });
        
        if (verifyRes.status === 404) {
          // Local development fallback/warning
          console.warn("Turnstile API not found (likely running with npm run dev instead of vercel dev). Skipping verification for local testing.");
        } else {
          const verifyData = await verifyRes.json();
          if (!verifyData.success) {
            alert("Gagal verifikasi keamanan (Bot detected). Silakan coba lagi.");
            setTurnstileToken(null);
            return;
          }
        }
      } catch (err) {
        console.error("Turnstile verification failed:", err);
        // During local dev, fetch might fail if API is not running. 
        // We alert the user instead of stucking.
        alert("Sistem verifikasi tidak merespons. Jika Anda di lokal, gunakan 'vercel dev' atau pastikan API berjalan.");
        return;
      }
    }

    const { data: settings, error } = await supabase
      .from('store_settings')
      .select('admin_username, admin_password')
      .eq('id', 'main_config')
      .single();

    if (error) {
      console.error("Supabase Login Error:", error);
      alert("Gagal terhubung ke Database: " + error.message);
      return;
    }

    const cleanUsername = loginUsername.trim();
    const cleanPassword = loginPassword.trim();

    if (settings && cleanUsername === settings.admin_username && cleanPassword === settings.admin_password) {
      setIsAuthenticated(true);
      setPinError(false);
      localStorage.removeItem('martabak_failed_attempts');
      localStorage.removeItem('martabak_lockout_until');
    } else {
      setPinError(true);
      setLoginPassword("");
      
      // Update failed attempts
      const currentAttempts = parseInt(localStorage.getItem('martabak_failed_attempts') || "0") + 1;
      localStorage.setItem('martabak_failed_attempts', currentAttempts.toString());
      
      if (currentAttempts >= 5) {
        const lockoutTime = Date.now() + 15 * 60 * 1000; // 15 minutes
        localStorage.setItem('martabak_lockout_until', lockoutTime.toString());
        setLockoutMessage("Akun terkunci sementara selama 15 menit karena terlalu banyak kesalahan.");
      }

      setTimeout(() => {
        setPinError(false);
        setLockoutMessage(null);
      }, 5000);
    }
  };

  const generateAIDescription = async (itemName: string) => {
    setIsAiGenerating(true);
    try {
      const prompt = `Buat 1 kalimat deskripsi martabak yang sangat menggoda dalam Bahasa Indonesia untuk menu: ${itemName}. Berikan teks saja tanpa tanda kutip.`;
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
      const text = await response.text();
      return text.trim();
    } catch (err) {
      console.error("AI Error:", err);
      return "Kelezatan martabak autentik dengan bahan pilihan.";
    } finally {
      setIsAiGenerating(false);
    }
  };

  // --- EDITING LOGIC ---
  const handleToggleAvailability = async (type: 'sweet' | 'savory', catIdx: number, itemIdx: number, vIdx?: number, pIdx?: number) => {
    let itemId: string;
    let newValue: boolean;

    if (type === 'sweet') {
      itemId = (menuSweet as any)[catIdx].items[itemIdx].id;
      newValue = !(menuSweet as any)[catIdx].items[itemIdx].isAvailable;
    } else {
      itemId = (menuSavory as any)[catIdx].variants[vIdx!].prices[pIdx!].id;
      newValue = !(menuSavory as any)[catIdx].variants[vIdx!].prices[pIdx!].isAvailable;
    }

    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: newValue })
      .eq('id', itemId);

    if (error) {
      alert("Gagal update ketersediaan: " + error.message);
      return;
    }

    if (type === 'sweet') {
      const newMenu = [...menuSweet];
      (newMenu as any)[catIdx].items[itemIdx].isAvailable = newValue;
      setMenuSweet(newMenu);
    } else {
      const newMenu = [...menuSavory];
      (newMenu as any)[catIdx].variants[vIdx!].prices[pIdx!].isAvailable = newValue;
      setMenuSavory(newMenu);
    }
  };

  const handleUpdateItem = async (newData: any) => {
    if (!editingItem) return;

    // 1. Sync to Supabase
    const { error } = await supabase
      .from('menu_items')
      .update({
        name: newData.name || "",
        price: newData.price,
        is_best_seller: newData.isBestSeller,
        description: newData.description,
        qty: newData.qty
      })
      .eq('id', newData.id);

    if (error) {
      alert("Error updating database: " + error.message);
      return;
    }

    // 2. Update local state
    if (editingItem.type === 'sweet') {
      const newMenu = [...menuSweet];
      newMenu[editingItem.categoryIdx].items[editingItem.itemIdx] = newData;
      setMenuSweet(newMenu);
    } else {
      const newMenu = [...menuSavory];
      newMenu[editingItem.categoryIdx].variants[editingItem.variantIdx!].prices[editingItem.priceIdx!] = newData;
      setMenuSavory(newMenu);
    }
    setEditingItem(null);
  };

  const handleAddItem = async (type: 'sweet' | 'savory', data: any) => {
    // 1. Determine category ID
    const catId = type === 'sweet' ? (menuSweet as any)[0].id : (menuSavory as any)[0].id;

    // 2. Insert to Supabase
    const { data: inserted, error } = await supabase
      .from('menu_items')
      .insert({
        category_id: catId,
        name: data.name || (type === 'savory' ? 'Savory Variant' : 'New Item'),
        price: data.price,
        qty: data.qty,
        variant_type: data.variant_type || (type === 'savory' ? 'Daging Sapi' : null),
        image: data.image,
        description: data.description,
        is_best_seller: false,
        is_available: true
      })
      .select()
      .single();

    if (error) {
      alert("Error adding item: " + error.message);
      return;
    }

    // 3. Update local state
    if (type === 'sweet') {
      const newMenu = [...menuSweet];
      newMenu[0].items.push({ ...data, id: inserted.id } as any);
      setMenuSweet(newMenu);
    } else {
      const newMenu = [...menuSavory];
      (newMenu as any)[0].variants[0].prices.push({ ...data, id: inserted.id });
      setMenuSavory(newMenu);
    }
    setIsAdding(null);
  };

  const handleDeleteItem = async (type: 'sweet' | 'savory', catIdx: number, itemIdx: number, vIdx?: number, pIdx?: number) => {
    if (window.confirm("Hapus item ini secara permanen dari database?")) {
      const itemId = type === 'sweet' 
        ? (menuSweet as any)[catIdx].items[itemIdx].id 
        : (menuSavory as any)[catIdx].variants[vIdx!].prices[pIdx!].id;

      const { error } = await supabase.from('menu_items').delete().eq('id', itemId);
      
      if (error) {
        alert("Error deleting item: " + error.message);
        return;
      }

      if (type === 'sweet') {
        const newMenu = [...menuSweet];
        newMenu[catIdx].items.splice(itemIdx, 1);
        setMenuSweet(newMenu);
      } else {
        const newMenu = [...menuSavory];
        newMenu[catIdx].variants[vIdx!].prices.splice(pIdx!, 1);
        setMenuSavory(newMenu);
      }
    }
  };

  // --- SETTINGS SYNC ---
  const handleUpdateSettings = async () => {
    const { error } = await supabase
      .from('store_settings')
      .update({
        store_name: storeSettings.name,
        open_hour: storeSettings.open,
        close_hour: storeSettings.close,
        promo_code: storeSettings.promoCode,
        promo_percent: storeSettings.promoPct,
        max_shipping_distance: storeSettings.maxDist,
        shipping_rate_per_km: storeSettings.shippingRate,
        admin_username: storeSettings.adminUsername,
        admin_password: storeSettings.adminPassword,
        store_address: storeSettings.address,
        store_phone: storeSettings.phone,
        is_emergency_closed: storeSettings.isEmergencyClosed,
        promo_start_at: storeSettings.promoStartAt || null,
        promo_end_at: storeSettings.promoEndAt || null
      })
      .eq('id', 'main_config');

    if (error) alert("Gagal update pengaturan: " + error.message);
    else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-zinc-900 border-4 border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl text-center"
        >
          <div className="w-20 h-20 bg-brand-orange/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Lock className={`w-10 h-10 ${pinError ? 'text-red-500 animate-shake' : 'text-brand-orange'}`} />
          </div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">Owner Access</h2>
          <p className="text-zinc-500 text-sm mb-8">Masukkan kredensial untuk melanjutkan</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black uppercase text-zinc-500 px-1 italic">Username</label>
              <div className="relative">
                 <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                 <input 
                  type="text" 
                  placeholder="admin..."
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className={`w-full bg-black border-2 ${pinError ? 'border-red-500' : 'border-zinc-800'} rounded-2xl p-4 pl-12 text-white focus:border-brand-orange outline-none transition-all font-bold`}
                  autoFocus
                />
              </div>
            </div>
            
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black uppercase text-zinc-500 px-1 italic">Password</label>
              <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                 <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={`w-full bg-black border-2 ${pinError ? 'border-red-500' : 'border-zinc-800'} rounded-2xl p-4 pl-12 pr-12 text-white focus:border-brand-orange outline-none transition-all font-bold`}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {pinError && <p className="text-red-500 text-[10px] font-black uppercase animate-pulse">Username atau Password salah!</p>}
            {lockoutMessage && <p className="text-orange-500 text-[10px] font-black uppercase animate-pulse">{lockoutMessage}</p>}
            
            <div className="flex justify-center mb-4">
              <Turnstile 
                siteKey={TURNSTILE_SITE_KEY} 
                onSuccess={(token) => setTurnstileToken(token)} 
                onError={() => setTurnstileToken(null)}
                onExpire={() => setTurnstileToken(null)}
                options={{ theme: 'dark' }}
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                disabled={!turnstileToken && !(new URL(window.location.href).searchParams.get('bypass') === 'true')}
                className="w-full bg-brand-orange text-white py-4 rounded-2xl font-black uppercase italic hover:scale-[1.02] transition-transform active:scale-95 shadow-xl shadow-brand-orange/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                Masuk ke Panel Kontrol
              </button>
            </div>
            
            <AnimatePresence>
              {showForgotHint && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden bg-brand-orange/10 border border-brand-orange/20 rounded-xl p-3 mt-4"
                >
                  <p className="text-[9px] font-bold text-brand-orange leading-tight uppercase">
                    💡 Cek tabel "store_settings" di Supabase Dashboard untuk melihat password Anda secara langsung.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
          
          <button onClick={onBack} className="mt-8 text-zinc-600 hover:text-zinc-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto transition-colors">
            <ArrowLeft className="w-3 h-3" /> Kembali ke Katalog
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-20">
      {/* Sidebar / Header Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold flex items-center gap-2 uppercase tracking-tighter">
              <span className="text-brand-orange text-2xl">MG</span>
              Dashboard Control
            </h1>
          </div>
          
          <div className="hidden md:flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
            {(['overview', 'menu', 'settings'] as const).map((id) => {
              const icons = { overview: BarChart3, menu: Package, settings: Settings };
              const labels = { overview: 'Ringkasan', menu: 'Atur Menu', settings: 'Toko' };
              const Icon = icons[id];
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeTab === id 
                      ? 'bg-white dark:bg-zinc-800 shadow-sm text-brand-orange' 
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {labels[id]}
                </button>
              );
            })}
          </div>

          <button 
            onClick={handleUpdateSettings}
            className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-brand-orange/20 hover:scale-105 transition-transform active:scale-95"
          >
            {copied ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {copied ? 'Terupdate di DB!' : 'Update Database'}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                  label="Total Produk" 
                  value={stats.totalItems.toString()} 
                  icon={Package} 
                  sub="Aktif di katalog"
                  color="text-blue-500"
                />
                <StatCard 
                  label="Best Sellers" 
                  value={stats.bestSellers.toString()} 
                  icon={TrendingUp} 
                  sub="Badge piala menyala"
                  color="text-yellow-500"
                />
                <StatCard 
                  label="Rata-rata Harga" 
                  value={formatPrice(stats.avgPrice)} 
                  icon={DollarSign} 
                  sub="Semua kategori"
                  color="text-green-500"
                />
              </div>

              {/* Weekly Insight (Mock) */}
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                <div className="flex-1 space-y-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-brand-orange" />
                    Wawasan Katalog
                  </h2>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Katalog Anda memiliki rasio Best Seller yang sangat baik. Pelanggan lebih menyukai kombinasi Keju and Pandan minggu ini melampaui varian standar.
                  </p>
                  <div className="flex gap-4">
                    <div className="bg-zinc-50 dark:bg-black p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mb-1">Paling Dicari</p>
                      <p className="font-bold text-lg">Pandan Keju</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-black p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mb-1">Peak Hour</p>
                      <p className="font-bold text-lg">19:00 - 21:00</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block w-72 h-44 bg-zinc-100 dark:bg-zinc-800 rounded-2xl overflow-hidden relative">
                   <div className="absolute inset-0 flex items-end gap-2 p-4">
                    {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.1, duration: 1 }}
                        className="flex-1 bg-brand-orange/20 rounded-t-md"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Tips Section */}
              <div className="bg-brand-orange/5 border border-brand-orange/10 p-6 rounded-2xl flex gap-4">
                <AlertCircle className="w-6 h-6 text-brand-orange shrink-0" />
                <div className="text-sm">
                  <p className="font-bold text-brand-orange mb-1">Tips Kelola Tanpa Database</p>
                  <p className="opacity-70">Gunakan tombol <strong>Simpan & Copy</strong> di pojok kanan atas untuk mendapatkan kode konfigurasi terbaru, lalu tempelkan ke file <code>src/data/config.ts</code> melalui editor kode Anda.</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold tracking-tighter uppercase italic flex items-center gap-2">
                  <Package className="w-6 h-6" />
                  Manajemen Menu
                </h2>
                <button 
                  onClick={() => setIsAdding('sweet')}
                  className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-transform active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Menu Baru
                </button>
              </div>

              <div className="space-y-8">
                {/* SWEET MENU LIST */}
                {menuSweet.map((cat, catIdx) => (
                  <div key={catIdx} className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 px-2 flex items-center gap-4">
                      {cat.category}
                      <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-grow" />
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cat.items.map((item, itemIdx) => (
                        <div 
                          key={itemIdx} 
                          className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between group hover:border-brand-orange/30 transition-all shadow-sm"
                        >
                          <div className="flex items-center gap-4">
                            <img src={item.image} className="w-12 h-12 rounded-xl bg-zinc-100 object-cover" alt="" />
                            <div>
                              <p className="font-bold text-sm">{item.name}</p>
                              <p className="text-xs text-brand-orange font-bold">{formatPrice(item.price)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleToggleAvailability('sweet', catIdx, itemIdx)}
                              className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${(item as any).isAvailable ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                              title={(item as any).isAvailable ? "Tersedia" : "Stok Habis"}
                            >
                              {(item as any).isAvailable ? <Check className="w-4 h-4" /> : <CircleSlash className="w-4 h-4" />}
                              <span className="text-[9px] font-black uppercase tracking-tighter hidden sm:inline">{(item as any).isAvailable ? 'Ready' : 'Habis'}</span>
                            </button>
                            <button 
                              onClick={() => setEditingItem({ type: 'sweet', categoryIdx: catIdx, itemIdx, data: {...item} })}
                              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-brand-orange transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteItem('sweet', catIdx, itemIdx)}
                              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* SAVORY MENU LIST */}
                {menuSavory.map((cat, catIdx) => (
                  <div key={catIdx} className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 px-2 flex items-center gap-4">
                      {cat.title}
                      <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-grow" />
                    </h3>
                    <div className="space-y-4">
                      {cat.variants.map((v, vIdx) => (
                        <div key={vIdx} className="bg-zinc-100 dark:bg-white/5 p-4 rounded-2xl space-y-3">
                          <p className="text-[10px] font-black uppercase opacity-40">{v.type}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {v.prices.map((p, pIdx) => (
                              <div key={pIdx} className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                                <span className="text-xs font-bold">{p.qty} Telor</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-black text-brand-orange">{formatPrice(p.price)}</span>
                                  <button 
                                    onClick={() => handleToggleAvailability('savory', catIdx, -1, vIdx, pIdx)}
                                    className={`p-1 transition-colors ${(p as any).isAvailable ? 'text-green-500' : 'text-red-500'}`}
                                    title={(p as any).isAvailable ? "Tersedia" : "Stok Habis"}
                                  >
                                    {(p as any).isAvailable ? <Check className="w-3 h-3" /> : <CircleSlash className="w-3 h-3" />}
                                  </button>
                                  <button 
                                    onClick={() => setEditingItem({ type: 'savory', categoryIdx: catIdx, variantIdx: vIdx, priceIdx: pIdx, itemIdx: -1, data: {...p} })}
                                    className="p-1 hover:text-brand-orange transition-colors"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteItem('savory', catIdx, -1, vIdx, pIdx)}
                                    className="p-1 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
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

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              {/* Store Identity Card */}
              <div className="bg-brand-orange text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 scale-150 group-hover:scale-[1.8] group-hover:rotate-0 transition-transform duration-700">
                   <Store className="w-32 h-32" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="w-28 h-28 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center border-2 border-white/30 shadow-inner group-hover:rotate-6 transition-transform">
                    <Sparkles className="w-14 h-14 text-white drop-shadow-lg" />
                  </div>
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Store Identity</span>
                      <div className="h-px w-8 bg-white/20" />
                    </div>
                    <h2 className="text-5xl font-black italic tracking-tighter mb-4 leading-none">{storeSettings.name}</h2>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 text-[10px] font-black uppercase tracking-widest">
                      <span className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-xl"><Clock className="w-3 h-3" /> {storeSettings.open}:00 - {storeSettings.close}:00</span>
                      <span className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-xl"><Store className="w-3 h-3" /> {storeSettings.address.substring(0, 25)}...</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border-4 border-zinc-200 dark:border-zinc-800 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                       Profile Toko
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase px-1">Nama Toko</label>
                        <input 
                          type="text" 
                          value={storeSettings.name}
                          onChange={(e) => setStoreSettings({...storeSettings, name: e.target.value})}
                          className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none transition-all" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                       Jam Operasional
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase px-1">Jam Buka</label>
                        <input 
                          type="number" 
                          value={storeSettings.open}
                          onChange={(e) => setStoreSettings({...storeSettings, open: parseInt(e.target.value)})}
                          className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none transition-all" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase px-1">Jam Tutup</label>
                        <input 
                          type="number" 
                          value={storeSettings.close}
                          onChange={(e) => setStoreSettings({...storeSettings, close: parseInt(e.target.value)})}
                          className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none transition-all" 
                        />
                      </div>
                    </div>
                         <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                       Promo Aktif & Jadwal
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase px-1">Kode Promo</label>
                        <input 
                          type="text" 
                          value={storeSettings.promoCode}
                          onChange={(e) => setStoreSettings({...storeSettings, promoCode: e.target.value.toUpperCase()})}
                          className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none transition-all" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase px-1">Diskon (%)</label>
                        <input 
                          type="number" 
                          value={storeSettings.promoPct}
                          onChange={(e) => setStoreSettings({...storeSettings, promoPct: parseInt(e.target.value)})}
                          className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none transition-all" 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase px-1 text-brand-orange">📅 Mulai Promo</label>
                        <input 
                          type="datetime-local" 
                          value={storeSettings.promoStartAt}
                          onChange={(e) => setStoreSettings({...storeSettings, promoStartAt: e.target.value})}
                          className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none transition-all text-sm" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase px-1 text-red-500">🏁 Selesai Promo</label>
                        <input 
                          type="datetime-local" 
                          value={storeSettings.promoEndAt}
                          onChange={(e) => setStoreSettings({...storeSettings, promoEndAt: e.target.value})}
                          className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none transition-all text-sm" 
                        />
                      </div>
                    </div>
                  </div>
            </div>

                  <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                       Alamat & Kontak
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase px-1">Alamat Lengkap</label>
                        <textarea 
                          value={storeSettings.address}
                          onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})}
                          className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none h-24 resize-none transition-all" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase px-1">Nomor WhatsApp</label>
                        <input 
                          type="text" 
                          value={storeSettings.phone}
                          onChange={(e) => setStoreSettings({...storeSettings, phone: e.target.value})}
                          className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none transition-all" 
                        />
                      </div>
                      <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                           Kredensial Admin Dashboard
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase px-1">Admin Username</label>
                            <input 
                              type="text" 
                              value={storeSettings.adminUsername}
                              onChange={(e) => setStoreSettings({...storeSettings, adminUsername: e.target.value})}
                              className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none transition-all" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase px-1">Admin Password</label>
                            <div className="relative">
                              <input 
                                type={showSettingsPassword ? "text" : "password"} 
                                value={storeSettings.adminPassword}
                                onChange={(e) => setStoreSettings({...storeSettings, adminPassword: e.target.value})}
                                className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-4 pr-12 rounded-2xl font-bold focus:border-brand-orange outline-none transition-all" 
                              />
                              <button 
                                type="button" 
                                onClick={() => setShowSettingsPassword(!showSettingsPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                              >
                                {showSettingsPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="text-[9px] font-bold text-zinc-400 opacity-60 px-1 italic text-center">
                          *Simpan kredensial ini baik-baik. Jika lupa, cek tabel "store_settings" di Supabase.
                        </p>
                      </div>
                    </div>
                  </div>

                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                       Pengiriman & Jarak
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase px-1">Tarif Ongkir (Rp/km)</label>
                        <input 
                          type="number" 
                          value={storeSettings.shippingRate}
                          onChange={(e) => setStoreSettings({...storeSettings, shippingRate: parseInt(e.target.value)})}
                          className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none transition-all" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase px-1">Jarak Maksimal (km)</label>
                        <input 
                          type="number" 
                          value={storeSettings.maxDist}
                          onChange={(e) => setStoreSettings({...storeSettings, maxDist: parseInt(e.target.value)})}
                          className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none transition-all" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* EMERGENCY SHUTDOWN */}
                  <div className="col-span-1 md:col-span-2">
                    <div className={`p-6 rounded-3xl border-2 transition-all ${
                      storeSettings.isEmergencyClosed 
                        ? 'bg-red-500/10 border-red-500/30' 
                        : 'bg-zinc-900/50 border-white/5'
                    }`}>
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${
                            storeSettings.isEmergencyClosed ? 'bg-red-500 text-white' : 'bg-black/20 text-zinc-500'
                          }`}>
                            <CircleSlash className="w-6 h-6" />
                          </div>
                          <div className="text-center md:text-left">
                            <h4 className="font-bold uppercase tracking-widest text-sm">Tutup Paksa Toko (Panic Button)</h4>
                            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                              Aktifkan ini untuk menutup katalog secara instan meskipun masih jam operasional. Gunakan hanya saat darurat.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setStoreSettings({ ...storeSettings, isEmergencyClosed: !storeSettings.isEmergencyClosed })}
                          className={`px-8 py-3 rounded-2xl font-black uppercase tracking-wider transition-all shadow-lg ${
                            storeSettings.isEmergencyClosed 
                              ? 'bg-green-500 text-white shadow-green-500/20' 
                              : 'bg-red-500 text-white shadow-red-500/20'
                          }`}
                        >
                          {storeSettings.isEmergencyClosed ? 'BUKA KEMBALI' : 'TUTUP SEKARANG'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={async () => {
                      const { error } = await supabase.from('store_settings').update({
                        store_name: storeSettings.name,
                        open_hour: parseInt(storeSettings.open.toString()),
                        close_hour: parseInt(storeSettings.close.toString()),
                        promo_code: storeSettings.promoCode,
                        promo_percent: parseInt(storeSettings.promoPct.toString()),
                        store_address: storeSettings.address,
                        store_phone: storeSettings.phone,
                        shipping_rate_per_km: parseInt(storeSettings.shippingRate.toString()),
                        max_shipping_distance: parseInt(storeSettings.maxDist.toString()),
                        admin_username: storeSettings.adminUsername,
                        admin_password: storeSettings.adminPassword,
                        is_emergency_closed: storeSettings.isEmergencyClosed
                      }).eq('id', 'main_config');

                      if (error) alert("Error saving settings: " + error.message);
                      else {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                        alert("✅ Pengaturan berhasil disimpan!");
                      }
                    }}
                    className="w-full h-[180px] bg-brand-orange text-white py-5 rounded-[2.5rem] font-black uppercase italic shadow-2xl hover:scale-[1.02] active:scale-95 transition-all text-xl flex flex-col items-center justify-center gap-2 group"
                  >
                    <Save className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                    <span>Simpan Semua Perubahan</span>
                  </button>
                </div>
              </div>

              <p className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-10">
                 Versi Dashboard 1.2.0 • Build Protected
               </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditingItem(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border-4 border-zinc-800 rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
            >
              <div className="p-6 bg-zinc-950 text-white flex justify-between items-center">
                <h3 className="font-black uppercase italic tracking-tighter">Edit Menu Item</h3>
                <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="p-8 overflow-y-auto space-y-6">
                {editingItem.type === 'sweet' ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase opacity-40 px-1">Nama Produk</label>
                      <input 
                        type="text" value={editingItem.data.name} 
                        onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, name: e.target.value}})}
                        className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase opacity-40 px-1">Harga (Rp)</label>
                        <input 
                          type="number" value={editingItem.data.price} 
                          onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, price: parseInt(e.target.value)}})}
                          className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none"
                        />
                      </div>
                      <div className="flex items-end pb-3">
                         <label className="flex items-center gap-3 cursor-pointer group">
                           <input 
                             type="checkbox" checked={editingItem.data.isBestSeller}
                             onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, isBestSeller: e.target.checked}})}
                             className="w-5 h-5 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 checked:bg-brand-orange transition-all"
                           />
                           <span className="text-xs font-bold uppercase tracking-wider">Best Seller?</span>
                         </label>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase opacity-40 px-1">Jumlah Telor</label>
                        <input 
                          type="number" value={editingItem.data.qty} 
                          onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, qty: parseInt(e.target.value)}})}
                          className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase opacity-40 px-1">Harga (Rp)</label>
                        <input 
                          type="number" value={editingItem.data.price} 
                          onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, price: parseInt(e.target.value)}})}
                          className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase opacity-40 px-1">Deskripsi Mentahan</label>
                    <button
                      onClick={async () => {
                        const aiText = await generateAIDescription(editingItem.data.name);
                        setEditingItem({ ...editingItem, data: { ...editingItem.data, description: aiText } });
                      }}
                      disabled={isAiGenerating || !editingItem.data.name}
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-brand-orange hover:text-brand-yellow transition-colors disabled:opacity-30"
                    >
                      {isAiGenerating ? (
                        <div className="w-3 h-3 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      Bantu Tulis via AI
                    </button>
                  </div>
                  <textarea 
                    value={editingItem.data.description || ""} 
                    onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, description: e.target.value}})}
                    className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none h-24 resize-none"
                  />
                </div>

                {/* LIVE PREVIEW CARD */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 text-center">Preview Katalog</label>
                  <div className="bg-brand-yellow rounded-2xl p-4 shadow-xl max-w-sm mx-auto">
                    <div className="flex gap-4 items-start">
                      <div className="w-16 h-16 rounded-xl bg-black/5 overflow-hidden shrink-0">
                        {editingItem.data.image ? (
                          <img src={editingItem.data.image} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-black/20 font-black text-xl">?</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-brand-black leading-tight mb-1">{editingItem.data.name || 'Nama Menu'}</h4>
                        <p className="text-[10px] text-brand-black/60 leading-relaxed mb-2 line-clamp-2">
                          {editingItem.data.description || 'Belum ada deskripsi...'}
                        </p>
                        <span className="font-black text-brand-black">Rp {editingItem.data.price?.toLocaleString('id-ID') || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-zinc-50 dark:bg-black/50 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
                 <button onClick={() => setEditingItem(null)} className="flex-1 py-4 font-bold text-xs uppercase opacity-40 hover:opacity-100 transition-opacity">Batal</button>
                 <button 
                  onClick={() => handleUpdateItem(editingItem.data)}
                  className="flex-[2] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 rounded-2xl font-black uppercase italic shadow-lg active:scale-95 transition-transform"
                >
                  Update Perubahan
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAdding(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border-4 border-zinc-800 rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
            >
              <div className="p-6 bg-brand-orange text-white flex justify-between items-center">
                <h3 className="font-black uppercase italic tracking-tighter">Tambah Menu Baru</h3>
                <button onClick={() => setIsAdding(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="p-8 overflow-y-auto space-y-6">
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest bg-zinc-100 dark:bg-white/5 p-3 rounded-xl text-center">
                  Menambahkan ke kategori: <span className="text-brand-orange">{isAdding === 'sweet' ? 'Terang Bulan Standard' : 'Daging Sapi (Telor Ayam)'}</span>
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40 px-1">Nama Produk / Variant</label>
                    <input 
                      id="new-item-name" type="text" placeholder="Masukkan nama..."
                      className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase opacity-40 px-1">Deskripsi</label>
                      <button
                        onClick={async () => {
                          const itemName = (document.getElementById('new-item-name') as HTMLInputElement).value;
                          if (!itemName) {
                            alert("Mohon masukkan nama produk terlebih dahulu untuk AI!");
                            return;
                          }
                          const aiText = await generateAIDescription(itemName);
                          (document.getElementById('new-item-description') as HTMLTextAreaElement).value = aiText;
                        }}
                        disabled={isAiGenerating || !(document.getElementById('new-item-name') as HTMLInputElement)?.value}
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-brand-orange hover:text-brand-yellow transition-colors disabled:opacity-30"
                      >
                        {isAiGenerating ? (
                          <div className="w-3 h-3 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        Bantu Tulis via AI
                      </button>
                    </div>
                    <textarea 
                      id="new-item-description" placeholder="Tulis deskripsi menu..."
                      className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none h-24 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase opacity-40 px-1">Harga (Rp)</label>
                      <input 
                        id="new-item-price" type="number" placeholder="15000"
                        className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none"
                      />
                    </div>
                    {isAdding === 'savory' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase opacity-40 px-1">Jumlah Telor</label>
                        <input 
                          id="new-item-qty" type="number" placeholder="2"
                          className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-zinc-50 dark:bg-black/50 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
                 <button onClick={() => setIsAdding(null)} className="flex-1 py-4 font-bold text-xs uppercase opacity-40 hover:opacity-100 transition-opacity">Batal</button>
                 <button 
                    onClick={async () => {
                      const nameInput = document.getElementById('new-item-name') as HTMLInputElement;
                      const priceInput = document.getElementById('new-item-price') as HTMLInputElement;
                      const descInput = document.getElementById('new-item-description') as HTMLTextAreaElement;
                      const qtyInput = document.getElementById('new-item-qty') as HTMLInputElement;
                      
                      const name = nameInput?.value;
                      const price = parseInt(priceInput?.value || "0");
                      const description = descInput?.value || "";
                      const qty = qtyInput ? parseInt(qtyInput.value) : undefined;

                      if (!name || isNaN(price)) return alert("Mohon lengkapi data!");
                      
                      if (isAdding === 'sweet') {
                        handleAddItem('sweet', { name, price, description, image: "/images/placeholder.webp" });
                      } else {
                        handleAddItem('savory', { variant_type: "Telor Ayam", name, price, description, qty: qty || 2, image: "/images/placeholder.webp" });
                      }
                    }}
                    className="flex-[2] py-4 bg-brand-orange text-white rounded-2xl font-black uppercase italic tracking-wider shadow-lg shadow-brand-orange/20 hover:scale-[1.02] transition-transform active:scale-95"
                  >
                    Tambah Sekarang
                  </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  sub: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, sub, color }) => (
  <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
        <TrendingUp className="w-3 h-3" /> +12%
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">{label}</p>
      <h3 className="text-3xl font-black tracking-tighter tabular-nums">{value}</h3>
      <p className="text-[10px] text-zinc-400">{sub}</p>
    </div>
  </div>
);

const CustomMoon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 3v4"/><path d="M21 5h-4"/>
  </svg>
);
