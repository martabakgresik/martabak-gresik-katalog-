import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X, Check, ArrowRight } from 'lucide-react';

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
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-[2000]"
        >
          <div className="relative bg-white/20 dark:bg-black/60 backdrop-blur-2xl border border-white/30 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-orange/20 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-brand-yellow/20 blur-3xl rounded-full pointer-events-none" />

            <div className="p-6 md:p-8 relative z-10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-brand-orange text-white rounded-2xl shadow-lg shadow-brand-orange/20 shrink-0 group-hover:rotate-12 transition-transform duration-500">
                  <Cookie className="w-6 h-6" />
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-lg font-black text-brand-black dark:text-brand-yellow uppercase tracking-tight">
                    Pengalaman Lebih Lezat! 🍪
                  </h4>
                  <p className="text-sm text-brand-black/70 dark:text-white/70 leading-relaxed font-medium">
                    Kami menggunakan cookies untuk meningkatkan pengalaman 'nyemil' online Anda di katalog Martabak Gresik. Dengan melanjutkan, Anda menyetujui Kebijakan Privasi kami.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onAccept}
                  className="bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black px-6 py-3 rounded-full font-black uppercase tracking-wider text-[11px] flex items-center gap-2 shadow-xl hover:bg-brand-orange dark:hover:bg-brand-orange dark:hover:text-white transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Siap, Lanjut!
                </motion.button>
                
                <button
                  onClick={onViewPrivacy}
                  className="px-6 py-3 rounded-full font-bold text-brand-black/60 dark:text-white/60 hover:text-brand-orange dark:hover:text-brand-yellow transition-colors text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  Lihat Detail
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Simple Close Button (X) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAccept();
              }}
              className="absolute top-4 right-4 p-3 text-brand-black/30 dark:text-white/30 hover:text-brand-orange transition-colors cursor-pointer z-[2001]"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
