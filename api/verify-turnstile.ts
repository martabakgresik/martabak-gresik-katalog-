import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    console.error('TURNSTILE_SECRET_KEY is not set in Vercel');
    return res.status(500).json({ error: 'Server configuration error' });
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
