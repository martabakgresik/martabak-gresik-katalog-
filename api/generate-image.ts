import type { VercelRequest, VercelResponse } from '@vercel node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Hanya mendukung POST (Professional Standard v11.0)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, model, size, seed, nologo } = req.body;
  const apiKey = process.env.POLLINATIONS_API_KEY || 
                 process.env.VITE_POLLINATIONS_API_KEY;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    console.log(`[PRO-API-v11] Generating pro image for model: ${model || 'flux'}`);

    const apiResponse = await fetch('https://gen.pollinations.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey ? `Bearer ${apiKey}` : ''
      },
      body: JSON.stringify({
        prompt: String(prompt),
        model: model || 'flux',
        size: size || "1024x1024",
        seed: seed ? parseInt(String(seed)) : -1,
        nologo: nologo !== false,
        response_format: "url"
      })
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error('Pollinations v1 API Error:', errorData);
      return res.status(apiResponse.status).json(errorData);
    }

    const proData = await apiResponse.json();
    return res.status(200).json(proData);

  } catch (error) {
    console.error('Error in Professional Proxy v11:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan sistem di jalur Pro v11.0.' });
  }
}
