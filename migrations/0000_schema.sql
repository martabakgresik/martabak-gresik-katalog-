DROP TABLE IF EXISTS store_settings;
DROP TABLE IF EXISTS menu_sweet_categories;
DROP TABLE IF EXISTS menu_sweet_items;
DROP TABLE IF EXISTS menu_savory_categories;
DROP TABLE IF EXISTS menu_savory_variants;
DROP TABLE IF EXISTS menu_savory_prices;
DROP TABLE IF EXISTS addons_sweet;
DROP TABLE IF EXISTS addons_savory;

CREATE TABLE addons_sweet (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  price INTEGER,
  min_qty INTEGER DEFAULT 1,
  max_qty INTEGER DEFAULT 20,
  default_qty INTEGER DEFAULT 1,
  disabled INTEGER DEFAULT 0
);

CREATE TABLE addons_savory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  price INTEGER,
  min_qty INTEGER DEFAULT 1,
  max_qty INTEGER DEFAULT 20,
  default_qty INTEGER DEFAULT 1,
  disabled INTEGER DEFAULT 0
);

CREATE TABLE store_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  open_hour TEXT,
  close_hour TEXT,
  active_promo_code TEXT,
  active_promo_percent INTEGER,
  shipping_rate INTEGER,
  max_distance INTEGER,
  store_name TEXT,
  store_address TEXT,
  store_phone TEXT,
  is_emergency_closed INTEGER DEFAULT 0,
  is_store_closed INTEGER DEFAULT 0,
  holidays_json TEXT,
  store_logo TEXT DEFAULT '/logo.webp',
  maintenance_logo TEXT,
  maintenance_end_time TEXT DEFAULT '',
  event_modal_active INTEGER DEFAULT 0,
  event_modal_title TEXT DEFAULT '',
  event_modal_content TEXT DEFAULT '',
  event_modal_image TEXT DEFAULT '',
  event_modal_start TEXT DEFAULT '',
  event_modal_end TEXT DEFAULT '',
  maintenance_reason TEXT DEFAULT '',
  maintenance_title TEXT,
  promo_start_at TEXT DEFAULT '',
  promo_end_at TEXT DEFAULT ''
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
(id, open_hour, close_hour, active_promo_code, active_promo_percent, shipping_rate, max_distance, store_name, store_address, store_phone, is_emergency_closed, is_store_closed, holidays_json, store_logo, maintenance_logo, maintenance_end_time, event_modal_active, event_modal_title, event_modal_content, event_modal_image, event_modal_start, event_modal_end, maintenance_reason, maintenance_title, promo_start_at, promo_end_at)
VALUES 
(1, '15:00', '23:59', 'MARTABAKBARU', 10, 2500, 15, 'Martabak Gresik ', 'Jl. Usman Sadar NO. 10, Gresik', '+6281330763633', 0, 0, '["2026-06-04"]', '/logo.webp', NULL, '', 0, '', '', '', '', '', '', '', '', '');



-- SEED DATA FROM CSV --

INSERT INTO menu_sweet_categories (id, name) VALUES 
(1, 'Terang Bulan Standard'),
(2, 'Terang Bulan Pandan'),
(3, 'Terang Bulan Redvelvet'),
(4, 'Terang Bulan Blackforest');

INSERT INTO menu_sweet_items (category_id, name, price, description) VALUES 
(1, 'Kacang', 12000, ''),
(1, 'Coklat', 12000, ''),
(1, 'Kacang + Coklat', 14000, ''),
(1, 'Kacang + Coklat + Keju', 19000, ''),
(1, 'Keju', 17000, ''),
(1, 'Keju + Kacang', 18000, ''),
(1, 'Keju + Coklat', 18000, ''),
(2, 'Pandan Kacang', 13000, ''),
(2, 'Pandan Coklat', 13000, ''),
(2, 'Pandan Kacang + Coklat', 15000, ''),
(2, 'Pandan Kacang + Coklat + Keju', 21000, ''),
(2, 'Pandan Keju', 20000, ''),
(2, 'Pandan Coklat Keju', 20000, ''),
(2, 'Pandan Kacang + Keju', 20000, ''),
(3, 'Red Velvet Kacang', 14000, ''),
(3, 'Red Velvet Coklat', 14000, ''),
(3, 'Red Velvet Kacang Coklat', 16000, ''),
(3, 'Red Velvet Kacang Coklat Keju', 21000, ''),
(3, 'Red Velvet Keju', 20000, ''),
(3, 'Red Velvet Keju + Coklat', 21000, ''),
(3, 'Red Velvet Keju + Kacang', 21000, ''),
(4, 'Blackforest Kacang', 25000, ''),
(4, 'Blackforest Coklat', 25000, ''),
(4, 'Blackforest Kacang Coklat', 26000, ''),
(4, 'Blackforest Kacang Coklat Keju', 29000, ''),
(4, 'Blackforest Keju', 27000, ''),
(4, 'Blackforest Keju Kacang', 28000, ''),
(4, 'Blackforest Keju Coklat', 28000, '');

INSERT INTO menu_savory_categories (id, title) VALUES 
(1, 'Daging Sapi'),
(2, 'Daging Ayam'),
(3, 'Menu Pedas');

INSERT INTO menu_savory_variants (id, category_id, type) VALUES 
(1, 1, 'Telor Ayam'),
(2, 1, 'Telor Bebek'),
(3, 2, 'Telor Ayam'),
(4, 2, 'Telor Bebek'),
(5, 3, 'Samyang Ayam Pedas'),
(6, 3, 'Samyang Sapi Pedas');

INSERT INTO menu_savory_prices (variant_id, qty, price) VALUES 
(1, 2, 25000),
(1, 3, 34000),
(1, 4, 42000),
(1, 5, 45000),
(2, 2, 26000),
(2, 3, 35000),
(2, 4, 44000),
(2, 5, 50000),
(3, 2, 22000),
(3, 3, 30000),
(3, 4, 35000),
(3, 5, 40000),
(4, 2, 24000),
(4, 3, 32000),
(4, 4, 40000),
(4, 5, 45000),
(5, 2, 30000),
(6, 2, 32000);

INSERT INTO addons_sweet (name, price) VALUES 
('Tambah Coklat', 3000),
('Tambah Kacang', 2000),
('Tambah Keju', 7000),
('Tambah Milo', 5000);

INSERT INTO addons_savory (name, price, min_qty, max_qty, default_qty, disabled) VALUES 
('Tambah Sosis', 2000, 1, 20, 3, 0),
('Tambah Kornet', 13000, 1, 20, 1, 1),
('Tambah Jamur', 10000, 1, 20, 1, 1),
('Tambah Acar', 2000, 1, 20, 1, 0),
('Tambah Irisan Cabe', 400, 1, 20, 5, 0),
('Tambah Saus', 2000, 1, 20, 1, 0),
('Tambah Sambal Pedas', 5000, 1, 20, 1, 0);

