import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Send, Sun, Moon, MapPin, Phone, Clock, Search, ChevronDown, ImageIcon, ShoppingBag, Home
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { SCROLL_SPACING } from "../../data/config";
import { useAppStore, useStoreComputed } from "../../store/useAppStore";

interface HeaderProps {
  imagesLoaded: Record<string, boolean>;
  handleImageLoad: (src: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

export const Header: React.FC<HeaderProps> = ({
  imagesLoaded,
  handleImageLoad,
  searchInputRef
}) => {
  const navigate = useNavigate();
  const { 
    uiState, 
    storeSettings, 
    setUiState, 
    toggleDarkMode, 
    setCurrentView,
    setSearchQuery,
    setUiLang,
    t 
  } = useAppStore();
  const { isPromoScheduledActive } = useStoreComputed();

  const {
    showPromo,
    currentView,
    isDarkMode,
    isHoliday,
    isOpen,
    isSearchOpen,
    searchQuery,
    uiLang
  } = uiState;

  const {
    storeName,
    storeAddress,
    storePhone,
    openHour,
    closeHour,
    activePromoCode,
    activePromoPercent,
    isEmergencyClosed
  } = storeSettings;

  const waPhone = (storePhone || "6281330763633").replace(/\D/g, '').replace(/^0/, '62');

  return (
    <>
      {/* Promo Banner */}
      <AnimatePresence>
        {(showPromo && isPromoScheduledActive) && (
          <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            exit={{ y: -50 }}
            className="bg-brand-orange text-brand-black text-[10px] md:text-xs font-bold py-2 px-4 text-center sticky top-0 z-[100] shadow-md flex items-center justify-center gap-2"
          >
            {typeof t?.promoText === 'function' ? t.promoText(activePromoCode, activePromoPercent) : ""}
            <button
              onClick={() => setUiState({ showPromo: false })}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section - Visible only in Catalog/Default views */}
      {currentView !== 'blog' && (
        <header className="relative bg-brand-black dark:bg-black text-white py-12 px-6 overflow-hidden">
        {/* Share Button (Left) */}
        <div className="absolute top-6 left-6 z-20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setUiState({ isGeneralShareOpen: true })}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 text-white backdrop-blur-sm shadow-xl"
            title={t.share}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Right Actions (Language + Theme + Cart) */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
          <button
            onClick={() => setUiLang(uiLang === 'id' ? 'en' : 'id')}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 text-white backdrop-blur-sm shadow-xl font-black text-[10px] tracking-widest transition-all"
            title={uiLang === 'id' ? "Switch to English" : "Ubah ke Bahasa Indonesia"}
          >
            {uiLang.toUpperCase()}
          </button>

          <button
            onClick={() => setCurrentView('cart')}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 text-white backdrop-blur-sm shadow-xl relative"
            title={t.viewCart}
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
          
          <button
            onClick={toggleDarkMode}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 text-white backdrop-blur-sm shadow-xl"
            title={isDarkMode ? t.toLight : t.toDark}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-brand-yellow" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-16 bg-brand-yellow dark:bg-brand-black rounded-t-[100%] translate-y-8" />

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center">
          <div className="mb-8 flex flex-row items-center justify-center gap-4 md:gap-10 w-full">
            <div 
              className="relative cursor-pointer"
              onClick={() => {
                setCurrentView('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate('/');
              }}
            >
              {!imagesLoaded['/logo.webp'] && <div className="absolute inset-0 bg-white/10 animate-pulse rounded-2xl" />}
              <img
                src="/logo.webp"
                alt="Logo"
                className={`w-24 md:w-48 h-auto transition-opacity duration-500 ${imagesLoaded['/logo.webp'] ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => handleImageLoad('/logo.webp')}
              />
            </div>
            <div className="text-left">
              <div className="flex flex-wrap items-center justify-start gap-1.5 md:gap-2 mb-2">
                <div className="bg-brand-yellow text-brand-black px-3 py-0.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest inline-block whitespace-nowrap">
                  Since 2020
                </div>
                <div className={`px-3 py-0.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-1.5 border-2 ${isHoliday ? 'bg-orange-600 border-orange-700' : isOpen ? 'bg-green-500 border-green-600' : 'bg-red-500 border-red-600'} text-white whitespace-nowrap`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${isHoliday || isOpen ? 'bg-white' : 'bg-white/50'}`} />
                  {isHoliday ? t.holidayClosed : isOpen ? t.open : t.closedAt(openHour)}
                </div>
              </div>
              <h1
                className="block text-3xl md:text-5xl font-display font-black tracking-tighter uppercase leading-[0.85] cursor-pointer"
                onClick={() => {
                  setCurrentView('catalog');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  navigate('/');
                }}
              >
                Martabak<br />
                <span className="text-brand-yellow">Gresik</span>
              </h1>
              <p className="text-xs md:text-lg font-medium text-brand-orange italic mt-1">
                {t.heroSubtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm md:text-base opacity-80 w-full">
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4 text-brand-orange" />
              <span>{storeAddress}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-4 h-4 text-brand-orange" />
              <span>{storePhone}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-brand-orange" />
              <span>{t.openingHours}: {openHour}.00 - {closeHour}.00 WIB</span>
            </div>
          </div>

          {/* Shop Status Indicator */}
          <div className="flex justify-center mt-8 mb-4">
            <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 ${
                isOpen 
                  ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
              } font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-lg backdrop-blur-md`}
            >
              <span className={`w-2 h-2 rounded-full animate-pulse ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
              {isEmergencyClosed ? t.emergencyClosed : isHoliday ? t.holidayClosed : isOpen ? t.openNowReady : t.closedNowAt(openHour)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                setCurrentView('catalog');
                setTimeout(() => {
                  document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="bg-brand-orange text-white px-8 py-3 rounded-full font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg hover:shadow-brand-orange/50"
            >
              <ShoppingBag className="w-5 h-5" />
              {t.orderNow}
            </button>
            <Link to="/gallery">
              <button
                className="bg-brand-yellow text-brand-black px-8 py-3 rounded-full font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg hover:shadow-brand-yellow/50 cursor-pointer"
              >
                <ImageIcon className="w-5 h-5" />
                {t.viewGallery}
              </button>
            </Link>
          </div>

          {/* Search Bar - Restored Dynamic Logic */}
          <div className="mt-8 mb-4 flex justify-center w-full max-w-2xl px-4">
            <motion.div 
              initial={false}
              animate={{ 
                width: isSearchOpen || searchQuery ? "100%" : "64px",
              }}
              className={`relative flex items-center shadow-xl rounded-full bg-white dark:bg-black/50 border-4 border-brand-black/10 transition-all overflow-hidden h-16`}
            >
              <button 
                onClick={() => {
                  if (!isSearchOpen && !searchQuery) {
                    setUiState({ isSearchOpen: true });
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                  } else if (isSearchOpen && !searchQuery) {
                    setUiState({ isSearchOpen: false });
                  }
                }}
                className="w-16 h-full flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Search className="h-6 w-6 text-brand-orange" />
              </button>
              
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t.searchHint}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentView !== 'catalog') setCurrentView('catalog');
                }}
                onFocus={() => setUiState({ isSearchOpen: true })}
                onBlur={() => {
                  if (!searchQuery) setUiState({ isSearchOpen: false });
                }}
                className="block flex-grow min-w-0 h-full bg-transparent border-none text-brand-black dark:text-white placeholder:text-brand-black/40 outline-none font-bold text-base md:text-lg pr-2"
                style={{ display: isSearchOpen || searchQuery ? 'block' : 'none' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="w-16 h-full flex items-center justify-center text-brand-black/40 hover:text-brand-orange transition-colors shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <div className={`${SCROLL_SPACING} flex flex-col items-center gap-1 text-brand-orange dark:text-brand-yellow w-full mt-4`}>
             <span className="text-[9px] font-black uppercase tracking-[0.3em] mb-1">{t.scrollMenu}</span>
             <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
        </div> {/* Closes main container (line 116) */}
      </header>
    )}

      {/* Blog specific header overlay */}
      {currentView === 'blog' && (
        <header className="fixed top-0 left-0 w-full bg-brand-black/90 backdrop-blur-md text-white py-4 px-6 z-50 border-b border-white/10">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setCurrentView('catalog'); navigate('/'); }}>
              <img src="/logo.webp" alt="Logo" className="w-10 h-10 object-contain" />
              <span className="font-display font-black uppercase text-brand-yellow">{storeName}</span>
            </div>
            <button onClick={() => { setCurrentView('catalog'); navigate('/'); }} className="text-[10px] font-black uppercase tracking-widest text-brand-orange flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              {t.backCatalog}
            </button>
          </div>
        </header>
      )}
    </>
  );
};
