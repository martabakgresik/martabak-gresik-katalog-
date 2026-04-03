import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.POLLINATIONS_API_KEY || process.env.VITE_POLLINATIONS_API_KEY;

  const { prompt, model = "flux", size = "1024x1024" } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt wajib diisi" });
  }

  const [width = "1024", height = "1024"] = String(size).split("x");

  const generateViaOpenAICompat = async (modelId: string) => {
    if (!apiKey) return null;

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
    const initialResult = await generateViaOpenAICompat(model);
    let response = initialResult?.response;
    let data = initialResult?.data;
    let selectedModel = apiKey ? model : "flux";

    // fallback ke model gratis paling stabil bila model pilihan gagal/berbayar
    if (response && !response.ok && model !== "flux") {
      const retry = await generateViaOpenAICompat("flux");
      if (retry) {
        response = retry.response;
        data = retry.data;
        selectedModel = "flux";
      }
    }

    // Hindari 403 di direct URL fallback saat model berbayar/tidak diizinkan
    if (response && !response.ok && selectedModel !== "flux") {
      selectedModel = "flux";
    }

    if (response?.ok) {
      return res.status(200).json({
        ...data,
        meta: { source: "openai-compatible", model: selectedModel }
      });
    }

    // fallback terakhir: direct URL mode mengikuti format docs Pollinations
    // https://gen.pollinations.ai/image/<prompt>
    // Hindari bearer/query-key karena browser <img> tidak mengirim Authorization header.
    const directParams = new URLSearchParams();
    if (selectedModel && selectedModel !== "flux") {
      directParams.set("model", selectedModel);
    }
    if (width && height) {
      directParams.set("width", width);
      directParams.set("height", height);
    }
    directParams.set("seed", "-1");
    directParams.set("enhance", "true");
    directParams.set("nologo", "true");

    const imageUrl =
      `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}` +
      (directParams.toString() ? `?${directParams.toString()}` : "");

    return res.status(200).json({
      data: [{ url: imageUrl }],
      meta: { source: "direct-url", model: selectedModel },
      warning:
        data?.error?.message ||
        data?.error ||
        (!apiKey
          ? "API key not configured, using anonymous direct URL fallback"
          : "Using direct URL fallback")
    });
  } catch (error) {
    console.error("Error in image proxy:", error);
    return res.status(500).json({ error: "Failed to generate image" });
  }
}
