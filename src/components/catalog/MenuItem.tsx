import React from "react";
import { motion } from "motion/react";
import { Heart, Plus, Trophy, Info, CircleSlash } from "lucide-react";
import { formatPrice } from "../../hooks/useCart";

interface MenuItemProps {
  item: any;
  category: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenAddonModal: () => void;
  setZoomedImage: (img: {src: string, alt: string}) => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  item, category, isFavorite, onToggleFavorite, onOpenAddonModal, setZoomedImage
}) => {
  const isAvailable = item.isAvailable !== false;

  return (
    <div className="flex flex-col gap-2 group relative">
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {item.image && (
            <div 
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-black/5 dark:bg-white/5 overflow-hidden flex-shrink-0 cursor-pointer ring-2 ring-transparent hover:ring-brand-orange transition-all relative"
              onClick={() => setZoomedImage({src: item.image, alt: item.name})}
            >
              <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" loading="lazy" />
              {item.isBestSeller && (
                <div className="absolute top-0 left-0 bg-yellow-400 text-yellow-900 text-[6px] font-black px-1 py-0.5 rounded-br shadow-sm uppercase z-10 flex items-center gap-0.5">
                  <Trophy className="w-1.5 h-1.5" /> 
                </div>
              )}
            </div>
          )}
          <span className={`font-medium ${item.highlight ? 'text-brand-orange' : 'text-brand-black dark:text-white'} flex items-center gap-1.5 min-w-0`}>
            <span className="whitespace-normal leading-tight">{item.name}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); onOpenAddonModal(); }}
              className="opacity-40 hover:opacity-100 hover:text-brand-orange transition-all p-0.5 flex-shrink-0"
              title="Detail Produk"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </span>
        </div>
        <div className="hidden sm:block flex-grow border-b border-dotted border-brand-black/20 dark:border-white/20 mx-2 group-hover:border-brand-orange/50 transition-colors" />
        <div className="flex flex-col items-end flex-shrink-0 ml-auto mr-1">
          <div className="flex items-center gap-1.5">
            {item.original_price && item.original_price > item.price && (
              <span className="text-[10px] md:text-xs text-zinc-600 dark:text-zinc-400 line-through decoration-red-600 decoration-2">
                {formatPrice(item.original_price)}
              </span>
            )}
            <span className="font-bold tabular-nums dark:text-brand-yellow text-sm md:text-base">
              {formatPrice(item.price)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={onToggleFavorite}
              className={`p-1.5 rounded-full transition-all active:scale-90 ${isFavorite
                ? 'bg-brand-orange text-white'
                : 'bg-brand-black/5 dark:bg-white/10 text-brand-black dark:text-white hover:bg-brand-orange/20'
                }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => isAvailable && onOpenAddonModal()}
              disabled={!isAvailable}
              className={`p-1.5 rounded-full transition-colors active:scale-90 ${!isAvailable 
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' 
                : 'bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black hover:bg-brand-orange hover:text-white'}`}
            >
              {!isAvailable ? <CircleSlash className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
      {!isAvailable && (
        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[1px] flex items-center justify-center rounded-2xl pointer-events-none z-[5]">
           <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase italic tracking-widest shadow-lg shadow-red-500/20">Stok Habis</span>
        </div>
      )}
    </div>
  );
};
