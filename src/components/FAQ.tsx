import React from "react";
import { motion } from "motion/react";
import { ChevronDown, HelpCircle } from "lucide-react";
import type { UiLang } from "../hooks/useUiLanguage";
import { FAQS_BY_LANG, FAQ_UI_TEXT } from "../data/i18n/faqCopy";

export const FAQ = ({ uiLang = "id" }: { uiLang?: UiLang }) => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const faqs = FAQS_BY_LANG[uiLang];
  const text = FAQ_UI_TEXT[uiLang];

  return (
    <div className="space-y-4 max-w-2xl mx-auto py-4">
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
  );
};
