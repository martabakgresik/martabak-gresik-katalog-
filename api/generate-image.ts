import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.POLLINATIONS_API_KEY || process.env.VITE_POLLINATIONS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API Key not configured on server" });
  }

  const { prompt, model = "flux", size = "1024x1024" } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt wajib diisi" });
  }

  const [width = "1024", height = "1024"] = String(size).split("x");

  const generateViaOpenAICompat = async (modelId: string) => {
    const response = await fetch("https://gen.pollinations.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt,
        model: modelId,
        size,
        seed: -1,
        enhance: true,
        response_format: "url"
      })
    });

    const data = await response.json();
    return { response, data };
  };

  try {
    let { response, data } = await generateViaOpenAICompat(model);
    let selectedModel = model;

    // fallback ke model gratis paling stabil bila model pilihan gagal/berbayar
    if (!response.ok && model !== "flux") {
      const retry = await generateViaOpenAICompat("flux");
      response = retry.response;
      data = retry.data;
      selectedModel = "flux";
    }

    if (response.ok) {
      return res.status(200).json({
        ...data,
        meta: { source: "openai-compatible", model: selectedModel }
      });
    }

    // fallback terakhir: direct URL mode (tetap pakai api key via query param)
    const imageUrl =
      `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}` +
      `?model=${encodeURIComponent(selectedModel)}` +
      `&width=${encodeURIComponent(width)}` +
      `&height=${encodeURIComponent(height)}` +
      `&seed=-1&enhance=true&nologo=true&key=${encodeURIComponent(apiKey)}`;

    return res.status(200).json({
      data: [{ url: imageUrl }],
      meta: { source: "direct-url", model: selectedModel },
      warning: data?.error?.message || data?.error || "Using direct URL fallback"
    });
  } catch (error) {
    console.error("Error in image proxy:", error);
    return res.status(500).json({ error: "Failed to generate image" });
  }
}
