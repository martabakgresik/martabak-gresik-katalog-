import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie } from 'lucide-react';

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
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="fixed bottom-4 sm:bottom-6 left-0 right-0 px-4 z-[2000] flex justify-center pointer-events-none"
        >
          <div className="pointer-events-auto flex items-center justify-between gap-3 sm:gap-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-black/5 dark:border-white/10 p-2 pl-3 sm:pl-4 pr-2 rounded-[1.25rem] sm:rounded-full shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] w-full max-w-[360px] sm:max-w-max mx-auto ring-1 ring-black/5 dark:ring-white/5">
            
            <div className="flex items-center gap-3 py-1">
              <div className="bg-brand-orange/10 p-2 rounded-full flex-shrink-0">
                <Cookie className="w-4 h-4 sm:w-4 sm:h-4 text-brand-orange" />
              </div>
              <div className="flex flex-col">
                <p className="text-[12px] sm:text-[13px] font-bold text-brand-black dark:text-white leading-tight">
                  Cookies & Privasi
                </p>
                <p className="text-[10px] sm:text-[11px] font-medium text-brand-black/50 dark:text-white/50 leading-snug mt-0.5">
                  Digunakan untuk <button onClick={onViewPrivacy} className="underline decoration-brand-black/20 dark:decoration-white/20 hover:text-brand-orange hover:decoration-brand-orange transition-colors">pengalaman</button> terbaik.
                </p>
              </div>
            </div>
            
            <button
              onClick={onAccept}
              className="bg-brand-black dark:bg-white text-white dark:text-brand-black px-4 sm:px-5 py-2.5 sm:py-2 rounded-[0.85rem] sm:rounded-full font-bold text-[11px] sm:text-[12px] hover:bg-brand-orange dark:hover:bg-brand-orange dark:hover:text-white active:scale-95 transition-all shadow-md flex-shrink-0"
            >
              Terima
            </button>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
