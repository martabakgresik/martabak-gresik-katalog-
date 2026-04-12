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
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-brand-black/10 dark:border-brand-yellow/20 p-4 md:p-2.5 md:pl-4 md:pr-3 rounded-3xl md:rounded-full shadow-2xl">
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="flex-shrink-0 bg-brand-orange/10 p-2 rounded-full">
                <Cookie className="w-5 h-5 text-brand-orange" />
              </div>
              <p className="text-[11px] md:text-xs font-bold text-brand-black dark:text-white/90 leading-tight">
                Kami menggunakan cookies untuk pengalaman yang lebih lezat.
              </p>
            </div>
            
            <div className="flex items-center gap-4 md:gap-2 w-full md:w-auto justify-center md:justify-start pt-2 md:pt-0 border-t md:border-t-0 border-brand-black/5 dark:border-white/5">
              <button
                onClick={onViewPrivacy}
                className="text-[10px] uppercase font-black tracking-widest text-brand-black/40 dark:text-white/40 hover:text-brand-orange transition-colors px-2 py-1"
              >
                Detail
              </button>
              
              <button
                onClick={onAccept}
                className="bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black px-6 md:px-4 py-2.5 md:py-2 rounded-full font-black uppercase text-[10px] tracking-wider flex items-center gap-1.5 hover:bg-brand-orange dark:hover:bg-brand-orange dark:hover:text-white transition-all shadow-md active:scale-95"
              >
                <Check className="w-3.5 h-3.5 md:w-3 md:h-3" />
                OK!
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
