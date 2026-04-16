import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface CartNotificationProps {
  lastItemName: string | null;
  onViewCart: () => void;
}

export const CartNotification: React.FC<CartNotificationProps> = ({ lastItemName, onViewCart }) => {
  const { t } = useAppStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (lastItemName) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [lastItemName]);

  return (
    <AnimatePresence>
      {isVisible && lastItemName && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
        >
          <div className="bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black p-4 rounded-[1.5rem] shadow-2xl flex items-center gap-4 border-2 border-white/10 dark:border-black/5 backdrop-blur-md">
            <div className="bg-green-500 rounded-full p-2 shrink-0 animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase opacity-60 leading-none mb-1">Berhasil Ditambah!</p>
              <p className="text-xs font-black truncate">{lastItemName}</p>
            </div>

            <button
              onClick={() => {
                onViewCart();
                setIsVisible(false);
              }}
              className="bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 p-2.5 rounded-xl flex items-center gap-2 transition-all group"
            >
              <span className="text-[10px] font-black uppercase whitespace-nowrap">Lihat</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
