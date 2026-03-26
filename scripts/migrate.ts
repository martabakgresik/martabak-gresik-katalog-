import { createClient } from '@supabase/supabase-js';
import { 
  MENU_SWEET, 
  MENU_SAVORY, 
  STORE_NAME, 
  OPEN_HOUR, 
  CLOSE_HOUR, 
  PROMO_CODE, 
  PROMO_PERCENT 
} from '../src/data/config';

// Ganti dengan URL dan Anon Key Anda jika belum ada di .env
const SUPABASE_URL = "https://qohvacfwdsceoyvjtbdg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvaHZhY2Z3ZHNjZW95dmp0YmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDc1NjMsImV4cCI6MjA5MDEyMzU2M30.w-1OjXidwYL0A7FmUGFmFIWhKd7HbV5a1sT1GiWV2_8";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
  console.log('🚀 Memulai migrasi data ke Supabase...');

  // 1. Migrasi Store Settings
  const { error: settingsError } = await supabase
    .from('store_settings')
    .upsert({
      id: 'main_config',
      store_name: STORE_NAME,
      open_hour: OPEN_HOUR,
      close_hour: CLOSE_HOUR,
      promo_code: PROMO_CODE,
      promo_percent: PROMO_PERCENT
    });

  if (settingsError) console.error('Error settings:', settingsError.message);
  else console.log('✅ Store settings berhasil di-upload.');

  // 2. Migrasi Categories & Items (Sweet)
  for (const cat of MENU_SWEET) {
    const { data: catData, error: catError } = await supabase
      .from('categories')
      .insert({ name: cat.category, type: 'sweet' })
      .select()
      .single();

    if (catError) {
      console.error('Error cat:', catError.message);
      continue;
    }

    const itemsToInsert = cat.items.map(item => ({
      category_id: catData.id,
      name: item.name,
      price: item.price,
      image: item.image,
      description: item.description,
      is_best_seller: (item as any).isBestSeller || false
    }));

    const { error: itemError } = await supabase.from('menu_items').insert(itemsToInsert);
    if (itemError) console.error('Error items:', itemError.message);
  }

  // 3. Migrasi Categories & Items (Savory)
  for (const cat of MENU_SAVORY) {
    const { data: catData, error: catError } = await supabase
      .from('categories')
      .insert({ name: cat.title, type: 'savory' })
      .select()
      .single();

    if (catError) continue;

    for (const variant of cat.variants) {
      const itemsToInsert = variant.prices.map(p => ({
        category_id: catData.id,
        name: variant.type,
        price: p.price,
        qty: p.qty,
        variant_type: variant.type,
        image: p.image || "/images/placeholder.webp",
        description: variant.description || "",
        is_best_seller: (p as any).isBestSeller || false
      }));
      await supabase.from('menu_items').insert(itemsToInsert);
    }
  }

  console.log('🎉 Migrasi selesai!');
}

migrate();
