import {
  OPEN_HOUR, CLOSE_HOUR, PROMO_CODE, PROMO_PERCENT, SHIPPING_RATE_PER_KM, 
  MAX_SHIPPING_DISTANCE, HOLIDAYS, MENU_SWEET, MENU_SAVORY, 
  STORE_NAME, STORE_ADDRESS, STORE_PHONE, ADDONS_SWEET, ADDONS_SAVORY
} from '../../src/data/config';

export const onRequestGet = async (context) => {
  const { env } = context;
  const d1 = env.MARTABAK_D1 || env["MARTABAK_D1 "] || env["MARTABAK_D1  "];
  
  const defaults = {
    storeSettings: {
      openHour: OPEN_HOUR, closeHour: CLOSE_HOUR, activePromoCode: PROMO_CODE,
      activePromoPercent: PROMO_PERCENT, shippingRate: SHIPPING_RATE_PER_KM,
      maxDistance: MAX_SHIPPING_DISTANCE, holidays: HOLIDAYS,
      storeName: STORE_NAME, storeAddress: STORE_ADDRESS, storePhone: STORE_PHONE,
      isEmergencyClosed: false, isStoreClosed: false, maintenanceEndTime: '', maintenanceReason: '', maintenanceTitle: '', promoStartAt: null, promoEndAt: null,
      eventModalActive: false, eventModalTitle: '', eventModalContent: '', eventModalImage: '', eventModalStart: '', eventModalEnd: '',
      storeLogo: '/logo.webp', maintenanceLogo: ''
    },
    menuSweet: MENU_SWEET,
    menuSavory: MENU_SAVORY,
    addonsSweet: ADDONS_SWEET,
    addonsSavory: ADDONS_SAVORY
  };

  if (!d1) return new Response(JSON.stringify({ error: 'DEBUG_ENV', keys: Object.keys(env) }), { status: 200, headers: { 'Content-Type': 'application/json' } });

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
        isEmergencyClosed: Boolean(settingsRow.is_emergency_closed),
        maintenanceEndTime: settingsRow.maintenance_end_time || '',
        maintenanceReason: settingsRow.maintenance_reason || '',
        maintenanceTitle: settingsRow.maintenance_title || '',
        eventModalActive: Boolean(settingsRow.event_modal_active),
        eventModalTitle: settingsRow.event_modal_title || '',
        eventModalContent: settingsRow.event_modal_content || '',
        eventModalImage: settingsRow.event_modal_image || '',
        eventModalStart: settingsRow.event_modal_start || '',
        eventModalEnd: settingsRow.event_modal_end || '',
        isStoreClosed: Boolean(settingsRow.is_store_closed),
        promoStartAt: settingsRow.promo_start_at || '',
        promoEndAt: settingsRow.promo_end_at || '',
        storeLogo: settingsRow.store_logo || '/logo.webp',
        maintenanceLogo: settingsRow.maintenance_logo || ''
      };
    }

    // Load Sweet Menu
    const { results: sweetCats } = await d1.prepare("SELECT * FROM menu_sweet_categories ORDER BY id").all();
    if (sweetCats && sweetCats.length > 0) {
      const { results: sweetItems } = await d1.prepare("SELECT * FROM menu_sweet_items").all();
      responseData.menuSweet = sweetCats.map((cat: any) => ({
        category: cat.name,
        items: sweetItems.filter((i: any) => i.category_id === cat.id).map((i: any) => {
          const defaultCat = defaults.menuSweet.find(c => c.category === cat.name);
          const defaultItem = defaultCat?.items?.find(item => item.name === i.name);
          return {
            name: i.name, price: i.price, description: i.description, 
            image: i.image || defaultItem?.image || '', 
            isBestSeller: Boolean(i.is_best_seller), highlight: Boolean(i.highlight)
          };
        })
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
          prices: savoryPrices.filter((p: any) => p.variant_id === v.id).map((p: any) => {
            const defaultCat = defaults.menuSavory.find(c => c.title === cat.title);
            const defaultVariant = defaultCat?.variants?.find(dv => dv.type === v.type);
            const defaultPrice = defaultVariant?.prices?.find(dp => dp.qty === p.qty);
            return {
              qty: p.qty, price: p.price, desc: p.desc, 
              image: p.image || defaultPrice?.image || '',
              isBestSeller: Boolean(p.is_best_seller), highlight: Boolean(p.highlight)
            };
          })
        }))
      }));
    }

    // Load Addons Sweet
    const { results: dbAddonsSweet } = await d1.prepare("SELECT * FROM addons_sweet ORDER BY id").all();
    if (dbAddonsSweet && dbAddonsSweet.length > 0) {
      responseData.addonsSweet = dbAddonsSweet.map((a: any) => ({
        name: a.name, price: a.price, minQty: a.min_qty, maxQty: a.max_qty, defaultQty: a.default_qty, disabled: Boolean(a.disabled)
      }));
    }

    // Load Addons Savory
    const { results: dbAddonsSavory } = await d1.prepare("SELECT * FROM addons_savory ORDER BY id").all();
    if (dbAddonsSavory && dbAddonsSavory.length > 0) {
      responseData.addonsSavory = dbAddonsSavory.map((a: any) => ({
        name: a.name, price: a.price, minQty: a.min_qty, maxQty: a.max_qty, defaultQty: a.default_qty, disabled: Boolean(a.disabled)
      }));
    }

    return new Response(JSON.stringify(responseData), { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      } 
    });
  } catch(e) {
    console.error("D1 GET Error:", e);
    return new Response(JSON.stringify(defaults), { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      } 
    });
  }
};

