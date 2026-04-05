import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Settings2, 
  Download, 
  Maximize2, 
  ChevronDown, 
  Image as ImageIcon,
  Video as VideoIcon,
  Volume2 as AudioIcon,
  Loader2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Copy,
  Check,
  Languages,
  Wand2,
  Trash2,
  Type
} from 'lucide-react';

// API Configuration
const API_URLS = {
  image: '/api/generate-image',
  audio: '/api/generate-audio',
  video: '/api/generate-video',
  chat: '/api/chat'
};

// Configuration Constants
const IMAGE_MODELS_DEFAULT = [
  'flux', 'kontext', 'zimage', 'gptimage', 'gptimage-large', 
  'nanobanana-pro', 'grok-imagine', 'grok-imagine-pro', 
  'wan-image', 'wan-image-pro', 'p-image', 'nova-canvas', 
  'nova-reel', 'klein', 'qwen-image', 'seedream5'
];

const VIDEO_MODELS = ['p-video', 'grok-video-pro'];

const AUDIO_VOICES = ['nova', 'shimmer', 'echo', 'onyx', 'fable', 'alloy'];

export const Text2Img: React.FC = () => {
  // Global View State
  const [activeTab, setActiveTab] = useState<'images' | 'video' | 'audio'>('images');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>(IMAGE_MODELS_DEFAULT);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '16:9' | '9:16'>('1:1');
  const [qualityPreset, setQualityPreset] = useState<'SD' | 'HD' | '2K' | '4K'>('HD');
  
  // Results State
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  // History State
  const [imageHistory, setImageHistory] = useState<Array<{ url: string, prompt: string, model: string, width: number, height: number }>>([]);

  // Images State
  const [imageState, setImageState] = useState({
    prompt: '',
    model: 'flux',
    width: 1024,
    height: 1024,
    seed: -1,
    enhance: true,
    negative_prompt: '',
    safe: false,
    quality: 'hd'
  });

  // Calculate dimensions based on ratio and quality
  useEffect(() => {
    let base = 1024;
    if (qualityPreset === 'SD') base = 512;
    if (qualityPreset === 'HD') base = 1024;
    if (qualityPreset === '2K') base = 1440;
    if (qualityPreset === '4K') base = 2048;

    let w = base;
    let h = base;

    if (aspectRatio === '4:5') { w = Math.round(base * 0.8); h = base; }
    if (aspectRatio === '16:9') { w = base; h = Math.round(base * 0.5625); }
    if (aspectRatio === '9:16') { w = Math.round(base * 0.5625); h = base; }

    setImageState(prev => ({ ...prev, width: w, height: h }));
  }, [aspectRatio, qualityPreset]);

  // Video State
  const [videoState, setVideoState] = useState({
    prompt: '',
    model: 'p-video',
    duration: 5,
    aspect_ratio: '1:1'
  });

  // Audio State
  const [audioState, setAudioState] = useState({
    text: '',
    voice: 'nova',
    speed: 1.0
  });

  // AI Translator State (Independent Feature)
  const [translatorInput, setTranslatorInput] = useState('');
  const [translatedResult, setTranslatedResult] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [hasCopiedTranslation, setHasCopiedTranslation] = useState(false);
  const [transDirection, setTransDirection] = useState<'id-en' | 'en-id'>('id-en');

  // Persistence (LocalStorage)
  useEffect(() => {
    const savedImage = localStorage.getItem('martabak-ai-image');
    if (savedImage) setImageState(JSON.parse(savedImage));
  }, []);

  useEffect(() => {
    localStorage.setItem('martabak-ai-image', JSON.stringify(imageState));
  }, [imageState]);

  // Fetch dynamic models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/image-models');
        if (response.ok) {
          const models = await response.json();
          if (Array.isArray(models)) {
            const modelIds = models.map((m: any) => m.id || m);
            if (modelIds.length > 5) setAvailableModels(modelIds);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch models, using defaults.');
      }
    };
    fetchModels();
  }, []);

  // Handlers
  const handleDirectRefine = async (currentTab: 'images' | 'video') => {
    const currentPrompt = currentTab === 'images' ? imageState.prompt : videoState.prompt;
    if (!currentPrompt.trim()) return;

    setIsRefining(true);
    try {
      const response = await fetch(API_URLS.chat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "Anda adalah pakar prompt engineering. Kembalikan HANYA teks prompt hasil perbaikan." },
            { role: "user", content: currentPrompt }
          ],
          model: 'openai'
        })
      });
      const data = await response.json();
      const refinedText = data.choices?.[0]?.message?.content || currentPrompt;
      if (currentTab === 'images') setImageState(prev => ({ ...prev, prompt: refinedText }));
      else setVideoState(prev => ({ ...prev, prompt: refinedText }));
    } catch (err) { console.error(err); } finally { setIsRefining(false); }
  };

  const handleClearPrompt = (currentTab: 'images' | 'video' | 'audio') => {
    if (currentTab === 'images') setImageState(prev => ({ ...prev, prompt: '' }));
    if (currentTab === 'video') setVideoState(prev => ({ ...prev, prompt: '' }));
    if (currentTab === 'audio') setAudioState(prev => ({ ...prev, text: '' }));
  };

  const handleTranslate = async () => {
    if (!translatorInput.trim()) return;
    setIsTranslating(true);
    try {
      const source = transDirection === 'id-en' ? 'Bahasa Indonesia' : 'English';
      const target = transDirection === 'id-en' ? 'English' : 'Bahasa Indonesia';
      const response = await fetch(API_URLS.chat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: "system", content: `Penerjemah profesional dari ${source} ke ${target}.` },
            { role: "user", content: translatorInput.trim() }
          ],
          model: 'openai'
        })
      });
      const data = await response.json();
      setTranslatedResult(data.choices?.[0]?.message?.content || '');
    } catch (err: any) { setError('Translator Error: ' + err.message); } finally { setIsTranslating(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    try {
      if (activeTab === 'images') {
        const response = await fetch(API_URLS.image, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: imageState.prompt,
            model: imageState.model,
            size: `${imageState.width}x${imageState.height}`,
            seed: imageState.seed === -1 ? Math.floor(Math.random() * 1000000) : imageState.seed,
            nologo: true,
            response_format: "url"
          })
        });

        if (!response.ok) throw new Error('Gagal men-generate gambar di jalur Professional.');
        
        const proData = await response.json();
        const rawUrl = proData?.data?.[0]?.url;
        if (!rawUrl) throw new Error('Model Pro gagal memberikan URL gambar.');
        
        // Anti-Cache Buster v11.0
        const imageUrl = `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
        
        const imageFetch = await fetch(imageUrl);
        const blob = await imageFetch.blob();
        const url = URL.createObjectURL(blob);
        
        setGeneratedImageUrl(url);
        setImageHistory(prev => [
          { url, prompt: imageState.prompt, model: imageState.model, width: imageState.width, height: imageState.height },
          ...prev
        ].slice(0, 12));

      } else if (activeTab === 'audio') {
        const params = new URLSearchParams();
        Object.entries(audioState).forEach(([k, v]) => params.append(k, String(v)));
        const response = await fetch(`${API_URLS.audio}?${params.toString()}`);
        const blob = await response.blob();
        setGeneratedAudioUrl(URL.createObjectURL(blob));
      } else if (activeTab === 'video') {
        const params = new URLSearchParams();
        Object.entries(videoState).forEach(([k, v]) => params.append(k, String(v)));
        const response = await fetch(`${API_URLS.video}?${params.toString()}`);
        const blob = await response.blob();
        setGeneratedVideoUrl(URL.createObjectURL(blob));
      }
    } catch (err: any) { setError(err.message); } finally { setIsGenerating(false); }
  };

  return (
    <div className="min-h-screen bg-brand-yellow font-display p-4 md:p-8 flex flex-col items-center selection:bg-[#2D1B08] selection:text-white">
      {/* Header Section */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-6xl flex flex-wrap items-center justify-between mb-8 gap-4">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 font-black uppercase tracking-tighter hover:bg-[#2D1B08] hover:text-white transition-all border-4 border-[#2D1B08] bg-white px-6 py-3 shadow-[6px_6px_0px_#2D1B08] active:translate-x-1 active:translate-y-1 active:shadow-none">
          <ArrowLeft className="w-5 h-5" /> Kembali
        </button>
        <div className="flex items-center gap-4">
          <div className="bg-brand-orange p-4 border-4 border-[#2D1B08] shadow-[6px_6px_0px_#2D1B08] -rotate-3 hover:rotate-0 transition-transform hidden sm:block">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-[#2D1B08]">
            Martabak AI <span className="text-white drop-shadow-[4px_4px_0px_#2D1B08]">Dashboard</span>
          </h1>
          <div className="bg-[#2D1B08] text-white text-[8px] font-black px-2 py-0.5 rounded-sm mt-1">v3.3 - STABLE</div>
        </div>
      </motion.div>

      {/* Tabs Menu */}
      <div className="w-full max-w-6xl mb-12 flex flex-wrap gap-4 justify-center">
        {[
          { id: 'images', icon: ImageIcon, color: 'bg-amber-400', label: 'Images' },
          { id: 'video', icon: VideoIcon, color: 'bg-purple-400', label: 'Video' },
          { id: 'audio', icon: AudioIcon, color: 'bg-pink-400', label: 'Audio' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-3 px-8 py-5 border-4 border-[#2D1B08] font-black uppercase tracking-widest text-lg transition-all 
            ${activeTab === t.id ? `${t.color} translate-x-1 translate-y-1 shadow-none` : 'bg-white shadow-[8px_8px_0px_#2D1B08] hover:-translate-y-1 hover:shadow-[10px_10px_0px_#2D1B08]'}`}
          >
            <t.icon className="w-6 h-6" /> {t.label}
          </button>
        ))}
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-20">
        <div className="space-y-10">
          <motion.div layout className="bg-white border-4 border-[#2D1B08] p-8 shadow-[12px_12px_0px_#2D1B08]">
            <form onSubmit={handleSubmit} className="space-y-8">
              <AnimatePresence mode="wait">
                {activeTab === 'images' && (
                  <motion.div key="images" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                    <div className="space-y-2 relative">
                      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#2D1B08]">🌟 Image Prompt</label>
                      <div className="relative group">
                        <textarea
                          value={imageState.prompt}
                          onChange={(e) => setImageState({ ...imageState, prompt: e.target.value })}
                          placeholder="Describe what you want to see..."
                          className="w-full p-6 pr-14 border-4 border-[#2D1B08] bg-brand-yellow/5 font-bold focus:bg-white transition-all h-44 resize-none leading-relaxed"
                          required
                        />
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                          <button type="button" onClick={() => handleClearPrompt('images')} className="p-2 bg-white text-[#2D1B08] border-2 border-[#2D1B08] shadow-[3px_3px_0px_#2D1B08] hover:bg-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                          <button type="button" onClick={() => handleDirectRefine('images')} disabled={isRefining || !imageState.prompt} className="p-2 bg-[#2D1B08] text-white border-2 border-[#2D1B08] shadow-[3px_3px_0px_#FFD700] hover:scale-110 active:scale-95 transition-all">
                            {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase opacity-60">Aspect Ratio</label>
                        <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as any)} className="w-full p-3 border-4 border-[#2D1B08] font-black uppercase text-xs focus:outline-none bg-white">
                          <option value="1:1">1:1 Square</option>
                          <option value="16:9">16:9 Cinematic</option>
                          <option value="9:16">9:16 Mobile</option>
                          <option value="4:5">4:5 Portrait</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase opacity-60">Quality</label>
                        <select value={qualityPreset} onChange={(e) => setQualityPreset(e.target.value as any)} className="w-full p-3 border-4 border-[#2D1B08] font-black uppercase text-xs focus:outline-none bg-white">
                          <option value="SD">SD (Standard)</option>
                          <option value="HD">HD (High Def)</option>
                          <option value="2K">2K (Retina)</option>
                          <option value="4K">4K (Ultra)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase opacity-60">Model Selection</label>
                      <select 
                        value={imageState.model} 
                        onChange={(e) => setImageState({ ...imageState, model: e.target.value })}
                        className="w-full p-3 border-4 border-[#2D1B08] font-black uppercase text-xs focus:outline-none bg-white"
                      >
                        {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </motion.div>
                )}
                {/* ... (Video & Audio tabs simplified for brevity) */}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isGenerating || isRefining}
                className={`w-full p-6 border-4 border-[#2D1B08] shadow-[10px_10px_0px_#2D1B08] font-black uppercase italic tracking-tighter text-xl transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50
                ${activeTab === 'images' ? 'bg-brand-orange text-white' : 'bg-purple-600 text-white'}`}
              >
                <div className="flex items-center justify-center gap-4">
                  {isGenerating ? <RefreshCw className="w-6 h-6 animate-spin" /> : 'GENERATE RESULTS'}
                  {!isGenerating && <Wand2 className="w-6 h-6" />}
                </div>
              </button>
            </form>
          </motion.div>

          {/* AI Translator Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-lime-400 border-4 border-[#2D1B08] p-8 shadow-[12px_12px_0px_#2D1B08]">
            {/* Same translator UI as before... */}
            <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
              <h3 className="font-black uppercase italic tracking-widest text-lg flex items-center gap-3"><Languages className="w-5 h-5"/> AI Translator</h3>
            </div>
            <textarea
              value={translatorInput}
              onChange={(e) => setTranslatorInput(e.target.value)}
              placeholder="Tulis teks untuk diterjemahkan..."
              className="w-full p-6 border-4 border-[#2D1B08] bg-white font-bold h-32 resize-none text-sm focus:outline-none mb-6"
            />
            <button
                onClick={handleTranslate}
                className="w-full p-4 bg-[#2D1B08] text-white font-black uppercase italic tracking-[0.2em] text-xs shadow-[6px_6px_0px_#2D1B08] active:shadow-none active:translate-y-1 transition-all"
              >
                {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Translate Now'}
            </button>
          </motion.div>
        </div>

        <div className="flex flex-col items-center sticky top-8">
          <div className="bg-[#2D1B08] text-white px-12 py-4 border-4 border-[#2D1B08] font-black uppercase tracking-[0.4em] text-sm shadow-[12px_12px_0px_#FFD700] mb-12 -rotate-2">
            Output Preview
          </div>

          <div className="relative w-full max-w-xl group">
             <div className="bg-white border-4 border-[#2D1B08] shadow-[15px_15px_0px_#2D1B08] overflow-hidden min-h-[450px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                       <Loader2 className="w-20 h-20 animate-spin text-brand-orange mb-4" />
                       <h4 className="text-2xl font-black uppercase">Generating...</h4>
                    </motion.div>
                  ) : activeTab === 'images' && generatedImageUrl ? (
                    <motion.img initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} src={generatedImageUrl} className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center opacity-10 select-none grayscale cursor-help">
                      <ImageIcon className="w-40 h-40" />
                      <p className="font-black mt-6 uppercase tracking-[0.3em] italic">Ready to Generate</p>
                    </div>
                  )}
                </AnimatePresence>
             </div>

             {/* Download & Maximize Buttons */}
             {generatedImageUrl && (
               <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-12 flex gap-6 w-full">
                  <button onClick={() => {
                      const link = document.createElement('a'); link.href = generatedImageUrl!; link.download = `martabak-ai-${Date.now()}`; link.click();
                    }} className="flex-1 p-6 bg-white border-4 border-[#2D1B08] shadow-[8px_8px_0px_#2D1B08] font-black uppercase italic flex items-center justify-center gap-4 hover:bg-[#2D1B08] hover:text-white transition-all">
                    <Download className="w-6 h-6" /> DOWNLOAD
                  </button>
               </motion.div>
             )}

             {/* Image History */}
             {imageHistory.length > 0 && (
               <div className="w-full mt-12 bg-[#2D1B08]/5 border-t-4 border-dashed border-[#2D1B08] pt-8">
                  <h5 className="font-black uppercase tracking-widest text-[10px] mb-4">Recent Generations</h5>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {imageHistory.map((item, idx) => (
                      <button key={idx} onClick={() => setGeneratedImageUrl(item.url)} className="aspect-square border-2 border-[#2D1B08] overflow-hidden shadow-[4px_4px_0px_#2D1B08] bg-white group hover:scale-110 transition-transform">
                        <img src={item.url} className="w-full h-full object-cover group-hover:opacity-60" />
                      </button>
                    ))}
                  </div>
               </div>
             )}

             {/* Error Message */}
             {error && (
               <div className="mt-8 p-5 bg-red-600 border-4 border-[#2D1B08] text-white font-black uppercase text-xs flex items-center gap-4 shadow-[6px_6px_0px_#2D1B08]">
                 <AlertCircle className="w-6 h-6 shrink-0" />
                 {error}
               </div>
             )}
          </div>
        </div>
      </div>

      <style>{`
        select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%232D1B08' stroke-width='4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1rem center; background-size: 1rem; }
      `}</style>
    </div>
  );
};
