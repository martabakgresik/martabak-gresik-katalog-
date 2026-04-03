import React from "react";
import { motion } from "motion/react";
import { CategoryBlock } from "./CategoryBlock";
import { MenuItem } from "./MenuItem";

interface MenuSectionProps {
  filteredSweet: any[];
  filteredSavory: any[];
  isFavorite: (name: string, category?: string) => boolean;
  toggleFavorite: (item: any) => void;
  onOpenAddonModal: (item: any, type: 'sweet' | 'savory') => void;
  setZoomedImage: (img: {src: string, alt: string}) => void;
  imagesLoaded: Record<string, boolean>;
  handleImageLoad: (src: string) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  filteredSweet, filteredSavory, isFavorite, toggleFavorite, onOpenAddonModal, setZoomedImage,
  imagesLoaded, handleImageLoad
}) => {
  return (
    <motion.main 
      key="catalog"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      id="menu-section" 
      className="max-w-7xl mx-auto px-4 py-8 md:py-12 scroll-mt-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Sweet Martabak Column */}
        <section className="space-y-6 md:space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-1 w-12 bg-brand-black dark:bg-brand-yellow rounded-full" />
            <h2 className="text-4xl font-display font-black uppercase tracking-tight dark:text-brand-yellow">Terang Bulan</h2>
          </div>
          <div className="relative flex justify-center w-full max-w-md h-48 md:h-64 mx-auto -mt-2 mb-4 drop-shadow-xl hover:scale-105 transition-transform duration-500">
            {!imagesLoaded['/terang-bulan.webp'] && <div className="absolute inset-0 bg-black/5 dark:bg-white/5 animate-pulse rounded-3xl" />}
            <img
              src="/terang-bulan.webp"
              alt="Ilustrasi Terang Bulan"
              className={`w-full h-full object-contain transition-opacity duration-500 ${imagesLoaded['/terang-bulan.webp'] ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => handleImageLoad('/terang-bulan.webp')}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>

          <div className="space-y-6">
            {filteredSweet.map((section, idx) => (
              <CategoryBlock 
                key={section.category}
                category={section.category}
                items={section.items}
                isFavorite={isFavorite}
                toggleFavorite={toggleFavorite}
                onOpenAddonModal={onOpenAddonModal}
                setZoomedImage={setZoomedImage}
                index={idx}
              />
            ))}
          </div>
        </section>

        {/* Savory Martabak Column */}
        <section className="space-y-6 md:space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-1 w-12 bg-brand-black dark:bg-brand-yellow rounded-full" />
            <h2 className="text-4xl font-display font-black uppercase tracking-tight dark:text-brand-yellow">Martabak Telor</h2>
          </div>
          <div className="relative flex justify-center w-full max-w-md h-48 md:h-64 mx-auto -mt-2 mb-4 drop-shadow-xl hover:scale-105 transition-transform duration-500">
            {!imagesLoaded['/martabak.webp'] && <div className="absolute inset-0 bg-black/5 dark:bg-white/5 animate-pulse rounded-3xl" />}
            <img
              src="/martabak.webp"
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
                className="bg-white/40 dark:bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-brand-black/5 dark:border-white/5"
              >
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-brand-orange rounded-full" />
                  {section.title}
                </h3>
                <div className="space-y-6">
                  {section.variants.map((variant: any) => (
                    <div key={variant.type} className="space-y-3">
                      <div className="pb-1 border-b border-brand-black/10 dark:border-white/10 flex justify-between items-end">
                        <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange">{variant.type}</h4>
                      </div>
                      <p className="text-[10px] opacity-60 leading-relaxed italic">{variant.description}</p>
                      <div className="grid grid-cols-1 gap-2">
                        {variant.prices.map((p: any) => (
                          <MenuItem 
                            key={`${variant.type}-${p.qty}`}
                            item={{ 
                              ...p, 
                              name: `${section.title} ${variant.type} (${p.desc || `${p.qty} Telor`})`,
                              description: variant.description
                            }}
                            category={section.title}
                            isFavorite={isFavorite(`${section.title} ${variant.type} (${p.desc || `${p.qty} Telor`})`, section.title)}
                            onToggleFavorite={() => toggleFavorite({ 
                              name: `${section.title} ${variant.type} (${p.desc || `${p.qty} Telor`})`, 
                              price: p.price, 
                              category: section.title 
                            })}
                            onOpenAddonModal={() => onOpenAddonModal({ 
                              ...p, 
                              name: `${section.title} ${variant.type} (${p.desc || `${p.qty} Telor`})`,
                              description: variant.description
                            }, 'savory')}
                            setZoomedImage={setZoomedImage}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </motion.main>
  );
};
