DROP TABLE IF EXISTS store_settings;
DROP TABLE IF EXISTS menu_sweet_categories;
DROP TABLE IF EXISTS menu_sweet_items;
DROP TABLE IF EXISTS menu_savory_categories;
DROP TABLE IF EXISTS menu_savory_variants;
DROP TABLE IF EXISTS menu_savory_prices;

CREATE TABLE store_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  open_hour INTEGER,
  close_hour INTEGER,
  active_promo_code TEXT,
  active_promo_percent INTEGER,
  shipping_rate INTEGER,
  max_distance INTEGER,
  store_name TEXT,
  store_address TEXT,
  store_phone TEXT,
  is_emergency_closed INTEGER DEFAULT 0,
  holidays_json TEXT
);

CREATE TABLE menu_sweet_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT
);

CREATE TABLE menu_sweet_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER,
  name TEXT,
  price INTEGER,
  description TEXT,
  image TEXT,
  is_best_seller INTEGER DEFAULT 0,
  highlight INTEGER DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES menu_sweet_categories(id) ON DELETE CASCADE
);

CREATE TABLE menu_savory_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT
);

CREATE TABLE menu_savory_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER,
  type TEXT,
  description TEXT,
  FOREIGN KEY (category_id) REFERENCES menu_savory_categories(id) ON DELETE CASCADE
);

CREATE TABLE menu_savory_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  variant_id INTEGER,
  qty INTEGER,
  price INTEGER,
  desc TEXT,
  image TEXT,
  is_best_seller INTEGER DEFAULT 0,
  highlight INTEGER DEFAULT 0,
  FOREIGN KEY (variant_id) REFERENCES menu_savory_variants(id) ON DELETE CASCADE
);

-- Insert default store settings
INSERT INTO store_settings 
(id, open_hour, close_hour, active_promo_code, active_promo_percent, shipping_rate, max_distance, store_name, store_address, store_phone, is_emergency_closed, holidays_json)
VALUES 
(1, 15, 23, 'MANIS2026', 15, 3000, 15, 'Martabak Gresik (Katalog)', 'Jl. Raya Cerme No. 45, Gresik', '+6281234567890', 0, '["2026-06-04"]');
