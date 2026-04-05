import React from 'react';
import { motion } from 'motion/react';
import { X, ArrowLeft, Mail, Globe, Github, Instagram, MessageCircle } from 'lucide-react';
import type { UiLang } from '../hooks/useUiLanguage';

interface AboutMeProps {
  onClose: () => void;
  uiLang: UiLang;
}

const ABOUT_COPY: Record<UiLang, {
  title: string;
  role: string;
  sections: Array<{ heading: string; body: string }>;
  contactLabel: string;
  backToCatalog: string;
}> = {
  id: {
    title: 'Tentang Arif Tirtana',
    role: 'Developer & Food Enthusiast',
    sections: [
      {
        heading: 'Halo, Saya Arif Tirtana!',
        body: 'Saya adalah pengembang dan desainer di balik katalog digital Martabak Gresik ini. Berbekal pengalaman lebih dari 10 tahun di industri kreatif dan pengembangan perangkat lunak, saya berdedikasi melahirkan solusi digital yang tidak hanya fungsional, tetapi juga memiliki estetika visual premium. Melalui website interaktif ini, saya ingin memastikan Anda mendapatkan pengalaman "nyemil" yang modern, praktis, dan menyenangkan.'
      },
      {
        heading: 'Visi & Misi',
        body: 'Misi utama saya adalah menjembatani kesenjangan antara teknologi modern dan UMKM lokal melalui inovasi digital. Dimulai dari Martabak Gresik, saya berkomitmen mendigitalkan ekosistem kuliner tradisional agar lebih efisien, transparan, dan kompetitif, dengan tetap mengedepankan kualitas visual serta pengalaman pengguna yang premium.'
      },
      {
        heading: 'Hubungi Saya',
        body: 'Jika Anda tertarik berkolaborasi, membutuhkan solusi digital kreatif, atau sekadar ingin berdiskusi mengenai teknologi, saya sangat terbuka untuk berbagi. Hubungi saya langsung melalui WhatsApp atau media sosial untuk respon yang lebih personal.'
      }
    ],
    contactLabel: 'Hubungi Kami',
    backToCatalog: 'Kembali ke Katalog'
  },
  en: {
    title: 'About Arif Tirtana',
    role: 'Developer & Food Enthusiast',
    sections: [
      {
        heading: 'Hi, I\'m Arif Tirtana!',
        body: 'I\'m the developer and designer behind this Martabak Gresik digital catalog. With over 10 years of experience in the creative industry and software development, I am dedicated to building digital solutions that are not only functional, but also have a premium visual aesthetic. Through this interactive website, I want to ensure you get a modern, practical, and enjoyable snacking experience.'
      },
      {
        heading: 'Vision & Mission',
        body: 'My main mission is to bridge the gap between modern technology and local MSMEs through digital innovation. Starting with Martabak Gresik, I am committed to digitizing the traditional culinary ecosystem to make it more efficient, transparent, and competitive, while still prioritizing premium visual quality and user experience.'
      },
      {
        heading: 'Contact Me',
        body: 'If you are interested in collaborating, need creative digital solutions, or simply want to discuss technology, I am always open to sharing. Contact me directly via WhatsApp or social media for a more personal response.'
      }
    ],
    contactLabel: 'Contact Us',
    backToCatalog: 'Back to Catalog'
  }
};

export const AboutMe: React.FC<AboutMeProps> = ({ onClose, uiLang }) => {
  const content = ABOUT_COPY[uiLang];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-3xl bg-white dark:bg-brand-black rounded-[2rem] shadow-2xl overflow-hidden border border-white/20"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-brand-yellow dark:bg-brand-black/90 dark:backdrop-blur-md p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-brand-orange to-brand-yellow rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <img 
                src="/logo.webp" 
                alt="Martabak Gresik Logo" 
                className="relative w-26 h-26 md:w-24 md:h-24 object-contain"
              />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-black uppercase text-brand-black dark:text-brand-yellow leading-tight">
                {content.title}
              </h2>
              <p className="text-[10px] md:text-xs font-bold text-brand-white uppercase tracking-widest mt-0.5">{content.role}</p>
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
        <div className="p-6 md:p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-brand-orange to-brand-yellow rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <img 
                src="/ariftitana.webp" 
                alt="Arif Tirtana" 
                className="relative w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-white dark:border-brand-black shadow-2xl"
              />
            </div>
          </div>

          {content.sections.map((section, idx) => (
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

          {/* Social Links */}
          <div className="flex justify-center gap-6 py-4">
             <a href="https://ariftirtana.my.id" target="_blank" rel="noopener noreferrer" className="p-4 bg-brand-black dark:bg-white/10 text-white rounded-2xl hover:bg-brand-orange transition-all shadow-lg group">
                <Globe className="w-6 h-6 group-hover:scale-110 transition-transform" />
             </a>
             <a href="https://github.com/arekgresikid" target="_blank" rel="noopener noreferrer" className="p-4 bg-brand-black dark:bg-white/10 text-white rounded-2xl hover:bg-brand-orange transition-all shadow-lg group">
                <Github className="w-6 h-6 group-hover:scale-110 transition-transform" />
             </a>
             <a href="https://instagram.com/ayick13" target="_blank" rel="noopener noreferrer" className="p-4 bg-brand-black dark:bg-white/10 text-white rounded-2xl hover:bg-brand-orange transition-all shadow-lg group">
                <Instagram className="w-6 h-6 group-hover:scale-110 transition-transform" />
             </a>
             <a href="https://wa.me/6281330763633?text=Halo%20Arif%20Tirtana%2C%20saya%20tertarik%20untuk%20berkolaborasi%20mengenai%20pengembangan%20digital%20seperti%20katalog%20Martabak%20Gresik%20ini." target="_blank" rel="noopener noreferrer" className="p-4 bg-brand-black dark:bg-white/10 text-white rounded-2xl hover:bg-brand-orange transition-all shadow-lg group">
                <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
             </a>
          </div>

          {/* Footer of Content */}
          <div className="pt-8 border-t border-black/5 dark:border-white/10 flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex items-center gap-2 text-brand-orange font-bold uppercase text-[10px] tracking-widest bg-brand-orange/10 px-4 py-1.5 rounded-full">
                <Mail className="w-3.5 h-3.5" />
                {content.contactLabel}: martabakgresik@gmail.com
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-8 py-3 bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black rounded-full font-black uppercase tracking-wider text-sm hover:bg-brand-orange dark:hover:bg-brand-orange dark:hover:text-white transition-all shadow-lg active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              {content.backToCatalog}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