export const onRequestPost = async (context) => {
  const { request, env } = context;
  const d1 = env.MARTABAK_D1 || env["MARTABAK_D1 "] || env["MARTABAK_D1  "];
  
  try {
    const body = await request.json();
    const { adminPassword, configData } = body;
    const validPassword = env.ADMIN_PASSWORD || "admin123";
    if (adminPassword !== validPassword) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    if (!d1) return new Response(JSON.stringify({ error: 'D1 not configured' }), { status: 500 });

    const isValidImageUrl = (url) => {
      if (!url) return true;
      if (url.startsWith('/')) return true;
      if (url.startsWith('http://') || url.startsWith('https://')) return true;
      return false;
    };

    const s = configData.storeSettings || {};

    if (!isValidImageUrl(s.storeLogo) || !isValidImageUrl(s.maintenanceLogo) || !isValidImageUrl(s.eventModalImage)) {
      return new Response(JSON.stringify({ error: 'Format URL Gambar tidak valid. Harus diawali http://, https://, atau /' }), { status: 400 });
    }

    const batchStmts = [];

    // 1. SETTINGS UPDATE
    batchStmts.push(
      d1.prepare(`
        UPDATE store_settings SET 
          open_hour = ?, close_hour = ?, active_promo_code = ?, active_promo_percent = ?,
          shipping_rate = ?, max_distance = ?, store_name = ?, store_address = ?, store_phone = ?, 
          is_emergency_closed = ?, is_store_closed = ?, maintenance_end_time = ?, maintenance_reason = ?, maintenance_title = ?, holidays_json = ?,
          event_modal_active = ?, event_modal_title = ?, event_modal_content = ?, event_modal_image = ?, event_modal_start = ?, event_modal_end = ?, store_logo = ?, maintenance_logo = ?, promo_start_at = ?, promo_end_at = ?
        WHERE id = 1
      `).bind(
        s.openHour ?? "15:00", s.closeHour ?? "23:00", s.activePromoCode ?? null, s.activePromoPercent ?? 0, s.shippingRate ?? 0, s.maxDistance ?? 0,
        s.storeName ?? null, s.storeAddress ?? null, s.storePhone ?? null, s.isEmergencyClosed ? 1 : 0, s.isStoreClosed ? 1 : 0, s.maintenanceEndTime ?? '', s.maintenanceReason ?? '', s.maintenanceTitle ?? '', JSON.stringify(s.holidays || []),
        s.eventModalActive ? 1 : 0, s.eventModalTitle ?? '', s.eventModalContent ?? '', s.eventModalImage ?? '', s.eventModalStart ?? '', s.eventModalEnd ?? '', s.storeLogo ?? '/logo.webp', s.maintenanceLogo ?? '', s.promoStartAt ?? '', s.promoEndAt ?? ''
      )
    );
    batchStmts.push(d1.prepare("DELETE FROM menu_sweet_items"));
    batchStmts.push(d1.prepare("DELETE FROM menu_sweet_categories"));
    batchStmts.push(d1.prepare("DELETE FROM menu_savory_prices"));
    batchStmts.push(d1.prepare("DELETE FROM menu_savory_variants"));
    batchStmts.push(d1.prepare("DELETE FROM menu_savory_categories"));

    // 3. PREPARE ADDONS
    if (configData.addonsSweet) {
      batchStmts.push(d1.prepare("DELETE FROM addons_sweet"));
      for (const a of configData.addonsSweet) {
        batchStmts.push(
          d1.prepare("INSERT INTO addons_sweet (name, price, min_qty, max_qty, default_qty, disabled) VALUES (?, ?, ?, ?, ?, ?)")
            .bind(a.name ?? '', Number(a.price) || 0, Number(a.minQty) || 1, Number(a.maxQty) || 20, Number(a.defaultQty) || 1, a.disabled ? 1 : 0)
        );
      }
    }
    if (configData.addonsSavory) {
      batchStmts.push(d1.prepare("DELETE FROM addons_savory"));
      for (const a of configData.addonsSavory) {
        batchStmts.push(
          d1.prepare("INSERT INTO addons_savory (name, price, min_qty, max_qty, default_qty, disabled) VALUES (?, ?, ?, ?, ?, ?)")
            .bind(a.name ?? '', Number(a.price) || 0, Number(a.minQty) || 1, Number(a.maxQty) || 20, Number(a.defaultQty) || 1, a.disabled ? 1 : 0)
        );
      }
    }

    // Execute first batch (Settings + Deletes + Addons)
    await d1.batch(batchStmts);

    // 4. INSERT SWEET MENU (Iterative for categories to get ID, batched for items)
    const sweetItemsBatch = [];
    for (const cat of (configData.menuSweet || [])) {
      const { meta } = await d1.prepare("INSERT INTO menu_sweet_categories (name) VALUES (?)").bind(cat.category ?? 'Uncategorized').run();
      const catId = meta.last_row_id;
      for (const item of (cat.items || [])) {
        sweetItemsBatch.push(
          d1.prepare(`INSERT INTO menu_sweet_items (category_id, name, price, description, image, is_best_seller, highlight) VALUES (?, ?, ?, ?, ?, ?, ?)`)
            .bind(catId, item.name ?? 'New Menu', Number(item.price) || 0, item.description ?? null, item.image ?? null, item.isBestSeller ? 1 : 0, item.highlight ? 1 : 0)
        );
      }
    }
    if (sweetItemsBatch.length > 0) await d1.batch(sweetItemsBatch);

    // 5. INSERT SAVORY MENU (Iterative for categories/variants to get IDs, batched for prices)
    const savoryItemsBatch = [];
    for (const cat of (configData.menuSavory || [])) {
      const { meta: catMeta } = await d1.prepare("INSERT INTO menu_savory_categories (title) VALUES (?)").bind(cat.title ?? 'Uncategorized').run();
      const catId = catMeta.last_row_id;
      for (const v of (cat.variants || [])) {
        const { meta: varMeta } = await d1.prepare("INSERT INTO menu_savory_variants (category_id, type, description) VALUES (?, ?, ?)")
          .bind(catId, v.type ?? 'New Variant', v.description ?? null).run();
        const varId = varMeta.last_row_id;
        for (const p of (v.prices || [])) {
          savoryItemsBatch.push(
            d1.prepare(`INSERT INTO menu_savory_prices (variant_id, qty, price, desc, image, is_best_seller, highlight) VALUES (?, ?, ?, ?, ?, ?, ?)`)
              .bind(varId, Number(p.qty) || 0, Number(p.price) || 0, p.desc ?? null, p.image ?? null, p.isBestSeller ? 1 : 0, p.highlight ? 1 : 0)
          );
        }
      }
    }
    if (savoryItemsBatch.length > 0) await d1.batch(savoryItemsBatch);

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error("D1 POST Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage || 'Invalid request' }), { status: 400 });
  }
};

