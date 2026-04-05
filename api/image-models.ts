import type { VercelRequest, VercelResponse } from '@vercel/node';

const FALLBACK_IMAGE_MODELS = [
  { id: 'flux', name: 'FLUX (Default)' },
  { id: 'flux-realism', name: 'FLUX Realism' },
  { id: 'flux-anime', name: 'FLUX Anime' },
  { id: 'turbo', name: 'Turbo' }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.POLLINATIONS_API_KEY;
  const headers: HeadersInit = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};

  try {
    const response = await fetch('https://image.pollinations.ai/models', { headers });
    if (!response.ok) {
      return res.status(200).json({ models: FALLBACK_IMAGE_MODELS, source: 'fallback' });
    }

    const data = await response.json();
    const normalized = (Array.isArray(data) ? data : data?.models || [])
      .map((item: any) => (typeof item === 'string' ? { id: item, name: item } : item))
      .filter((item: any) => item?.id);

    if (normalized.length === 0) {
      return res.status(200).json({ models: FALLBACK_IMAGE_MODELS, source: 'fallback' });
    }

    return res.status(200).json({ models: normalized, source: 'api' });
  } catch (error) {
    console.error('Error fetching image models:', error);
    return res.status(200).json({ models: FALLBACK_IMAGE_MODELS, source: 'fallback' });
  }
}
