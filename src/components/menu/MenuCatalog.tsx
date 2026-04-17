import React from "react";
import { motion } from "motion/react";
import { Trophy, Info, Heart, CircleSlash, Plus, ShoppingBag } from "lucide-react";
import { SEO } from "../SEO";
import { SEO_COPY } from "../../data/i18n/seoCopy";
import { useAppStore } from "../../store/useAppStore";

interface MenuCatalogProps {
  filteredSweet: any[];
  filteredSavory: any[];
  imagesLoaded: Record<string, boolean>;
  handleImageLoad: (src: string) => void;
  setZoomedImage: (img: { src: string; alt: string } | null) => void;
  toggleFavorite: (item: any) => void;
  isFavorite: (name: string, category?: string) => boolean;
  handleOpenAddonModal: (item: any, type: 'sweet' | 'savory') => void;
  formatPrice: (price: number) => string;
}

export const MenuCatalog: React.FC<MenuCatalogProps> = ({
  filteredSweet,
  filteredSavory,
  imagesLoaded,
  handleImageLoad,
  setZoomedImage,
  toggleFavorite,
  isFavorite,
  handleOpenAddonModal,
  formatPrice
}) => {
  const { uiState, t } = useAppStore();
  const { uiLang } = uiState;

  return (
    <motion.main 
      key="catalog"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      id="menu-section" 
      className="max-w-7xl mx-auto px-4 py-8 md:py-12 scroll-mt-8"
    >
      <SEO 
        title={SEO_COPY[uiLang].catalog.title}
        description={SEO_COPY[uiLang].catalog.description}
        url="https://martabakgresik.my.id"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Sweet Martabak Column */}
        <section className="space-y-6 md:space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-1 w-12 bg-brand-black dark:bg-brand-yellow rounded-full" />
            <h2 className="text-4xl font-display font-black uppercase tracking-tight dark:text-brand-yellow">{t.sweetTitle}</h2>
          </div>
          <div className="relative flex justify-center w-full max-w-md h-48 md:h-64 mx-auto -mt-2 mb-4 drop-shadow-xl hover:scale-105 transition-transform duration-500">
            {!imagesLoaded['/terang-bulan.webp'] && <div className="absolute inset-0 bg-black/5 dark:bg-white/5 animate-pulse rounded-3xl" />}
            <img
              src="/terang-bulan.webp"
              srcSet="/terang-bulan-320w.webp 320w, /terang-bulan-640w.webp 640w, /terang-bulan-960w.webp 960w"
              sizes="(max-width: 768px) 90vw, 450px"
              alt="Ilustrasi Terang Bulan"
              className={`w-full h-full object-contain transition-opacity duration-500 ${imagesLoaded['/terang-bulan.webp'] ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => handleImageLoad('/terang-bulan.webp')}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>

          <div className="space-y-6">
            {filteredSweet.map((section, idx) => (
              <motion.div
                key={section.category}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/40 dark:bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-brand-black/5 dark:border-white/5"
              >
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-brand-orange rounded-full" />
                  {section.category}
                </h3>
            <div className="space-y-3">
              {section.items.map((item) => (
                 <article key={item.name} className="flex flex-col gap-2 group relative">
                   <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {('image' in item) && (
                        <div 
                          className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-black/5 dark:bg-white/5 overflow-hidden flex-shrink-0 animate-pulse-once cursor-pointer ring-2 ring-transparent hover:ring-brand-orange transition-all relative"
                          onClick={() => setZoomedImage({src: (item as any).image, alt: item.name})}
                        >
                          <img src={(item as any).image} alt={item.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.style.setProperty('display', 'none'); }} />
                          {(item as any).isBestSeller && (
                            <div className="absolute top-0 left-0 bg-yellow-400 text-yellow-900 text-[6px] font-black px-1 py-0.5 rounded-br shadow-sm uppercase z-10 flex items-center gap-0.5">
                              <Trophy className="w-1.5 h-1.5" /> 
                            </div>
                          )}
                        </div>
                      )}
                        <h4 className={`font-medium ${item.highlight ? 'text-brand-orange' : 'text-brand-black dark:text-white'} flex items-center gap-1.5 min-w-0 text-base`}>
                         <span className="whitespace-normal leading-tight">{item.name}</span>
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             handleOpenAddonModal({ name: item.name, price: item.price, category: section.category, image: (item as any).image, description: (item as any).description }, 'sweet');
                           }}
                           className="opacity-40 hover:opacity-100 hover:text-brand-orange transition-all p-0.5 flex-shrink-0"
                           title="Detail Produk"
                         >
                           <span className="sr-only">Detail</span>
                           <Info className="w-3.5 h-3.5" />
                         </button>
                       </h4>
                    </div>
                    <div className="hidden sm:block flex-grow border-b border-dotted border-brand-black/20 dark:border-white/20 mx-2 group-hover:border-brand-orange/50 transition-colors" />
                    <div className="flex flex-col items-end flex-shrink-0 ml-auto mr-1">
                      <div className="flex items-center gap-1.5">
                        {(item as any).original_price && (item as any).original_price > item.price && (
                          <span className="text-[10px] md:text-xs text-zinc-600 dark:text-zinc-400 line-through decoration-red-600 decoration-2">
                            {formatPrice((item as any).original_price)}
                          </span>
                        )}
                        <span className="font-bold tabular-nums dark:text-brand-yellow text-sm md:text-base">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          onClick={() => toggleFavorite({ name: item.name, price: item.price, category: section.category })}
                          className={`p-1.5 rounded-full transition-all active:scale-90 ${isFavorite(item.name, section.category)
                            ? 'bg-brand-orange text-white'
                            : 'bg-brand-black/5 dark:bg-white/10 text-brand-black dark:text-white hover:bg-brand-orange/20'
                            }`}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite(item.name, section.category) ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => (item as any).isAvailable !== false && handleOpenAddonModal({ name: item.name, price: item.price, category: section.category, image: (item as any).image, description: (item as any).description }, 'sweet')}
                          disabled={(item as any).isAvailable === false}
                          className={`p-1.5 rounded-full transition-colors active:scale-90 ${(item as any).isAvailable === false 
                            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' 
                            : 'bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black hover:bg-brand-orange hover:text-white'}`}
                        >
                          {(item as any).isAvailable === false ? <CircleSlash className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  {(item as any).isAvailable === false && (
                    <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[1px] flex items-center justify-center rounded-2xl pointer-events-none z-[5]">
                       <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase italic tracking-widest shadow-lg shadow-red-500/20">{t.soldOut}</span>
                    </div>
                  )}
                  </article>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Savory Martabak Column */}
    <section className="space-y-6 md:space-y-8">
      <div className="flex items-center gap-4 mb-2">
        <div className="h-1 w-12 bg-brand-black dark:bg-brand-yellow rounded-full" />
        <h2 className="text-4xl font-display font-black uppercase tracking-tight dark:text-brand-yellow">{t.savoryTitle}</h2>
      </div>
      <div className="relative flex justify-center w-full max-w-md h-48 md:h-64 mx-auto -mt-2 mb-4 drop-shadow-xl hover:scale-105 transition-transform duration-500">
        {!imagesLoaded['/martabak.webp'] && <div className="absolute inset-0 bg-black/5 dark:bg-white/5 animate-pulse rounded-3xl" />}
        <img
          src="/martabak.webp"
          srcSet="/martabak-320w.webp 320w, /martabak-640w.webp 640w, /martabak-960w.webp 960w"
          sizes="(max-width: 768px) 90vw, 450px"
          alt="Ilustrasi Martabak Telor"
          className={`w-full h-full object-contain transition-opacity duration-500 ${imagesLoaded['/martabak.webp'] ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => handleImageLoad('/martabak.webp')}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>

      <div className="space-y-8">
        {filteredSavory.map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="bg-brand-black dark:bg-black text-white p-8 rounded-[2rem] shadow-2xl shadow-brand-black/20 dark:border dark:border-white/10"
          >
            <h3 className="text-3xl font-display font-black text-brand-yellow uppercase mb-8 italic">
              {section.title}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {section.variants.map((variant) => (
                <div key={variant.type} className="space-y-4">
                  <h4 className="text-brand-orange font-bold text-lg italic border-b border-brand-orange/30 pb-2">
                    {variant.type}
                  </h4>
                  <div className="space-y-3">
                    {variant.prices.map((p) => (
                       <article key={p.qty} className="flex justify-between items-center gap-2 bg-white/5 p-2 rounded-xl hover:bg-white/10 transition-colors shadow-sm relative">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {('image' in p) && (
                            <div 
                              className="w-10 h-10 rounded-lg bg-black/20 overflow-hidden flex-shrink-0 animate-pulse-once cursor-pointer ring-2 ring-transparent hover:ring-brand-orange transition-all relative"
                              onClick={() => setZoomedImage({src: (p as any).image, alt: `${section.title} ${variant.type}`})}
                            >
                              <img src={(p as any).image} alt={`${p.qty} Telor`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.style.setProperty('display', 'none'); }} />
                              {(p as any).isBestSeller && (
                                <div className="absolute top-0 left-0 bg-yellow-400 text-yellow-900 text-[6px] font-black px-1 py-0.5 rounded-br shadow-sm uppercase z-10 flex items-center gap-0.5">
                                  <Trophy className="w-1.5 h-1.5" /> 
                                </div>
                              )}
                            </div>
                          )}
                          <h5 className="text-sm font-medium opacity-90 flex items-center gap-1.5 min-w-0">
                            <span className="whitespace-normal leading-tight">{p.desc ? p.desc : t.eggs(p.qty)}</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenAddonModal({
                                  name: `${section.title} (${variant.type} - ${p.desc ? p.desc : t.eggs(p.qty)})`,
                                  price: p.price,
                                  image: (p as any).image,
                                  description: (variant as any).description
                                }, 'savory');
                              }}
                              className="opacity-40 hover:opacity-100 hover:text-brand-orange transition-all p-0.5 flex-shrink-0"
                              title="Detail Produk"
                            >
                              <span className="sr-only">Detail</span>
                              <Info className="w-3 h-3" />
                            </button>
                          </h5>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0 ml-auto">
                          <div className="flex items-center gap-1.5">
                            {(p as any).original_price && (p as any).original_price > p.price && (
                              <span className="text-[9px] text-zinc-500 dark:text-zinc-400 line-through decoration-red-600 decoration-2">
                                {formatPrice((p as any).original_price)}
                              </span>
                            )}
                            <span className="font-bold text-brand-yellow text-sm">{formatPrice(p.price)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 ml-1">
                            <button
                              onClick={() => toggleFavorite({
                                name: `${section.title} (${variant.type} - ${p.desc ? p.desc : t.eggs(p.qty)})`,
                                price: p.price
                              })}
                              className={`p-1.5 rounded-full transition-all active:scale-90 ${isFavorite(`${section.title} (${variant.type} - ${p.desc ? p.desc : t.eggs(p.qty)})`)
                                ? 'bg-brand-orange text-white'
                                : 'bg-white/10 text-brand-yellow hover:bg-brand-orange/20'
                                }`}
                            >
                              <Heart className={`w-4 h-4 ${isFavorite(`${section.title} (${variant.type} - ${p.desc ? p.desc : t.eggs(p.qty)})`) ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={() => (p as any).isAvailable !== false && handleOpenAddonModal({
                                name: `${section.title} (${variant.type} - ${p.desc ? p.desc : t.eggs(p.qty)})`,
                                price: p.price,
                                image: (p as any).image,
                                description: (variant as any).description
                              }, 'savory')}
                              disabled={(p as any).isAvailable === false}
                              className={`p-1.5 rounded-full transition-colors active:scale-90 ${(p as any).isAvailable === false 
                                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' 
                                : 'bg-brand-yellow text-brand-black hover:bg-brand-orange hover:text-white'}`}
                            >
                              {(p as any).isAvailable === false ? <CircleSlash className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        {(p as any).isAvailable === false && (
                          <div className="absolute inset-0 bg-white/20 dark:bg-black/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl pointer-events-none z-[5]">
                            <span className="text-[10px] font-black text-red-500 tracking-[0.2em] italic uppercase bg-white/90 dark:bg-zinc-950 px-2 py-0.5 rounded shadow-sm border border-red-500/20 underline decoration-red-500">{t.soldOut.toUpperCase()}</span>
                          </div>
                        )}
                       </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Ordering Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="mt-16 bg-white dark:bg-white/5 p-8 rounded-[2rem] border-4 border-brand-black dark:border-brand-yellow/20"
      >
        <h3 className="text-2xl font-black uppercase mb-6 text-center italic dark:text-brand-yellow">{t.orderOnlineTitle}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              name: "GrabFood",
              color: "bg-[#00B14F]",
              url: "https://r.grab.com/o/R7F36f6j",
              icon: ShoppingBag
            },
            { name: "GoFood", color: "bg-[#EE2737]", url: "https://gofood.co.id/surabaya/restaurant/martabak-gresik-drojogan-usman-sadar-no-10-84fc235a-673a-4163-a15c-d7ca0b077a4e", icon: ShoppingBag },
            { name: "ShopeeFood", color: "bg-[#EE4D2D]", url: "https://spf.shopee.co.id/qeqAKpT0c", icon: ShoppingBag },
          ].map((app) => (
            <a
              key={app.name}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${app.color} !text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform active:scale-95 shadow-lg text-center`}
            >
              <app.icon className="w-5 h-5 shrink-0 text-white" />
              {app.name}
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  </div>
    </motion.main>
  );
};
