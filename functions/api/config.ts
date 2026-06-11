import {
  OPEN_HOUR,
  CLOSE_HOUR,
  PROMO_CODE,
  PROMO_PERCENT,
  SHIPPING_RATE_PER_KM,
  MAX_SHIPPING_DISTANCE,
  HOLIDAYS,
  MENU_SWEET,
  MENU_SAVORY,
  STORE_NAME,
  STORE_ADDRESS,
  STORE_PHONE
} from '../../src/data/config';

export const onRequestGet = async (context) => {
  const { env } = context;
  const kv = env.MARTABAK_KV;
  
  const defaults = {
    storeSettings: {
      openHour: OPEN_HOUR,
      closeHour: CLOSE_HOUR,
      activePromoCode: PROMO_CODE,
      activePromoPercent: PROMO_PERCENT,
      shippingRate: SHIPPING_RATE_PER_KM,
      maxDistance: MAX_SHIPPING_DISTANCE,
      holidays: HOLIDAYS,
      storeName: STORE_NAME,
      storeAddress: STORE_ADDRESS,
      storePhone: STORE_PHONE,
      isEmergencyClosed: false,
      promoStartAt: null,
      promoEndAt: null
    },
    menuSweet: MENU_SWEET,
    menuSavory: MENU_SAVORY
  };

  if (!kv) {
    return new Response(JSON.stringify(defaults), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  const savedSettingsStr = await kv.get('storeConfig');
  if (savedSettingsStr) {
    try {
      const data = JSON.parse(savedSettingsStr);
      return new Response(JSON.stringify({
        ...defaults,
        ...data,
        storeSettings: { ...defaults.storeSettings, ...(data.storeSettings || {}) }
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch(e) {}
  }
  
  return new Response(JSON.stringify(defaults), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

export const onRequestPost = async (context) => {
  const { request, env } = context;
  const kv = env.MARTABAK_KV;
  
  try {
    const body = await request.json();
    const { adminPassword, configData } = body;
    
    // Fallback password for dev if not set
    const validPassword = env.ADMIN_PASSWORD || "admin123";
    
    if (adminPassword !== validPassword) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    
    if (!kv) {
       return new Response(JSON.stringify({ error: 'KV not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    await kv.put('storeConfig', JSON.stringify(configData));
    
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
};
