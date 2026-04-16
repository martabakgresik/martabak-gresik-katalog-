import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Languages, ArrowUp, ShoppingBag } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

interface FloatingActionsProps {
  totalItems: number;
  onViewCart: () => void;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({
  totalItems,
  onViewCart
}) => {
  const { uiState, setUiLang, t } = useAppStore();
  const { uiLang, showBackToTop, currentView } = uiState;

  return (
    <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex flex-col gap-3 md:gap-4 items-end pointer-events-none">
        <button
          onClick={() => setUiLang(uiLang === "id" ? "en" : "id")}
          className="px-4 py-2 rounded-full bg-white/95 dark:bg-brand-black border-2 border-brand-black dark:border-brand-yellow text-brand-black dark:text-white shadow-xl font-black text-[10px] uppercase tracking-wide flex items-center gap-2 hover:scale-105 transition-transform pointer-events-auto"
          title={uiLang === "id" ? "Ganti bahasa ke English" : "Switch language to Bahasa Indonesia"}
          aria-label={uiLang === "id" ? "Ganti bahasa ke English" : "Switch language to Bahasa Indonesia"}
        >
          <Languages className="w-4 h-4" />
          {uiLang === "id" ? "Bahasa ID" : "English"}
        </button>
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="p-3 md:p-4 bg-brand-orange text-white rounded-full shadow-2xl hover:bg-brand-black dark:hover:bg-brand-yellow dark:hover:text-brand-black transition-all group active:scale-90 pointer-events-auto"
              title={t.backToTop}
            >
              <ArrowUp className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-y-1 transition-transform" />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(totalItems > 0 && currentView !== 'cart') && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={onViewCart}
              className="w-auto md:bg-brand-black bg-brand-black text-white px-6 py-4 md:px-8 md:py-5 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2 md:gap-3 hover:bg-brand-orange hover:scale-105 hover:shadow-brand-orange/50 transition-all group animate-[pulse_2s_ease-in-out_infinite] pointer-events-auto"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 animate-[bounce_2s_infinite]" />
                <span className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-brand-yellow text-brand-black text-[9px] md:text-[10px] font-black w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center border-2 border-brand-black">
                  {totalItems}
                </span>
              </div>
              <span className="font-bold text-sm md:text-base pr-1 md:pr-2 tracking-wide uppercase">{t.viewOrder}</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
  );
};
