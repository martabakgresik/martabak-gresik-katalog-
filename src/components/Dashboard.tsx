import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Turnstile } from '@marsidev/react-turnstile';
import { BlogManager } from './BlogManager';
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
  CircleSlash,
  ChevronDown,
  BookOpen,
  CalendarDays,
  CalendarOff,
  CalendarPlus
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { 
  MENU_SWEET as INITIAL_SWEET, 
  MENU_SAVORY as INITIAL_SAVORY, 
  STORE_NAME as INITIAL_NAME, 
  OPEN_HOUR as INITIAL_OPEN, 
  CLOSE_HOUR as INITIAL_CLOSE,
  PROMO_CODE as INITIAL_PROMO,
  PROMO_PERCENT as INITIAL_PROMO_PCT,
  TURNSTILE_SITE_KEY,
  HOLIDAYS as INITIAL_HOLIDAYS
} from '../data/config';
import { formatPrice } from '../hooks/useCart';

interface DashboardProps {
  onBack: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'settings' | 'blog'>('overview');
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
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
    adminPassword: '1234',
    isEmergencyClosed: false,
    promoStartAt: '',
    promoEndAt: ''
  });
  const [loading, setLoading] = useState(true);
  const [holidays, setHolidays] = useState<string[]>(INITIAL_HOLIDAYS);
  const [newHolidayDate, setNewHolidayDate] = useState('');

  // --- FETCH DATA ON MOUNT ---
  useEffect(() => {
    async function loadData() {
      try {
        const { data: settings } = await supabase.from('store_settings').select('*').eq('id', 'main_config').single();
        const { data: categories } = await supabase
          .from('categories')
          .select('*, menu_items(*)')
          .order('display_order')
          .order('display_order', { foreignTable: 'menu_items' });

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
            adminPassword: settings.admin_password || '•••••',
            isEmergencyClosed: settings.is_emergency_closed || false,
            promoStartAt: settings.promo_start_at ? new Date(settings.promo_start_at).toISOString().slice(0, 16) : '',
            promoEndAt: settings.promo_end_at ? new Date(settings.promo_end_at).toISOString().slice(0, 16) : ''
          });
          // Load holidays from DB (JSON array stored in store_settings)
          if (settings.holidays && Array.isArray(settings.holidays)) {
            setHolidays(settings.holidays);
          }
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
                image: i.image,
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

  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showSettingsPassword, setShowSettingsPassword] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

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
  const [lockoutMessage, setLockoutMessage] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check Turnstile Token
    if (!turnstileToken) {
      alert("Silakan verifikasi Turnstile terlebih dahulu!");
      return;
    }

    // Check Lockout
    const lockoutUntil = localStorage.getItem('martabak_lockout_until');
    if (lockoutUntil && Date.now() < parseInt(lockoutUntil)) {
      const remainingMin = Math.ceil((parseInt(lockoutUntil) - Date.now()) / 60000);
      setLockoutMessage(`Terlalu banyak percobaan. Silakan tunggu ${remainingMin} menit.`);
      setTimeout(() => setLockoutMessage(null), 5000);
      return;
    }

    // Verify Turnstile on Backend
    try {
      const verifyResponse = await fetch('/api/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken })
      });

      const verifyData = await verifyResponse.json();
      if (!verifyData.success) {
        alert("Verifikasi Turnstile gagal. Silakan coba lagi.");
        setTurnstileToken(null);
        if (turnstileRef.current) {
          turnstileRef.current.reset();
        }
        return;
      }
    } catch (error) {
      console.error('Turnstile verification error:', error);
      alert("Gagal melakukan verifikasi. Silakan coba lagi.");
      return;
    }

    const { data: settings, error } = await supabase
      .from('store_settings')
      .select('admin_username, admin_password')
      .eq('id', 'main_config')
      .single();

    if (error) {
      alert("Gagal terhubung ke Database: " + error.message);
      setTurnstileToken(null);
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
      return;
    }

    if (settings && loginUsername.trim() === settings.admin_username && loginPassword.trim() === settings.admin_password) {
      setIsAuthenticated(true);
      setPinError(false);
      localStorage.removeItem('martabak_failed_attempts');
      localStorage.removeItem('martabak_lockout_until');
    } else {
      setPinError(true);
      setLoginPassword("");
      const currentAttempts = parseInt(localStorage.getItem('martabak_failed_attempts') || "0") + 1;
      localStorage.setItem('martabak_failed_attempts', currentAttempts.toString());
      if (currentAttempts >= 5) {
        const lockoutTime = Date.now() + 15 * 60 * 1000;
        localStorage.setItem('martabak_lockout_until', lockoutTime.toString());
        setLockoutMessage("Akun terkunci sementara selama 15 menit.");
      }
      setTurnstileToken(null);
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
      setTimeout(() => { setPinError(false); setLockoutMessage(null); }, 5000);
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

    setTogglingId(itemId);
    const { error } = await supabase.from('menu_items').update({ is_available: newValue }).eq('id', itemId);

    if (error) {
      alert("Gagal update ketersediaan: " + error.message);
      setTogglingId(null);
      return;
    }

    if (type === 'sweet') {
      setMenuSweet(prev => {
        const next = [...prev];
        const cat = { ...next[catIdx] };
        const items = [...cat.items];
        items[itemIdx] = { ...items[itemIdx], isAvailable: newValue } as any;
        cat.items = items;
        next[catIdx] = cat as any;
        return next;
      });
    } else {
      setMenuSavory(prev => {
        const next = [...prev];
        const cat = { ...(next as any)[catIdx] };
        const variants = [...cat.variants];
        const variant = { ...variants[vIdx!] };
        const prices = [...variant.prices];
        prices[pIdx!] = { ...prices[pIdx!], isAvailable: newValue } as any;
        variant.prices = prices;
        variants[vIdx!] = variant;
        cat.variants = variants;
        (next as any)[catIdx] = cat;
        return next;
      });
    }
    setTogglingId(null);
  };

  const handleUpdateItem = async (newData: any) => {
    if (!editingItem) return;
    const { error } = await supabase.from('menu_items').update({
        name: newData.name || "",
        price: newData.price,
        is_best_seller: newData.isBestSeller,
        description: newData.description,
        qty: newData.qty
      }).eq('id', newData.id);

    if (error) {
      alert("Error updating database: " + error.message);
      return;
    }

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
    const catId = type === 'sweet' ? (menuSweet as any)[0].id : (menuSavory as any)[0].id;
    const { data: inserted, error } = await supabase.from('menu_items').insert({
        category_id: catId,
        name: data.name || (type === 'savory' ? 'Savory Variant' : 'New Item'),
        price: data.price,
        qty: data.qty,
        variant_type: data.variant_type || (type === 'savory' ? 'Daging Sapi' : null),
        image: data.image,
        description: data.description,
        is_best_seller: false,
        is_available: true,
        display_order: 0
      }).select().single();

    if (error) { alert("Error adding item: " + error.message); return; }

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
      const itemId = type === 'sweet' ? (menuSweet as any)[catIdx].items[itemIdx].id : (menuSavory as any)[catIdx].variants[vIdx!].prices[pIdx!].id;
      const { error } = await supabase.from('menu_items').delete().eq('id', itemId);
      if (error) { alert("Error deleting item: " + error.message); return; }
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

  const handleUpdateSettings = async () => {
    const { error } = await supabase.from('store_settings').update({
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
        promo_end_at: storeSettings.promoEndAt || null,
        holidays: holidays
      }).eq('id', 'main_config');

    if (error) alert("Gagal update pengaturan: " + error.message);
    else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-zinc-900 border-4 border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl text-center">
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
                 <input type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} className={`w-full bg-black border-2 ${pinError ? 'border-red-500' : 'border-zinc-800'} rounded-2xl p-4 pl-12 text-white focus:border-brand-orange outline-none transition-all font-bold`} autoFocus />
              </div>
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black uppercase text-zinc-500 px-1 italic">Password</label>
              <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                 <input type={showPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className={`w-full bg-black border-2 ${pinError ? 'border-red-500' : 'border-zinc-800'} rounded-2xl p-4 pl-12 text-white focus:border-brand-orange outline-none transition-all font-bold`} />
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            {pinError && <p className="text-red-500 text-[10px] font-black uppercase">Username atau Password salah!</p>}
            <div className="flex justify-center my-4">
              <Turnstile
                ref={turnstileRef}
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={(token) => setTurnstileToken(token)}
                onError={() => {
                  setTurnstileToken(null);
                  alert("Turnstile verification failed. Silakan coba lagi.");
                }}
                onExpire={() => {
                  setTurnstileToken(null);
                  alert("Turnstile token expired. Silakan verifikasi ulang.");
                }}
              />
            </div>
            <button type="submit" className="w-full bg-brand-orange text-white py-4 rounded-2xl font-black uppercase italic hover:scale-[1.02] transition-transform shadow-xl shadow-brand-orange/20">Masuk</button>
          </form>
          <button onClick={onBack} className="mt-8 text-zinc-600 hover:text-zinc-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"><ArrowLeft className="w-3 h-3" /> Kembali</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-20">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"><ArrowLeft className="w-5 h-5" /></button>
            <h1 className="text-xl font-bold flex items-center gap-2 uppercase tracking-tighter"><span className="text-brand-orange text-2xl">MG</span> Dashboard</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
            {(['overview', 'menu', 'blog', 'settings'] as const).map((id) => {
              const icons = { overview: BarChart3, menu: Package, blog: BookOpen, settings: Settings };
              const labels = { overview: 'Ringkasan', menu: 'Atur Menu', blog: 'Blog', settings: 'Toko' };
              const Icon = icons[id];
              return (
                <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === id ? 'bg-white dark:bg-zinc-800 shadow-sm text-brand-orange' : 'text-zinc-500 hover:text-zinc-700'}`}>
                  <Icon className="w-4 h-4" /> {labels[id]}
                </button>
              );
            })}
          </div>

          <div className="relative md:hidden">
            <button onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)} className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-xl font-bold text-sm">
              {activeTab === 'overview' ? <BarChart3 className="w-4 h-4 text-brand-orange" /> : activeTab === 'menu' ? <Package className="w-4 h-4 text-brand-orange" /> : activeTab === 'blog' ? <BookOpen className="w-4 h-4 text-brand-orange" /> : <Settings className="w-4 h-4 text-brand-orange" />}
              {activeTab === 'overview' ? 'Ringkasan' : activeTab === 'menu' ? 'Atur Menu' : activeTab === 'blog' ? 'Blog' : 'Toko'}
              <ChevronDown className={`w-4 h-4 transition-transform ${isNavDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isNavDropdownOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden">
                  {(['overview', 'menu', 'blog', 'settings'] as const).map((id) => {
                    const icons = { overview: BarChart3, menu: Package, blog: BookOpen, settings: Settings };
                    const labels = { overview: 'Ringkasan', menu: 'Atur Menu', blog: 'Blog', settings: 'Toko' };
                    const Icon = icons[id];
                    return (
                      <button key={id} onClick={() => { setActiveTab(id); setIsNavDropdownOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors ${activeTab === id ? 'bg-brand-orange/10 text-brand-orange' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600'}`}>
                        <Icon className="w-4 h-4" /> {labels[id]}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={handleUpdateSettings} className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-transform">
             {copied ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
             <span className="hidden sm:inline">{copied ? 'Terupdate!' : 'Update Data'}</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Produk" value={stats.totalItems.toString()} icon={Package} sub="Aktif di katalog" color="text-blue-500" />
                <StatCard label="Best Sellers" value={stats.bestSellers.toString()} icon={TrendingUp} sub="Badge menyala" color="text-yellow-500" />
                <StatCard label="Rata-rata Harga" value={formatPrice(stats.avgPrice)} icon={DollarSign} sub="Semua kategori" color="text-green-500" />
              </div>
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                <div className="flex-1 space-y-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="w-6 h-6 text-brand-orange" /> Wawasan Katalog</h2>
                  <p className="text-zinc-500 dark:text-zinc-400">Katalog Anda memiliki rasio Best Seller yang sangat baik. Pelanggan menyukai Pandan Keju.</p>
                </div>
                <div className="hidden lg:block w-72 h-44 bg-zinc-100 dark:bg-zinc-800 rounded-2xl overflow-hidden relative">
                   <div className="absolute inset-0 flex items-end gap-2 p-4">
                    {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                      <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.1, duration: 1 }} className="flex-1 bg-brand-orange/20 rounded-t-md" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'menu' && (
            <motion.div key="menu" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold tracking-tighter uppercase italic flex items-center gap-2">Manajemen Menu</h2>
                <button onClick={() => setIsAdding('sweet')} className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-xl font-bold text-sm transition-transform active:scale-95"><Plus className="w-4 h-4" /> Menu Baru</button>
              </div>
              <div className="space-y-8">
                {menuSweet.map((cat, catIdx) => (
                  <div key={catIdx} className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 px-2">{cat.category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cat.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-4">
                            <img src={item.image} className="w-12 h-12 rounded-xl bg-zinc-100 object-cover" alt="" />
                            <div>
                               <p className="font-bold text-sm">{item.name}</p>
                               <p className="text-xs text-brand-orange font-bold">{formatPrice(item.price)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <button onClick={() => handleToggleAvailability('sweet', catIdx, itemIdx)} className={`p-2 rounded-lg transition-colors ${(item as any).isAvailable ? 'text-green-500' : 'text-red-500'}`}>{togglingId === (item as any).id ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : (item as any).isAvailable ? <Check className="w-4 h-4" /> : <CircleSlash className="w-4 h-4" />}</button>
                             <button onClick={() => setEditingItem({ type: 'sweet', categoryIdx: catIdx, itemIdx, data: {...item} })} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
                             <button onClick={() => handleDeleteItem('sweet', catIdx, itemIdx)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {menuSavory.map((cat, catIdx) => (
                  <div key={catIdx} className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 px-2">{cat.title}</h3>
                    <div className="space-y-4">
                      {cat.variants.map((v, vIdx) => (
                        <div key={vIdx} className="bg-zinc-100 dark:bg-white/5 p-4 rounded-2xl space-y-3">
                          <p className="text-[10px] font-black uppercase opacity-40">{v.type}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {v.prices.map((p, pIdx) => (
                              <div key={pIdx} className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 flex justify-between items-center shadow-sm">
                                <span className="text-xs font-bold">{p.qty} Telor</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-black text-brand-orange">{formatPrice(p.price)}</span>
                                  <button onClick={() => handleToggleAvailability('savory', catIdx, -1, vIdx, pIdx)} className={`p-1 transition-colors ${(p as any).isAvailable ? 'text-green-500' : 'text-red-500'}`}>{togglingId === (p as any).id ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : (p as any).isAvailable ? <Check className="w-3 h-3" /> : <CircleSlash className="w-3 h-3" />}</button>
                                  <button onClick={() => setEditingItem({ type: 'savory', categoryIdx: catIdx, variantIdx: vIdx, priceIdx: pIdx, itemIdx: -1, data: {...p} })} className="p-1 hover:text-brand-orange transition-colors"><Edit2 className="w-3 h-3" /></button>
                                  <button onClick={() => handleDeleteItem('savory', catIdx, -1, vIdx, pIdx)} className="p-1 hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
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

          {activeTab === 'blog' && (
            <motion.div key="blog" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <BlogManager />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-4xl mx-auto space-y-8">
              <div className="bg-brand-orange text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <Store className="absolute top-0 right-0 p-10 opacity-10 rotate-12 scale-150 w-32 h-32" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border-2 border-white/30"><Sparkles className="w-10 h-10 text-white" /></div>
                  <div className="text-center md:text-left">
                    <h2 className="text-4xl font-black italic tracking-tighter mb-2">{storeSettings.name}</h2>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 text-[10px] font-black uppercase tracking-widest">
                      <span className="bg-black/20 px-3 py-1.5 rounded-xl">{storeSettings.open}:00 - {storeSettings.close}:00</span>
                      <span className="bg-black/20 px-3 py-1.5 rounded-xl">{storeSettings.address.substring(0, 30)}...</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Profile Toko</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase opacity-40">Nama Toko</label>
                        <input type="text" value={storeSettings.name} onChange={(e) => setStoreSettings({...storeSettings, name: e.target.value})} className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-40">Buka</label><input type="number" value={storeSettings.open} onChange={(e) => setStoreSettings({...storeSettings, open: parseInt(e.target.value)})} className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl font-bold" /></div>
                        <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-40">Tutup</label><input type="number" value={storeSettings.close} onChange={(e) => setStoreSettings({...storeSettings, close: parseInt(e.target.value)})} className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl font-bold" /></div>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Promo</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-40">Kode</label><input type="text" value={storeSettings.promoCode} onChange={(e) => setStoreSettings({...storeSettings, promoCode: e.target.value.toUpperCase()})} className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl font-bold" /></div>
                        <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-40">Diskon %</label><input type="number" value={storeSettings.promoPct} onChange={(e) => setStoreSettings({...storeSettings, promoPct: parseInt(e.target.value)})} className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl font-bold" /></div>
                      </div>
                    </div>
                  </div>
                   <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Alamat & Kontak</h3>
                    <div className="space-y-4">
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-40">Alamat</label><textarea value={storeSettings.address} onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})} className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl font-bold h-24 resize-none" /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-40">WhatsApp</label><input type="text" value={storeSettings.phone} onChange={(e) => setStoreSettings({...storeSettings, phone: e.target.value})} className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl font-bold" /></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                   <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Pengiriman</h3>
                    <div className="space-y-4">
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-40">Ongkir/km</label><input type="number" value={storeSettings.shippingRate} onChange={(e) => setStoreSettings({...storeSettings, shippingRate: parseInt(e.target.value)})} className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl font-bold" /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase opacity-40">Jarak Maks</label><input type="number" value={storeSettings.maxDist} onChange={(e) => setStoreSettings({...storeSettings, maxDist: parseInt(e.target.value)})} className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl font-bold" /></div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Admin Login</h3>
                    <div className="space-y-4">
                       <input type="text" value={storeSettings.adminUsername} onChange={(e) => setStoreSettings({...storeSettings, adminUsername: e.target.value})} className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl font-bold" placeholder="Username" />
                       <div className="relative">
                         <input type={showSettingsPassword ? "text" : "password"} value={storeSettings.adminPassword} onChange={(e) => setStoreSettings({...storeSettings, adminPassword: e.target.value})} className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl font-bold" placeholder="Password" />
                         <button type="button" onClick={() => setShowSettingsPassword(!showSettingsPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">{showSettingsPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 🗓️ PENGATURAN HARI LIBUR */}
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm col-span-1 md:col-span-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" /> Pengaturan Hari Libur
                  </h3>
                  <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                    {holidays.length} hari libur
                  </span>
                </div>

                {/* Add New Holiday */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <CalendarPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      type="date" 
                      value={newHolidayDate}
                      onChange={(e) => setNewHolidayDate(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 p-4 pl-12 rounded-2xl font-bold focus:border-brand-orange outline-none transition-colors"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      if (newHolidayDate && !holidays.includes(newHolidayDate)) {
                        setHolidays(prev => [...prev, newHolidayDate].sort());
                        setNewHolidayDate('');
                      }
                    }}
                    disabled={!newHolidayDate || holidays.includes(newHolidayDate)}
                    className="flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-4 rounded-2xl font-black uppercase italic text-sm shadow-lg active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" /> Tambah Libur
                  </button>
                </div>

                {/* Holiday List */}
                {holidays.length > 0 ? (
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {holidays.map((date) => {
                        const dateObj = new Date(date + 'T00:00:00');
                        const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
                        const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                        const isPast = new Date(date) < new Date(new Date().toISOString().split('T')[0]);
                        const isToday = date === new Date().toISOString().split('T')[0];
                        return (
                          <motion.div 
                            key={date}
                            layout
                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${
                              isToday 
                                ? 'bg-orange-500/10 border-orange-500/30 dark:bg-orange-500/5' 
                                : isPast 
                                  ? 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 opacity-50' 
                                  : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 hover:border-brand-orange/30'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center ${
                                isToday ? 'bg-orange-500 text-white' : isPast ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400' : 'bg-brand-orange/10 text-brand-orange'
                              }`}>
                                <span className="text-[10px] font-black uppercase leading-none">{dateObj.toLocaleDateString('id-ID', { month: 'short' })}</span>
                                <span className="text-lg font-black leading-none">{dateObj.getDate()}</span>
                              </div>
                              <div>
                                <p className="font-bold text-sm">{formattedDate}</p>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                  {dayName}
                                  {isToday && <span className="ml-2 text-orange-500">• HARI INI</span>}
                                  {isPast && !isToday && <span className="ml-2">• SUDAH LEWAT</span>}
                                </p>
                              </div>
                            </div>
                            <button 
                              onClick={() => setHolidays(prev => prev.filter(h => h !== date))}
                              className="p-2 rounded-xl text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                              title="Hapus hari libur"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <CalendarOff className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
                    <p className="text-sm font-bold text-zinc-400">Belum ada hari libur</p>
                    <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1">Tambahkan tanggal di atas untuk menjadwalkan hari libur</p>
                  </div>
                )}

                {/* Quick info */}
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Info</p>
                      <p className="text-[11px] text-zinc-500">Toko akan otomatis menampilkan status "LIBUR" pada tanggal-tanggal yang ditentukan. Pelanggan tidak bisa memesan saat hari libur. Klik <strong>Update Data</strong> atau <strong>Simpan Perubahan</strong> untuk menyimpan.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-8 rounded-[2.5rem] border-4 transition-all ${storeSettings.isEmergencyClosed ? 'bg-red-500/10 border-red-500/30' : 'bg-zinc-100 dark:bg-white/5 border-transparent'}`}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4 text-center md:text-left">
                    <div className={`p-4 rounded-2xl ${storeSettings.isEmergencyClosed ? 'bg-red-500 text-white' : 'bg-black/10 text-zinc-400'}`}><CircleSlash className="w-6 h-6" /></div>
                    <div><h4 className="font-bold uppercase italic">Emergency Closed</h4><p className="text-xs opacity-60">Tutup toko secara instan.</p></div>
                  </div>
                  <button onClick={() => setStoreSettings({...storeSettings, isEmergencyClosed: !storeSettings.isEmergencyClosed})} className={`px-10 py-4 rounded-2xl font-black uppercase italic shadow-lg shadow-red-500/20 active:scale-95 transition-all ${storeSettings.isEmergencyClosed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{storeSettings.isEmergencyClosed ? 'Buka Toko' : 'Tutup Toko'}</button>
                </div>
              </div>

              <button onClick={handleUpdateSettings} className="w-full py-10 bg-brand-orange text-white rounded-[2.5rem] font-black uppercase italic text-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center justify-center gap-2">
                <Save className="w-8 h-8" /> <span>Simpan Perubahan</span>
              </button>
              
              <p className="text-center text-[10px] font-black uppercase opacity-20 tracking-[0.3em]">Dashboard V3.1 • Protected</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingItem(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border-4 border-zinc-800 rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
              <div className="p-6 bg-zinc-950 text-white flex justify-between items-center"><h3 className="font-black uppercase italic tracking-tighter">Edit Menu Item</h3><button onClick={() => setEditingItem(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button></div>
              <div className="p-8 overflow-y-auto space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase opacity-40 px-1">Nama</label>
                   <input type="text" value={editingItem.data.name} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, name: e.target.value}})} className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase opacity-40 px-1">Harga</label>
                     <input type="number" value={editingItem.data.price} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, price: parseInt(e.target.value)}})} className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none" />
                   </div>
                   <div className="flex items-end pb-3">
                     <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={editingItem.data.isBestSeller} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, isBestSeller: e.target.checked}})} className="w-5 h-5 accent-brand-orange" />
                        <span className="text-xs font-bold uppercase tracking-wider">Best Seller?</span>
                     </label>
                   </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase opacity-40 px-1">Deskripsi</label>
                    <button onClick={async () => { const aiText = await generateAIDescription(editingItem.data.name); setEditingItem({ ...editingItem, data: { ...editingItem.data, description: aiText } }); }} disabled={isAiGenerating} className="text-[10px] font-black text-brand-orange uppercase flex items-center gap-1 transition-opacity disabled:opacity-30"><Sparkles className="w-3 h-3" /> Bantu via AI</button>
                  </div>
                  <textarea value={editingItem.data.description || ""} onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, description: e.target.value}})} className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none h-24 resize-none" />
                </div>
              </div>
              <div className="p-6 bg-zinc-50 dark:bg-black/50 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
                 <button onClick={() => setEditingItem(null)} className="flex-1 py-4 font-bold text-xs uppercase opacity-40 hover:opacity-100 transition-opacity">Batal</button>
                 <button onClick={() => handleUpdateItem(editingItem.data)} className="flex-[2] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 rounded-2xl font-black uppercase italic shadow-lg active:scale-95 transition-transform">Update Perubahan</button>
              </div>
            </motion.div>
          </div>
        )}

        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAdding(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border-4 border-zinc-800 rounded-[2.5rem] p-10 text-center shadow-2xl">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-6">Tambah Menu Baru</h3>
              <div className="space-y-4">
                <input id="add-name" type="text" placeholder="Nama Menu..." className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none" />
                <input id="add-price" type="number" placeholder="Harga (Rp)..." className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none" />
                <button onClick={() => {
                  const name = (document.getElementById('add-name') as HTMLInputElement).value;
                  const price = parseInt((document.getElementById('add-price') as HTMLInputElement).value);
                  if (name && price) handleAddItem(isAdding, { name, price, description: "", image: "/images/placeholder.webp" });
                }} className="w-full bg-brand-orange text-white py-4 rounded-2xl font-black uppercase italic shadow-lg shadow-brand-orange/20 active:scale-95 transition-transform">Tambah Sekarang</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface StatCardProps {
  label: string; value: string; icon: React.ElementType; sub: string; color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, sub, color }) => (
  <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-lg group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl ${color} group-hover:scale-110 transition-transform`}><Icon className="w-6 h-6" /></div>
      <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold px-2 py-1 rounded-full"><TrendingUp className="w-3 h-3 inline mr-1" /> +12%</div>
    </div>
    <div className="space-y-1">
      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{label}</p>
      <h3 className="text-3xl font-black tracking-tighter tabular-nums">{value}</h3>
      <p className="text-[10px] text-zinc-400 font-bold">{sub}</p>
    </div>
  </div>
);

const CustomMoon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 3v4"/><path d="M21 5h-4"/>
  </svg>
);
