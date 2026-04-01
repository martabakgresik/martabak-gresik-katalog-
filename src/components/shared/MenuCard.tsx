import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Heart, Share2, Plus } from 'lucide-react';
import { formatPrice } from '../../hooks/useCart';

interface MenuCardProps {
  name: string;
  price: number;
  image: string;
  description?: string;
  category?: string;
  isBestSeller?: boolean;
  isAvailable?: boolean;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onShare: () => void;
  onAddToCart: () => void;
  onImageLoad?: (src: string) => void;
}

export const MenuCard = memo(({
  name,
  price,
  image,
  description,
  category,
  isBestSeller,
  isAvailable = true,
  isFavorite,
  onFavoriteToggle,
  onShare,
  onAddToCart,
  onImageLoad,
}: MenuCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -100px 0px' }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-white/5 border border-brand-black/10 dark:border-white/10 rounded-2xl overflow-hidden group shadow-md hover:shadow-xl transition-shadow duration-300 ${
        !isAvailable ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-brand-yellow/10">
        <img
          src={image}
          alt={name}
          loading="lazy"
          decoding="async"
          onLoad={() => onImageLoad?.(image)}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {isBestSeller && (
          <div className="absolute top-2 left-2 bg-brand-orange text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg">
            ⭐ BEST SELLER
          </div>
        )}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-xs">STOK HABIS</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onFavoriteToggle}
            className={`p-2.5 rounded-full backdrop-blur-sm shadow-lg transition-all ${
              isFavorite
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-brand-black hover:bg-white'
            }`}
            title={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
          >
            <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onShare}
            className="p-2.5 bg-white/80 hover:bg-white text-brand-black rounded-full backdrop-blur-sm shadow-lg transition-all"
            title="Bagikan"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {category && (
          <p className="text-[10px] font-black uppercase text-brand-orange leading-none">
            {category}
          </p>
        )}
        <h3 className="text-sm font-black dark:text-white line-clamp-2 leading-tight">
          {name}
        </h3>
        {description && (
          <p className="text-[11px] text-brand-black/60 dark:text-white/60 line-clamp-2">
            {description}
          </p>
        )}

        {/* Price & Button */}
        <div className="flex items-center justify-between gap-2 pt-2">
          <div className="text-sm font-black dark:text-brand-yellow">
            {formatPrice(price)}
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onAddToCart}
            disabled={!isAvailable}
            className="flex-1 py-2.5 bg-brand-orange hover:brightness-110 disabled:opacity-50 text-white rounded-lg font-black text-[11px] flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            PESAN
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

MenuCard.displayName = 'MenuCard';
