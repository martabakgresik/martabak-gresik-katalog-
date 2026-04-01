import React, { memo } from 'react';
import { MenuCard } from './MenuCard';

interface MenuSectionProps {
  title: string;
  items: any[];
  type: 'sweet' | 'savory';
  isFavorite: (name: string, category?: string) => boolean;
  onFavoriteToggle: (item: any) => void;
  onShare: (item: any) => void;
  onAddToCart: (item: any) => void;
  onImageLoad?: (src: string) => void;
}

export const MenuSection = memo(({
  title,
  items,
  type,
  isFavorite,
  onFavoriteToggle,
  onShare,
  onAddToCart,
  onImageLoad,
}: MenuSectionProps) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1 bg-brand-orange rounded-full" />
        <h2 className="text-xl md:text-2xl font-black dark:text-brand-yellow whitespace-nowrap">
          {title}
        </h2>
        <div className="flex-1 h-1 bg-brand-orange rounded-full" />
      </div>

      {/* Grid of Menu Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {items.map((item, idx) => (
          <MenuCard
            key={`${item.name}-${idx}`}
            name={item.name}
            price={item.price}
            image={item.image || '/placeholder.webp'}
            description={item.description}
            category={item.category || title}
            isBestSeller={item.isBestSeller}
            isAvailable={item.isAvailable !== false}
            isFavorite={isFavorite(item.name, item.category || title)}
            onFavoriteToggle={() =>
              onFavoriteToggle({
                name: item.name,
                price: item.price,
                category: item.category || title,
              })
            }
            onShare={() =>
              onShare({
                name: item.name,
                price: item.price,
                category: item.category || title,
              })
            }
            onAddToCart={() =>
              onAddToCart({
                name: item.name,
                price: item.price,
                image: item.image || '/placeholder.webp',
                description: item.description,
                category: item.category || title,
              })
            }
            onImageLoad={onImageLoad}
          />
        ))}
      </div>
    </section>
  );
});

MenuSection.displayName = 'MenuSection';
