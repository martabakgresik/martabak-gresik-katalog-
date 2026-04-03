import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch("https://gen.pollinations.ai/image/models");
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Error fetching image models:", error);
    return res.status(500).json({ error: "Failed to fetch image models" });
  }
}
