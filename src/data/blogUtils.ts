export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  thumbnail: string;
  author: string;
  content: string;
}

function parseFrontMatter(allContent: string) {
  // Regex to match YAML frontmatter between --- and ---
  const match = allContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  
  if (!match) {
    return { data: {} as any, body: allContent };
  }
  
  const yamlBlock = match[1];
  const body = match[2];
  const data: Record<string, string> = {};
  
  // Simple YAML parser for key: value pairs
  yamlBlock.split(/\r?\n/).forEach(line => {
    const firstColon = line.indexOf(':');
    if (firstColon !== -1) {
      const key = line.slice(0, firstColon).trim();
      let value = line.slice(firstColon + 1).trim();
      // Remove surrounding quotes if any
      value = value.replace(/^["'](.*)["']$/, '$1');
      data[key] = value;
    }
  });
  
  return { data, body };
}

export function getBlogPosts(): BlogPost[] {
  // Use Vite's import.meta.glob to get all markdown files in the blog directory
  // query: '?raw' and import: 'default' gets the raw file content as a string
  const modules = import.meta.glob('../content/blog/*.md', { query: '?raw', import: 'default', eager: true });
  
  const posts = Object.entries(modules).map(([filepath, content]) => {
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
    } as BlogPost;
  });

  // Sort by date descending
  return posts.sort((a, b) => {
    const dateA = new Date(a.date).getTime() || 0;
    const dateB = new Date(b.date).getTime() || 0;
    return dateB - dateA;
  });
}
