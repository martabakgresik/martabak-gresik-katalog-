import React from "react";
import { motion } from "motion/react";
import { ChevronDown, HelpCircle, X, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import type { UiLang } from "../hooks/useUiLanguage";
import { FAQS_BY_LANG, FAQ_UI_TEXT } from "../data/i18n/faqCopy";

export const FAQ = ({ uiLang = "id", isPage = false, onClose }: { uiLang?: UiLang, isPage?: boolean, onClose?: () => void }) => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const faqs = FAQS_BY_LANG[uiLang];
  const text = FAQ_UI_TEXT[uiLang];

  const Container = isPage ? 'div' : motion.div;
  const innerClasses = isPage 
    ? "relative w-full max-w-4xl mx-auto bg-white dark:bg-brand-black min-h-screen pt-12"
    : "relative w-full max-w-2xl bg-white dark:bg-brand-black rounded-[2.5rem] border-4 border-brand-black dark:border-brand-yellow w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl";

  return (
    <Container
      initial={isPage ? undefined : { opacity: 0 }}
      animate={isPage ? undefined : { opacity: 1 }}
      className={isPage ? "min-h-screen bg-neutral-50 dark:bg-brand-black pb-20 mt-16 md:mt-24" : "fixed inset-0 z-[1200] flex items-center justify-center bg-brand-black/60 backdrop-blur-sm p-4"}
    >
      <motion.div
        initial={isPage ? { opacity: 0, y: 10 } : { opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={innerClasses}
      >
        {!isPage && (
          <div className="p-6 bg-brand-black text-white flex justify-between items-center shrink-0">
            <h3 className="text-xl font-black uppercase italic tracking-tighter">{text.title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
          </div>
        )}
        
        <div className={`p-6 md:p-8 custom-scrollbar space-y-4 ${isPage ? '' : 'overflow-y-auto flex-grow'}`}>
          {isPage && (
            <div className="flex items-center justify-between mb-8">
               <Link
                 to="/"
                 onClick={onClose}
                 className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest text-brand-orange hover:bg-brand-orange/10 px-4 py-2 rounded-full transition-all no-underline"
               >
                 <ArrowLeft className="w-3 h-3" /> Back to Catalog
               </Link>
            </div>
          )}

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-brand-orange/20 rounded-xl text-brand-orange">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight dark:text-brand-yellow">{text.title}</h2>
          <p className="text-xs font-bold text-brand-black/40 dark:text-white/40">{text.subtitle}</p>
        </div>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className="border-2 border-brand-black/5 dark:border-white/5 rounded-2xl overflow-hidden bg-white/50 dark:bg-white/5 backdrop-blur-sm"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-brand-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <span className="font-bold text-sm md:text-base dark:text-white pr-4">{faq.question}</span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <ChevronDown className="w-5 h-5 text-brand-orange" />
              </motion.div>
            </button>
            <motion.div
              initial={false}
              animate={{ 
                height: openIndex === index ? "auto" : 0,
                opacity: openIndex === index ? 1 : 0
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 text-sm leading-relaxed text-brand-black/70 dark:text-white/70 font-medium border-t border-brand-black/5 dark:border-white/5 mt-2">
                {faq.answer}
              </div>
            </motion.div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-6 bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black rounded-[2rem] text-center space-y-3">
        <p className="text-sm font-bold">{text.moreQuestions}</p>
        <a 
          href="https://wa.me/6281330763633?text=Halo%20Admin,%20saya%20ingin%20bertanya..."
          target="_blank"
          className="inline-flex items-center gap-2 px-6 py-2 bg-brand-orange text-white rounded-full font-black text-xs uppercase tracking-wider hover:scale-105 transition-transform"
        >
          {text.contactAdmin}
        </a>
      </div>
      </div>
      </motion.div>
    </Container>
  );
};
