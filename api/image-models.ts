import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.POLLINATIONS_API_KEY || process.env.VITE_POLLINATIONS_API_KEY;
    const headers: HeadersInit = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
    const response = await fetch("https://gen.pollinations.ai/image/models", { headers });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Error fetching image models:", error);
    return res.status(500).json({ error: "Failed to fetch image models" });
  }
}
