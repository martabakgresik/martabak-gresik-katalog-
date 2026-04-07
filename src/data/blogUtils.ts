export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  thumbnail: string;
  author: string;
  content: string;
  category?: string;
  readingTime?: number;
}

function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return minutes;
}

function parseFrontMatter(allContent: string) {
  const match = allContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {} as Record<string, string>, body: allContent };
  const yamlBlock = match[1];
  const body = match[2];
  const data: Record<string, string> = {};

  yamlBlock.split(/\r?\n/).forEach(line => {
    const firstColon = line.indexOf(':');
    if (firstColon !== -1) {
      const key = line.slice(0, firstColon).trim();
      let value = line.slice(firstColon + 1).trim();
      value = value.replace(/^["'](.*?)["']$/, '$1');
      data[key] = value;
    }
  });

  return { data, body };
}

/** Baca blog dari file .md lokal (Vite import.meta.glob) */
export function getBlogPosts(): BlogPost[] {
  const modules = import.meta.glob('../content/blog/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  });

  return Object.entries(modules)
    .map(([filepath, content]) => {
      const slug = filepath.split('/').pop()?.replace('.md', '') || '';
      const { data, body } = parseFrontMatter(content as string);

      return {
        slug,
        title: data.title || 'Untitled',
        date: data.date || '',
        excerpt: data.excerpt || '',
        thumbnail: data.thumbnail || data.image || '/logo.webp',
        author: data.author || 'Admin',
        category: data.category || 'Lainnya',
        readingTime: calculateReadingTime(body || ''),
        content: body || '',
      } as BlogPost;
    })
    .filter(post => {
      // Di mode development, tampilkan semua artikel (termasuk draf masa depan)
      if (import.meta.env.DEV) return true;
      
      if (!post.date) return false;
      const now = new Date();
      // Mendapatkan tanggal hari ini dalam format YYYY-MM-DD sesuai waktu Jakarta
      const today = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
        
      return post.date <= today;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;
      return dateB - dateA;
    });
}
