import { 
  MENU_SWEET, MENU_SAVORY, OPEN_HOUR, CLOSE_HOUR, STORE_NAME, STORE_ADDRESS,
  HOLIDAYS, PROMO_CODE, PROMO_PERCENT, SHIPPING_RATE_PER_KM, MAX_SHIPPING_DISTANCE
} from '../../src/data/config';

const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
};

export const onRequestOptions = () => new Response(null, { headers: corsHeaders });

export const onRequestGet = async (context) => {
  const { env } = context;
  const kv = env.MARTABAK_KV;
  
  let config = {
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
      isEmergencyClosed: false
    },
    menuSweet: MENU_SWEET,
    menuSavory: MENU_SAVORY
  };
  
  if (kv) {
    try {
      const saved = await kv.get('storeConfig', { type: 'json' });
      if (saved) {
        config.menuSweet = saved.menuSweet || config.menuSweet;
        config.menuSavory = saved.menuSavory || config.menuSavory;
        config.storeSettings = { ...config.storeSettings, ...(saved.storeSettings || {}) };
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Calculate local time (GMT+7)
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const localNow = new Date(utc + (3600000 * 7));
  
  const currentHour = localNow.getHours();
  const currentDate = localNow.toISOString().split('T')[0];
  
  const isHoliday = config.storeSettings.holidays.includes(currentDate);
  const isWithinOperationalHours = currentHour >= config.storeSettings.openHour && currentHour < config.storeSettings.closeHour;
  const isOpen = isWithinOperationalHours && !isHoliday && !config.storeSettings.isEmergencyClosed;

  return new Response(JSON.stringify({
    store: {
      name: config.storeSettings.storeName,
      address: config.storeSettings.storeAddress,
      status: {
        isOpen,
        reason: config.storeSettings.isEmergencyClosed ? 'Tutup Darurat' : (isHoliday ? 'Sedang Libur' : (!isWithinOperationalHours ? `Toko Tutup (Buka jam ${config.storeSettings.openHour}:00)` : 'Toko Buka'))
      },
      operationalHours: `${config.storeSettings.openHour}:00 - ${config.storeSettings.closeHour}:00`,
      shipping: {
        ratePerKm: config.storeSettings.shippingRate,
        maxDistanceKm: config.storeSettings.maxDistance
      },
      activePromo: {
        code: config.storeSettings.activePromoCode,
        discountPercent: config.storeSettings.activePromoPercent
      }
    },
    catalog: {
      terang_bulan: config.menuSweet,
      martabak_telor: config.menuSavory
    }
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
};
