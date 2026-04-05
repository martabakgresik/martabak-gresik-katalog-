import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, model, duration, aspect_ratio } = req.query;
  const apiKey = process.env.POLLINATIONS_API_KEY || 
                 process.env.VITE_IMAGE_API_KEY || 
                 process.env.VITE_POLLINATIONS_API_KEY;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Generate URL for Pollinations Video API
    const params = new URLSearchParams();
    if (model) params.append('model', String(model));
    if (duration) params.append('duration', String(duration));
    if (aspect_ratio) params.append('aspect_ratio', String(aspect_ratio));
    
    const targetUrl = `https://gen.pollinations.ai/video/${encodeURIComponent(String(prompt))}?${params.toString()}`;

    console.log(`Generating Video for: ${prompt}`);

    const apiResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Video API Error:', errorText);
      return res.status(apiResponse.status).json({ error: 'Gagal membuat video AI' });
    }

    const videoBuffer = await apiResponse.arrayBuffer();
    const contentType = apiResponse.headers.get('content-type') || 'video/mp4';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).send(Buffer.from(videoBuffer));

  } catch (error) {
    console.error('Error in Video Proxy:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
