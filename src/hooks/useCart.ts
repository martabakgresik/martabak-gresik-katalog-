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
    if (!address || address.length < 5 || isGoogleMapsLink(address)) return null;

    const apiKey = import.meta.env.VITE_POLLINATIONS_API_KEY;
    if (!apiKey) {
      console.error("VITE_POLLINATIONS_API_KEY not found in environment.");
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
              content: 'Sistem ahli geocoding. Tugas: Ubah alamat teks menjadi link Google Maps SEARCH yang akurat. Format: https://www.google.com/maps/search/[alamat]. Berikan HANYA link tersebut tanpa teks lain, tanpa markdown, tanpa penjelasan. Pastikan spasi diubah menjadi tanda plus (+) atau %20.' 
            },
            { role: 'user', content: `Konversikan alamat ini: ${address}` }
          ],
          model: 'openai-fast'
        })
      });

      const data = await response.json();
      const aiLink = data.choices[0].message.content.trim();
      
      if (isGoogleMapsLink(aiLink)) {
        return aiLink;
      }
      return null;
    } catch (error) {
      console.error("AI Address Processing Error:", error);
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

      if (item.note) message += `   Catatan: _${item.note}_\n`;
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
    processAddressWithAI
  };
};
