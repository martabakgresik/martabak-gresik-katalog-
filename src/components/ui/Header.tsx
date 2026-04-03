import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { 
  Search, X, MapPin, Phone, Clock, ShoppingBag, ImageIcon, Send, Sun, Moon, ChevronDown, Plus 
} from "lucide-react";
import { Link } from "react-router-dom";

interface HeaderProps {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  openHour: number;
  closeHour: number;
  isOpen: boolean;
  isHoliday: boolean;
  isEmergencyClosed: boolean;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  setIsGeneralShareOpen: (open: boolean) => void;
  setCurrentView: (view: 'catalog' | 'blog') => void;
  PROMO_TEXT: string;
  showPromo: boolean;
  setShowPromo: (show: boolean) => void;
  imagesLoaded: Record<string, boolean>;
  handleImageLoad: (src: string) => void;
  SCROLL_SPACING: string;
}

export const Header: React.FC<HeaderProps> = ({
  storeName, storeAddress, storePhone, openHour, closeHour, isOpen, isHoliday, isEmergencyClosed,
  isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery, isDarkMode, setIsDarkMode,
  setIsGeneralShareOpen, setCurrentView, PROMO_TEXT, showPromo, setShowPromo,
  imagesLoaded, handleImageLoad, SCROLL_SPACING
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="relative bg-brand-black dark:bg-black text-white py-12 px-6 overflow-hidden">
      {/* Share Button (Left) */}
      <div className="absolute top-6 left-6 z-20">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsGeneralShareOpen(true)}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 text-white backdrop-blur-sm shadow-xl"
          title="Bagikan"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-20">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 text-white backdrop-blur-sm shadow-xl"
          title={isDarkMode ? "Ganti ke Terang" : "Ganti ke Gelap"}
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-brand-yellow" /> : <Moon className="w-5 h-5" />}
        </motion.button>
      </div>

      {/* Wavy Background Element */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-brand-yellow dark:bg-brand-black rounded-t-[100%] translate-y-8" />

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center">
        <div className="mb-8 flex flex-row items-center justify-center gap-4 md:gap-10 w-full">
          <motion.div 
            className="relative cursor-pointer group"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setCurrentView('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              window.history.pushState({}, '', '/');
            }}
          >
            {!imagesLoaded['/logo.webp'] && <div className="absolute inset-0 bg-white/10 animate-pulse rounded-2xl" />}
            <img
              src="/logo.webp"
              alt={`${storeName} Logo`}
              className={`w-24 md:w-48 h-auto shrink-0 transition-opacity duration-500 ${imagesLoaded['/logo.webp'] ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => handleImageLoad('/logo.webp')}
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="text-left">
            <div className="flex flex-wrap items-center justify-start gap-1.5 md:gap-2 mb-2">
              <div className="bg-brand-yellow text-brand-black px-3 py-0.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest inline-block whitespace-nowrap">
                Since 2020
              </div>
              <div className={`px-3 py-0.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-1.5 border-2 ${isHoliday ? 'bg-orange-600 border-orange-700' : isOpen ? 'bg-green-500 border-green-600' : 'bg-red-500 border-red-600'} text-white whitespace-nowrap`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${isHoliday || isOpen ? 'bg-white' : 'bg-white/50'}`} />
                {isHoliday ? 'LIBUR (TUTUP)' : isOpen ? 'BUKA' : 'TUTUP (Buka 16:00)'}
              </div>
            </div>
            <motion.h1
              className="text-3xl md:text-6xl font-display font-black tracking-tighter uppercase leading-[0.85] cursor-pointer hover:text-brand-yellow transition-colors"
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setCurrentView('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                window.history.pushState({}, '', '/');
              }}
            >
              Martabak<br />
              <span className="text-brand-yellow font-display">Gresik</span>
            </motion.h1>
            <p className="text-xs md:text-2xl font-medium text-brand-orange italic mt-1 md:mt-2">
              Terang Bulan dan Martabak Telor
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm md:text-base opacity-80 w-full"
        >
          <button className="flex items-center justify-center gap-2 hover:text-brand-orange transition-colors cursor-pointer group">
            <MapPin className="w-4 h-4 text-brand-orange group-hover:scale-110 transition-transform" />
            <span className="underline decoration-transparent hover:decoration-brand-orange transition-colors">{storeAddress}</span>
          </button>
          <a href={`tel:${storePhone.replace(/\s/g, '')}`} className="flex items-center justify-center gap-2 hover:text-brand-orange transition-colors cursor-pointer">
            <Phone className="w-4 h-4 text-brand-orange" />
            <span className="underline decoration-transparent hover:decoration-brand-orange transition-colors">{storePhone}</span>
          </a>
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-brand-orange" />
            <span>Jam Buka: {openHour}.00 - {closeHour}.00 WIB</span>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 mb-4 flex justify-center w-full max-w-2xl px-4"
        >
          <motion.div 
            initial={false}
            animate={{ 
              width: isSearchOpen || searchQuery ? "100%" : "64px",
              maxWidth: isSearchOpen || searchQuery ? "42rem" : "64px"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`relative flex items-center shadow-xl rounded-full bg-white dark:bg-black/50 border-4 ${
              isSearchOpen || searchQuery ? 'border-brand-black/10 dark:border-brand-yellow/20 focus-within:border-brand-orange focus-within:ring-4 focus-within:ring-brand-orange/20' : 'border-brand-orange/50 dark:border-brand-yellow/50'
            } transition-colors overflow-hidden h-16`}
          >
            <button 
              onClick={() => {
                if (!isSearchOpen && !searchQuery) {
                  setIsSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                } else if (isSearchOpen && !searchQuery) {
                   setIsSearchOpen(false);
                }
              }}
              className={`w-16 h-full flex items-center justify-center shrink-0 ${!isSearchOpen && !searchQuery ? 'cursor-pointer hover:bg-brand-black/5 dark:hover:bg-white/5' : ''}`}
            >
              <Search className={`h-6 w-6 ${!isSearchOpen && !searchQuery ? 'text-brand-orange dark:text-brand-yellow' : 'text-brand-black/40 dark:text-white/40'}`} />
            </button>
            
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Cari menu (Misal: Keju, Ayam, sapi, Pandan)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (window.location.pathname !== '/') {
                   setCurrentView('catalog');
                }
              }}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => {
                if (!searchQuery) setIsSearchOpen(false);
              }}
              className="block flex-grow min-w-0 h-full bg-transparent border-none text-brand-black dark:text-white placeholder:text-brand-black/40 dark:placeholder:text-white/40 outline-none font-bold text-base md:text-lg pr-2"
              style={{ display: isSearchOpen || searchQuery ? 'block' : 'none' }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="w-16 h-full flex items-center justify-center text-brand-black/40 hover:text-brand-orange transition-colors shrink-0"
              >
                <div className="bg-brand-black/5 p-2 rounded-full">
                  <X className="h-5 w-5" />
                </div>
              </button>
            )}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className={`${SCROLL_SPACING} flex flex-col items-center gap-1 text-brand-orange dark:text-brand-yellow w-full`}
        >
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center"
          >
            <span className="text-[9px] font-black uppercase tracking-[0.3em] mb-1">Scroll Menu Below</span>
            <ChevronDown className="w-5 h-5 animate-pulse" />
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
};
