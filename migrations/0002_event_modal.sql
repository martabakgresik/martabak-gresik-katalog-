-- Migration: Add Event Modal Fields
ALTER TABLE store_settings ADD COLUMN event_modal_active INTEGER DEFAULT 0;
ALTER TABLE store_settings ADD COLUMN event_modal_title TEXT DEFAULT '';
ALTER TABLE store_settings ADD COLUMN event_modal_content TEXT DEFAULT '';
ALTER TABLE store_settings ADD COLUMN event_modal_image TEXT DEFAULT '';
ALTER TABLE store_settings ADD COLUMN event_modal_start TEXT DEFAULT '';
ALTER TABLE store_settings ADD COLUMN event_modal_end TEXT DEFAULT '';
