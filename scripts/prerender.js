/**
 * 🚀 MARTABAK GRESIK — Custom Prerender Script
 *
 * Script ini berjalan setelah `vite build` dan menghasilkan file HTML statis
 * yang sudah berisi meta tags yang benar untuk setiap route.
 *
 * Routes yang di-prerender:
 *   /              → Halaman Katalog Utama
 *   /blog          → Daftar Artikel Blog
 *   /blog/:slug    → Detail Artikel Blog (dengan Article schema + meta spesifik)
 *   /gallery       → Halaman Galeri Foto
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT_DIR, 'src/content/blog');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const INDEX_PATH = path.join(DIST_DIR, 'index.html');
const BASE_URL = 'https://martabakgresik.my.id';

function parseFrontMatter(mdContent) {
  const match = mdContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, body: mdContent };
  }

  const yaml = match[1];
  const body = match[2];
  const data = {};

  yaml.split(/\r?\n/).forEach((line) => {
    const firstColon = line.indexOf(':');
    if (firstColon === -1) return;

    const key = line.slice(0, firstColon).trim();
    let value = line.slice(firstColon + 1).trim();
    value = value.replace(/^["'](.*)['"']$/, '$1');
    data[key] = value;
  });

  return { data, body };
}

/**
 * Inject meta tags ke dalam template HTML berdasarkan `id` attribute.
 */
