import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Image as ImageIcon, 
  ArrowLeft, 
  Home,
  X, 
  Download, 
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Tag,
  Camera,
  Utensils
} from 'lucide-react';
import { SEO } from './SEO';
import { useUiLanguage } from '../hooks/useUiLanguage';
import { GALLERY_TEXT } from '../data/i18n/galleryCopy';

type Category = 'all' | 'savory' | 'sweet' | 'promo' | 'sticker';

interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  category: Exclude<Category, 'all'>;
  title: string;
  subCategory?: string;
}

// Full Asset definitions covering ALL items
const GALLERY_ITEMS: GalleryItem[] = [
  // PROMOTIONS
  { id: 'p1', src: '/iklan-martabak.png', alt: 'Promo Martabak Gresik', category: 'promo', title: 'Banner Promo Utama' },
  { id: 'p2', src: '/katalog.webp', alt: 'Katalog Visual', category: 'promo', title: 'Katalog Lengkap' },
  { id: 'p3', src: '/metaseo.webp', alt: 'SEO Visual', category: 'promo', title: 'Asset SEO' },
  { id: 'p4', src: '/iklan-martabak-2.webp', alt: 'Promo Baru Martabak Gresik', category: 'promo', title: 'Banner Promo 2' },
  
  // STICKERS
  { id: 'st1', src: '/stiker-martabak.png', alt: 'Stiker Maskot', category: 'sticker', title: 'Mascot Sticker' },

  // SAVORY (MARTABAK TELOR)
  { id: 'sv1', src: '/images/savory/martabak.webp', alt: 'Martabak Telor', category: 'savory', title: 'Martabak Telor Ayam/Bebek', subCategory: 'Daging Sapi/Ayam' },
  { id: 'sv2', src: '/images/savory/samyang-pedas.webp', alt: 'Martabak Samyang', category: 'savory', title: 'Martabak Samyang Pedas', subCategory: 'Menu Pedas' },

  // SWEET (TERANG BULAN) - ORIGINAL BASE
  { id: 'sw-or1', src: '/images/sweet/coklat.webp', alt: 'Terang Bulan Coklat', category: 'sweet', title: 'Terang Bulan Coklat', subCategory: 'Original' },
  { id: 'sw-or2', src: '/images/sweet/keju.webp', alt: 'Terang Bulan Keju', category: 'sweet', title: 'Terang Bulan Keju', subCategory: 'Original' },
  { id: 'sw-or3', src: '/images/sweet/kacang.webp', alt: 'Terang Bulan Kacang', category: 'sweet', title: 'Terang Bulan Kacang', subCategory: 'Original' },
  { id: 'sw-or4', src: '/images/sweet/kacang-coklat.webp', alt: 'Terang Bulan Kacang Coklat', category: 'sweet', title: 'Kacang + Coklat', subCategory: 'Original' },
  { id: 'sw-or5', src: '/images/sweet/kacang-coklat-keju.webp', alt: 'Terang Bulan Special Mix', category: 'sweet', title: 'Kacang + Coklat + Keju', subCategory: 'Original' },
  { id: 'sw-or6', src: '/images/sweet/keju-coklat.webp', alt: 'Terang Bulan Keju Coklat', category: 'sweet', title: 'Keju + Coklat', subCategory: 'Original' },
  { id: 'sw-or7', src: '/images/sweet/keju-kacang.webp', alt: 'Terang Bulan Keju Kacang', category: 'sweet', title: 'Keju + Kacang', subCategory: 'Original' },

  // SWEET - PANDAN BASE
  { id: 'sw-pa1', src: '/images/sweet/pandan-keju.webp', alt: 'Pandan Keju', category: 'sweet', title: 'Pandan Keju', subCategory: 'Pandan Base' },
  { id: 'sw-pa2', src: '/images/sweet/pandan-coklat.webp', alt: 'Pandan Coklat', category: 'sweet', title: 'Pandan Coklat', subCategory: 'Pandan Base' },
  { id: 'sw-pa3', src: '/images/sweet/pandan-kacang.webp', alt: 'Pandan Kacang', category: 'sweet', title: 'Pandan Kacang', subCategory: 'Pandan Base' },
  { id: 'sw-pa4', src: '/images/sweet/pandan-coklat-keju.webp', alt: 'Pandan Coklat Keju', category: 'sweet', title: 'Pandan Coklat Keju', subCategory: 'Pandan Base' },
  { id: 'sw-pa5', src: '/images/sweet/pandan-kacang-keju.webp', alt: 'Pandan Kacang Keju', category: 'sweet', title: 'Pandan Kacang Keju', subCategory: 'Pandan Base' },
  { id: 'sw-pa6', src: '/images/sweet/pandan-kacang-coklat.webp', alt: 'Pandan Kacang Coklat', category: 'sweet', title: 'Pandan Kacang Coklat', subCategory: 'Pandan Base' },
  { id: 'sw-pa7', src: '/images/sweet/pandan-kacang-coklat-keju.webp', alt: 'Pandan Komplit', category: 'sweet', title: 'Pandan Kacang Coklat Keju', subCategory: 'Pandan Base' },

  // SWEET - RED VELVET BASE
  { id: 'sw-rv1', src: '/images/sweet/redvelvet-keju.webp', alt: 'Red Velvet Keju', category: 'sweet', title: 'Red Velvet Keju', subCategory: 'Red Velvet' },
  { id: 'sw-rv2', src: '/images/sweet/redvelvet-coklat.webp', alt: 'Red Velvet Coklat', category: 'sweet', title: 'Red Velvet Coklat', subCategory: 'Red Velvet' },
  { id: 'sw-rv3', src: '/images/sweet/redvelvet-kacang.webp', alt: 'Red Velvet Kacang', category: 'sweet', title: 'Red Velvet Kacang', subCategory: 'Red Velvet' },
  { id: 'sw-rv4', src: '/images/sweet/redvelvet-keju-coklat.webp', alt: 'Red Velvet Keju Coklat', category: 'sweet', title: 'Red Velvet Keju Coklat', subCategory: 'Red Velvet' },
  { id: 'sw-rv5', src: '/images/sweet/redvelvet-keju-kacang.webp', alt: 'Red Velvet Keju Kacang', category: 'sweet', title: 'Red Velvet Keju Kacang', subCategory: 'Red Velvet' },
  { id: 'sw-rv6', src: '/images/sweet/redvelvet-kacang-coklat.webp', alt: 'Red Velvet Kacang Coklat', category: 'sweet', title: 'Red Velvet Kacang Coklat', subCategory: 'Red Velvet' },
  { id: 'sw-rv7', src: '/images/sweet/redvelvet-kacang-coklat-keju.webp', alt: 'Red Velvet Komplit', category: 'sweet', title: 'Red Velvet Mix Komplit', subCategory: 'Red Velvet' },

  // SWEET - BLACKFOREST BASE
  { id: 'sw-bf1', src: '/images/sweet/blackforest-keju.webp', alt: 'Blackforest Keju', category: 'sweet', title: 'Blackforest Keju', subCategory: 'Blackforest' },
  { id: 'sw-bf2', src: '/images/sweet/blackforest-coklat.webp', alt: 'Blackforest Coklat', category: 'sweet', title: 'Blackforest Coklat', subCategory: 'Blackforest' },
  { id: 'sw-bf3', src: '/images/sweet/blackforest-kacang.webp', alt: 'Blackforest Kacang', category: 'sweet', title: 'Blackforest Kacang', subCategory: 'Blackforest' },
  { id: 'sw-bf4', src: '/images/sweet/blackforest-keju-coklat.webp', alt: 'Blackforest Keju Coklat', category: 'sweet', title: 'Blackforest Keju Coklat', subCategory: 'Blackforest' },
  { id: 'sw-bf5', src: '/images/sweet/blackforest-keju-kacang.webp', alt: 'Blackforest Keju Kacang', category: 'sweet', title: 'Blackforest Keju Kacang', subCategory: 'Blackforest' },
  { id: 'sw-bf6', src: '/images/sweet/blackforest-kacang-coklat.webp', alt: 'Blackforest Kacang Coklat', category: 'sweet', title: 'Blackforest Kacang Coklat', subCategory: 'Blackforest' },
  { id: 'sw-bf7', src: '/images/sweet/blackforest-kacang-coklat-keju.webp', alt: 'Blackforest Komplit', category: 'sweet', title: 'Blackforest Mix Komplit', subCategory: 'Blackforest' },
];

