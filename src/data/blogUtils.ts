import { supabase } from '../lib/supabase';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  thumbnail: string;
  author: string;
  content: string;
  id?: string;
  is_published?: boolean;
}

function parseFrontMatter(allContent: string) {
  const match = allContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {} as any, body: allContent };
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
function getLocalBlogPosts(): BlogPost[] {
  const modules = import.meta.glob('../content/blog/*.md', { query: '?raw', import: 'default', eager: true });
  return Object.entries(modules).map(([filepath, content]) => {
    const slug = filepath.split('/').pop()?.replace('.md', '') || '';
    const { data, body } = parseFrontMatter(content as string);
    return {
      slug,
      title: data.title || 'Untitled',
      date: data.date || '',
      excerpt: data.excerpt || '',
      thumbnail: data.thumbnail || '/logo.webp',
      author: data.author || 'Admin',
      content: body || '',
      is_published: true,
    } as BlogPost;
  });
}

/** Fetch blog dari Supabase (async) */
export async function getBlogPostsFromSupabase(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('date', { ascending: false });

  if (error || !data) return [];
  return data.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    date: p.date,
    excerpt: p.excerpt || '',
    thumbnail: p.thumbnail || '/logo.webp',
    author: p.author || 'Admin',
    content: p.content || '',
    is_published: p.is_published,
  }));
}

/** Fetch semua blog (termasuk unpublished) untuk dashboard */
export async function getAllBlogPostsAdmin(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('date', { ascending: false });

  if (error || !data) return [];
  return data.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    date: p.date,
    excerpt: p.excerpt || '',
    thumbnail: p.thumbnail || '/logo.webp',
    author: p.author || 'Admin',
    content: p.content || '',
    is_published: p.is_published,
  }));
}

/** Gabungkan local + Supabase (deprecated, gunakan getBlogPostsFromSupabase) */
export function getBlogPosts(): BlogPost[] {
  return getLocalBlogPosts().sort((a, b) => {
    const dateA = new Date(a.date).getTime() || 0;
    const dateB = new Date(b.date).getTime() || 0;
    return dateB - dateA;
  });
}
