import type { VercelRequest, VercelResponse } from '@vercel/node';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const CONFIG_PATH = path.resolve(process.cwd(), 'src/data/config.ts');

const DEFAULT_ADDONS_SWEET = [
  { name: 'Tambah Coklat', price: 3000 },
  { name: 'Tambah Kacang', price: 2000 },
  { name: 'Tambah Keju', price: 7000 },
  { name: 'Tambah Milo', price: 5000 },
];

const DEFAULT_ADDONS_SAVORY = [
  { name: 'Tambah Sosis', price: 2000, minQty: 1, maxQty: 20, defaultQty: 3 },
  { name: 'Tambah Kornet', price: 13000, disabled: true },
  { name: 'Tambah Jamur', price: 10000, disabled: true },
  { name: 'Tambah Acar', price: 2000, minQty: 1, maxQty: 20, defaultQty: 1 },
  { name: 'Tambah Irisan Cabe', price: 400, minQty: 1, maxQty: 20, defaultQty: 5 },
  { name: 'Tambah Saus', price: 2000, minQty: 1, maxQty: 20, defaultQty: 1 },
  { name: 'Tambah Sambal Pedas', price: 5000, minQty: 1, maxQty: 20, defaultQty: 1 },
];

function generateConfigFile(payload: any) {
  const storeSettings = payload?.storeSettings ?? {};
  const menuSweet = payload?.menuSweet ?? [];
  const menuSavory = payload?.menuSavory ?? [];
  const holidays = payload?.holidays ?? [];

  return `import type { Addon } from "../hooks/useCart";

export const OPEN_HOUR = ${Number(storeSettings.open ?? 16)};
export const CLOSE_HOUR = ${Number(storeSettings.close ?? 23)};

export const PROMO_CODE = ${JSON.stringify(storeSettings.promoCode ?? 'MARTABAKBARU')};
export const PROMO_PERCENT = ${Number(storeSettings.promoPct ?? 10)};

export const HOLIDAYS = ${JSON.stringify(holidays, null, 2)};

export const STORE_NAME = ${JSON.stringify(storeSettings.name ?? 'Martabak Gresik')};
export const STORE_ADDRESS = ${JSON.stringify(storeSettings.address ?? 'Jl. Usman Sadar No 10, Gresik, Jawa Timur, Indonesia')};
export const STORE_PHONE = ${JSON.stringify(storeSettings.phone ?? '081330763633')};
export const SINCE_YEAR = "2020";

export const SHIPPING_RATE_PER_KM = ${Number(storeSettings.shippingRate ?? 2500)};
export const MAX_SHIPPING_DISTANCE = ${Number(storeSettings.maxDist ?? 10)};

export const SCROLL_SPACING = "mt-2";

export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAACwdrus7K-Tn9Gd-";

export const MENU_SWEET = ${JSON.stringify(menuSweet, null, 2)};

export const MENU_SAVORY = ${JSON.stringify(menuSavory, null, 2)};

export const ADDONS_SWEET: Addon[] = ${JSON.stringify(DEFAULT_ADDONS_SWEET, null, 2)};

export const ADDONS_SAVORY: Addon[] = ${JSON.stringify(DEFAULT_ADDONS_SAVORY, null, 2)};
`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const configFileContent = generateConfigFile(req.body);
    await fs.writeFile(CONFIG_PATH, configFileContent, 'utf8');
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Failed to sync config.ts',
      message: error?.message || 'Unknown error',
    });
  }
}
