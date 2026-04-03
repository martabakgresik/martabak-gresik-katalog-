import React from "react";
import { motion } from "motion/react";
import { MenuItem } from "./MenuItem";

interface CategoryBlockProps {
  category: string;
  items: any[];
  isFavorite: (name: string, category?: string) => boolean;
  toggleFavorite: (item: any) => void;
  onOpenAddonModal: (item: any, type: 'sweet' | 'savory') => void;
  setZoomedImage: (img: {src: string, alt: string}) => void;
  index: number;
}

export const CategoryBlock: React.FC<CategoryBlockProps> = ({
  category, items, isFavorite, toggleFavorite, onOpenAddonModal, setZoomedImage, index
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/40 dark:bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-brand-black/5 dark:border-white/5"
    >
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="w-2 h-2 bg-brand-orange rounded-full" />
        {category}
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <MenuItem 
            key={item.name}
            item={item}
            category={category}
            isFavorite={isFavorite(item.name, category)}
            onToggleFavorite={() => toggleFavorite({ name: item.name, price: item.price, category })}
            onOpenAddonModal={() => onOpenAddonModal(item, 'sweet')}
            setZoomedImage={setZoomedImage}
          />
        ))}
      </div>
    </motion.div>
  );
};
