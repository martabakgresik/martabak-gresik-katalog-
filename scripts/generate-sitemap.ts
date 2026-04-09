import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Mock Vite's import.meta.env for Node environment
if (typeof global !== 'undefined' && !(global as any).import) {
  (global as any).import = { meta: { env: {} } };
}
// Alternative for tsx/esm:
(globalThis as any).importMetaEnv = {}; 

import { MENU_SWEET, MENU_SAVORY } from '../src/data/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT_DIR, 'src/content/blog');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const BASE_URL = 'https://martabakgresik.my.id';

/**
 * Generate a valid XML sitemap string.
 */
function generateSitemap() {
  const routes = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/blog', priority: '0.8', changefreq: 'weekly' },
    { loc: '/gallery', priority: '0.7', changefreq: 'monthly' },
    { loc: '/about', priority: '0.5', changefreq: 'monthly' },
    { loc: '/faq', priority: '0.5', changefreq: 'monthly' },
    { loc: '/qr', priority: '0.6', changefreq: 'monthly' },
    { loc: '/converter', priority: '0.6', changefreq: 'monthly' },
    { loc: '/terms', priority: '0.3', changefreq: 'monthly' },
    { loc: '/privacy', priority: '0.3', changefreq: 'monthly' },
    { loc: '/deletion', priority: '0.3', changefreq: 'monthly' }
  ];

  // Add individual blog posts
  if (fs.existsSync(BLOG_DIR)) {
    const blogFiles = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
    blogFiles.forEach(file => {
      const slug = file.replace('.md', '');
      routes.push({
        loc: `/blog/${slug}`,
        priority: '0.6',
        changefreq: 'monthly'
      });
    });
  }

  // Add individual Menu products (as query params since it's a SPA item detail)
  // Sweet Items
  MENU_SWEET.forEach(section => {
    section.items.forEach(item => {
      routes.push({
        loc: `/?item=${encodeURIComponent(item.name)}`,
        priority: '0.5',
        changefreq: 'monthly'
      });
    });
  });

  // Savory Items
  MENU_SAVORY.forEach(section => {
    section.variants.forEach(variant => {
      const fullName = `${section.title} ${variant.type}`;
      routes.push({
        loc: `/?item=${encodeURIComponent(fullName)}`,
        priority: '0.5',
        changefreq: 'monthly'
      });
    });
  });

  const now = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${BASE_URL}${route.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  // Write to both public/sitemap.xml (for future builds) and dist/sitemap.xml (for immediate use if build already ran)
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml);
  console.log(`✅ Sitemap generated in ${path.join(PUBLIC_DIR, 'sitemap.xml')}`);

  if (fs.existsSync(DIST_DIR)) {
    fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), xml);
    console.log(`✅ Sitemap also copied to ${path.join(DIST_DIR, 'sitemap.xml')}`);
  }
}

generateSitemap();