export const Gallery: React.FC = () => {
  const navigate = useNavigate();
  const { uiLang } = useUiLanguage();
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const t = GALLERY_TEXT[uiLang];

  const filteredItems = GALLERY_ITEMS.filter(item => 
    activeCategory === 'all' || item.category === activeCategory
  );

  const [isZoomed, setIsZoomed] = useState(false);

  const selectedItem = selectedImageIndex !== null ? filteredItems[selectedImageIndex] : null;

  const navigateLightbox = (direction: 'next' | 'prev') => {
    if (selectedImageIndex === null) return;
    let nextIndex = direction === 'next' ? selectedImageIndex + 1 : selectedImageIndex - 1;
    if (nextIndex < 0) nextIndex = filteredItems.length - 1;
    if (nextIndex >= filteredItems.length) nextIndex = 0;
    setSelectedImageIndex(nextIndex);
  };

  // Reset zoom when changing images
  const handleNavigate = (direction: 'next' | 'prev') => {
    setIsZoomed(false);
    navigateLightbox(direction);
  };

  const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: t.all, icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'savory', label: t.savory, icon: <Utensils className="w-4 h-4" /> },
    { id: 'sweet', label: t.sweet, icon: <Camera className="w-4 h-4" /> },
    { id: 'promo', label: t.promo, icon: <Sparkles className="w-4 h-4" /> },
    { id: 'sticker', label: t.sticker, icon: <Tag className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-brand-black text-brand-black dark:text-white pb-20">
      <SEO 
        title={t.seoTitle} 
        description={t.seoDescription}
        url="https://martabakgresik.my.id/gallery"
      />

      {/* Hero Header */}
      <div className="relative h-64 md:h-80 bg-brand-black flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.3, scale: 1 }}
          className="absolute inset-0"
        >
          <img 
            src="/iklan-martabak.png" 
            alt="Background" 
            className="w-full h-full object-cover blur-sm"
          />
        </motion.div>
        
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="p-3 bg-brand-yellow rounded-2xl shadow-xl rotate-3">
              <Camera className="w-8 h-8 text-brand-black" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic text-brand-yellow">
              {t.heroTitle} <span className="text-white">{t.heroHighlight}</span>
            </h1>
            <p className="text-white/60 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">
              {t.heroSubtitle}
            </p>
          </motion.div>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-brand-yellow backdrop-blur-md rounded-full text-white hover:text-brand-black transition-all z-20 group border border-white/20 shadow-xl"
        >
          <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase italic tracking-widest">{t.backToCatalog}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="sticky top-0 z-40 bg-zinc-50/80 dark:bg-brand-black/80 backdrop-blur-xl border-b border-brand-black/5 dark:border-white/5 py-4 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto flex overflow-x-auto gap-2 no-scrollbar pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase italic text-[10px] md:text-xs transition-all shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black shadow-lg scale-105'
                  : 'bg-brand-black/5 dark:bg-white/5 hover:bg-brand-black/10 dark:hover:bg-white/10'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Image Grid */}
      <div className="max-w-7xl mx-auto px-4 mt-12 mb-12">
        <motion.div 
          layout
          className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.02 }}
                className="group relative break-inside-avoid rounded-[2.5rem] overflow-hidden border-4 border-transparent hover:border-brand-yellow transition-all cursor-pointer shadow-xl bg-zinc-100 dark:bg-zinc-900"
                onClick={() => setSelectedImageIndex(index)}
              >
                <img 
                  src={item.src} 
                  alt={item.alt}
                  className="w-full h-auto object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <div className="flex justify-between items-end">
                    <div>
                      {item.subCategory && (
                        <p className="text-brand-yellow font-black uppercase italic text-[10px] mb-1">
                          {item.subCategory}
                        </p>
                      )}
                      <h3 className="text-white font-black uppercase italic text-sm leading-tight">
                        {item.title}
                      </h3>
                    </div>
                    <div className="p-3 bg-brand-yellow rounded-xl shadow-lg shrink-0">
                      <Maximize2 className="w-4 h-4 text-brand-black" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center p-2 sm:p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImageIndex(null)}
              className="absolute inset-0 bg-brand-black/95 backdrop-blur-2xl"
            />
            
            <motion.div
              layoutId={selectedItem.id}
              className="relative w-full max-w-6xl h-full flex flex-col z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Bar - Now fixed at the top with safe area */}
              <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl p-4 md:p-6 rounded-[2rem] border border-white/10 mb-4 shrink-0 shadow-2xl">
                <div className="flex flex-col">
                  <span className="text-brand-yellow font-black uppercase italic text-[8px] md:text-[10px] tracking-widest">
                    {selectedItem.category} {selectedItem.subCategory ? `• ${selectedItem.subCategory}` : ''}
                  </span>
                  <h4 className="text-white font-black uppercase italic text-xs md:text-2xl truncate max-w-[140px] md:max-w-2xl">
                    {selectedItem.title}
                  </h4>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsZoomed(!isZoomed)}
                    className={`p-3 md:p-4 rounded-2xl transition-all shadow-xl flex items-center gap-2 ${isZoomed ? 'bg-brand-yellow text-brand-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    title={t.zoomToggle}
                  >
                    <Maximize2 className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="hidden md:block text-[10px] font-black uppercase italic">{t.zoom}</span>
                  </button>
                  <a 
                    href={selectedItem.src} 
                    download={`martabak-gresik-${selectedItem.id}`}
                    className="p-3 md:p-4 bg-white/10 hover:bg-green-500 text-white rounded-2xl transition-all shadow-xl"
                    title="Download"
                  >
                    <Download className="w-5 h-5 md:w-6 md:h-6" />
                  </a>
                  <button 
                    onClick={() => setSelectedImageIndex(null)}
                    className="p-3 md:p-4 bg-white/10 hover:bg-brand-orange text-white rounded-2xl transition-all shadow-xl"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>
              </div>

              {/* Image Display Area - Fits exactly in remaining space */}
              <div className="flex-grow relative flex items-center justify-center overflow-hidden rounded-[2.5rem] bg-zinc-900/50 border border-white/5 shadow-inner">
                <motion.div 
                  className="w-full h-full flex items-center justify-center p-4 md:px-24 md:py-8"
                  animate={{ scale: isZoomed ? 1.5 : 1 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                >
                  <img 
                    src={selectedItem.src} 
                    alt={selectedItem.alt}
                    className={`max-w-full max-h-full object-contain transition-all duration-500 rounded-xl ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in shadow-2xl'}`}
                    onClick={() => setIsZoomed(!isZoomed)}
                  />
                </motion.div>

                {/* Navigation Buttons - Placed in the 'gutters' created by padding */}
                <div className="absolute inset-y-0 left-0 md:left-4 flex items-center">
                  <button 
                    onClick={() => handleNavigate('prev')}
                    className="p-4 md:p-5 bg-white/5 hover:bg-brand-yellow text-white hover:text-brand-black rounded-3xl backdrop-blur-2xl transition-all shadow-2xl group border border-white/10 active:scale-90 z-20"
                  >
                    <ChevronLeft className="w-8 h-8 md:w-10 md:h-10 group-hover:-translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="absolute inset-y-0 right-0 md:right-4 flex items-center">
                  <button 
                    onClick={() => handleNavigate('next')}
                    className="p-4 md:p-5 bg-white/5 hover:bg-brand-yellow text-white hover:text-brand-black rounded-3xl backdrop-blur-2xl transition-all shadow-2xl group border border-white/10 active:scale-90 z-20"
                  >
                    <ChevronRight className="w-8 h-8 md:w-10 md:h-10 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="flex justify-center gap-1.5 mt-4 opacity-30 select-none shrink-0">
                {filteredItems.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 rounded-full transition-all duration-500 ${i === selectedImageIndex ? 'w-8 bg-brand-yellow' : 'w-1 bg-white'}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="max-w-7xl mx-auto px-4 mt-20 text-center opacity-40">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
          {t.groupedByAi} &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};
