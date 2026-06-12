import {
  OPEN_HOUR, CLOSE_HOUR, PROMO_CODE, PROMO_PERCENT, SHIPPING_RATE_PER_KM, 
  MAX_SHIPPING_DISTANCE, HOLIDAYS, MENU_SWEET, MENU_SAVORY, 
  STORE_NAME, STORE_ADDRESS, STORE_PHONE
} from '../../src/data/config';

export const onRequestGet = async (context) => {
  const { env } = context;
  const d1 = env.MARTABAK_D1;
  
  const defaults = {
    storeSettings: {
      openHour: OPEN_HOUR, closeHour: CLOSE_HOUR, activePromoCode: PROMO_CODE,
      activePromoPercent: PROMO_PERCENT, shippingRate: SHIPPING_RATE_PER_KM,
      maxDistance: MAX_SHIPPING_DISTANCE, holidays: HOLIDAYS,
      storeName: STORE_NAME, storeAddress: STORE_ADDRESS, storePhone: STORE_PHONE,
      isEmergencyClosed: false, promoStartAt: null, promoEndAt: null
    },
    menuSweet: MENU_SWEET,
    menuSavory: MENU_SAVORY
  };

  if (!d1) return new Response(JSON.stringify(defaults), { status: 200, headers: { 'Content-Type': 'application/json' } });

  try {
    const settingsRow = await d1.prepare("SELECT * FROM store_settings WHERE id = 1").first();
    
    // Construct response matching the original JSON
    const responseData = { ...defaults };
    
    if (settingsRow) {
      responseData.storeSettings = {
        ...responseData.storeSettings,
        openHour: settingsRow.open_hour,
        closeHour: settingsRow.close_hour,
        activePromoCode: settingsRow.active_promo_code,
        activePromoPercent: settingsRow.active_promo_percent,
        shippingRate: settingsRow.shipping_rate,
        maxDistance: settingsRow.max_distance,
        holidays: JSON.parse(settingsRow.holidays_json || '[]'),
        storeName: settingsRow.store_name,
        storeAddress: settingsRow.store_address,
        storePhone: settingsRow.store_phone,
        isEmergencyClosed: Boolean(settingsRow.is_emergency_closed)
      };
    }

    // Load Sweet Menu
    const { results: sweetCats } = await d1.prepare("SELECT * FROM menu_sweet_categories ORDER BY id").all();
    if (sweetCats && sweetCats.length > 0) {
      const { results: sweetItems } = await d1.prepare("SELECT * FROM menu_sweet_items").all();
      responseData.menuSweet = sweetCats.map((cat: any) => ({
        category: cat.name,
        items: sweetItems.filter((i: any) => i.category_id === cat.id).map((i: any) => ({
          name: i.name, price: i.price, description: i.description, image: i.image, 
          isBestSeller: Boolean(i.is_best_seller), highlight: Boolean(i.highlight)
        }))
      }));
    }

    // Load Savory Menu
    const { results: savoryCats } = await d1.prepare("SELECT * FROM menu_savory_categories ORDER BY id").all();
    if (savoryCats && savoryCats.length > 0) {
      const { results: savoryVars } = await d1.prepare("SELECT * FROM menu_savory_variants").all();
      const { results: savoryPrices } = await d1.prepare("SELECT * FROM menu_savory_prices").all();
      
      responseData.menuSavory = savoryCats.map((cat: any) => ({
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

    return new Response(JSON.stringify(responseData), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch(e) {
    console.error("D1 GET Error:", e);
    return new Response(JSON.stringify(defaults), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
};

export const onRequestPost = async (context) => {
  const { request, env } = context;
  const d1 = env.MARTABAK_D1;
  
  try {
    const body = await request.json();
    const { adminPassword, configData } = body;
    const validPassword = env.ADMIN_PASSWORD || "admin123";
    if (adminPassword !== validPassword) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    if (!d1) return new Response(JSON.stringify({ error: 'D1 not configured' }), { status: 500 });

    // UPDATE SETTINGS
    const s = configData.storeSettings || {};
    await d1.prepare(`
      UPDATE store_settings SET 
        open_hour = ?, close_hour = ?, active_promo_code = ?, active_promo_percent = ?,
        shipping_rate = ?, max_distance = ?, store_name = ?, store_address = ?, store_phone = ?, 
        is_emergency_closed = ?, holidays_json = ?
      WHERE id = 1
    `).bind(
      s.openHour ?? 15, s.closeHour ?? 23, s.activePromoCode ?? null, s.activePromoPercent ?? 0, s.shippingRate ?? 0, s.maxDistance ?? 0,
      s.storeName ?? null, s.storeAddress ?? null, s.storePhone ?? null, s.isEmergencyClosed ? 1 : 0, JSON.stringify(s.holidays || [])
    ).run();

    // UPDATE SWEET MENU (Clear and re-insert for sync)
    await d1.prepare("DELETE FROM menu_sweet_items").run();
    await d1.prepare("DELETE FROM menu_sweet_categories").run();
    for (const cat of (configData.menuSweet || [])) {
      const { success, meta } = await d1.prepare("INSERT INTO menu_sweet_categories (name) VALUES (?)").bind(cat.category ?? 'Uncategorized').run();
      const catId = meta.last_row_id;
      for (const item of (cat.items || [])) {
        await d1.prepare(`INSERT INTO menu_sweet_items (category_id, name, price, description, image, is_best_seller, highlight) VALUES (?, ?, ?, ?, ?, ?, ?)`)
          .bind(catId, item.name ?? 'New Menu', Number(item.price) || 0, item.description ?? null, item.image ?? null, item.isBestSeller ? 1 : 0, item.highlight ? 1 : 0).run();
      }
    }

    // UPDATE SAVORY MENU (Clear and re-insert for sync)
    await d1.prepare("DELETE FROM menu_savory_prices").run();
    await d1.prepare("DELETE FROM menu_savory_variants").run();
    await d1.prepare("DELETE FROM menu_savory_categories").run();
    for (const cat of (configData.menuSavory || [])) {
      const { meta: catMeta } = await d1.prepare("INSERT INTO menu_savory_categories (title) VALUES (?)").bind(cat.title ?? 'Uncategorized').run();
      const catId = catMeta.last_row_id;
      for (const v of (cat.variants || [])) {
        const { meta: varMeta } = await d1.prepare("INSERT INTO menu_savory_variants (category_id, type, description) VALUES (?, ?, ?)")
          .bind(catId, v.type ?? 'New Variant', v.description ?? null).run();
        const varId = varMeta.last_row_id;
        for (const p of (v.prices || [])) {
          await d1.prepare(`INSERT INTO menu_savory_prices (variant_id, qty, price, desc, image, is_best_seller, highlight) VALUES (?, ?, ?, ?, ?, ?, ?)`)
            .bind(varId, Number(p.qty) || 0, Number(p.price) || 0, p.desc ?? null, p.image ?? null, p.isBestSeller ? 1 : 0, p.highlight ? 1 : 0).run();
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error("D1 POST Error:", error);
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }
};

