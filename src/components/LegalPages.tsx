import React from 'react';
import { motion } from 'motion/react';
import { X, ArrowLeft, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { LEGAL_CONTENT } from '../data/i18n/legalCopy';

interface LegalPagesProps {
  type: 'tos' | 'privacy' | 'deletion';
  onClose: () => void;
  isPage?: boolean;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ type, onClose, isPage = false }) => {
  const { uiState } = useAppStore();
  const { uiLang } = uiState;
  const contentByLang = LEGAL_CONTENT;

  const activeLang = contentByLang[uiLang];
  const activeContent = activeLang.content[type];

  const Container = isPage ? 'div' : motion.div;
  const innerClasses = isPage 
    ? "relative w-full max-w-4xl mx-auto bg-white dark:bg-brand-black min-h-screen pt-12"
    : "relative w-full max-w-3xl bg-white dark:bg-brand-black rounded-[2rem] shadow-2xl overflow-hidden border border-white/20";

  return (
    <Container
      initial={isPage ? undefined : { opacity: 0 }}
      animate={isPage ? undefined : { opacity: 1 }}
      exit={isPage ? undefined : { opacity: 0 }}
      className={isPage ? "min-h-screen bg-neutral-50 dark:bg-brand-black pb-20 mt-16 md:mt-24" : "fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md overflow-y-auto"}
    >
      <motion.div
        initial={isPage ? { opacity: 0, y: 10 } : { scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={innerClasses}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-brand-yellow dark:bg-brand-black/90 dark:backdrop-blur-md p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white dark:bg-white/10 rounded-2xl shadow-sm">
              {activeContent.icon}
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-black uppercase text-brand-black dark:text-brand-yellow leading-tight">
                {activeContent.title}
              </h2>
              <p className="text-[10px] md:text-xs font-bold text-brand-orange uppercase tracking-widest mt-0.5">Martabak Gresik</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-brand-black/5 dark:bg-white/10 hover:bg-brand-orange hover:text-white dark:hover:bg-brand-orange transition-all rounded-full group"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Content Body */}
        <div className={`p-6 md:p-10 space-y-8 overflow-y-auto custom-scrollbar ${isPage ? '' : 'max-h-[70vh]'}`}>
          {activeContent.sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-3"
            >
              <h3 className="text-lg md:text-xl font-black text-brand-black dark:text-brand-yellow flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-orange rounded-full" />
                {section.heading}
              </h3>
              <p className="text-sm md:text-base text-brand-black/70 dark:text-white/70 leading-relaxed font-medium">
                {section.body}
              </p>
            </motion.div>
          ))}

          {/* Footer of Content */}
          <div className="pt-8 border-t border-black/5 dark:border-white/10 flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex items-center gap-2 text-brand-orange font-bold uppercase text-[10px] tracking-widest bg-brand-orange/10 px-4 py-1.5 rounded-full">
                <Mail className="w-3.5 h-3.5" />
                {activeLang.contactUs}: martabakgresik@gmail.com
              </div>
            </div>
            
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center gap-2 px-8 py-3 bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black rounded-full font-black uppercase tracking-wider text-sm hover:bg-brand-orange dark:hover:bg-brand-orange dark:hover:text-white transition-all shadow-lg active:scale-95 no-underline"
            >
              <ArrowLeft className="w-4 h-4" />
              {activeLang.backToCatalog}
            </Link>
          </div>
        </div>
      </motion.div>
    </Container>
  );
};
