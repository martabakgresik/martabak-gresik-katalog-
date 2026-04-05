import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, prompt, systemPrompt, model } = req.body;
  const apiKey = process.env.POLLINATIONS_API_KEY || process.env.VITE_POLLINATIONS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key not configured on server' });
  }

  // Construct messages: prioritize 'messages' array, then 'prompt'
  let apiMessages = Array.isArray(messages) ? messages : null;
  
  if (!apiMessages && prompt) {
    apiMessages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: prompt }
    ];
  }

  if (!apiMessages || apiMessages.length === 0) {
    return res.status(400).json({ error: 'Missing messages or prompt' });
  }

  try {
    const selectedModel = model || 'openai'; // default to openai as per docs
    
    const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: apiMessages,
        model: selectedModel,
        seed: -1 // randomize by default
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('API Error:', data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in AI Proxy:', error);
    return res.status(500).json({ error: 'Failed to communicate with AI provider' });
  }
}

