import React from "react";
import { SHIPPING_RATE_PER_KM, MAX_SHIPPING_DISTANCE, STORE_PHONE } from "../data/config";
import { useAppStore } from "../store/useAppStore";

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

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export const useCart = (customShippingRate?: number, customMaxDistance?: number) => {
  const { checkoutState, setCheckoutState, storeSettings } = useAppStore();
  const rate = customShippingRate ?? storeSettings.shippingRate ?? SHIPPING_RATE_PER_KM;
  
  const [cart, setCart] = React.useState<CartItem[]>(() => {
    const saved = localStorage.getItem('martabak_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const {
    distance,
    deliveryMethod,
    customerName,
    customerAddress,
    addressNotes,
    coordinates
  } = checkoutState;

  const [promoCode, setPromoCode] = React.useState<string>("");
  const [discountPercent, setDiscountPercent] = React.useState<number>(0);

  React.useEffect(() => {
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
  const shippingCost = deliveryMethod === 'delivery' ? distance * rate : 0;
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
          setCheckoutState({
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          } as any);
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

  const updateLocation = (data: { address: string; lat: number; lng: number; distance: number }) => {
    setCheckoutState({
      customerAddress: data.address,
      coordinates: { lat: data.lat, lng: data.lng },
      distance: data.distance
    } as any);
  };

  const isGoogleMapsLink = (text: string) => {
    return /https?:\/\/(maps\.(app\.)?goo\.gl|goo\.gl\/maps|www\.google\.com\/maps|maps\.google\.com)/.test(text);
  };

  const reverseGeocodeWithAI = async (lat: number, lng: number) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Berapa alamat untuk koordinat ini: ${lat}, ${lng}?`,
          systemPrompt: 'Sistem ahli geocoding. Tugas: Berikan alamat jalan yang lengkap, akurat, dan manusiawi berdasarkan koordinat latitude dan longitude yang diberikan. Contoh return: "Jl. Usman Sadar No. 10, Gresik, Jawa Timur". Berikan HANYA teks alamat tersebut tanpa penjelasan lain, tanpa markdown.'
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
    const phone = STORE_PHONE.replace(/\D/g, '');
    const phoneNumber = phone.startsWith('0') ? '62' + phone.slice(1) : phone;
    let message = "*PESANAN BARU - MARTABAK GRESIK*\n\n";

    message += `*DATA PELANGGAN:*\n`;
    message += `Nama: ${customerName || '-'}\n`;
    if (deliveryMethod === 'delivery') {
      const containsMapsLink = isGoogleMapsLink(customerAddress);
      message += `Alamat: ${customerAddress || '-'}\n`;
      if (addressNotes) message += `Patokan: ${addressNotes}\n`;
      
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
    setDistance: (dist: number) => setCheckoutState({ distance: dist }),
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
    customerAddress,
    coordinates,
    deliveryMethod,
    setDeliveryMethod: (method: 'delivery' | 'pickup') => setCheckoutState({ deliveryMethod: method }),
    setCustomerName: (name: string) => setCheckoutState({ customerName: name }),
    setCustomerAddress: (address: string) => setCheckoutState({ customerAddress: address }),
    applyPromoCode,
    detectLocation,
    sendWhatsAppOrder,
    isGoogleMapsLink,
    reverseGeocodeWithAI,
    updateLocation
  };
};
