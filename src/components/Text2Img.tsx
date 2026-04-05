import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Sparkles, RefreshCcw } from "lucide-react";

interface ImageModelOption {
  id: string;
  name?: string;
}

export const Text2Img = () => {
  const [prompt, setPrompt] = useState("martabak hangat di malam hari, food photography, cinematic lighting");
  const [imageUrl, setImageUrl] = useState("");
  const [seed, setSeed] = useState<number | null>(null);
  const [usedModel, setUsedModel] = useState("flux");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [models, setModels] = useState<ImageModelOption[]>([{ id: "flux", name: "FLUX (Default)" }]);
  const [selectedModel, setSelectedModel] = useState("flux");

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("/api/image-models");
        if (!response.ok) return;
        const data = await response.json();
        const normalized = (Array.isArray(data?.models) ? data.models : [])
          .map((item: any) => (typeof item === "string" ? { id: item, name: item } : item))
          .filter((item: any) => item?.id);
        if (normalized.length > 0) {
          setModels(normalized);
          if (!normalized.some((m: ImageModelOption) => m.id === selectedModel)) {
            setSelectedModel(normalized[0].id);
          }
        }
      } catch {
        // fallback model sudah ada di state default
      }
    };
    fetchModels();
  }, []);

  const downloadName = useMemo(() => {
    const seedSuffix = seed ? `-${seed}` : "";
    return `text2img-${selectedModel}${seedSuffix}.png`;
  }, [selectedModel, seed]);

  const generate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), model: selectedModel })
      });
      const data = await response.json();
      if (!response.ok || !data?.imageUrl) {
        throw new Error(data?.error || "Gagal membuat gambar");
      }
      setImageUrl(data.imageUrl);
      setSeed(data.seed ?? null);
      setUsedModel(data.model || selectedModel);
    } catch (error: any) {
      setErrorMessage(error?.message || "Terjadi kesalahan saat generate gambar.");
      setImageUrl("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-yellow/20 via-white to-brand-orange/10 dark:from-gray-950 dark:via-black dark:to-gray-900 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-black text-white dark:bg-brand-yellow dark:text-brand-black font-bold text-xs uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Katalog
          </Link>
        </div>

        <section className="bg-white/90 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-5 sm:p-8 shadow-xl">
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-orange" />
            Text to Image
          </h1>
          <p className="mt-2 text-sm opacity-70 dark:text-white">
            Buat gambar dari prompt dan pilih model secara manual.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-black uppercase tracking-wider mb-2 dark:text-white/80">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/40 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-orange dark:text-white"
                placeholder="contoh: warm martabak on wooden table, ultra realistic, 4k"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider mb-2 dark:text-white/80">
                Model Gambar
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/40 px-4 py-3 text-sm outline-none dark:text-white"
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name || model.id}
                  </option>
                ))}
              </select>
              <button
                onClick={generate}
                disabled={isLoading || !prompt.trim()}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-brand-orange text-white font-black text-xs uppercase tracking-widest disabled:opacity-50"
              >
                {isLoading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isLoading ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm">
              {errorMessage}
            </div>
          )}

          {imageUrl && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
              <div className="rounded-3xl overflow-hidden border border-black/10 dark:border-white/10">
                <img src={imageUrl} alt="Generated" className="w-full h-auto object-cover" />
              </div>
              <div className="flex md:flex-col gap-2">
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-black text-white dark:bg-brand-yellow dark:text-brand-black font-bold text-xs uppercase"
                >
                  Buka Gambar
                </a>
                <a
                  href={imageUrl}
                  download={downloadName}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-black/10 dark:bg-white/10 dark:border-white/10 font-bold text-xs uppercase dark:text-white"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
                <div className="text-[11px] opacity-70 dark:text-white/70">
                  <p><strong>Model:</strong> {usedModel}</p>
                  <p><strong>Seed:</strong> {seed ?? "-"}</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

