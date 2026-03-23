import { useState, useEffect } from "react";

export interface Addon {
  name: string;
  price: number;
  disabled?: boolean;
  minQty?: number;
  maxQty?: number;
  defaultQty?: number;
  quantity?: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  note?: string;
  addons?: Addon[];
  description?: string;
  image?: string;
}

export const SHIPPING_RATE_PER_KM = 2500;
export const MAX_SHIPPING_DISTANCE = 10;

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('martabak_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [distance, setDistance] = useState<number>(0);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [promoCode, setPromoCode] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");
  const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    localStorage.setItem('martabak_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'id' | 'quantity'>) => {
    const addonsString = item.addons ? item.addons.map(a => `${a.name}(${a.quantity || 1})`).sort().join(',') : '';
    const id = `${item.name}-${item.category || ''}-${addonsString}`;
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, id, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const updateNote = (id: string, note: string) => {
    setCart(prev => prev.map(i =>
      i.id === id ? { ...i, note } : i
    ));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const itemsPrice = cart.reduce((sum, item) => {
    const itemAddonsPrice = item.addons ? item.addons.reduce((a, b) => a + (b.price * (b.quantity || 1)), 0) : 0;
    return sum + ((item.price + itemAddonsPrice) * item.quantity);
  }, 0);
  const shippingCost = deliveryMethod === 'delivery' ? distance * SHIPPING_RATE_PER_KM : 0;
  const discountAmount = Math.round(itemsPrice * (discountPercent / 100));
  const totalPrice = itemsPrice + shippingCost - discountAmount;

  const applyPromoCode = (code: string) => {
    if (code.toUpperCase() === "MARTABAKBARU") {
      setPromoCode(code.toUpperCase());
      setDiscountPercent(10);
      return { success: true, message: "Kode promo berhasil digunakan! Diskon 10% diterapkan." };
    }
    setPromoCode("");
    setDiscountPercent(0);
    return { success: false, message: "Kode promo tidak valid." };
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      return { success: false, message: "Geolocation tidak didukung oleh browser ini." };
    }

    return new Promise<{ success: boolean, message: string }>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          resolve({ success: true, message: "Lokasi berhasil dideteksi!" });
        },
        (error) => {
          let msg = "Gagal mendapatkan lokasi.";
          if (error.code === 1) msg = "Izin lokasi ditolak.";
          resolve({ success: false, message: msg });
        }
      );
    });
  };

  const isGoogleMapsLink = (text: string) => {
    return /https?:\/\/(maps\.(app\.)?goo\.gl|goo\.gl\/maps|www\.google\.com\/maps|maps\.google\.com)/.test(text);
  };

  const processAddressWithAI = async (address: string) => {
    if (!address || address.length < 5) return null;

    // Use VITE_ prefix as required by Vite for client-side exposure, 
    // but the user reminded the source is POLLINATIONS_API_KEY
    const apiKey = import.meta.env.VITE_POLLINATIONS_API_KEY || import.meta.env.POLLINATIONS_API_KEY;
    if (!apiKey) {
      const errorMsg = "⚠️ POLLINATIONS_API_KEY tidak ditemukan (VITE_ prefix diperlukan untuk browser). Mohon cek konfigurasi .env Anda.";
      console.error(errorMsg);
      alert(errorMsg);
      return null;
    }

    try {
      const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          messages: [
            { 
              role: 'system', 
              content: `Sistem ahli geocoding dan validasi wilayah Gresik. 
              LOKASI TOKO: Jl. Usman Sadar No. 10, Gresik (Pusat Kota).
              
              TUGAS: 
              1. Analisis apakah alamat "${address}" berada di wilayah kabupaten Gresik, Jawa Timur, Indonesia.
              2. Estimasi secara akurat jarak (dalam angka KM) dari TOKO (Jl. Usman Sadar No. 10) ke alamat tujuan.
                 - CATATAN GEOGRAFI: Jl. Pahlawan, Jl. Basuki Rahmat, Jl. Jaksa Agung adalah area DEKAT (< 1.5 KM).
                 - Gunakan estimasi rute jalan raya, bukan garis lurus.
              3. Pastikan alamat mencantumkan NOMOR RUMAH yang jelas.
              4. Jika VALID (Gresik, <= 10KM, & Ada No Rumah): Return JSON: {"success": true, "beautifiedAddress": "Alamat yang diperbaiki", "googleMapsLink": "https://www.google.com/maps/search/...", "distance": [angka_km_presisi]}.
              5. Jika INVALID (Luar Gresik, > 10KM, atau TANPA No Rumah): Return JSON: {"success": false, "error": "Pesan peringatan dalam Bahasa Indonesia yang spesifik (misal: 'Mohon cantumkan nomor rumah' atau 'Di luar wilayah Gresik') dan minta konfirmasi admin"}.
              
              ATURAN: Return HANYA JSON tersebut. Tanpa markdown backticks, tanpa penjelasan.` 
            },
            { role: 'user', content: `Validasi dan proses alamat ini: ${address}` }
          ],
          model: 'openai-fast'
        })
      });

      const data = await response.json();
      const aiContent = data.choices[0].message.content.trim();
      
      // Attempt to parse JSON
      try {
        const result = JSON.parse(aiContent.replace(/```json|```/g, ''));
        return result;
      } catch (parseError) {
        console.error("AI JSON Parse Error:", parseError, aiContent);
        // Fallback for simple link return if AI fails JSON format
        if (isGoogleMapsLink(aiContent)) {
          return { success: true, googleMapsLink: aiContent };
        }
        return null;
      }
    } catch (error) {
      console.error("AI Address Processing Error:", error);
      return null;
    }
  };

  const reverseGeocodeWithAI = async (lat: number, lng: number) => {
    const apiKey = import.meta.env.VITE_POLLINATIONS_API_KEY;
    if (!apiKey) return null;

    try {
      const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          messages: [
            { 
              role: 'system', 
              content: 'Sistem ahli geocoding. Tugas: Berikan alamat jalan yang lengkap, akurat, dan manusiawi berdasarkan koordinat latitude dan longitude yang diberikan. Contoh return: "Jl. Usman Sadar No. 10, Gresik, Jawa Timur". Berikan HANYA teks alamat tersebut tanpa penjelasan lain, tanpa markdown.' 
            },
            { role: 'user', content: `Berapa alamat untuk koordinat ini: ${lat}, ${lng}?` }
          ],
          model: 'openai-fast'
        })
      });

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error("AI Reverse Geocoding Error:", error);
      return null;
    }
  };

  const sendWhatsAppOrder = () => {
    const phoneNumber = "6281330763633";
    let message = "*PESANAN BARU - MARTABAK GRESIK*\n\n";

    message += `*DATA PELANGGAN:*\n`;
    message += `Nama: ${customerName || '-'}\n`;
    if (deliveryMethod === 'delivery') {
      const containsMapsLink = isGoogleMapsLink(customerAddress);
      message += `Alamat: ${customerAddress || '-'}\n`;
      
      if (containsMapsLink) {
        message += `📍 *Lokasi (Share Link dari Pembeli)*\n`;
      } else if (coordinates) {
        message += `📍 *Lokasi (GPS Terdeteksi):* https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}\n`;
      }
    }
    message += `\n*PESANAN:*\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      if (item.category) message += `   (${item.category})\n`;

      const itemAddonsPrice = item.addons ? item.addons.reduce((a, b) => a + (b.price * (b.quantity || 1)), 0) : 0;
      if (item.addons && item.addons.length > 0) {
        item.addons.forEach(addon => {
          message += `   + ${addon.name} ${addon.quantity && addon.quantity > 1 ? `(${addon.quantity}x)` : ''}\n`;
        });
      }

      if (item.note) {
        const lines = item.note.split('\n').filter(l => l.trim());
        lines.forEach(line => {
          message += `   _(${line.trim()})_\n`;
        });
      }
      message += `   ${item.quantity}x ${formatPrice(item.price + itemAddonsPrice)} = *${formatPrice((item.price + itemAddonsPrice) * item.quantity)}*\n\n`;
    });

    message += `--------------------------\n`;
    message += `Metode: *${deliveryMethod === 'pickup' ? 'AMBIL SENDIRI' : 'KIRIM KE ALAMAT'}*\n`;
    if (deliveryMethod === 'delivery' && distance > 0) {
      message += `Ongkir (${distance}km): ${formatPrice(shippingCost)}\n`;
    }
    if (discountAmount > 0) {
      message += `Diskon Promo (${promoCode}): -${formatPrice(discountAmount)}\n`;
    }
    message += `*TOTAL PEMBAYARAN: ${formatPrice(totalPrice)}*\n\n`;
    message += `Mohon segera diproses ya, terima kasih! 🙏`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  return {
    cart,
    setCart,
    distance,
    setDistance,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateNote,
    totalItems,
    itemsPrice,
    shippingCost,
    discountAmount,
    totalPrice,
    promoCode,
    discountPercent,
    customerName,
    setCustomerName,
    customerAddress,
    setCustomerAddress,
    coordinates,
    deliveryMethod,
    setDeliveryMethod,
    applyPromoCode,
    detectLocation,
    sendWhatsAppOrder,
    isGoogleMapsLink,
    processAddressWithAI,
    reverseGeocodeWithAI
  };
};
