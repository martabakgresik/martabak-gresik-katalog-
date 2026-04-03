import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.POLLINATIONS_API_KEY || process.env.VITE_POLLINATIONS_API_KEY;

  const { prompt, size = "1024x1024" } = req.body || {};
  // Stabilkan endpoint: pakai flux sebagai model aman/default agar tidak kena scope-key mismatch.
  const model = "flux";
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

    const rawText = await response.text();
    let data: any = null;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = { error: { message: rawText || "Non-JSON response from provider" } };
    }
    return { response, data };
  };

  try {
    const initialResult = await generateViaOpenAICompat(model);
    let response = initialResult?.response;
    let data = initialResult?.data;
    let selectedModel = model;

    // fallback ke model gratis paling stabil bila model pilihan gagal/berbayar
    if (response && !response.ok && model !== "flux") {
      const retry = await generateViaOpenAICompat("flux");
      if (retry) {
        response = retry.response;
        data = retry.data;
        selectedModel = "flux";
      }
    }

    // Apapun error upstream-nya, fallback direct harus pakai flux (model paling aman)
    if (response && !response.ok) selectedModel = "flux";

    if (response?.ok) {
      return res.status(200).json({
        ...data,
        meta: { source: "openai-compatible", model: selectedModel }
      });
    }

    // fallback terakhir: proxy direct URL via server agar API key tidak terekspos ke browser
    const directParams = new URLSearchParams();
    // Selalu kirim model secara eksplisit. Default Pollinations untuk GET /image adalah zimage.
    // Tanpa parameter ini, fallback flux bisa berubah jadi zimage dan memicu 403.
    directParams.set("model", selectedModel || "flux");
    if (width && height) {
      directParams.set("width", width);
      directParams.set("height", height);
    }
    directParams.set("seed", "-1");
    directParams.set("enhance", "true");
    directParams.set("nologo", "true");
    const pollinationsUrl =
      `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}` +
      (directParams.toString() ? `?${directParams.toString()}` : "");

    // 1) Coba dengan key (jika ada), 2) jika forbidden/auth issue, coba tanpa key (public quickstart mode)
    const withKeyUrl = apiKey ? `${pollinationsUrl}&key=${encodeURIComponent(apiKey)}` : pollinationsUrl;
    let directResponse = await fetch(withKeyUrl);
    if (!directResponse.ok && (directResponse.status === 401 || directResponse.status === 403 || directResponse.status === 402)) {
      directResponse = await fetch(pollinationsUrl);
    }
    if (!directResponse.ok) {
      const directError = await directResponse.text().catch(() => "");
      return res.status(directResponse.status).json({
        error: {
          code: "direct_fallback_failed",
          message: directError || `Direct fallback failed with status ${directResponse.status}`
        }
      });
    }

    const imageBuffer = Buffer.from(await directResponse.arrayBuffer());
    const b64 = imageBuffer.toString("base64");

    return res.status(200).json({
      data: [{ b64_json: b64 }],
      meta: { source: "direct-proxy-b64", model: selectedModel },
      warning: data?.error?.message || data?.error || "Using direct proxy fallback"
    });
  } catch (error) {
    console.error("Error in image proxy:", error);
    return res.status(500).json({ error: "Failed to generate image" });
  }
}
