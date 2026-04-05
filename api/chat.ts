import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, prompt, systemPrompt, model } = req.body;
  const apiKey = process.env.POLLINATIONS_API_KEY || process.env.VITE_POLLINATIONS_API_KEY;

  try {
    const selectedModel = model || 'openai';
    
    // Normalization logic: handle both 'messages' (OpenAI) or 'prompt' (Legacy/Custom)
    let finalPrompt = '';
    let finalSystem = systemPrompt || 'You are a professional translator.';

    if (Array.isArray(messages)) {
      // If messages array exists, extract prompt and system prompt
      const sysMsg = messages.find((m: any) => m.role === 'system');
      const userMsg = messages.find((m: any) => m.role === 'user');
      if (sysMsg) finalSystem = sysMsg.content;
      if (userMsg) finalPrompt = userMsg.content;
    } else {
      finalPrompt = prompt || '';
    }

    const encodedPrompt = encodeURIComponent(finalPrompt);
    const encodedSystem = encodeURIComponent(finalSystem);
    
    // EXCLUSIVE GET ROUTE for maximum stability in Vercel environment
    let getUrl = `https://text.pollinations.ai/${encodedPrompt}?model=${selectedModel}&system=${encodedSystem}`;
    if (apiKey) getUrl += `&key=${apiKey}`;
    
    const response = await fetch(getUrl);
    
    if (response.ok) {
      const textResult = await response.text();
      return res.status(200).json({
        choices: [{ message: { content: textResult } }]
      });
    }

    const errorText = await response.text();
    return res.status(response.status).json({
      error: `Pollinations Error: ${response.status} - ${errorText}`,
    });

  } catch (error: any) {
    return res.status(500).json({ error: `Fatal Proxy Error: ${error.message}` });
  }
}
