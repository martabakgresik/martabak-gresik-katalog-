import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_IMAGE_MODELS = new Set([
  'flux',
  'flux-realism',
  'flux-anime',
  'turbo'
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, model, seed } = req.body || {};
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
    return res.status(400).json({ error: 'Prompt minimal 3 karakter.' });
  }

  const selectedModel = typeof model === 'string' ? model : 'flux';
  if (!ALLOWED_IMAGE_MODELS.has(selectedModel)) {
    return res.status(400).json({
      error: `Model gambar tidak didukung: "${selectedModel}".`,
      allowedModels: Array.from(ALLOWED_IMAGE_MODELS)
    });
  }

  const selectedSeed = Number.isFinite(seed)
    ? Number(seed)
    : Math.floor(Math.random() * 10_000_000);

  const safePrompt = encodeURIComponent(prompt.trim());
  const url =
    `https://image.pollinations.ai/prompt/${safePrompt}` +
    `?model=${encodeURIComponent(selectedModel)}` +
    `&seed=${selectedSeed}` +
    '&nologo=true' +
    '&safe=true';

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  return res.status(200).json({
    imageUrl: url,
    prompt: prompt.trim(),
    model: selectedModel,
    seed: selectedSeed
  });
}
