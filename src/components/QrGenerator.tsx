import React, { useState, useRef } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { motion, AnimatePresence } from 'motion/react';
import { 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  ArrowLeft, 
  Image as ImageIcon, 
  Type, 
  Settings2,
  Share2,
  RefreshCw,
  Palette,
  ChevronDown,
  Globe,
  MapPin,
  Instagram,
  MessageCircle
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { UI_COPY } from '../data/i18n/appCopy';
import { SEO } from './SEO';
import { SEO_COPY } from '../data/i18n/seoCopy';

const PRESETS = [
  { 
    name: 'Katalog', 
    url: 'https://martabakgresik.my.id', 
    icon: Globe,
    color: 'bg-blue-500/10 text-blue-500'
  },
  { 
    name: 'Maps', 
    url: 'https://maps.app.goo.gl/hQUez8CW4wTCXYg3A', 
    icon: MapPin,
    color: 'bg-red-500/10 text-red-500'
  },
  { 
    name: 'Instagram', 
    url: 'https://instagram.com/martabakgresik', 
    icon: Instagram,
    color: 'bg-pink-500/10 text-pink-500'
  },
  { 
    name: 'WhatsApp', 
    url: `https://wa.me/${(() => { const p = "6281330763633"; return p.startsWith('0') ? '62' + p.slice(1) : p; })()}?text=Halo%20Martabak%20Gresik!`, 
    icon: MessageCircle,
    color: 'bg-green-500/10 text-green-500'
  },
];

export const QrGenerator: React.FC = () => {
  const { uiState } = useAppStore();
  const { uiLang } = uiState;
  const t = UI_COPY[uiLang];

  const [text, setText] = useState('https://martabakgresik.my.id');
  const [size, setSize] = useState(300);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fgColor, setFgColor] = useState('#000000');
  const [includeImage, setIncludeImage] = useState(true);
  const [imageSrc, setImageSrc] = useState('/metaseo.webp');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [qrStyle, setQrStyle] = useState<'squares' | 'dots'>('squares');
  const [eyeRadius, setEyeRadius] = useState(0);
  
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = () => {
    setIsDownloading(true);
    const canvas = qrRef.current?.querySelector('canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `martabak-qr-${Date.now()}.png`;
      link.href = url;
      link.click();
    }
    setTimeout(() => setIsDownloading(false), 1000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-brand-yellow dark:bg-brand-black text-brand-black dark:text-brand-yellow p-4 md:p-8 flex flex-col items-center">
      <SEO 
        title={SEO_COPY[uiLang].qr.title}
        description={SEO_COPY[uiLang].qr.description}
        url="https://martabakgresik.my.id/qr"
      />
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-5xl flex items-center justify-between mb-8"
      >
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 font-bold uppercase tracking-tighter hover:text-brand-orange transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> {t.back}
        </button>
        <div className="flex items-center gap-2">
          <div className="bg-brand-orange p-2 rounded-xl">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">{t.qrTitle}</h1>
        </div>
        <div className="w-20 hidden md:block" /> {/* Spacer */}
      </motion.div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left: Configuration */}
        <motion.div 
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Main Input */}
          <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-brand-black/5 dark:border-white/10 p-6 rounded-[2.5rem] shadow-xl">
            <div className="flex items-center gap-2 mb-4 text-brand-orange">
              <Type className="w-5 h-5" />
              <h2 className="font-black uppercase italic tracking-wider text-sm">{t.qrContent}</h2>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="..."
              className="w-full max-w-md bg-white/50 dark:bg-black/50 border-2 border-brand-black/10 dark:border-white/10 p-4 rounded-2xl font-bold focus:border-brand-orange outline-none transition-all h-24 resize-none text-sm"
            />
            <div className="flex flex-wrap items-center justify-between mt-4 gap-4">
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setText(preset.url)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${preset.color}`}
                  >
                    <preset.icon className="w-3 h-3" />
                    {preset.name}
                  </button>
                ))}
              </div>
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
              >
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                {copied ? t.copiedShort : t.copyMessage}
              </button>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Appearance */}
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-brand-black/5 dark:border-white/10 p-6 rounded-[2.5rem] shadow-xl overflow-hidden">
              <button 
                onClick={() => setIsAppearanceOpen(!isAppearanceOpen)}
                className="w-full flex items-center justify-between text-brand-orange group"
              >
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  <h2 className="font-black uppercase italic tracking-wider text-sm">{t.qrAppearance}</h2>
                </div>
                <motion.div
                  animate={{ rotate: isAppearanceOpen ? 180 : 0 }}
                  className="p-1 rounded-full bg-brand-orange/10 group-hover:bg-brand-orange/20 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {isAppearanceOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: "auto", opacity: 1, marginTop: 24 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase opacity-60">{t.qrStyle}</label>
                      <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-lg">
                        <button 
                          onClick={() => setQrStyle('squares')}
                          className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all ${qrStyle === 'squares' ? 'bg-brand-orange text-white shadow-md' : 'opacity-40'}`}
                        >
                          Squares
                        </button>
                        <button 
                          onClick={() => setQrStyle('dots')}
                          className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all ${qrStyle === 'dots' ? 'bg-brand-orange text-white shadow-md' : 'opacity-40'}`}
                        >
                          Dots
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between">
                        <label className="text-[10px] font-black uppercase opacity-60">{t.qrEyeRadius}</label>
                        <span className="text-[10px] font-bold">{eyeRadius}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="24" 
                        step="4"
                        value={eyeRadius} 
                        onChange={(e) => setEyeRadius(parseInt(e.target.value))}
                        className="w-full accent-brand-orange h-1 bg-brand-black/10 dark:bg-white/10 rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase opacity-60">{t.qrFgColor}</label>
                      <input 
                        type="color" 
                        value={fgColor} 
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-8 h-8 rounded-lg bg-transparent cursor-pointer overflow-hidden border-none"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase opacity-60">{t.qrBgColor}</label>
                      <input 
                        type="color" 
                        value={bgColor} 
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-8 h-8 rounded-lg bg-transparent cursor-pointer overflow-hidden border-none"
                      />
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between">
                        <label className="text-[10px] font-black uppercase opacity-60">{t.qrSize}</label>
                        <span className="text-[10px] font-bold">{size}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="128" 
                        max="512" 
                        step="8"
                        value={size} 
                        onChange={(e) => setSize(parseInt(e.target.value))}
                        className="w-full accent-brand-orange h-1 bg-brand-black/10 dark:bg-white/10 rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Logo Customization */}
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-brand-black/5 dark:border-white/10 p-6 rounded-[2.5rem] shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-brand-orange">
                  <ImageIcon className="w-5 h-5" />
                  <h2 className="font-black uppercase italic tracking-wider text-sm">{t.qrLogo}</h2>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={includeImage} 
                    onChange={() => setIncludeImage(!includeImage)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-brand-black/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange"></div>
                </label>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/50 dark:bg-black/50 border-2 border-dashed border-brand-black/10 dark:border-white/20 flex items-center justify-center overflow-hidden shrink-0">
                    {includeImage && (
                      <img src={imageSrc} alt="Preview" className="w-12 h-12 object-contain" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="w-full bg-brand-orange text-white text-[10px] font-black uppercase py-2 px-4 rounded-xl cursor-pointer hover:scale-105 transition-transform flex items-center justify-center gap-2">
                       {t.qrSelectLogo}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={!includeImage} />
                    </label>
                    <button 
                      onClick={() => setImageSrc('/metaseo.webp')}
                      className="w-full mt-2 text-[9px] font-black uppercase opacity-40 hover:opacity-100 transition-opacity"
                    >
                      {t.qrResetLogo}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Preview */}
        <motion.div 
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <div className="sticky top-24 w-full flex flex-col items-center">
            <div className="bg-brand-black text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-xl border border-white/10">
              {t.qrLivePreview}
            </div>

            <motion.div 
              id="qr-container"
              ref={qrRef}
              whileHover={{ scale: 1.02 }}
              className="p-8 bg-white rounded-[3rem] shadow-2xl relative group"
              style={{ backgroundColor: bgColor }}
            >
              <QRCode
                value={text}
                size={size}
                bgColor={bgColor}
                fgColor={fgColor}
                qrStyle={qrStyle}
                eyeRadius={eyeRadius}
                quietZone={20}
                logoImage={includeImage ? imageSrc : undefined}
                logoWidth={size * 0.2}
                logoHeight={size * 0.2}
                logoOpacity={1}
                removeQrCodeBehindLogo={true}
              />
              
              {/* Decorative Corner */}
              <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-brand-orange rounded-tl-2xl" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-brand-orange rounded-br-2xl" />
            </motion.div>

            <div className="mt-12 grid grid-cols-2 gap-4 w-full px-4 md:px-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadQRCode}
                className="bg-brand-orange text-white py-4 rounded-3xl font-black uppercase italic flex items-center justify-center gap-3 shadow-xl shadow-brand-orange/20"
              >
                {isDownloading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {t.qrDownload}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (navigator.share) {
                    const canvas = qrRef.current?.querySelector('canvas');
                    canvas?.toBlob((blob) => {
                      if (blob) {
                        const file = new File([blob], "martabak-qr.png", { type: "image/png" });
                        navigator.share({
                          title: 'QR Code Martabak Gresik',
                          files: [file],
                        }).catch(() => {});
                      }
                    });
                  } else {
                    alert("Sharing tidak didukung di browser ini. Silakan download gambar.");
                  }
                }}
                className="bg-brand-black dark:bg-white text-white dark:text-brand-black py-4 rounded-3xl font-black uppercase italic flex items-center justify-center gap-3 shadow-xl"
              >
                <Share2 className="w-5 h-5" />
                {t.qrShare}
              </motion.button>
            </div>

            <p className="mt-8 text-[10px] font-black uppercase opacity-40 text-center max-w-xs leading-relaxed">
              {t.qrNote}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer Decoration */}
      <div className="mt-20 opacity-10 pointer-events-none select-none">
        <h2 className="text-[15vw] font-black uppercase italic tracking-tighter leading-none text-center">MARTABAK GRESIK</h2>
      </div>
    </div>
  );
};
