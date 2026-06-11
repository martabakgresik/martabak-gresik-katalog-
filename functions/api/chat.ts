export const onRequestPost = async (context) => {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const { messages, prompt, systemPrompt, model } = body;
    const apiKey = env.POLLINATIONS_API_KEY || env.VITE_POLLINATIONS_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key not configured on server' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    let apiMessages = Array.isArray(messages) ? messages : null;
    
    if (!apiMessages && prompt) {
      apiMessages = [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ];
    }

    if (!apiMessages || apiMessages.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing messages or prompt' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const selectedModel = model || 'openai';
    
    const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: apiMessages,
        model: selectedModel,
        seed: -1
      })
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in AI Proxy:', error);
    return new Response(JSON.stringify({ error: 'Failed to communicate with AI provider' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
