import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Plus, Edit2, Trash2, Eye, Upload, X, Save,
  BookOpen, Check, AlertCircle, Loader, ToggleLeft, ToggleRight, Image, Database
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getAllBlogPostsAdmin, type BlogPost } from '../data/blogUtils';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function parseFrontMatterFromMd(content: string) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {} as Record<string, string>, body: content };
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

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  thumbnail: '/logo.webp',
  author: 'Martabak Gresik Admin',
  date: new Date().toISOString().split('T')[0],
  content: '',
  is_published: true,
};

type FormData = typeof EMPTY_FORM;

export function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [editingPost, setEditingPost] = useState<BlogPost | null>(null); // null = new post
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setSupabaseError(null);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('date', { ascending: false });
      if (error) {
        // Tabel belum dibuat di Supabase
        setSupabaseError(error.message);
        setPosts([]);
      } else {
        setPosts((data || []).map((p: any) => ({
          id: p.id, slug: p.slug, title: p.title, date: p.date,
          excerpt: p.excerpt || '', thumbnail: p.thumbnail || '/logo.webp',
          author: p.author || 'Admin', content: p.content || '',
          is_published: p.is_published,
        })));
      }
    } catch (e: any) {
      setSupabaseError(e.message || 'Koneksi ke database gagal');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const openNewEditor = () => {
    setEditingPost(null);
    setForm(EMPTY_FORM);
    setShowEditor(true);
    setShowPreview(false);
  };

  const openEditEditor = (post: BlogPost) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      thumbnail: post.thumbnail,
      author: post.author,
      date: post.date,
      content: post.content,
      is_published: post.is_published ?? true,
    });
    setShowEditor(true);
    setShowPreview(false);
  };

  const handleUploadMd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const raw = ev.target?.result as string;
      const { data, body } = parseFrontMatterFromMd(raw);
      const slug = file.name.replace('.md', '');
      setForm({
        title: data.title || slug,
        slug: slugify(data.title || slug),
        excerpt: data.excerpt || '',
        thumbnail: data.thumbnail || '/logo.webp',
        author: data.author || 'Martabak Gresik Admin',
        date: data.date || new Date().toISOString().split('T')[0],
        content: body.trim(),
        is_published: true,
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      showToast('error', 'Judul dan konten tidak boleh kosong!');
      return;
    }
    if (!form.slug.trim()) {
      showToast('error', 'Slug tidak boleh kosong!');
      return;
    }

    setSaving(true);
    try {
      if (editingPost?.id) {
        const { error } = await supabase
          .from('blog_posts')
          .update({ ...form })
          .eq('id', editingPost.id);
        if (error) throw error;
        showToast('success', 'Blog berhasil diupdate!');
      } else {
        const { error } = await supabase.from('blog_posts').insert({ ...form });
        if (error) throw error;
        showToast('success', 'Blog berhasil dipublikasikan!');
      }
      setShowEditor(false);
      loadPosts();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menyimpan blog');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    const { error } = await supabase
      .from('blog_posts')
      .update({ is_published: !post.is_published })
      .eq('id', post.id!);
    if (!error) {
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_published: !p.is_published } : p));
    }
  };

  const handleDelete = async (post: BlogPost) => {
    if (!window.confirm(`Hapus artikel "${post.title}" secara permanen?`)) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', post.id!);
    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== post.id));
      showToast('success', 'Artikel dihapus');
    } else {
      showToast('error', 'Gagal menghapus artikel');
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl font-bold text-sm ${
              toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tighter uppercase italic flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-orange" /> Manajemen Blog
          </h2>
          <p className="text-xs text-zinc-400 mt-1">{posts.length} artikel tersimpan</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Upload .md */}
          <label className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-xl font-bold text-sm cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload .md</span>
            <input type="file" accept=".md" className="hidden" onChange={e => { handleUploadMd(e); setShowEditor(true); }} />
          </label>
          <button
            onClick={openNewEditor}
            className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" /> Tulis Blog
          </button>
        </div>
      </div>

      {/* Post List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-8 h-8 animate-spin text-brand-orange" />
        </div>
      ) : supabaseError ? (
        // Tabel belum dibuat di Supabase
        <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-3xl p-8 space-y-4">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-amber-500 flex-shrink-0" />
            <div>
              <h3 className="font-black text-lg text-amber-700 dark:text-amber-400">Tabel Blog Belum Dibuat</h3>
              <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">Error: {supabaseError}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-amber-200 dark:border-amber-800">
            <p className="text-xs font-black uppercase text-zinc-400 mb-3">Jalankan SQL ini di Supabase SQL Editor:</p>
            <pre className="text-xs bg-zinc-900 text-green-400 p-4 rounded-xl overflow-x-auto leading-relaxed">{`CREATE TABLE blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text default '',
  thumbnail text default '/logo.webp',
  author text default 'Martabak Gresik Admin',
  content text not null default '',
  date date not null default current_date,
  is_published boolean default true,
  created_at timestamptz default now()
);
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Anon full access" ON blog_posts FOR ALL USING (true) WITH CHECK (true);`}</pre>
          </div>
          <button
            onClick={loadPosts}
            className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl font-bold text-sm"
          >
            <Loader className="w-4 h-4" /> Coba Lagi
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-700">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
          <p className="text-lg font-bold text-zinc-400">Belum ada artikel</p>
          <p className="text-sm text-zinc-400 mt-1">Klik "Tulis Blog" atau upload file .md</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <motion.div
              key={post.id || post.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4"
            >
              <img
                src={post.thumbnail}
                alt={post.title}
                className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-zinc-100"
                onError={e => { e.currentTarget.src = '/logo.webp'; }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-sm truncate">{post.title}</p>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    post.is_published ? 'bg-green-100 text-green-600' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'
                  }`}>
                    {post.is_published ? 'PUBLISHED' : 'DRAFT'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 truncate">{post.excerpt}</p>
                <p className="text-[10px] text-zinc-300 mt-1">{post.date} · {post.author}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleTogglePublish(post)}
                  className={`p-2 rounded-lg transition-colors ${post.is_published ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                  title={post.is_published ? 'Unpublish' : 'Publish'}
                >
                  {post.is_published ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => openEditEditor(post)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(post)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <div className="fixed inset-0 z-[150] flex items-start justify-center p-4 pt-16 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditor(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 border-4 border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Editor Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-zinc-950 text-white">
                <h3 className="font-black uppercase italic tracking-tighter text-lg">
                  {editingPost ? 'Edit Artikel' : 'Tulis Artikel Baru'}
                </h3>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 bg-zinc-800 px-3 py-1.5 rounded-lg cursor-pointer hover:text-white transition-colors">
                    <Upload className="w-3 h-3" /> Import .md
                    <input type="file" accept=".md" className="hidden" onChange={handleUploadMd} />
                  </label>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${showPreview ? 'bg-brand-orange text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                  >
                    <Eye className="w-3 h-3" /> Preview
                  </button>
                  <button onClick={() => setShowEditor(false)} className="p-2 hover:bg-white/10 rounded-full">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Editor Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Metadata Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-400">Judul Artikel *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })}
                      placeholder="Judul artikel yang menarik..."
                      className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-3 rounded-xl font-bold text-lg focus:border-brand-orange outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-400">Slug (URL)</label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={e => setForm({ ...form, slug: slugify(e.target.value) })}
                      className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-3 rounded-xl font-bold text-sm focus:border-brand-orange outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-400">Tanggal</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={e => setForm({ ...form, date: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-3 rounded-xl font-bold text-sm focus:border-brand-orange outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-400">Ringkasan (Excerpt)</label>
                    <textarea
                      value={form.excerpt}
                      onChange={e => setForm({ ...form, excerpt: e.target.value })}
                      placeholder="Deskripsi singkat artikel..."
                      rows={2}
                      className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-3 rounded-xl font-bold text-sm focus:border-brand-orange outline-none resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-400 flex items-center gap-1"><Image className="w-3 h-3" /> Thumbnail</label>
                    <div className="flex gap-2">
                      <div className="w-11 h-11 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 overflow-hidden border border-zinc-200 dark:border-zinc-800">
                        <img src={form.thumbnail || '/logo.webp'} alt="Preview" className="w-full h-full object-cover" onError={e => e.currentTarget.src = '/logo.webp'} />
                      </div>
                      <input
                        type="text"
                        value={form.thumbnail}
                        onChange={e => setForm({ ...form, thumbnail: e.target.value })}
                        placeholder="URL gambar..."
                        className="flex-1 bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl font-bold text-xs focus:border-brand-orange outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-400">Penulis</label>
                    <input
                      type="text"
                      value={form.author}
                      onChange={e => setForm({ ...form, author: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-3 rounded-xl font-bold text-sm focus:border-brand-orange outline-none"
                    />
                  </div>
                </div>


                {/* Markdown Editor / Preview */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-400">
                    Konten (Markdown) *
                  </label>
                  {showPreview ? (
                    <div className="min-h-[300px] bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 rounded-xl p-4 prose prose-sm max-w-none
                      [&>h1]:text-2xl [&>h1]:font-black [&>h1]:uppercase
                      [&>h2]:text-xl [&>h2]:font-black [&>h2]:text-brand-orange
                      [&>h3]:text-lg [&>h3]:font-bold
                      [&>p]:text-sm [&>p]:leading-relaxed
                      [&>ul]:list-disc [&>ul]:pl-6
                      [&>ol]:list-decimal [&>ol]:pl-6
                      [&>blockquote]:border-l-4 [&>blockquote]:border-brand-orange [&>blockquote]:pl-4 [&>blockquote]:italic
                      [&>strong]:text-brand-orange
                    ">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content || '*Belum ada konten...*'}</ReactMarkdown>
                    </div>
                  ) : (
                    <textarea
                      value={form.content}
                      onChange={e => setForm({ ...form, content: e.target.value })}
                      placeholder={`# Judul H1\n\n## Subjudul H2\n\nIsi konten artikel dalam format **Markdown**...\n\n- Poin 1\n- Poin 2\n\n> Kutipan menarik`}
                      rows={16}
                      className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 p-4 rounded-xl font-mono text-sm focus:border-brand-orange outline-none resize-y"
                    />
                  )}
                </div>

                {/* Publish Toggle */}
                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                  <div>
                    <p className="font-bold text-sm">Status Publikasi</p>
                    <p className="text-xs text-zinc-400">{form.is_published ? 'Artikel akan tampil di blog' : 'Tersimpan sebagai draft'}</p>
                  </div>
                  <button
                    onClick={() => setForm({ ...form, is_published: !form.is_published })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                      form.is_published ? 'bg-green-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                    }`}
                  >
                    {form.is_published ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    {form.is_published ? 'Published' : 'Draft'}
                  </button>
                </div>
              </div>

              {/* Editor Footer */}
              <div className="p-4 bg-zinc-50 dark:bg-black/50 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
                <button
                  onClick={() => setShowEditor(false)}
                  className="flex-1 py-3 font-bold text-xs uppercase text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-[2] bg-brand-orange text-white py-3 rounded-2xl font-black uppercase italic shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform"
                >
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Menyimpan...' : (editingPost ? 'Update Artikel' : 'Publikasikan')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
