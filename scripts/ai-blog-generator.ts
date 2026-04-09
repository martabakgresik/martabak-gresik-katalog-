import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Helper for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV_PATH = path.join(__dirname, '../.env.local');
const BLOG_DIR = path.join(__dirname, '../src/content/blog');
const IMG_DIR = path.join(__dirname, '../public/images/blog');

// Topics to choose from (fallback)
const TOPICS = [
  "Rahasia Martabak Telor Gurih & Renyah",
  "Perbedaan Terang Bulan vs Martabak Manis",
  "Tips Memilih Martabak yang Nggak Kebanyakan Minyak",
  "Sejarah Singkat Martabak di Indonesia",
  "Kenapa Topping Keju Begitu Populer di Martabak",
  "Resep Cara Menyimpan Martabak agar Tetap Enak Esok Hari",
  "Inovasi Rasa Martabak: Dari Klasik hingga Kekinian",
  "Martabak Gresik: Kenapa Harus Coba Sekarang?",
];

// === FITUR BARU: Dynamic Topic Generator ===
async function generateDynamicTopic(apiKey, category = "kuliner") {
  const prompt = `
  Buat 1 judul artikel blog yang sangat menarik, SEO friendly, dan Geo-relevant (fokus wilayah Gresik) tentang martabak atau terang bulan.
  Fokus kategori: ${category}.
  
  Kriteria:
  - Harus mengandung kata kunci lokal (misal: "Gresik", "Kuliner Gresik", "Jajan Gresik", dll).
  - Judul harus unik, kekinian (Clickbait yang elegan), dan relevan dengan UMKM Martabak Gresik.
  - Gunakan gaya bahasa yang sedang tren di kalangan pecinta kuliner Indonesia.
  
  Output HANYA judul saja, tanpa nomor, tanda kutip, atau teks tambahan.
  `;

  try {
    const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model: 'gemini',
        jsonFallback: false
      })
    });

    const data = await response.json();
    let topic = data.choices[0].message.content.trim();
    // Bersihkan kutip jika ada
    topic = topic.replace(/^["']|["']$/g, '');
    return topic;
  } catch (err) {
    console.warn('Gagal generate topik dinamis, akan pakai TOPICS array.', err.message);
    return null;
  }
}

async function generateBlog() {
  console.log('--- Starting AI Blog Generation ---');

  // 1. Get API Key
  let apiKey = process.env.POLLINATIONS_API_KEY || '';

  if (!apiKey) {
    try {
      const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
      const match = envContent.match(/POLLINATIONS_API_KEY="?([^"\n\r]+)"?/);
      if (match) apiKey = match[1];
    } catch (e) {
      console.log('Skipping .env.local check (not found or inaccessible)');
    }
  }

  if (!apiKey) {
    console.error('API Key not found in .env.local');
    process.exit(1);
  }

  // 2. Pilih metode topik (true = pakai AI dynamic, false = pakai TOPICS array)
  const useDynamicTopic = true; // <-- ubah ke false jika ingin pakai topik manual
  let topic = "";

  if (useDynamicTopic) {
    console.log("Menghasilkan topik dinamis dengan AI...");
    const categories = ["Tips", "Menu", "Promo", "Info", "UMKM", "Sejarah"];
    const randomCat = categories[Math.floor(Math.random() * categories.length)];
    const dynamicTopic = await generateDynamicTopic(apiKey, randomCat);
    if (dynamicTopic && dynamicTopic.length > 10) {
      topic = dynamicTopic;
      console.log(`Topik AI dinamis (${randomCat}): "${topic}"`);
    } else {
      console.log("Gagal dapat topik dinamis, beralih ke TOPICS array.");
      topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
      console.log(`Topik dari daftar tetap: "${topic}"`);
    }
  } else {
    topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    console.log(`Topik dari daftar tetap: "${topic}"`);
  }

  // 3. Generate Content using Pollinations Text API
  const prompt = `
  Tulis sebuah artikel blog profesional namun santai (SEO & Geo Optimized) dalam Bahasa Indonesia tentang "${topic}".
  
  Panduan Penulisan WAJIB:
  1. SEO & Geo Focus: Sertakan kata kunci "Martabak Gresik", "Gresik", dan sebutkan area layanan (Gresik Kota, Manyar, Kebomas, dsb) secara natural.
  2. Struktur & Visual: 
     - Gunakan sub-heading (H2, H3) yang informatif.
     - WAJIB gunakan TABEL MARKDOWN untuk membandingkan varian, harga, atau nutrisi jika relevan.
     - Gunakan LIST (Bullet points) untuk langkah-langkah atau tips.
     - Gunakan BOLD untuk penekanan kata kunci.
  3. Link & Referensi:
     - Sertakan LINK (Internal atau Eksternal) yang relevan jika memungkinkan (misal: link ke katalog https://martabakgresik.my.id atau referensi kuliner).
  4. Call to Action: Ajak pembaca untuk berkunjung ke Martabak Gresik di Jl. Usman Sadar No. 10 atau pesan via WhatsApp.
  
  Format output harus JSON murni dengan struktur:
  {
    "title": "Judul Artikel yang Menarik & SEO Optimized",
    "excerpt": "Ringkasan meta deskripsi (140-160 karakter) yang mengandung kata kunci utama",
    "content": "Isi lengkap artikel dalam format Markdown",
    "category": "Pilih yang paling cocok: Tips, Menu, Promo, Info, UMKM, Sejarah"
  }
  
  Berikan HANYA JSON tersebut. Jangan sertakan teks lain di luar blok JSON.
  `;

  try {
    const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model: 'gemini',
        jsonFallback: true
      })
    });

    const data = await response.json();
    const text = data.choices[0].message.content;
    
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error('AI Response:', text);
      throw new Error('AI tidak mengembalikan struktur JSON yang valid.');
    }
    
    const jsonStr = text.substring(jsonStart, jsonEnd + 1);
    const result = JSON.parse(jsonStr);

    if (!result.title) {
      console.error('Parsed result:', result);
      throw new Error('Data artikel tidak lengkap (title missing).');
    }

    // 4. Generate Slug
    const slug = result.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim();

    // 5. Save Markdown
    const date = new Date().toISOString().split('T')[0];
    const mdContent = `---
title: "${result.title}"
date: "${date}"
excerpt: "${result.excerpt}"
thumbnail: "/logo.webp"
author: "Martabak Gresik AI"
category: "${result.category || 'Info'}"
---

${result.content}
`;

    const mdPath = path.join(BLOG_DIR, `${slug}.md`);
    fs.writeFileSync(mdPath, mdContent);
    console.log(`Blog post saved to ${mdPath} with default logo thumbnail.`);

    console.log('--- AI Blog Generation Successful ---');

  } catch (error) {
    console.error('Error during generation:', error);
  }
}

generateBlog();
