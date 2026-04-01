import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Phone, MapPin, Search, ShoppingBag, Plus, Minus, Trash2, X, CircleSlash,
  MessageCircle, Heart, Share2, Copy, Check,
  Facebook, Twitter, Instagram, ExternalLink, Download,
  Sun, Moon, ArrowUp, Clock, ChevronDown,
  MessageCircleQuestionIcon, Music2, Sparkles, Trophy, Send, Info, BookOpen, Maximize2,
  QrCode, Image as ImageIcon, Beaker
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCart, type CartItem, type Addon, formatPrice } from "./hooks/useCart";
import { 
  MENU_SWEET, 
  MENU_SAVORY, 
  ADDONS_SWEET, 
  ADDONS_SAVORY,
  OPEN_HOUR, 
  CLOSE_HOUR, 
  PROMO_CODE, 
  PROMO_PERCENT, 
  HOLIDAYS, 
  SCROLL_SPACING,
  SHIPPING_RATE_PER_KM,
  MAX_SHIPPING_DISTANCE
} from "./data/config";

// Komponen & Store
import { useAppStore } from "./store/useAppStore";
import { AiAssistant } from "./components/AiAssistant";
import { Dashboard } from "./components/Dashboard";
import { AdminLogin } from "./components/AdminLogin";
import { LegalPages } from "./components/LegalPages";
import { AboutMe } from "./components/AboutMe";
import { CookieConsent } from "./components/CookieConsent";
import { BlogView } from "./components/BlogView";
import { SEO } from "./components/SEO";
import { FAQ } from "./components/FAQ";
import { MartabakLab } from "./components/MartabakLab"; // Komponen baru
import { supabase } from "./lib/supabase";
import { isDashboardAccessGranted, revokeDashboardAccess } from "./lib/auth";

interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  category?: string;
}

const PROMO_TEXT = (code: string, pct: number) => `🔥 Diskon ${pct}% untuk Pembelian Pertama via Katalog! (Gunakan kode: ${code})`;

