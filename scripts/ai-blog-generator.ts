import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Helper for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV_PATH = path.join(__dirname, '../.env.local');
const BLOG_DIR = path.join(__dirname, '../src/content/blog');
const IMG_DIR = path.join(__dirname, '../public/images/blog');

// Topics to choose from
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

  // 2. Select Topic
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  console.log(`Generating content for topic: "${topic}"...`);

  // 3. Generate Content using Pollinations Text API
  const prompt = `
  Tulis sebuah artikel blog menarik dalam Bahasa Indonesia tentang "${topic}". 
  Gunakan gaya bahasa santai tapi informatif (ala pecinta kuliner).
  Format output harus JSON dengan struktur:
  {
    "title": "Judul Artikel Menarik",
    "excerpt": "Ringkasan singkat artikel (1-2 kalimat)",
    "content": "Isi lengkap artikel dalam format Markdown",
    "category": "Salah satu dari: Tips, Menu, Info, UMKM"
  }
  Berikan HANYA JSON tersebut tanpa teks lain.
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

    const data = await response.json() as any;
    const text = data.choices[0].message.content;
    
    // Pencarian JSON yang lebih tangguh (mencari kurung kurawal pertama dan terakhir)
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

    // 5. Save Markdown (Using default logo for thumbnail)
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
