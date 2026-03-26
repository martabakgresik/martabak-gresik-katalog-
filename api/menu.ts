import type { VercelRequest, VercelResponse } from '@vercel/node';
import { 
  MENU_SWEET, 
  MENU_SAVORY, 
  OPEN_HOUR, 
  CLOSE_HOUR, 
  STORE_NAME, 
  STORE_ADDRESS,
  HOLIDAYS,
  PROMO_CODE,
  PROMO_PERCENT,
  SHIPPING_RATE_PER_KM,
  MAX_SHIPPING_DISTANCE
} from '../src/data/config';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for AI agents
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentDate = now.toISOString().split('T')[0];
  
  const isHoliday = HOLIDAYS.includes(currentDate);
  const isWithinOperationalHours = currentHour >= OPEN_HOUR && currentHour < CLOSE_HOUR;
  const isOpen = isWithinOperationalHours && !isHoliday;

  return res.status(200).json({
    store: {
      name: STORE_NAME,
      address: STORE_ADDRESS,
      status: {
        isOpen,
        reason: isHoliday ? 'Sedang Libur' : (!isWithinOperationalHours ? 'Toko Tutup (Buka jam 16:00)' : 'Toko Buka')
      },
      operationalHours: `${OPEN_HOUR}:00 - ${CLOSE_HOUR}:00`,
      shipping: {
        ratePerKm: SHIPPING_RATE_PER_KM,
        maxDistanceKm: MAX_SHIPPING_DISTANCE
      },
      activePromo: {
        code: PROMO_CODE,
        discountPercent: PROMO_PERCENT
      }
    },
    catalog: {
      terang_bulan: MENU_SWEET,
      martabak_telor: MENU_SAVORY
    }
  });
}
