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
          initial={{ y: 40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full px-4 sm:w-auto sm:px-0 z-[2000] flex justify-center"
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-black/5 dark:border-white/10 p-3 sm:p-2 sm:pr-2.5 sm:pl-4 rounded-3xl sm:rounded-full shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] w-full sm:w-auto max-w-md">
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="bg-brand-orange/10 p-1.5 rounded-full flex-shrink-0">
                <Cookie className="w-4 h-4 text-brand-orange" />
              </div>
              <p className="text-[12px] font-medium text-brand-black/70 dark:text-white/70 leading-snug flex-1">
                Kami menggunakan cookies untuk pengalaman yang lebih lezat.
              </p>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:border-l sm:border-black/10 sm:dark:border-white/10 sm:pl-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5 dark:border-white/5">
              <button
                onClick={onViewPrivacy}
                className="text-[11px] font-bold text-brand-black/40 dark:text-white/40 hover:text-brand-orange transition-colors px-2 py-1.5"
              >
                Detail
              </button>
              
              <button
                onClick={onAccept}
                className="bg-brand-black dark:bg-white text-white dark:text-brand-black px-5 py-1.5 rounded-full font-bold text-[11px] hover:bg-brand-orange dark:hover:bg-brand-orange dark:hover:text-white transition-colors active:scale-95 flex items-center gap-1.5"
              >
                Mengerti
              </button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
