import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, Check } from 'lucide-react';

interface CookieConsentProps {
  onAccept: () => void;
  onViewPrivacy: () => void;
  isVisible: boolean;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept, onViewPrivacy, isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] md:w-auto md:min-w-[400px] z-[2000]"
        >
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-brand-black/10 dark:border-brand-yellow/20 p-2.5 pl-4 pr-3 rounded-full shadow-lg">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 bg-brand-orange/10 p-1.5 rounded-full">
                <Cookie className="w-4 h-4 text-brand-orange" />
              </div>
              <p className="text-[11px] md:text-xs font-bold text-brand-black dark:text-white/90 whitespace-nowrap">
                Kami menggunakan cookies untuk pengalaman yang lebih lezat.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={onViewPrivacy}
                className="text-[10px] uppercase font-black tracking-widest text-brand-black/40 dark:text-white/40 hover:text-brand-orange transition-colors px-2 py-1"
              >
                Detail
              </button>
              
              <button
                onClick={onAccept}
                className="bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black px-4 py-2 rounded-full font-black uppercase text-[10px] tracking-wider flex items-center gap-1.5 hover:bg-brand-orange dark:hover:bg-brand-orange dark:hover:text-white transition-all shadow-md active:scale-95"
              >
                <Check className="w-3 h-3" />
                OK!
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
