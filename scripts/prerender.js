import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT_DIR, 'src/content/blog');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const INDEX_PATH = path.join(DIST_DIR, 'index.html');

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
    value = value.replace(/^["'](.*)["']$/, '$1');
    data[key] = value;
  });

  return { data, body };
}

async function prerender() {
  if (!fs.existsSync(INDEX_PATH)) {
    console.error('Error: dist/index.html not found. Run "npm run build" first.');
    process.exit(1);
  }

  const template = fs.readFileSync(INDEX_PATH, 'utf-8');
  const blogFiles = fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith('.md'));

  console.log(`Prerendering ${blogFiles.length} blog posts...`);

  for (const file of blogFiles) {
    const slug = file.replace('.md', '');
    const mdContent = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
    const { data } = parseFrontMatter(mdContent);

    const title = data.title || 'Untitled';
    const excerpt = data.excerpt || '';
    const thumbnail = data.thumbnail || '/logo.webp';
    const fullTitle = `${title} | Blog Martabak Gresik`;
    const fullUrl = `https://martabakgresik.my.id/blog/${slug}`;
    const imageUrl = thumbnail.startsWith('http') ? thumbnail : `https://martabakgresik.my.id${thumbnail}`;

    console.log(`- Generating: /blog/${slug}`);

    let html = template;
    html = html.replace(/<title>.*?<\/title>/, `<title>${fullTitle}</title>`);

    const metaUpdates = [
      { id: 'meta-description', content: excerpt },
      { id: 'og-title', content: fullTitle },
      { id: 'og-description', content: excerpt },
      { id: 'og-image', content: imageUrl },
      { id: 'og-url', content: fullUrl },
      { id: 'twitter-title', content: fullTitle },
      { id: 'twitter-description', content: excerpt },
      { id: 'twitter-image', content: imageUrl },
    ];

    metaUpdates.forEach((m) => {
      const escapedContent = String(m.content).replace(/"/g, '&quot;');
      const tagRegex = new RegExp(`<meta[^>]*id="${m.id}"[^>]*>`, 'i');
      const tagMatch = html.match(tagRegex);

      if (tagMatch) {
        const oldTag = tagMatch[0];
        const newTag = oldTag.replace(/content="[^"]*"/, `content="${escapedContent}"`);
        html = html.replace(oldTag, newTag);
      }
    });

    const outputDir = path.join(DIST_DIR, 'blog', slug);
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'index.html'), html);
  }

  console.log('Prerendering complete!');
}

prerender().catch(console.error);
