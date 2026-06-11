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
  const d1 = env.MARTABAK_D1;
  
  let config = {
    storeSettings: {
      openHour: OPEN_HOUR, closeHour: CLOSE_HOUR, activePromoCode: PROMO_CODE,
      activePromoPercent: PROMO_PERCENT, shippingRate: SHIPPING_RATE_PER_KM,
      maxDistance: MAX_SHIPPING_DISTANCE, holidays: HOLIDAYS,
      storeName: STORE_NAME, storeAddress: STORE_ADDRESS, isEmergencyClosed: false
    },
    menuSweet: MENU_SWEET,
    menuSavory: MENU_SAVORY
  };
  
  if (d1) {
    try {
      const settingsRow = await d1.prepare("SELECT * FROM store_settings WHERE id = 1").first();
      if (settingsRow) {
        config.storeSettings = {
          ...config.storeSettings,
          openHour: settingsRow.open_hour,
          closeHour: settingsRow.close_hour,
          activePromoCode: settingsRow.active_promo_code,
          activePromoPercent: settingsRow.active_promo_percent,
          shippingRate: settingsRow.shipping_rate,
          maxDistance: settingsRow.max_distance,
          holidays: JSON.parse(settingsRow.holidays_json || '[]'),
          storeName: settingsRow.store_name,
          storeAddress: settingsRow.store_address,
          isEmergencyClosed: Boolean(settingsRow.is_emergency_closed)
        };
      }

      const { results: sweetCats } = await d1.prepare("SELECT * FROM menu_sweet_categories ORDER BY id").all();
      if (sweetCats && sweetCats.length > 0) {
        const { results: sweetItems } = await d1.prepare("SELECT * FROM menu_sweet_items").all();
        config.menuSweet = sweetCats.map((cat: any) => ({
          category: cat.name,
          items: sweetItems.filter((i: any) => i.category_id === cat.id).map((i: any) => ({
            name: i.name, price: i.price, description: i.description, image: i.image, 
            isBestSeller: Boolean(i.is_best_seller), highlight: Boolean(i.highlight)
          }))
        }));
      }

      const { results: savoryCats } = await d1.prepare("SELECT * FROM menu_savory_categories ORDER BY id").all();
      if (savoryCats && savoryCats.length > 0) {
        const { results: savoryVars } = await d1.prepare("SELECT * FROM menu_savory_variants").all();
        const { results: savoryPrices } = await d1.prepare("SELECT * FROM menu_savory_prices").all();
        
        config.menuSavory = savoryCats.map((cat: any) => ({
          title: cat.title,
          variants: savoryVars.filter((v: any) => v.category_id === cat.id).map((v: any) => ({
            type: v.type, description: v.description,
            prices: savoryPrices.filter((p: any) => p.variant_id === v.id).map((p: any) => ({
              qty: p.qty, price: p.price, desc: p.desc, image: p.image,
              isBestSeller: Boolean(p.is_best_seller), highlight: Boolean(p.highlight)
            }))
          }))
        }));
      }
    } catch (e) {
      console.error("D1 Menu Error:", e);
    }
  }

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
      shipping: { ratePerKm: config.storeSettings.shippingRate, maxDistanceKm: config.storeSettings.maxDistance },
      activePromo: { code: config.storeSettings.activePromoCode, discountPercent: config.storeSettings.activePromoPercent }
    },
    catalog: {
      terang_bulan: config.menuSweet,
      martabak_telor: config.menuSavory
    }
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
};