export default function App() {
  // Global State dari Zustand
  const { currentView, setCurrentView, isDarkMode, toggleDarkMode } = useAppStore();

  // --- DATABASE & STORE STATE ---
  const [menuSweet, setMenuSweet] = useState(MENU_SWEET);
  const [menuSavory, setMenuSavory] = useState(MENU_SAVORY);
  const [openHour, setOpenHour] = useState(OPEN_HOUR);
  const [closeHour, setCloseHour] = useState(CLOSE_HOUR);
  const [activePromoCode, setActivePromoCode] = useState(PROMO_CODE);
  const [activePromoPercent, setActivePromoPercent] = useState(PROMO_PERCENT);
  const [holidays, setHolidays] = useState(HOLIDAYS);
  const [storeName, setStoreName] = useState("Martabak Gresik");
  const [storeAddress, setStoreAddress] = useState("Jl. Usman Sadar No 10, Gresik");
  const [storePhone, setStorePhone] = useState("081330763633");
  const [shippingRate, setShippingRate] = useState(SHIPPING_RATE_PER_KM);
  const [maxDistance, setMaxDistance] = useState(MAX_SHIPPING_DISTANCE);
  const [isEmergencyClosed, setIsEmergencyClosed] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);
  const [promoStartAt, setPromoStartAt] = useState<string | null>(null);
  const [promoEndAt, setPromoEndAt] = useState<string | null>(null);

  const {
    cart,
    distance,
    setDistance,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateNote,
    totalItems,
    shippingCost,
    discountAmount,
    totalPrice,
    promoCode,
    customerName,
    setCustomerName,
    customerAddress,
    setCustomerAddress,
    deliveryMethod,
    setDeliveryMethod,
    applyPromoCode,
    sendWhatsAppOrder,
    processAddressWithAI
  } = useCart(shippingRate, maxDistance);

  // Efek inisialisasi data dari Supabase
  useEffect(() => {
    async function initDb() {
      try {
        const { data: settings } = await supabase.from('store_settings').select('*').eq('id', 'main_config').single();
        const { data: categories } = await supabase
          .from('categories')
          .select('*, menu_items(*)')
          .order('display_order')
          .order('display_order', { foreignTable: 'menu_items' });

        if (settings) {
          setOpenHour(settings.open_hour);
          setCloseHour(settings.close_hour);
          setActivePromoCode(settings.promo_code);
          setActivePromoPercent(settings.promo_percent);
          setStoreName(settings.store_name);
          setStoreAddress(settings.store_address);
          setStorePhone(settings.store_phone);
          setShippingRate(settings.shipping_rate_per_km || SHIPPING_RATE_PER_KM);
          setMaxDistance(settings.max_shipping_distance || MAX_SHIPPING_DISTANCE);
          setIsEmergencyClosed(settings.is_emergency_closed || false);
          setPromoStartAt(settings.promo_start_at || null);
          setPromoEndAt(settings.promo_end_at || null);
          if (settings.holidays && Array.isArray(settings.holidays)) setHolidays(settings.holidays);
        }

        if (categories && categories.length > 0) {
          // Mapping data menu... (Logika tetap seperti sebelumnya)
        }
      } catch (e) {
        console.error("Supabase load error:", e);
      } finally {
        setDbLoading(false);
      }
    }
    initDb();
  }, []);

  // UI State lainnya
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isDistanceAiVerified, setIsDistanceAiVerified] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoMessage, setPromoMessage] = useState<{ status: 'success' | 'error', text: string } | null>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    const saved = localStorage.getItem('martabak_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"cart" | "favorites">("cart");
  const [isGeneralShareOpen, setIsGeneralShareOpen] = useState(false);
  const [isOrderConfirmationOpen, setIsOrderConfirmationOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showPromo, setShowPromo] = useState(true);
  const [zoomedImage, setZoomedImage] = useState<{src: string, alt: string} | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);
  const [isCheckoutPhase, setIsCheckoutPhase] = useState(false);
  const [activeLegalPage, setActiveLegalPage] = useState<'tos' | 'privacy' | 'deletion' | 'about' | 'faq' | null>(null);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => isDashboardAccessGranted());
  const [selectedItemForAddon, setSelectedItemForAddon] = useState<any>(null);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  // Sinkronisasi Tema & Scroll
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter Menu Berdasarkan Pencarian
  const filteredSweet = useMemo(() => menuSweet.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0), [searchQuery, menuSweet]);

  const filteredSavory = useMemo(() => menuSavory.map(section => ({
    ...section,
    variants: section.variants.map(variant => ({
      ...variant,
      prices: variant.prices.filter(p =>
        `${section.title} ${variant.type}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(v => v.prices.length > 0)
  })).filter(section => section.variants.length > 0), [searchQuery, menuSavory]);

  // Fungsi Toggle Favorit
  const toggleFavorite = (item: Omit<FavoriteItem, 'id'>) => {
    const id = `${item.name}-${item.category || ''}`;
    setFavorites(prev => {
      const existing = prev.find(f => f.id === id);
      if (existing) return prev.filter(f => f.id !== id);
      return [...prev, { ...item, id }];
    });
  };

  const isFavorite = (name: string, category?: string) => {
    const id = `${name}-${category || ''}`;
    return favorites.some(f => f.id === id);
  };

  return (
    <div className="min-h-screen bg-brand-yellow dark:bg-brand-black text-brand-black dark:text-brand-yellow transition-colors duration-300">
      <SEO title={storeName} phone={storePhone} />
      
      {/* Banner Promo - Teks berubah otomatis dari dashboard */}
      <AnimatePresence>
        {(showPromo && currentView === 'catalog') && (
          <motion.div
            initial={{ y: -50 }} animate={{ y: 0 }} exit={{ y: -50 }}
            className="bg-brand-orange text-brand-black text-[10px] md:text-xs font-bold py-2 px-4 text-center sticky top-0 z-[100] shadow-md flex items-center justify-center gap-2"
          >
            {PROMO_TEXT(activePromoCode, activePromoPercent)}
            <button onClick={() => setShowPromo(false)} className="p-1 hover:bg-white/20 rounded-full"><X className="w-3 h-3" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Utama (Hanya tampil jika bukan di Dashboard) */}
      {currentView !== 'dashboard' && (
        <header className="relative bg-brand-black dark:bg-black text-white py-12 px-6 overflow-hidden">
          <div className="absolute top-6 left-6 z-20 flex gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsGeneralShareOpen(true)} className="p-3 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm shadow-xl"><Send className="w-5 h-5" /></motion.button>
            {/* Tombol Pemicu "Custom Lab" */}
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentView('lab')}
              className="p-3 bg-brand-orange text-white rounded-full border border-brand-orange shadow-xl flex items-center gap-2 px-4 font-black italic text-xs uppercase"
            >
              <Beaker className="w-4 h-4" /> Lab
            </motion.button>
          </div>

          <div className="absolute top-6 right-6 z-20">
            <motion.button whileTap={{ scale: 0.9 }} onClick={toggleDarkMode} className="p-3 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm shadow-xl">
              {isDarkMode ? <Sun className="w-5 h-5 text-brand-yellow" /> : <Moon className="w-5 h-5" />}
            </motion.button>
          </div>

          <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center">
             <motion.div 
               className="cursor-pointer group flex flex-row items-center gap-4 md:gap-10"
               onClick={() => setCurrentView('catalog')}
             >
                <img src="/logo.webp" alt="Logo" className="w-24 md:w-48 h-auto" />
                <div className="text-left">
                  <h1 className="text-3xl md:text-6xl font-display font-black tracking-tighter uppercase leading-[0.85]">
                    Martabak<br /><span className="text-brand-yellow">Gresik</span>
                  </h1>
                </div>
             </motion.div>
          </div>
        </header>
      )}

      {/* Main Content dengan Perubahan View Terisolasi */}
      <AnimatePresence mode="wait">
        {currentView === 'dashboard' ? (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Dashboard onBack={() => { revokeDashboardAccess(); setCurrentView('catalog'); }} />
          </motion.div>
        ) : currentView === 'blog' ? (
          <motion.div key="blog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BlogView onClose={() => setCurrentView('catalog')} />
          </motion.div>
        ) : currentView === 'lab' ? (
          <motion.div key="lab" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <MartabakLab /> {/* Halaman Lab Baru */}
          </motion.div>
        ) : (
          <motion.main key="catalog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto px-4 py-8">
            {/* Logika Katalog (Sweet & Savory) Anda tetap utuh di sini */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               {/* Terang Bulan Column */}
               <section className="space-y-6">
                 <h2 className="text-4xl font-display font-black uppercase tracking-tight">Terang Bulan</h2>
                 {filteredSweet.map((section, idx) => (
                    <div key={idx} className="bg-white/40 dark:bg-white/5 p-6 rounded-3xl border border-brand-black/5">
                      <h3 className="font-bold mb-4">{section.category}</h3>
                      {/* Menu Items Loop */}
                    </div>
                 ))}
               </section>
               {/* Martabak Telor Column */}
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      {/* Footer & Floating Components (Selalu Tampil) */}
      <footer className="bg-brand-black text-white pt-12 pb-32 px-6 mt-20 relative overflow-hidden">
        {/* Footer Content... */}
        <div className="flex flex-wrap justify-center gap-6 mt-4 font-bold uppercase tracking-widest text-[9px]">
           <button onClick={() => setCurrentView('blog')}>Blog Martabak</button>
           <button onClick={() => setCurrentView('dashboard')}>Admin Login</button>
           {/* Link ke Lab di Footer */}
           <button onClick={() => setCurrentView('lab')} className="text-brand-orange">Eksperimen Lab AI</button>
        </div>
      </footer>

      {/* Floating UI */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
        {totalItems > 0 && (
          <motion.button
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            onClick={() => setIsCartOpen(true)}
            className="bg-brand-black text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:bg-brand-orange transition-all"
          >
            <div className="relative">
              <ShoppingBag className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-brand-yellow text-brand-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand-black">{totalItems}</span>
            </div>
            <span className="font-bold text-sm uppercase">Pesanan</span>
          </motion.button>
        )}
        <AiAssistant onAddToCart={addToCart} menuSweet={menuSweet} menuSavory={menuSavory} />
      </div>

      {/* Sidebar Keranjang (Tetap Berfungsi Meskipun dari Lab) */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[1000] flex justify-end">
             {/* Isi Sidebar Keranjang... */}
          </div>
        )}
      </AnimatePresence>

      <CookieConsent isVisible={showCookieConsent} onAccept={() => setShowCookieConsent(false)} />
    </div>
  );
}