function injectMeta(html, updates) {
  let result = html;

  // Update <title>
  if (updates.title) {
    result = result.replace(/<title>.*?<\/title>/, `<title>${updates.title}</title>`);
  }

  // Update meta tags by id
  const metaUpdates = updates.metas || [];
  metaUpdates.forEach((m) => {
    const escapedContent = String(m.content).replace(/"/g, '&quot;');
    const tagRegex = new RegExp(`<meta[^>]*id="${m.id}"[^>]*>`, 'i');
    const tagMatch = result.match(tagRegex);
    if (tagMatch) {
      const oldTag = tagMatch[0];
      const newTag = oldTag.replace(/content="[^"]*"/, `content="${escapedContent}"`);
      result = result.replace(oldTag, newTag);
    }
  });

  return result;
}

/**
 * Inject JSON-LD Article schema untuk blog posts.
 */
function injectArticleSchema(html, article) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.imageUrl,
    author: {
      '@type': 'Person',
      name: article.author || 'Tim Martabak Gresik',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Martabak Gresik',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.webp`,
      },
    },
    datePublished: article.date,
    dateModified: article.date,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
    url: article.url,
  };

  const schemaTag = `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  // Inject sebelum </head>
  return html.replace('</head>', `${schemaTag}\n</head>`);
}

/**
 * Update canonical link tag.
 */
function injectCanonical(html, url) {
  // Ganti canonical yang ada
  const canonicalRegex = /<link rel="canonical"[^>]*>/i;
  const newCanonical = `<link rel="canonical" href="${url}" />`;
  if (canonicalRegex.test(html)) {
    return html.replace(canonicalRegex, newCanonical);
  }
  // Atau inject sebelum </head>
  return html.replace('</head>', `${newCanonical}\n</head>`);
}

async function prerender() {
  if (!fs.existsSync(INDEX_PATH)) {
    console.error('Error: dist/index.html not found. Run "vite build" first.');
    process.exit(1);
  }

  const template = fs.readFileSync(INDEX_PATH, 'utf-8');

  // ─────────────────────────────────────────────────
  // 1. Prerender /gallery
  // ─────────────────────────────────────────────────
  console.log('- Generating: /gallery');
  {
    let html = template;
    html = injectMeta(html, {
      title: 'Galeri Foto Martabak Gresik - Terang Bulan & Martabak Telor',
      metas: [
        { id: 'meta-description', content: 'Lihat koleksi foto lengkap menu Martabak Gresik: Terang Bulan Pandan, Red Velvet, Blackforest, Martabak Telor, dan Samyang Pedas.' },
        { id: 'og-title', content: 'Galeri Foto Martabak Gresik' },
        { id: 'og-description', content: 'Foto-foto menu Martabak Gresik: Terang Bulan berbagai varian dan Martabak Telor Spesial.' },
        { id: 'og-image', content: `${BASE_URL}/metaseo.webp` },
        { id: 'og-url', content: `${BASE_URL}/gallery` },
        { id: 'twitter-title', content: 'Galeri Foto Martabak Gresik' },
        { id: 'twitter-description', content: 'Foto-foto menu Martabak Gresik: Terang Bulan berbagai varian dan Martabak Telor Spesial.' },
        { id: 'twitter-image', content: `${BASE_URL}/metaseo.webp` },
      ],
    });
    html = injectCanonical(html, `${BASE_URL}/gallery`);

    const outputDir = path.join(DIST_DIR, 'gallery');
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'index.html'), html);
  }

  // ─────────────────────────────────────────────────
  // 2. Prerender /blog (daftar artikel)
  // ─────────────────────────────────────────────────
  console.log('- Generating: /blog');
  {
    let html = template;
    html = injectMeta(html, {
      title: 'Blog Martabak Gresik - Tips Kuliner & Info UMKM',
      metas: [
        { id: 'meta-description', content: 'Baca artikel seputar kuliner, tips bisnis UMKM, dan informasi terbaru dari Martabak Gresik Jawa Timur.' },
        { id: 'og-title', content: 'Blog Martabak Gresik - Tips Kuliner & Info UMKM' },
        { id: 'og-description', content: 'Artikel kuliner, tips bisnis UMKM, dan info terbaru dari Martabak Gresik.' },
        { id: 'og-image', content: `${BASE_URL}/metaseo.webp` },
        { id: 'og-url', content: `${BASE_URL}/blog` },
        { id: 'twitter-title', content: 'Blog Martabak Gresik' },
        { id: 'twitter-description', content: 'Artikel kuliner, tips bisnis UMKM, dan info terbaru dari Martabak Gresik.' },
        { id: 'twitter-image', content: `${BASE_URL}/metaseo.webp` },
      ],
    });
    html = injectCanonical(html, `${BASE_URL}/blog`);

    const outputDir = path.join(DIST_DIR, 'blog');
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'index.html'), html);
  }

  // ─────────────────────────────────────────────────
  // 3. Prerender /blog/:slug (setiap artikel)
  // ─────────────────────────────────────────────────
  if (!fs.existsSync(BLOG_DIR)) {
    console.warn('Warning: Blog directory not found, skipping blog post prerender.');
  } else {
    const blogFiles = fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith('.md'));
    console.log(`- Generating ${blogFiles.length} blog posts...`);

    for (const file of blogFiles) {
      const slug = file.replace('.md', '');
      const mdContent = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
      const { data } = parseFrontMatter(mdContent);

      const title = data.title || 'Untitled';
      const excerpt = data.excerpt || '';
      const thumbnail = data.thumbnail || '/logo.webp';
      const author = data.author || 'Tim Martabak Gresik';
      const date = data.date || new Date().toISOString().split('T')[0];
      const fullTitle = `${title} | Blog Martabak Gresik`;
      const fullUrl = `${BASE_URL}/blog/${slug}`;
      const imageUrl = thumbnail.startsWith('http') ? thumbnail : `${BASE_URL}${thumbnail}`;

      console.log(`  → /blog/${slug}`);

      let html = template;
      html = injectMeta(html, {
        title: fullTitle,
        metas: [
          { id: 'meta-description', content: excerpt },
          { id: 'og-title', content: fullTitle },
          { id: 'og-description', content: excerpt },
          { id: 'og-image', content: imageUrl },
          { id: 'og-url', content: fullUrl },
          { id: 'twitter-title', content: fullTitle },
          { id: 'twitter-description', content: excerpt },
          { id: 'twitter-image', content: imageUrl },
        ],
      });

      // Inject Article schema khusus untuk blog posts
      html = injectArticleSchema(html, {
        title: fullTitle,
        excerpt,
        imageUrl,
        author,
        date,
        url: fullUrl,
      });

      html = injectCanonical(html, fullUrl);

      const outputDir = path.join(DIST_DIR, 'blog', slug);
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(path.join(outputDir, 'index.html'), html);
    }
  }

  console.log('\n✅ Prerendering complete!');
  console.log(`   - /gallery`);
  console.log(`   - /blog`);
  console.log(`   - /blog/* (blog posts)`);
}

prerender().catch(console.error);
