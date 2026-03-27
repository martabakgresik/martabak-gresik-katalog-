import type { VercelRequest, VercelResponse } from '@vercel/node';

// Test tokens resmi dari Cloudflare (docs.cloudflare.com/turnstile/troubleshooting/testing/)
const CLOUDFLARE_TEST_TOKENS = [
  'XXXX.DUMMY.TOKEN.XXXX', // always pass
];
const CLOUDFLARE_TEST_SECRET_KEYS = [
  '1x0000000000000000000000000000000AA', // always pass
  '2x0000000000000000000000000000000AB', // always fail
  '3x0000000000000000000000000000000FF', // token already spent
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!token) {
    return res.status(400).json({ error: 'Token missing' });
  }

  if (!secretKey) {
    console.error('TURNSTILE_SECRET_KEY is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // 🧪 Bypass untuk lokal/testing: jika menggunakan test secret key, langsung pass
  if (CLOUDFLARE_TEST_SECRET_KEYS.includes(secretKey)) {
    console.log('[Turnstile] Using test secret key - bypass verification');
    return res.status(200).json({ success: true, note: 'test-mode' });
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
    });

    const data = await response.json();

    if (data.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(403).json({ success: false, error: 'Robot detection failed' });
    }
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

