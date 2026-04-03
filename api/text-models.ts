import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.POLLINATIONS_API_KEY;
    const headers: HeadersInit = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};

    let response = await fetch("https://gen.pollinations.ai/text/models", { headers });
    if (!response.ok) {
      response = await fetch("https://gen.pollinations.ai/v1/models", { headers });
    }

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Error fetching text models:", error);
    return res.status(500).json({ error: "Failed to fetch text models" });
  }
}
