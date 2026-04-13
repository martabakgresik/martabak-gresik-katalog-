import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Image as ImageIcon,
  Upload,
  Download,
  X,
  ArrowLeft,
  Settings2,
  RefreshCw,
  FileDown,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Maximize,
  Archive
} from 'lucide-react';
import JSZip from 'jszip';
import { useAppStore } from '../store/useAppStore';
import { UI_COPY } from '../data/i18n/appCopy';
import { SEO } from './SEO';
import { SEO_COPY } from '../data/i18n/seoCopy';

interface FileItem {
  id: string;
  file: File;
  preview: string;
  status: 'idle' | 'processing' | 'success' | 'error';
  progress: number;
  convertedUrl?: string;
  convertedName?: string;
  error?: string;
}

const SUPPORTED_FORMATS = [
  { label: 'WebP', value: 'image/webp', ext: 'webp' },
  { label: 'JPEG', value: 'image/jpeg', ext: 'jpg' },
  { label: 'PNG', value: 'image/png', ext: 'png' },
  { label: 'AVIF', value: 'image/avif', ext: 'avif' },
];

export const ImageConverter: React.FC = () => {
  const { uiState } = useAppStore();
  const { uiLang } = uiState;
  const t = UI_COPY[uiLang];
  
  const [files, setFiles] = useState<FileItem[]>([]);
  const [targetFormat, setTargetFormat] = useState('image/webp');
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState<number>(2000);
  const [maxHeight, setMaxHeight] = useState<number>(2000);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const newItems: FileItem[] = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: 'idle',
      progress: 0
    }));
    setFiles(prev => [...prev, ...newItems]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const item = prev.find(f => f.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      if (item?.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
      return prev.filter(f => f.id !== id);
    });
  };

  const clearAll = () => {
    files.forEach(f => {
      URL.revokeObjectURL(f.preview);
      if (f.convertedUrl) URL.revokeObjectURL(f.convertedUrl);
    });
    setFiles([]);
  };

  const convertFile = async (item: FileItem) => {
    if (item.status === 'success' || item.status === 'processing') return;

    setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'processing', progress: 10 } : f));

    try {
      const img = new Image();
      const reader = new FileReader();

      await new Promise((resolve, reject) => {
        reader.onload = (e) => {
          img.src = e.target?.result as string;
          img.onload = resolve;
          img.onerror = reject;
        };
        reader.readAsDataURL(item.file);
      });

      let width = img.width;
      let height = img.height;

      // Maintain aspect ratio while resizing
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: targetFormat !== 'image/jpeg' });
      if (!ctx) throw new Error('Canvas context not available');

      // Better image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, progress: 60 } : f));

      const blob = await new Promise<Blob | null>(resolve => {
        canvas.toBlob(
          b => resolve(b),
          targetFormat,
          targetFormat === 'image/png' ? undefined : quality / 100
        );
      });

      if (!blob) throw new Error('Conversion failed');

      const formatInfo = SUPPORTED_FORMATS.find(f => f.value === targetFormat);
      const convertedName = `${item.file.name.split('.')[0]}.${formatInfo?.ext || 'bin'}`;
      const convertedUrl = URL.createObjectURL(blob);

      setFiles(prev => prev.map(f => f.id === item.id ? { 
        ...f, 
        status: 'success', 
        progress: 100, 
        convertedUrl, 
        convertedName 
      } : f));

    } catch (err) {
      setFiles(prev => prev.map(f => f.id === item.id ? { 
        ...f, 
        status: 'error', 
        error: (err as Error).message 
      } : f));
    }
  };

  const convertAll = async () => {
    for (const file of files) {
      if (file.status === 'idle') {
        await convertFile(file);
      }
    }
  };

  const downloadFile = (item: FileItem) => {
    if (!item.convertedUrl || !item.convertedName) return;
    const link = document.createElement('a');
    link.href = item.convertedUrl;
    link.download = item.convertedName;
    link.click();
  };

  const downloadAll = () => {
    files.forEach(f => {
      if (f.status === 'success') {
        downloadFile(f);
      }
    });
  };

  const downloadZip = async () => {
    const successfulFiles = files.filter(f => f.status === 'success' && f.convertedUrl && f.convertedName);
    if (successfulFiles.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      for (const file of successfulFiles) {
        const response = await fetch(file.convertedUrl!);
        const blob = await response.blob();
        zip.file(file.convertedName!, blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `martabak-gresik-converted-${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("ZIP Error:", err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-yellow dark:bg-brand-black text-brand-black dark:text-brand-yellow p-4 md:p-8 flex flex-col items-center selection:bg-brand-orange selection:text-white transition-colors duration-300">
      <SEO 
        title={SEO_COPY[uiLang].converter.title}
        description={SEO_COPY[uiLang].converter.description}
        url="https://martabakgresik.my.id/converter"
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
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">{t.converterTitle}</h1>
        </div>
        <div className="w-20 hidden md:block" />
      </motion.div>

      <div className="w-full max-w-5xl space-y-8">
        {/* Top Section: Settings & Upload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Settings Card */}
          <motion.div 
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border-4 border-brand-black dark:border-brand-yellow/20 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-brand-orange/10 transition-colors" />
            
            <div className="flex items-center gap-2 mb-6 text-brand-orange">
              <Settings2 className="w-5 h-5" />
              <h2 className="font-black uppercase italic tracking-wider text-sm">{t.config}</h2>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase opacity-60 flex items-center justify-between">
                  {t.targetFormat}
                  <span className="bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full text-[8px] font-black underline decoration-2">{targetFormat.split('/')[1].toUpperCase()}</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {SUPPORTED_FORMATS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setTargetFormat(f.value)}
                      className={`py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all border-2 ${
                        targetFormat === f.value 
                          ? 'bg-brand-orange border-brand-orange text-white shadow-lg shadow-brand-orange/20 scale-105' 
                          : 'bg-white/50 dark:bg-black/50 border-brand-black/5 dark:border-white/10 opacity-60 hover:opacity-100 hover:border-brand-orange/50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resize Options */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-orange">
                  <Maximize className="w-4 h-4" />
                  <label className="text-[10px] font-black uppercase opacity-60">{t.resizeOptions}</label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase opacity-40">{t.maxWidth}</span>
                    <input 
                      type="number"
                      value={maxWidth}
                      onChange={(e) => setMaxWidth(parseInt(e.target.value) || 0)}
                      className="w-full bg-white/50 dark:bg-black/50 border-2 border-brand-black/5 dark:border-white/10 p-3 rounded-xl font-black text-xs outline-none focus:border-brand-orange transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase opacity-40">{t.maxHeight}</span>
                    <input 
                      type="number"
                      value={maxHeight}
                      onChange={(e) => setMaxHeight(parseInt(e.target.value) || 0)}
                      className="w-full bg-white/50 dark:bg-black/50 border-2 border-brand-black/5 dark:border-white/10 p-3 rounded-xl font-black text-xs outline-none focus:border-brand-orange transition-all"
                    />
                  </div>
                </div>
              </div>

              {targetFormat !== 'image/png' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase opacity-60">{t.quality}</label>
                    <span className="text-sm font-black text-brand-orange">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-brand-black/10 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-brand-orange"
                  />
                  <div className="flex justify-between text-[8px] font-black uppercase opacity-40">
                    <span>{t.smallFile}</span>
                    <span>{t.highQuality}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Upload Dropzone */}
          <motion.div 
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragActive(false); addFiles(Array.from(e.dataTransfer.files)); }}
            className={`cursor-pointer border-4 border-dashed rounded-[3rem] p-12 flex flex-col items-center justify-center transition-all duration-300 group relative overflow-hidden h-full min-h-[300px] lg:min-h-full ${
              isDragActive 
                ? 'border-brand-orange bg-brand-orange/5 shadow-2xl scale-[1.01]' 
                : 'border-brand-black/10 dark:border-white/10 hover:border-brand-orange/40 hover:bg-white/20 dark:hover:bg-white/5 shadow-xl'
            }`}
          >
            <div className={`p-6 rounded-full bg-brand-orange/10 mb-6 transition-transform duration-500 ${isDragActive ? 'scale-110 rotate-12' : 'group-hover:scale-110'}`}>
              <Upload className="w-10 h-10 text-brand-orange" />
            </div>
            <h3 className="text-lg font-black uppercase italic tracking-tight mb-2">{t.dragDrop}</h3>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest text-center">{t.supportedFormats}</p>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
          </motion.div>
        </div>

        {/* Bottom Section: Files List / Queue */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border-4 border-brand-black dark:border-brand-yellow/20 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-auto"
        >
          <div className="p-8 border-b-2 border-brand-black/5 dark:border-white/5 flex items-center justify-between bg-brand-black/5">
            <div className="flex items-center gap-3">
              <div className="bg-brand-black text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                {t.queue(files.length)}
              </div>
            </div>
            {files.length > 0 && (
              <div className="flex gap-2">
                <button 
                  onClick={clearAll}
                  className="p-2 text-brand-black/40 hover:text-red-500 transition-colors"
                  title={t.clearAll}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 max-h-[600px] space-y-3 custom-scrollbar">
            <AnimatePresence initial={false}>
              {files.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center opacity-20 py-20"
                >
                  <ImageIcon className="w-16 h-16 mb-4" />
                  <p className="font-black uppercase italic tracking-widest text-sm text-center">{t.noImages}</p>
                </motion.div>
              ) : (
                files.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    className="bg-white/80 dark:bg-black/40 p-4 rounded-3xl border-2 border-brand-black/5 dark:border-white/10 group flex items-center gap-4 transition-all hover:border-brand-orange/30 shadow-sm"
                  >
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-brand-black/5 shrink-0 border border-brand-black/10">
                      <img src={item.preview} alt="File Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black truncate max-w-[150px] uppercase tracking-tight">{item.file.name}</span>
                        <span className="text-[8px] font-bold opacity-40 uppercase bg-black/5 px-1.5 py-0.5 rounded">{(item.file.size / 1024).toFixed(1)} KB</span>
                      </div>
                      
                      <div className="relative h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          className={`absolute inset-0 h-full rounded-full ${
                            item.status === 'error' ? 'bg-red-500' : 
                            item.status === 'success' ? 'bg-green-500' : 'bg-brand-orange'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {item.status === 'idle' && (
                        <button 
                          onClick={() => convertFile(item)}
                          className="p-2 bg-brand-orange text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all"
                          title={t.convert}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      {item.status === 'success' && (
                        <>
                          <div className="p-2 text-green-500">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <button 
                            onClick={() => downloadFile(item)}
                            className="p-2 bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black rounded-xl hover:scale-110 active:scale-95 transition-all"
                            title={t.download}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {item.status === 'error' && (
                        <div className="p-2 text-red-500" title={item.error}>
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      )}
                      <button 
                        onClick={() => removeFile(item.id)}
                        className="p-2 text-brand-black/20 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="p-8 bg-brand-black dark:bg-black/50 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                disabled={files.length === 0 || files.every(f => f.status === 'success')}
                onClick={convertAll}
                className="bg-brand-orange text-white py-4 rounded-3xl font-black uppercase italic flex items-center justify-center gap-3 shadow-xl shadow-brand-orange/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed group"
              >
                <RefreshCw className={`w-5 h-5 ${files.some(f => f.status === 'processing') ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                {t.convertAll}
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={!files.some(f => f.status === 'success')}
                  onClick={downloadAll}
                  className="bg-white dark:bg-brand-yellow text-brand-black py-4 rounded-3xl font-black uppercase italic flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed"
                  title={t.downloadAll}
                >
                  <FileDown className="w-5 h-5" />
                </button>
                <button
                  disabled={!files.some(f => f.status === 'success') || isZipping}
                  onClick={downloadZip}
                  className="bg-brand-yellow text-brand-black py-4 rounded-3xl font-black uppercase italic flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed group"
                  title={t.downloadZip}
                >
                  <Archive className={`w-5 h-5 ${isZipping ? 'animate-bounce' : 'group-hover:-translate-y-1 transition-transform'}`} />
                </button>
              </div>
            </div>
            
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-center opacity-40 text-white/60">
              {t.offlineNote}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Decorative Text */}
      <div className="mt-20 opacity-5 pointer-events-none select-none">
        <h2 className="text-[12vw] font-black uppercase italic tracking-tighter leading-none text-center">{t.converterTitle}</h2>
      </div>
    </div>
  );
};
