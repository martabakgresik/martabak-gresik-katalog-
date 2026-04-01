import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Share2, Copy, Plus, Minus, Trash2, X } from 'lucide-react';
import { type CartItem, type Addon, formatPrice } from '../hooks/useCart';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onAddToCart: (item: any) => void;
  onRemoveFromCart: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onUpdateNote: (id: string, note: string) => void;
  favorites: any[];
  activeTab: 'cart' | 'favorites';
  onTabChange: (tab: 'cart' | 'favorites') => void;
  onToggleFavorite: (item: any) => void;
  isFavorite: (name: string, category?: string) => boolean;
  totalItems: number;
  onCheckout: () => void;
}

export const CartSidebar = memo(({
  isOpen,
  onClose,
  cart,
  onRemoveFromCart,
  onUpdateQuantity,
  onUpdateNote,
  favorites,
  activeTab,
  onTabChange,
  onToggleFavorite,
  isFavorite,
  totalItems,
  onCheckout,
}: CartSidebarProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-brand-black z-50 overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-brand-black border-b border-brand-black/10 dark:border-white/10 p-4 z-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black dark:text-brand-yellow">
                  {activeTab === 'cart' ? '🛒 Keranjang' : '❤️ Favorit'}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-brand-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => onTabChange('cart')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                    activeTab === 'cart'
                      ? 'bg-brand-orange text-white shadow-md'
                      : 'bg-brand-black/5 dark:bg-white/5 text-brand-black dark:text-white hover:bg-brand-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  Keranjang ({totalItems})
                </button>
                <button
                  onClick={() => onTabChange('favorites')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                    activeTab === 'favorites'
                      ? 'bg-brand-orange text-white shadow-md'
                      : 'bg-brand-black/5 dark:bg-white/5 text-brand-black dark:text-white hover:bg-brand-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  Favorit ({favorites.length})
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {activeTab === 'cart' ? (
                cart.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-brand-black/60 dark:text-white/60 text-sm">Keranjang kosong 🛒</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="bg-brand-black/5 dark:bg-white/5 p-3 rounded-xl border border-brand-black/10 dark:border-white/10 space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-xs dark:text-white">{item.name}</h4>
                            {item.category && <p className="text-[10px] text-brand-black/60 dark:text-white/60">{item.category}</p>}
                          </div>
                          <button
                            onClick={() => onRemoveFromCart(item.id)}
                            className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="p-1 bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black rounded-lg hover:brightness-90 transition-all"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="p-1 bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black rounded-lg hover:brightness-90 transition-all"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <span className="ml-auto font-bold text-xs dark:text-brand-yellow">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>

                        {/* Note */}
                        <textarea
                          value={item.note || ''}
                          onChange={(e) => onUpdateNote(item.id, e.target.value)}
                          placeholder="Catatan khusus..."
                          className="w-full text-[10px] p-2 bg-white dark:bg-white/10 border border-brand-black/10 dark:border-white/10 rounded-lg outline-none focus:ring-1 focus:ring-brand-orange resize-none"
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                )
              ) : (
                favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-brand-black/60 dark:text-white/60 text-sm">Belum ada favorit ❤️</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {favorites.map((item) => (
                      <div
                        key={item.id}
                        className="bg-brand-black/5 dark:bg-white/5 p-3 rounded-xl border border-brand-black/10 dark:border-white/10"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-bold text-xs dark:text-white">{item.name}</h4>
                            {item.category && <p className="text-[10px] text-brand-black/60 dark:text-white/60">{item.category}</p>}
                          </div>
                          <button
                            onClick={() => onToggleFavorite(item)}
                            className="p-1"
                          >
                            <Heart className="w-4 h-4 fill-current text-red-500" />
                          </button>
                        </div>
                        <p className="font-bold text-xs dark:text-brand-yellow mb-2">{formatPrice(item.price)}</p>
                        <button
                          onClick={() => onToggleFavorite(item)}
                          className="w-full py-2 bg-brand-orange text-white rounded-lg font-bold text-[10px] hover:brightness-110 transition-all"
                        >
                          Pesan
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Footer */}
            {activeTab === 'cart' && cart.length > 0 && (
              <div className="sticky bottom-0 bg-white dark:bg-brand-black border-t border-brand-black/10 dark:border-white/10 p-4 space-y-3">
                <button
                  onClick={onCheckout}
                  className="w-full py-3 bg-brand-orange text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all active:scale-95 shadow-lg"
                >
                  Lanjut Checkout →
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

CartSidebar.displayName = 'CartSidebar';
