import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;
  const apiKey = process.env.POLLINATIONS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key not configured on server' });
  }

  // Instruksi khusus untuk Checkout via WhatsApp
  const systemInstruction = {
    role: 'system',
    content: `Anda adalah Asisten Pintar Martabak Gresik yang ramah dan gaul.
    Tugas Anda: Membantu pelanggan memilih menu dan melakukan CHECKOUT.
    
    ATURAN CHECKOUT:
    1. Jika pengguna ingin memesan (misal: "saya mau pesan", "beli yang ini", "checkout"), buatkan RANGKUMAN pesanan.
    2. Berikan LINK WHATSAPP di akhir jawaban dengan format: 
       https://wa.me/6281330763633?text=[PESAN_YANG_DI_ENCODE]
    3. Isi pesan WhatsApp harus berisi: Daftar menu, jumlah, total harga, dan minta alamat pengiriman.
    4. Contoh: "Klik link ini untuk pesan: https://wa.me/6281330763633?text=Halo...".
    5. Gunakan emoji agar menarik.`
  };

  try {
    const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [systemInstruction, ...messages],
        model: 'openai' // Menggunakan model 'openai' untuk logika yang lebih cerdas
      })
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error in AI Proxy:', error);
    return res.status(500).json({ error: 'Failed to communicate with AI provider' });
  }
}
