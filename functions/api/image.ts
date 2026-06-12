export const onRequestGet = async (context: any) => {
  const { request, env } = context;
  
  try {
    const url = new URL(request.url);
    const prompt = url.searchParams.get('prompt');
    
    if (!prompt) {
      return new Response('Missing prompt', { status: 400 });
    }

    const model = url.searchParams.get('model') || 'nanobanana';
    const seed = url.searchParams.get('seed') || Math.floor(Math.random() * 1000000).toString();
    const width = url.searchParams.get('width') || '800';
    const height = url.searchParams.get('height') || '400';
    
    // Construct the Pollinations URL for generating the image
    const pollinationsUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=${model}&seed=${seed}&width=${width}&height=${height}`;
    
    const apiKey = env.POLLINATIONS_API_KEY || env.VITE_POLLINATIONS_API_KEY || '';
    
    const headers: Record<string, string> = {};
    if (apiKey) {
      // Pass the API key as a Bearer token. Pollinations premium endpoints require this.
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(pollinationsUrl, {
      method: 'GET',
      headers: headers
    });

    // Stream the image directly back to the client
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        // Optional: you can choose to not cache it or cache it heavily. Since seed is random, caching is fine.
        'Cache-Control': 'public, max-age=31536000'
      }
    });
  } catch (error) {
    console.error('Error in AI Image Proxy:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
};
