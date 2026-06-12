import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Save, AlertCircle, CheckCircle2, Lock, ArrowLeft, Settings, Pizza, EggFried, Eye, EyeOff, Download, Upload, Plus, Trash2, Search, Image, Star, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'umum' | 'sweet' | 'savory'>('overview');
  
  // Filter states
  const [searchSweet, setSearchSweet] = useState('');
  const [searchSavory, setSearchSavory] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importType, setImportType] = useState<'sweet'|'savory'|null>(null);
  
  // Mass price update state
  const [massUpdatePercent, setMassUpdatePercent] = useState<number>(10);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void } | null>(null);

  // Drag and Drop state
  const [draggedSweetCat, setDraggedSweetCat] = useState<number | null>(null);
  const [draggedSweetItem, setDraggedSweetItem] = useState<{catIdx: number, itemIdx: number} | null>(null);
  const [draggedSavoryCat, setDraggedSavoryCat] = useState<number | null>(null);
  const [draggedSavoryVariant, setDraggedSavoryVariant] = useState<{catIdx: number, varIdx: number} | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConfig();
    }
  }, [isAuthenticated]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (!data.menuSweet) data.menuSweet = [];
        if (!data.menuSavory) data.menuSavory = [];
        if (!data.storeSettings.holidays) data.storeSettings.holidays = [];
        setConfig(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setMessage({ type: 'error', text: 'Password diperlukan.' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword: password })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setIsAuthenticated(true);
        setMessage(null);
      } else {
        setMessage({ type: 'error', text: 'Password salah!' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    }
    setLoading(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    if (!password) {
      setMessage({ type: 'error', text: 'Password diperlukan untuk menyimpan.' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword: password,
          configData: config
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setMessage({ type: 'success', text: 'Semua perubahan berhasil disimpan!' });
        setIsAuthenticated(true);
      } else {
        setMessage({ type: 'error', text: result.error || 'Gagal menyimpan. Password salah?' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const updateStoreSetting = (key: string, value: any) => {
    setConfig({
      ...config,
      storeSettings: {
        ...config.storeSettings,
        [key]: value
      }
    });
  };

  // HOLIDAY MANAGEMENT
  const addHoliday = () => {
    const newHolidays = [...(config.storeSettings.holidays || []), "2026-01-01"];
    updateStoreSetting('holidays', newHolidays);
  };

  const updateHoliday = (index: number, val: string) => {
    const newHolidays = [...config.storeSettings.holidays];
    newHolidays[index] = val;
    updateStoreSetting('holidays', newHolidays);
  };

  const removeHoliday = (index: number) => {
    const newHolidays = config.storeSettings.holidays.filter((_: any, i: number) => i !== index);
    updateStoreSetting('holidays', newHolidays);
  };

  // CSV EXPORT
  const exportCSV = (type: 'sweet' | 'savory') => {
    let csv = '';
    if (type === 'sweet') {
      csv = Papa.unparse(
        config.menuSweet.flatMap((cat: any) => 
          cat.items.map((item: any) => ({
            Kategori: cat.category,
            Nama: item.name,
            Harga: item.price,
            Deskripsi: item.description || ''
          }))
        )
      );
    } else {
      csv = Papa.unparse(
        config.menuSavory.flatMap((cat: any) => 
          cat.variants.flatMap((variant: any) =>
            variant.prices.map((p: any) => ({
              Kategori: cat.title,
              Tipe: variant.type,
              Telor: p.qty,
              Harga: p.price
            }))
          )
        )
      );
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `martabak_menu_${type}.csv`;
    link.click();
  };

  // CSV IMPORT
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !importType) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        const newConfig = { ...config };

        if (importType === 'sweet') {
          const map = new Map<string, any>();
          data.forEach(row => {
            if (!map.has(row.Kategori)) map.set(row.Kategori, { category: row.Kategori, items: [] });
            map.get(row.Kategori).items.push({
              name: row.Nama,
              price: row.Harga ? parseInt(row.Harga) : 0,
              description: row.Deskripsi || ''
            });
          });
          newConfig.menuSweet = Array.from(map.values());
        } else {
          const catMap = new Map<string, any>();
          data.forEach(row => {
            if (!catMap.has(row.Kategori)) catMap.set(row.Kategori, { title: row.Kategori, variants: [] });
            const cat = catMap.get(row.Kategori);
            let varObj = cat.variants.find((v: any) => v.type === row.Tipe);
            if (!varObj) {
              varObj = { type: row.Tipe, prices: [] };
              cat.variants.push(varObj);
            }
            varObj.prices.push({
              qty: parseInt(row.Telor),
              price: row.Harga ? parseInt(row.Harga) : 0
            });
          });
          newConfig.menuSavory = Array.from(catMap.values());
        }

        setConfig(newConfig);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setImportType(null);
        setMessage({ type: 'success', text: `Data CSV berhasil di-import!` });
      }
    });
  };

  const handleMassUpdate = (target: 'sweet' | 'savory' | 'all') => {
    if (massUpdatePercent === 0) return;
    const multiplier = 1 + (massUpdatePercent / 100);
    const newConfig = { ...config };
    
    if (target === 'sweet' || target === 'all') {
      newConfig.menuSweet = newConfig.menuSweet.map((cat: any) => ({
        ...cat,
        items: cat.items.map((item: any) => ({
          ...item,
          price: item.price ? Math.round(item.price * multiplier) : item.price
        }))
      }));
    }
    
    if (target === 'savory' || target === 'all') {
      newConfig.menuSavory = newConfig.menuSavory.map((cat: any) => ({
        ...cat,
        variants: cat.variants.map((v: any) => ({
          ...v,
          prices: v.prices.map((p: any) => ({
            ...p,
            price: p.price ? Math.round(p.price * multiplier) : p.price
          }))
        }))
      }));
    }
    
    setConfig(newConfig);
    setMessage({ type: 'success', text: `Berhasil mengubah harga ${target === 'all' ? 'semua menu' : target === 'sweet' ? 'terang bulan' : 'martabak telor'} sebesar ${massUpdatePercent}%. Jangan lupa klik Simpan Pengaturan.` });
  };

  // SWEET MANAGEMENT
  const addSweetCategory = () => {
    setConfig({ ...config, menuSweet: [{ category: 'Kategori Baru', items: [] }, ...config.menuSweet] });
  };
  const removeSweetCategory = (idx: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Kategori',
      message: 'Yakin ingin menghapus kategori ini beserta semua menunya?',
      onConfirm: () => {
        const newMenu = config.menuSweet.filter((_: any, i: number) => i !== idx);
        setConfig({ ...config, menuSweet: newMenu });
        setConfirmDialog(null);
      }
    });
  };
  const addSweetItem = (catIdx: number) => {
    const newMenu = [...config.menuSweet];
    newMenu[catIdx].items.push({ name: 'Menu Baru', price: '' });
    setConfig({ ...config, menuSweet: newMenu });
  };
  const removeSweetItem = (catIdx: number, itemIdx: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Menu',
      message: 'Yakin ingin menghapus menu ini?',
      onConfirm: () => {
        const newMenu = [...config.menuSweet];
        newMenu[catIdx].items.splice(itemIdx, 1);
        setConfig({ ...config, menuSweet: newMenu });
        setConfirmDialog(null);
      }
    });
  };

  const toggleSweetBestSeller = (catIdx: number, itemIdx: number) => {
    const newMenu = [...config.menuSweet];
    newMenu[catIdx].items[itemIdx].isBestSeller = !newMenu[catIdx].items[itemIdx].isBestSeller;
    setConfig({ ...config, menuSweet: newMenu });
  };

  // Drag and drop handlers - Sweet
  const handleSweetCatDrop = (idx: number) => {
    if (draggedSweetCat !== null && draggedSweetCat !== idx && searchSweet === '') {
      const newMenu = [...config.menuSweet];
      const draggedItem = newMenu.splice(draggedSweetCat, 1)[0];
      newMenu.splice(idx, 0, draggedItem);
      setConfig({ ...config, menuSweet: newMenu });
    }
    setDraggedSweetCat(null);
  };

  const handleSweetItemDrop = (catIdx: number, itemIdx: number) => {
    if (draggedSweetItem !== null && searchSweet === '') {
      if (draggedSweetItem.catIdx === catIdx && draggedSweetItem.itemIdx === itemIdx) {
        setDraggedSweetItem(null);
        return;
      }
      const newMenu = [...config.menuSweet];
      const draggedItem = newMenu[draggedSweetItem.catIdx].items.splice(draggedSweetItem.itemIdx, 1)[0];
      newMenu[catIdx].items.splice(itemIdx, 0, draggedItem);
      setConfig({ ...config, menuSweet: newMenu });
    }
    setDraggedSweetItem(null);
  };

  // SAVORY MANAGEMENT
  const addSavoryCategory = () => {
    setConfig({ ...config, menuSavory: [{ title: 'Kategori Baru', variants: [] }, ...config.menuSavory] });
  };
  const removeSavoryCategory = (idx: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Kategori',
      message: 'Yakin ingin menghapus kategori ini beserta semua variannya?',
      onConfirm: () => {
        const newMenu = config.menuSavory.filter((_: any, i: number) => i !== idx);
        setConfig({ ...config, menuSavory: newMenu });
        setConfirmDialog(null);
      }
    });
  };
  const addSavoryVariant = (catIdx: number) => {
    const newMenu = [...config.menuSavory];
    newMenu[catIdx].variants.push({ type: 'Varian Baru', prices: [{ qty: 1, price: '' }] });
    setConfig({ ...config, menuSavory: newMenu });
  };
  const removeSavoryVariant = (catIdx: number, varIdx: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Varian',
      message: 'Yakin ingin menghapus varian ini?',
      onConfirm: () => {
        const newMenu = [...config.menuSavory];
        newMenu[catIdx].variants = newMenu[catIdx].variants.filter((_: any, i: number) => i !== varIdx);
        setConfig({ ...config, menuSavory: newMenu });
        setConfirmDialog(null);
      }
    });
  };
  const addSavoryPrice = (catIdx: number, varIdx: number) => {
    const newMenu = [...config.menuSavory];
    newMenu[catIdx].variants[varIdx].prices.push({ qty: 2, price: '' });
    setConfig({ ...config, menuSavory: newMenu });
  };
  const removeSavoryPrice = (catIdx: number, varIdx: number, priceIdx: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Harga',
      message: 'Yakin ingin menghapus harga ini?',
      onConfirm: () => {
        const newMenu = [...config.menuSavory];
        newMenu[catIdx].variants[varIdx].prices = newMenu[catIdx].variants[varIdx].prices.filter((_: any, i: number) => i !== priceIdx);
        setConfig({ ...config, menuSavory: newMenu });
        setConfirmDialog(null);
      }
    });
  };

  // Drag and drop handlers - Savory
  const handleSavoryCatDrop = (idx: number) => {
    if (draggedSavoryCat !== null && draggedSavoryCat !== idx && searchSavory === '') {
      const newMenu = [...config.menuSavory];
      const draggedItem = newMenu.splice(draggedSavoryCat, 1)[0];
      newMenu.splice(idx, 0, draggedItem);
      setConfig({ ...config, menuSavory: newMenu });
    }
    setDraggedSavoryCat(null);
  };

  const handleSavoryVariantDrop = (catIdx: number, varIdx: number) => {
    if (draggedSavoryVariant !== null && searchSavory === '') {
      if (draggedSavoryVariant.catIdx === catIdx && draggedSavoryVariant.varIdx === varIdx) {
        setDraggedSavoryVariant(null);
        return;
      }
      const newMenu = [...config.menuSavory];
      const draggedItem = newMenu[draggedSavoryVariant.catIdx].variants.splice(draggedSavoryVariant.varIdx, 1)[0];
      newMenu[catIdx].variants.splice(varIdx, 0, draggedItem);
      setConfig({ ...config, menuSavory: newMenu });
    }
    setDraggedSavoryVariant(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-yellow/10 dark:bg-zinc-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-brand-black p-8 md:p-12 rounded-[2rem] shadow-2xl max-w-md w-full border border-black/5 dark:border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-brand-orange"></div>
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-brand-orange" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Admin<span className="text-brand-orange">Panel</span></h1>
            <p className="opacity-60 mt-2 font-medium">Silakan masukkan password admin untuk melanjutkan.</p>
          </div>

          <AnimatePresence>
            {message && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-4 rounded-xl mb-6 font-bold text-center text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Password"
                className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-brand-orange/50 rounded-xl p-4 pr-12 font-bold focus:outline-none transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-orange transition-colors cursor-pointer">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button type="submit" disabled={loading || !password} className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer">
              {loading ? 'Memeriksa...' : 'Login Ke Dashboard'}
            </button>
          </form>
          
          <button onClick={() => navigate('/')} className="w-full mt-6 flex items-center justify-center gap-2 text-sm font-bold opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog
          </button>
        </div>
      </div>
    );
  }

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-brand-yellow/10 dark:bg-zinc-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Filters
  const filteredSweet = config.menuSweet.map((cat: any) => ({
    ...cat,
    items: cat.items.filter((item: any) => item.name.toLowerCase().includes(searchSweet.toLowerCase()))
  })).filter((cat: any) => cat.items.length > 0 || cat.category.toLowerCase().includes(searchSweet.toLowerCase()));

  const filteredSavory = config.menuSavory.map((cat: any) => ({
    ...cat,
    variants: cat.variants.filter((v: any) => v.type.toLowerCase().includes(searchSavory.toLowerCase()) || cat.title.toLowerCase().includes(searchSavory.toLowerCase()))
  })).filter((cat: any) => cat.variants.length > 0 || cat.title.toLowerCase().includes(searchSavory.toLowerCase()));

  return (
    <div className="min-h-screen bg-brand-yellow/10 dark:bg-zinc-900 pt-20 pb-24 px-4 md:px-8 text-brand-black dark:text-brand-yellow font-sans">
      <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
      
      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header & Notifications */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2 text-white font-bold ${
                message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
            <div className="bg-brand-orange text-white p-3 rounded-2xl">
              <ArrowLeft className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Admin<span className="text-brand-orange">Panel</span></h1>
              <p className="font-medium opacity-60">Kelola Menu & Pengaturan</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <button onClick={() => {setIsAuthenticated(false); setPassword('');}} className="bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-brand-black dark:text-brand-yellow px-6 py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2 cursor-pointer text-sm">
              <Lock className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 p-2 bg-white/40 dark:bg-black/20 rounded-2xl border border-black/5 dark:border-white/5 mb-8">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-white dark:bg-brand-black shadow-md text-brand-orange scale-[1.02]' : 'opacity-60 hover:bg-white/50 dark:hover:bg-white/5 hover:opacity-100'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Ringkasan
          </button>
          <button 
            onClick={() => setActiveTab('umum')}
            className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'umum' ? 'bg-white dark:bg-brand-black shadow-md text-brand-orange scale-[1.02]' : 'opacity-60 hover:bg-white/50 dark:hover:bg-white/5 hover:opacity-100'}`}
          >
            <Settings className="w-5 h-5" />
            Umum
          </button>
          <button 
            onClick={() => setActiveTab('sweet')}
            className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'sweet' ? 'bg-white dark:bg-brand-black shadow-md text-brand-orange scale-[1.02]' : 'opacity-60 hover:bg-white/50 dark:hover:bg-white/5 hover:opacity-100'}`}
          >
            <Pizza className="w-5 h-5" />
            Terang Bulan
          </button>
          <button 
            onClick={() => setActiveTab('savory')}
            className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'savory' ? 'bg-white dark:bg-brand-black shadow-md text-brand-orange scale-[1.02]' : 'opacity-60 hover:bg-white/50 dark:hover:bg-white/5 hover:opacity-100'}`}
          >
            <EggFried className="w-5 h-5" />
            Martabak Telor
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-brand-black rounded-[2rem] p-6 md:p-10 shadow-lg border border-black/5 dark:border-white/10 relative overflow-hidden">
          
          {activeTab === 'overview' && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
              <div className="mb-8">
                <h2 className="text-2xl font-black uppercase flex items-center gap-3">
                  <span className="w-2 h-8 bg-brand-orange rounded-full"></span>
                  Ringkasan Toko
                </h2>
                <p className="opacity-60 font-medium mt-2">Ringkasan status toko dan statistik menu saat ini.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/50 dark:bg-white/5 p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-full bg-brand-orange/10 text-brand-orange flex justify-center items-center mb-2">
                    <Pizza className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold opacity-60">Total Terang Bulan</span>
                  <span className="text-3xl font-black">{config.menuSweet?.reduce((acc: number, cat: any) => acc + (cat.items?.length || 0), 0) || 0} Menu</span>
                </div>
                
                <div className="bg-white/50 dark:bg-white/5 p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-full bg-brand-orange/10 text-brand-orange flex justify-center items-center mb-2">
                    <EggFried className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold opacity-60">Total Martabak Telor</span>
                  <span className="text-3xl font-black">{config.menuSavory?.reduce((acc: number, cat: any) => acc + (cat.variants?.reduce((varAcc: number, v: any) => varAcc + (v.prices?.length || 0), 0) || 0), 0) || 0} Varian</span>
                </div>

                <div className="bg-white/50 dark:bg-white/5 p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-full bg-brand-orange/10 text-brand-orange flex justify-center items-center mb-2">
                    <Settings className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold opacity-60">Jam Operasional</span>
                  <span className="text-xl font-black">{config.storeSettings?.openHour ?? 15}.00 - {config.storeSettings?.closeHour ?? 23}.00</span>
                </div>

                <div className="bg-white/50 dark:bg-white/5 p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-full bg-brand-orange/10 text-brand-orange flex justify-center items-center mb-2">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold opacity-60">Status Toko Saat Ini</span>
                  <span className="text-xl font-black flex items-center gap-2">
                    {(() => {
                      const now = new Date();
                      const dateString = now.toISOString().split('T')[0];
                      const hour = now.getHours();
                      const holidays = config.storeSettings?.holidays || [];
                      const isEmergencyClosed = config.storeSettings?.isEmergencyClosed;
                      const openHour = config.storeSettings?.openHour ?? 15;
                      const closeHour = config.storeSettings?.closeHour ?? 23;
                      
                      const isHoliday = holidays.some((h: any) => h === dateString);
                      const isOpen = !isHoliday && !isEmergencyClosed && (hour >= openHour && hour < closeHour);

                      if (isEmergencyClosed) return <><span className="w-3 h-3 rounded-full bg-red-500"></span>Tutup Darurat</>;
                      if (isHoliday) return <><span className="w-3 h-3 rounded-full bg-gray-500"></span>Libur</>;
                      if (isOpen) return <><span className="w-3 h-3 rounded-full bg-green-500"></span>Buka</>;
                      return <><span className="w-3 h-3 rounded-full bg-orange-500"></span>Tutup (Luar Jam Kerja)</>;
                    })()}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'umum' && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl font-black uppercase flex items-center gap-3">
                  <span className="w-2 h-8 bg-brand-orange rounded-full"></span>
                  Pengaturan Toko
                </h2>
                <button onClick={handleSave} disabled={saving || !password} className="bg-brand-orange text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 w-full md:w-auto flex items-center justify-center gap-2 cursor-pointer">
                  <Save className="w-5 h-5" />
                  {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Store Profile Settings */}
                <div className="p-6 bg-white/50 dark:bg-white/5 rounded-2xl shadow-sm border border-transparent hover:border-brand-orange/30 transition-all md:col-span-2">
                  <label className="block text-sm font-bold mb-5 uppercase opacity-70 border-b border-black/10 dark:border-white/10 pb-2">Profil & Kontak Toko</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold mb-2 opacity-70">Nama Toko</label>
                      <input 
                        type="text" 
                        value={config.storeSettings.storeName || ''}
                        onChange={(e) => updateStoreSetting('storeName', e.target.value)}
                        className="w-full bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
                        placeholder="Contoh: Martabak Gresik"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-2 opacity-70">Nomor WhatsApp</label>
                      <input 
                        type="text" 
                        value={config.storeSettings.storePhone || ''}
                        onChange={(e) => updateStoreSetting('storePhone', e.target.value)}
                        className="w-full bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
                        placeholder="Contoh: 6281234567890"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold mb-2 opacity-70">Alamat Lengkap</label>
                      <textarea 
                        value={config.storeSettings.storeAddress || ''}
                        onChange={(e) => updateStoreSetting('storeAddress', e.target.value)}
                        className="w-full bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
                        placeholder="Masukkan alamat lengkap toko..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Promo Setting */}
                <div className="p-6 bg-white/50 dark:bg-white/5 rounded-2xl shadow-sm border border-transparent hover:border-brand-orange/30 transition-all">
                  <label className="block text-sm font-bold mb-3 uppercase opacity-70 border-b border-black/10 dark:border-white/10 pb-2">Pengaturan Promo Banner</label>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold mb-2 opacity-70">Kode Promo (Kosongkan untuk menonaktifkan banner)</label>
                      <input 
                        type="text" 
                        value={config.storeSettings.activePromoCode || ''}
                        onChange={(e) => updateStoreSetting('activePromoCode', e.target.value)}
                        className="w-full bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all uppercase"
                        placeholder="Contoh: MARTABAKBARU"
                      />
                    </div>
                    <div className="w-full md:w-1/3">
                      <label className="block text-xs font-bold mb-2 opacity-70">Diskon (%)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          min="0" max="100"
                          value={config.storeSettings.activePromoPercent || ''}
                          onChange={(e) => updateStoreSetting('activePromoPercent', e.target.value === '' ? 0 : Number(e.target.value))}
                          className="w-full bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
                          placeholder="0"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold opacity-50">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tutup Darurat (Maintenance) */}
                <div className="p-6 bg-white/50 dark:bg-white/5 rounded-2xl shadow-sm border border-transparent hover:border-brand-orange/30 transition-all md:col-span-2 mt-4 mb-4 border-l-4 border-l-red-500">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-red-600 dark:text-red-400">Mode Tutup Darurat / Maintenance</h3>
                      <p className="text-sm opacity-70 mt-1">Aktifkan ini jika toko harus ditutup mendadak (misalnya bahan habis atau sistem maintenance). Mode ini akan memblokir semua akses pengunjung.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={config.storeSettings.isEmergencyClosed ? true : false}
                        onChange={(e) => updateStoreSetting('isEmergencyClosed', e.target.checked ? 1 : 0)}
                      />
                      <div className="w-14 h-7 bg-black/20 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>
                  
                  {config.storeSettings.isEmergencyClosed ? (
                    <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 animate-fade-in flex flex-col gap-4">
                      <div>
                        <label className="block text-sm font-bold mb-2 opacity-80">Kapan Aktif Kembali?</label>
                        <input 
                          type="datetime-local" 
                          value={config.storeSettings.maintenanceEndTime || ''}
                          onChange={(e) => updateStoreSetting('maintenanceEndTime', e.target.value)}
                          className="w-full bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-bold opacity-80">Deskripsi / Alasan Tutup</label>
                          <button 
                            onClick={async () => {
                              const btn = document.getElementById('btn-ai-maint') as HTMLButtonElement;
                              if (btn) btn.disabled = true;
                              const prevText = btn?.innerText;
                              if (btn) btn.innerText = 'Menghasilkan...';
                              
                              try {
                                const res = await fetch('/api/chat', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    prompt: 'Buatkan 1 kalimat (maksimal 20 kata) yang profesional, sopan, dan jelas untuk menginformasikan pelanggan bahwa layanan toko Martabak Gresik sedang ditutup sementara (bisa karena pemeliharaan rutin, kehabisan bahan, atau cuaca buruk). Jangan gunakan tanda kutip.',
                                    model: 'openai'
                                  })
                                });
                                const data = await res.json();
                                const aiText = data.choices?.[0]?.message?.content || data.response;
                                if (aiText) {
                                  updateStoreSetting('maintenanceReason', aiText);
                                } else {
                                  alert('Gagal menghasilkan teks AI: ' + (data.error || JSON.stringify(data)));
                                }
                              } catch (e: any) {
                                alert('Error: ' + e.message);
                              } finally {
                                if (btn) {
                                  btn.disabled = false;
                                  btn.innerText = prevText || '✨ Buat dengan AI';
                                }
                              }
                            }}
                            id="btn-ai-maint"
                            className="text-xs bg-brand-orange text-white px-3 py-1 rounded-full font-bold hover:bg-brand-orange/80 transition-colors disabled:opacity-50"
                          >
                            ✨ Buat dengan AI
                          </button>
                        </div>
                        <textarea 
                          value={config.storeSettings.maintenanceReason || ''}
                          onChange={(e) => updateStoreSetting('maintenanceReason', e.target.value)}
                          className="w-full bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all min-h-[100px]"
                          placeholder="Contoh: Mohon maaf, layanan kami saat ini sedang tidak tersedia karena pemeliharaan sistem rutin."
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
                
                {/* Shipping Rate */}
                <div className="p-6 bg-white/50 dark:bg-white/5 rounded-2xl shadow-sm border border-transparent hover:border-brand-orange/30 transition-all">
                  <label className="block text-sm font-bold mb-3 uppercase opacity-70 border-b border-black/10 dark:border-white/10 pb-2">Tarif Ongkir / KM</label>
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold opacity-50 text-xl">Rp</span>
                      <input 
                        type="number" 
                        value={config.storeSettings.shippingRate === '' ? '' : (config.storeSettings.shippingRate || 0)}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => updateStoreSetting('shippingRate', e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl p-4 pl-14 font-bold text-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Jam Buka & Tutup */}
                <div className="p-6 bg-white/50 dark:bg-white/5 rounded-2xl shadow-sm border border-transparent hover:border-brand-orange/30 transition-all md:col-span-2">
                  <label className="block text-sm font-bold mb-3 uppercase opacity-70 border-b border-black/10 dark:border-white/10 pb-2">Jam Operasional Toko</label>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 flex items-center gap-3">
                      <span className="font-bold opacity-80 w-24">Buka Jam:</span>
                      <input 
                        type="number" min="0" max="23"
                        value={config.storeSettings.openHour ?? 15}
                        onChange={(e) => updateStoreSetting('openHour', parseInt(e.target.value))}
                        className="bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl p-3 font-bold text-lg text-center w-24 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
                      />
                      <span className="font-bold opacity-50">.00 WIB</span>
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <span className="font-bold opacity-80 w-24">Tutup Jam:</span>
                      <input 
                        type="number" min="0" max="23"
                        value={config.storeSettings.closeHour ?? 23}
                        onChange={(e) => updateStoreSetting('closeHour', parseInt(e.target.value))}
                        className="bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl p-3 font-bold text-lg text-center w-24 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
                      />
                      <span className="font-bold opacity-50">.00 WIB</span>
                    </div>
                  </div>
                </div>

                {/* Admin Management */}
                <div className="p-6 bg-white/50 dark:bg-white/5 rounded-2xl shadow-sm border border-transparent hover:border-brand-orange/30 transition-all md:col-span-2">
                  <label className="block text-sm font-bold mb-3 uppercase opacity-70 border-b border-black/10 dark:border-white/10 pb-2">Pengaturan Akun Admin</label>
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                      <p className="text-sm font-medium opacity-80 mb-2">Untuk mengubah password admin, Anda harus mengupdate variabel <code className="bg-black/10 dark:bg-white/10 px-1 rounded">ADMIN_PASSWORD</code> di dashboard Cloudflare Pages atau file <code className="bg-black/10 dark:bg-white/10 px-1 rounded">.env.local</code>.</p>
                      <input 
                        type="password"
                        disabled
                        value="********"
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 font-medium focus:outline-none opacity-50 cursor-not-allowed"
                        placeholder="Password Baru"
                      />
                    </div>
                    <div className="w-full md:w-auto">
                      <button disabled className="w-full bg-black/20 dark:bg-white/20 text-brand-black dark:text-white px-6 py-3 rounded-xl font-bold cursor-not-allowed opacity-50">
                        Ubah Password
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mass Price Update */}
                <div className="p-6 bg-white/50 dark:bg-white/5 rounded-2xl shadow-sm border border-brand-orange/20 hover:border-brand-orange/50 transition-all md:col-span-2">
                  <label className="block text-sm font-bold mb-3 uppercase opacity-70 border-b border-brand-orange/20 pb-2 text-brand-orange">Manajemen Harga Massal</label>
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold mb-2 opacity-70">Persentase Kenaikan / Penurunan (%)</label>
                      <div className="relative">
                        <input 
                          type="number"
                          value={massUpdatePercent}
                          onChange={(e) => setMassUpdatePercent(Number(e.target.value))}
                          className="w-full bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all text-lg"
                          placeholder="Misal: 10 atau -10"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold opacity-50">%</span>
                      </div>
                      <p className="text-xs font-medium opacity-60 mt-2">Gunakan angka minus (misal: -10) untuk menurunkan harga.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                      <button onClick={() => handleMassUpdate('sweet')} className="flex-1 md:flex-none bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 px-4 py-3 rounded-xl font-bold text-sm transition-all border border-black/5 dark:border-white/5 text-center">
                        Terapkan ke <br/>Terang Bulan
                      </button>
                      <button onClick={() => handleMassUpdate('savory')} className="flex-1 md:flex-none bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 px-4 py-3 rounded-xl font-bold text-sm transition-all border border-black/5 dark:border-white/5 text-center">
                        Terapkan ke <br/>Martabak Telor
                      </button>
                      <button onClick={() => handleMassUpdate('all')} className="flex-1 md:flex-none bg-brand-orange hover:bg-brand-orange/90 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-md text-center">
                        Terapkan ke <br/>Semua Menu
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Holiday Management */}
              <div className="p-6 bg-white/50 dark:bg-white/5 rounded-2xl shadow-sm border border-transparent transition-all mb-8">
                <div className="flex justify-between items-center mb-5">
                  <label className="block text-sm font-bold uppercase opacity-70">Jadwal Libur Toko</label>
                  <button onClick={addHoliday} className="flex items-center gap-1 text-sm bg-brand-orange/10 text-brand-orange px-3 py-1.5 rounded-lg hover:bg-brand-orange hover:text-white transition-colors cursor-pointer font-bold">
                    <Plus className="w-4 h-4" /> Tambah Libur
                  </button>
                </div>
                {(!config.storeSettings.holidays || config.storeSettings.holidays.length === 0) ? (
                  <p className="text-sm opacity-50 italic">Belum ada tanggal libur yang diatur.</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {config.storeSettings.holidays.map((dateStr: string, idx: number) => (
                      <div key={idx} className="flex items-center bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl p-2 gap-2">
                        <input 
                          type="date" 
                          value={dateStr}
                          onChange={(e) => updateHoliday(idx, e.target.value)}
                          className="bg-transparent border-none focus:outline-none text-sm font-bold px-2 py-1"
                        />
                        <button onClick={() => removeHoliday(idx)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>


            </motion.div>
          )}

          {activeTab === 'sweet' && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
              <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl font-black uppercase flex items-center gap-3">
                  <span className="w-2 h-8 bg-brand-orange rounded-full"></span>
                  Harga Terang Bulan
                </h2>
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                  <div className="relative flex-grow md:flex-grow-0 w-full md:w-auto">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                    <input type="text" placeholder="Cari menu..." value={searchSweet} onChange={e => setSearchSweet(e.target.value)} className="w-full md:w-48 pl-9 pr-3 py-2 bg-black/5 dark:bg-white/5 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50" />
                  </div>
                  <div className="flex flex-wrap gap-2 w-full xl:w-auto">
                    <button onClick={() => exportCSV('sweet')} className="flex-1 md:flex-none flex justify-center items-center gap-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer">
                      <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button onClick={() => { setImportType('sweet'); fileInputRef.current?.click(); }} className="flex-1 md:flex-none flex justify-center items-center gap-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer">
                      <Upload className="w-4 h-4" /> Import CSV
                    </button>
                    <button onClick={addSweetCategory} className="flex-1 md:flex-none flex justify-center items-center gap-1 bg-brand-black text-brand-yellow px-4 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition-all cursor-pointer">
                      <Plus className="w-4 h-4" /> Tambah Kategori
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                {filteredSweet.map((cat: any, catIdx: number) => {
                  const originalCatIdx = config.menuSweet.findIndex((c: any) => c.category === cat.category);
                  return (
                  <div key={catIdx} className="bg-white/40 dark:bg-white/5 p-6 rounded-3xl border border-white/60 dark:border-white/5 relative group">
                    <button onClick={() => removeSweetCategory(originalCatIdx)} className="absolute top-4 right-4 p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"><Trash2 className="w-4 h-4"/></button>
                    
                    <div className="flex items-center gap-2 mb-6 pr-8">
                      <input 
                        type="text" 
                        value={cat.category} 
                        onChange={e => {
                          const newMenu = [...config.menuSweet];
                          newMenu[originalCatIdx].category = e.target.value;
                          setConfig({ ...config, menuSweet: newMenu });
                        }}
                        className="font-bold text-xl bg-transparent border-b border-transparent hover:border-black/20 focus:border-brand-orange focus:outline-none px-1 py-0.5 w-full transition-all"
                      />
                      <button onClick={handleSave} className="p-2 text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all cursor-pointer flex-shrink-0" title="Simpan Kategori">
                        <Save className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {cat.items.map((item: any, itemIdx: number) => {
                        const originalItemIdx = config.menuSweet[originalCatIdx].items.findIndex((i: any) => i.name === item.name);
                        return (
                        <div 
                          key={itemIdx} 
                          draggable={searchSweet === ''}
                          onDragStart={(e) => {
                            e.stopPropagation();
                            searchSweet === '' && setDraggedSweetItem({catIdx: originalCatIdx, itemIdx: originalItemIdx});
                          }}
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onDrop={(e) => {
                            e.stopPropagation();
                            handleSweetItemDrop(originalCatIdx, originalItemIdx);
                          }}
                          onDragEnd={(e) => {
                            e.stopPropagation();
                            setDraggedSweetItem(null);
                          }}
                          className={`flex flex-col gap-4 p-4 bg-white/60 dark:bg-black/40 rounded-2xl border border-transparent hover:border-brand-orange/30 transition-all shadow-sm group/item ${draggedSweetItem?.catIdx === originalCatIdx && draggedSweetItem?.itemIdx === originalItemIdx ? 'opacity-50 scale-95' : ''}`}
                        >
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 flex-grow w-full">
                              <button onClick={() => toggleSweetBestSeller(originalCatIdx, originalItemIdx)} className={`p-2 rounded-xl transition-all cursor-pointer flex-shrink-0 ${item.isBestSeller ? 'bg-brand-orange text-white' : 'bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 hover:bg-black/10'}`} title={item.isBestSeller ? 'Hapus dari Best Seller' : 'Jadikan Best Seller'}>
                                <Star className={`w-4 h-4 ${item.isBestSeller ? 'fill-current' : ''}`} />
                              </button>
                              <div className="flex flex-col w-full gap-2">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={e => {
                                    const newMenu = [...config.menuSweet];
                                    newMenu[originalCatIdx].items[originalItemIdx].name = e.target.value;
                                    setConfig({ ...config, menuSweet: newMenu });
                                  }}
                                  className="font-bold text-base opacity-90 bg-transparent border-b border-transparent hover:border-black/20 focus:border-brand-orange focus:outline-none w-full"
                                  placeholder="Nama Menu"
                                />
                                <div className="flex items-center gap-2">
                                  <Image className="w-3 h-3 opacity-40" />
                                  <input
                                    type="text"
                                    value={item.image || ''}
                                    onChange={e => {
                                      const newMenu = [...config.menuSweet];
                                      newMenu[originalCatIdx].items[originalItemIdx].image = e.target.value;
                                      setConfig({ ...config, menuSweet: newMenu });
                                    }}
                                    className="text-xs font-medium opacity-60 bg-transparent border-b border-transparent hover:border-black/20 focus:border-brand-orange focus:outline-none w-full"
                                    placeholder="URL Gambar (Opsional)"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 self-end md:self-auto w-full md:w-auto justify-end mt-2 md:mt-0">
                              <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-xl p-1 pr-1">
                                <span className="text-xs font-bold opacity-50 pl-2">Rp</span>
                                <input
                                  type="number"
                                  value={item.price === '' ? '' : item.price}
                                  onFocus={(e) => e.target.select()}
                                  onChange={(e) => {
                                    const newMenu = [...config.menuSweet];
                                    newMenu[originalCatIdx].items[originalItemIdx].price = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                                    setConfig({ ...config, menuSweet: newMenu });
                                  }}
                                  className="w-24 md:w-28 bg-white dark:bg-black/80 border-none rounded-lg p-2 font-bold focus:ring-2 focus:ring-brand-orange/50 outline-none text-right transition-all"
                                />
                              </div>
                              <button onClick={handleSave} className="p-2 text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all cursor-pointer flex-shrink-0" title="Simpan Menu">
                                <Save className="w-4 h-4" />
                              </button>
                              <button onClick={() => removeSweetItem(originalCatIdx, originalItemIdx)} className="p-2 text-red-500 opacity-0 group-hover/item:opacity-100 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"><Trash2 className="w-4 h-4"/></button>
                            </div>
                          </div>
                        </div>
                      )})}
                      <button onClick={() => addSweetItem(originalCatIdx)} className="w-full mt-2 py-3 border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl flex justify-center items-center gap-2 text-sm font-bold opacity-60 hover:opacity-100 hover:border-brand-orange hover:text-brand-orange transition-all cursor-pointer">
                        <Plus className="w-4 h-4" /> Tambah Menu
                      </button>
                    </div>
                  </div>
                )})}

                {/* BIG Add Category Button at the end */}
                <div className="bg-white/20 dark:bg-black/10 border-2 border-dashed border-black/10 dark:border-white/10 p-6 rounded-3xl flex flex-col justify-center items-center gap-4 hover:border-brand-orange hover:bg-brand-orange/5 transition-all cursor-pointer" onClick={addSweetCategory}>
                  <div className="w-16 h-16 bg-brand-orange/20 text-brand-orange rounded-full flex justify-center items-center">
                    <Plus className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-lg">Tambah Kategori Baru</h3>
                    <p className="text-sm opacity-60">Misal: Terang Bulan Tipker</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'savory' && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
              <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl font-black uppercase flex items-center gap-3">
                  <span className="w-2 h-8 bg-brand-orange rounded-full"></span>
                  Harga Martabak Telor
                </h2>
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                  <div className="relative flex-grow md:flex-grow-0 w-full md:w-auto">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                    <input type="text" placeholder="Cari kategori/varian..." value={searchSavory} onChange={e => setSearchSavory(e.target.value)} className="w-full md:w-48 pl-9 pr-3 py-2 bg-black/5 dark:bg-white/5 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50" />
                  </div>
                  <div className="flex flex-wrap gap-2 w-full xl:w-auto">
                    <button onClick={() => exportCSV('savory')} className="flex-1 md:flex-none flex justify-center items-center gap-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer">
                      <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button onClick={() => { setImportType('savory'); fileInputRef.current?.click(); }} className="flex-1 md:flex-none flex justify-center items-center gap-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer">
                      <Upload className="w-4 h-4" /> Import CSV
                    </button>
                    <button onClick={addSavoryCategory} className="flex-1 md:flex-none flex justify-center items-center gap-1 bg-brand-black text-brand-yellow px-4 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition-all cursor-pointer">
                      <Plus className="w-4 h-4" /> Tambah Kategori
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                {filteredSavory.map((cat: any, catIdx: number) => {
                  const originalCatIdx = config.menuSavory.findIndex((c: any) => c.title === cat.title);
                  return (
                  <div key={catIdx} className="bg-white/40 dark:bg-white/5 p-6 rounded-3xl border border-white/60 dark:border-white/5 relative group">
                    <button onClick={() => removeSavoryCategory(originalCatIdx)} className="absolute top-4 right-4 p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"><Trash2 className="w-4 h-4"/></button>
                    
                    <div className="flex items-center gap-2 mb-6 pr-8">
                      <input 
                        type="text" 
                        value={cat.title} 
                        onChange={e => {
                          const newMenu = [...config.menuSavory];
                          newMenu[originalCatIdx].title = e.target.value;
                          setConfig({ ...config, menuSavory: newMenu });
                        }}
                        className="font-bold text-xl bg-transparent border-b border-transparent hover:border-black/20 focus:border-brand-orange focus:outline-none px-1 py-0.5 w-full transition-all"
                      />
                      <button onClick={handleSave} className="p-2 text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all cursor-pointer flex-shrink-0" title="Simpan Kategori">
                        <Save className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {cat.variants.map((variant: any, varIdx: number) => {
                        const originalVarIdx = config.menuSavory[originalCatIdx].variants.findIndex((v: any) => v.type === variant.type);
                        return (
                        <div key={varIdx} className="bg-white/30 dark:bg-black/20 p-4 rounded-2xl border border-black/5 dark:border-white/5 relative group/var">
                          <div className="flex items-center justify-between mb-3 border-b border-black/5 dark:border-white/5 pb-2">
                            <div className="flex items-center gap-2 flex-grow">
                              <input
                                type="text"
                                value={variant.type}
                                onChange={e => {
                                  const newMenu = [...config.menuSavory];
                                  newMenu[originalCatIdx].variants[originalVarIdx].type = e.target.value;
                                  setConfig({ ...config, menuSavory: newMenu });
                                }}
                                className="font-bold text-sm opacity-80 uppercase tracking-wider bg-transparent outline-none border-b border-transparent focus:border-brand-orange/50"
                              />
                              <button onClick={handleSave} className="p-1 text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all cursor-pointer flex-shrink-0" title="Simpan Tipe">
                                <Save className="w-4 h-4" />
                              </button>
                            </div>
                            <button onClick={() => removeSavoryVariant(originalCatIdx, originalVarIdx)} className="p-1.5 text-red-500 opacity-0 group-hover/var:opacity-100 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"><Trash2 className="w-3 h-3"/></button>
                          </div>
                          
                          <div className="space-y-2">
                            {variant.prices.map((p: any, priceIdx: number) => {
                              const originalPriceIdx = priceIdx; // Index matches since we don't filter prices
                              return (
                              <div key={priceIdx} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 group/price bg-white/50 dark:bg-black/20 p-2 rounded-xl">
                                <div className="flex flex-col flex-grow w-full gap-2">
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="number"
                                      value={p.qty}
                                      onChange={e => {
                                        const newMenu = [...config.menuSavory];
                                        newMenu[originalCatIdx].variants[originalVarIdx].prices[originalPriceIdx].qty = parseInt(e.target.value) || 0;
                                        setConfig({ ...config, menuSavory: newMenu });
                                      }}
                                      className="w-12 text-center font-bold text-sm bg-white dark:bg-black/40 rounded-lg py-1 px-1 outline-none border border-black/10 dark:border-white/10 focus:border-brand-orange"
                                    />
                                    <span className="text-sm font-bold opacity-60">Telor</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Image className="w-3 h-3 opacity-40" />
                                    <input
                                      type="text"
                                      value={p.image || ''}
                                      onChange={e => {
                                        const newMenu = [...config.menuSavory];
                                        newMenu[originalCatIdx].variants[originalVarIdx].prices[originalPriceIdx].image = e.target.value;
                                        setConfig({ ...config, menuSavory: newMenu });
                                      }}
                                      className="text-xs font-medium opacity-60 bg-transparent border-b border-transparent hover:border-black/20 focus:border-brand-orange focus:outline-none w-full"
                                      placeholder="URL Gambar (Opsional)"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 self-end w-full md:w-auto justify-end">
                                  <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-xl p-1">
                                    <span className="text-xs font-bold opacity-50 pl-2">Rp</span>
                                    <input
                                      type="number"
                                      value={p.price === '' ? '' : p.price}
                                      onFocus={(e) => e.target.select()}
                                      onChange={(e) => {
                                        const newMenu = [...config.menuSavory];
                                        newMenu[originalCatIdx].variants[originalVarIdx].prices[originalPriceIdx].price = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                                        setConfig({ ...config, menuSavory: newMenu });
                                      }}
                                      className="w-24 md:w-28 bg-white dark:bg-black/80 border-none rounded-lg p-1.5 font-bold focus:ring-2 focus:ring-brand-orange/50 outline-none text-right transition-all text-sm"
                                    />
                                  </div>
                                  <button onClick={handleSave} className="p-1.5 text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all cursor-pointer flex-shrink-0" title="Simpan Harga">
                                    <Save className="w-3 h-3" />
                                  </button>
                                  <button onClick={() => removeSavoryPrice(originalCatIdx, originalVarIdx, originalPriceIdx)} className="p-1.5 text-red-500 opacity-0 group-hover/price:opacity-100 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"><Trash2 className="w-3 h-3"/></button>
                                </div>
                              </div>
                            )})}
                            <button onClick={() => addSavoryPrice(originalCatIdx, originalVarIdx)} className="mt-2 text-xs font-bold text-brand-orange hover:text-white hover:bg-brand-orange px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1">
                              <Plus className="w-3 h-3" /> Tambah Harga
                            </button>
                          </div>
                        </div>
                      )})}
                      <button onClick={() => addSavoryVariant(originalCatIdx)} className="w-full py-2 border-2 border-dashed border-black/10 dark:border-white/10 rounded-xl flex justify-center items-center gap-2 text-sm font-bold opacity-60 hover:opacity-100 hover:border-brand-orange hover:text-brand-orange transition-all cursor-pointer">
                        <Plus className="w-4 h-4" /> Tambah Tipe
                      </button>
                    </div>
                  </div>
                )})}

                {/* BIG Add Category Button at the end */}
                <div className="bg-white/20 dark:bg-black/10 border-2 border-dashed border-black/10 dark:border-white/10 p-6 rounded-3xl flex flex-col justify-center items-center gap-4 hover:border-brand-orange hover:bg-brand-orange/5 transition-all cursor-pointer" onClick={addSavoryCategory}>
                  <div className="w-16 h-16 bg-brand-orange/20 text-brand-orange rounded-full flex justify-center items-center">
                    <Plus className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-lg">Tambah Kategori Baru</h3>
                    <p className="text-sm opacity-60">Misal: Martabak Sultan</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* Confirm Dialog Modal */}
      <AnimatePresence>
        {confirmDialog?.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setConfirmDialog(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-black/10 dark:border-white/10"
            >
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-center mb-2">{confirmDialog.title}</h3>
              <p className="text-center opacity-70 font-medium mb-8">
                {confirmDialog.message}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transition-all"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
