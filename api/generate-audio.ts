import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, voice, speed } = req.query;
  const apiKey = process.env.POLLINATIONS_API_KEY || 
                 process.env.VITE_IMAGE_API_KEY || 
                 process.env.VITE_POLLINATIONS_API_KEY;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    // Generate URL for Pollinations Audio API
    const params = new URLSearchParams();
    if (voice) params.append('voice', String(voice));
    if (speed) params.append('speed', String(speed));
    
    const targetUrl = `https://gen.pollinations.ai/audio/${encodeURIComponent(String(text))}?${params.toString()}`;

    console.log(`Generating Audio for: ${text}`);

    const apiResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Audio API Error:', errorText);
      return res.status(apiResponse.status).json({ error: 'Gagal membuat audio AI' });
    }

    const audioBuffer = await apiResponse.arrayBuffer();
    const contentType = apiResponse.headers.get('content-type') || 'audio/mpeg';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).send(Buffer.from(audioBuffer));

  } catch (error) {
    console.error('Error in Audio Proxy:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
