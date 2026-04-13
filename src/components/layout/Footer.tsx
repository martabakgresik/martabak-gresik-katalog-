import React from "react";
import { Link } from "react-router-dom";
import { 
  Download, ImageIcon, QrCode, BookOpen, ExternalLink, MessageCircleQuestionIcon
} from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

export const Footer: React.FC = () => {
  const { uiState, storeSettings, setCurrentView, t } = useAppStore();
  const { storePhone, storeName } = storeSettings;

  return (
    <footer className="bg-brand-black text-white pt-12 pb-44 md:pb-12 px-6 mt-20 relative overflow-hidden">
        {/* Wavy Background Element */}
        <div className="absolute top-0 left-0 w-full h-16 bg-brand-yellow rounded-b-[100%] -translate-y-8" />

        <div className="max-w-6xl mx-auto text-center relative z-10 flex flex-col items-center">
          <h2 className="text-3xl font-display font-black text-brand-yellow uppercase mb-4">{storeName}</h2>
          <p className="opacity-60 text-sm max-w-md mb-8">
            {t.footerDescription}
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <a
              href="/katalog.webp"
              download
              className="bg-brand-orange text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-white hover:text-brand-orange transition-all shadow-lg text-sm uppercase tracking-wider active:scale-95"
            >
              <Download className="w-4 h-4" />
              {t.downloadCatalog}
            </a>
            <a
              href="/martabak-gresik.apk"
              download
              className="bg-brand-yellow text-brand-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-brand-orange hover:text-white transition-all shadow-lg text-sm uppercase tracking-wider active:scale-95"
            >
              <Download className="w-4 h-4" />
              {t.downloadApp}
            </a>
          </div>
          <p className="text-[10px] font-bold opacity-30 mt-4 max-w-xs mx-auto">
             *Instal APK secara manual jika belum tersedia di Play Store.
          </p>

          <div className="w-full pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] md:text-xs text-white/40">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
              <p className="italic font-medium">{t.priceNote}</p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-2">
              <p className="font-bold">
                Deliciously Coded by <a href="https://ariftirtana.my.id" target="_blank" rel="noopener noreferrer" className="text-brand-yellow hover:text-brand-orange transition-colors cursor-pointer">Arif Tirtana</a>
              </p>
              <div className="flex items-center gap-2">
                <Link 
                  to="/gallery" 
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-brand-yellow/20 hover:text-brand-yellow rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 group"
                >
                  <ImageIcon className="w-3 h-3 text-brand-white group-hover:text-brand-yellow transition-colors" />
                  Gallery
                </Link>
                <Link 
                  to="/qr" 
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-brand-yellow/20 hover:text-brand-yellow rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 group"
                >
                  <QrCode className="w-3 h-3 text-brand-white group-hover:text-brand-yellow transition-colors" />
                  QR Generator
                </Link>
                <Link 
                  to="/converter" 
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-brand-yellow/20 hover:text-brand-yellow rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 group"
                >
                  <ImageIcon className="w-3 h-3 text-brand-white group-hover:text-brand-yellow transition-colors" />
                  {t.converterTitle}
                </Link>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 mt-4 md:mt-0 font-bold uppercase tracking-widest text-[9px] md:text-[10px]">
              <Link 
                to="/blog"
                onClick={() => { 
                  setCurrentView('blog'); 
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-brand-white hover:text-brand-yellow hover:underline transition-all flex items-center gap-1"
              >
                <BookOpen className="w-3 h-3" /> {t.blogLink}
              </Link>
              <Link 
                to="/terms"
                onClick={() => { setCurrentView('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-brand-yellow transition-colors"
              >
                {t.terms}
              </Link>
              <Link 
                to="/privacy"
                onClick={() => { setCurrentView('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-brand-yellow transition-colors"
              >
                {t.privacy}
              </Link>
              <Link 
                to="/deletion"
                onClick={() => { setCurrentView('deletion'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-brand-yellow transition-colors"
              >
                {t.deletion}
              </Link>
              <Link 
                to="/about"
                onClick={() => { setCurrentView('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-brand-yellow transition-colors"
              >
                About Me
              </Link>
              <Link 
                to="/faq"
                onClick={() => { setCurrentView('faq'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-brand-yellow transition-colors"
              >
                {t.faq}
              </Link>
              <a 
                href="https://invoice.martabakgresik.my.id/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-yellow transition-colors flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                InvoiceGenerator
              </a>
            </div>
            
            <div className="flex gap-6">
              <a href={`https://wa.me/${storePhone.replace(/\s/g, '').replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-yellow transition-colors flex items-center gap-1.5 font-bold">
                <MessageCircleQuestionIcon className="w-3.5 h-3.5" />
                {t.feedback}
              </a>
            </div>
          </div>
        </div>
      </footer>
  );
};
