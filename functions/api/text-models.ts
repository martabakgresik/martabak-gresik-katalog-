export const onRequestGet = async (context) => {
  const { env } = context;

  try {
    const apiKey = env.POLLINATIONS_API_KEY;
    const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};

    let response = await fetch("https://gen.pollinations.ai/text/models", { headers });
    if (!response.ok) {
      response = await fetch("https://gen.pollinations.ai/v1/models", { headers });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error fetching text models:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch text models" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
