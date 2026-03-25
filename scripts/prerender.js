import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT_DIR, 'src/content/blog');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const INDEX_PATH = path.join(DIST_DIR, 'index.html');

async function prerender() {
  if (!fs.existsSync(INDEX_PATH)) {
    console.error('Error: dist/index.html not found. Run "npm run build" first.');
    process.exit(1);
  }

  const template = fs.readFileSync(INDEX_PATH, 'utf-8');
  const blogFiles = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.md'));

  console.log(`Prerendering ${blogFiles.length} blog posts...`);

  for (const file of blogFiles) {
    const slug = file.replace('.md', '');
    const mdContent = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
    const { data } = matter(mdContent);

    const title = data.title || 'Untitled';
    const excerpt = data.excerpt || '';
    const thumbnail = data.thumbnail || '/logo.webp';
    const fullTitle = `${title} | Blog Martabak Gresik`;
    const fullUrl = `https://martabakgresik.my.id/blog/${slug}`;
    const imageUrl = thumbnail.startsWith('http') ? thumbnail : `https://martabakgresik.my.id${thumbnail}`;

    console.log(`- Generating: /blog/${slug}`);

    let html = template;
    
    // Replace Title
    html = html.replace(/<title>.*?<\/title>/, `<title>${fullTitle}</title>`);
    
    // Replace Meta Tags by ID if available, otherwise just inject
    const metaUpdates = [
      { id: 'meta-description', content: excerpt },
      { id: 'og-title', content: fullTitle },
      { id: 'og-description', content: excerpt },
      { id: 'og-image', content: imageUrl },
      { id: 'og-url', content: fullUrl },
      { id: 'twitter-title', content: fullTitle },
      { id: 'twitter-description', content: excerpt },
      { id: 'twitter-image', content: imageUrl }
    ];

    metaUpdates.forEach(m => {
      // Find the meta tag that has the specific ID
      const tagRegex = new RegExp(`<meta[^>]*id="${m.id}"[^>]*>`, 'i');
      const tagMatch = html.match(tagRegex);
      if (tagMatch) {
        const oldTag = tagMatch[0];
        const newTag = oldTag.replace(/content="[^"]*"/, `content="${m.content.replace(/"/g, '&quot;')}"`);
        html = html.replace(oldTag, newTag);
        // Also update property/name attributes if they exist as fallback (og tags)
        if (m.id.startsWith('og-')) {
          html = html.replace(new RegExp(`property="og:${m.id.split('-')[1]}"`, 'g'), `property="og:${m.id.split('-')[1]}"`);
        }
      } else {
        // Fallback for property/name search if ID replacement fails
        const propName = m.id.startsWith('og-') ? `property="og:${m.id.split('-')[1]}"` : `name="${m.id.replace('meta-', '')}"`;
        const fallbackRegex = new RegExp(`<meta[^>]*${propName}[^>]*>`, 'i');
        const fallbackMatch = html.match(fallbackRegex);
        if (fallbackMatch) {
          const oldTag = fallbackMatch[0];
          const newTag = oldTag.replace(/content="[^"]*"/, `content="${m.content.replace(/"/g, '&quot;')}"`);
          html = html.replace(oldTag, newTag);
        }
      }
    });

    // Create directory
    const outputDir = path.join(DIST_DIR, 'blog', slug);
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'index.html'), html);
  }

  console.log('Prerendering complete!');
}

prerender().catch(console.error);
