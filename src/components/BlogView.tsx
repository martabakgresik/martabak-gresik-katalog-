import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, User, ArrowLeft, ChevronRight, BookOpen, Share2, Check, Search, Filter } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getBlogPosts, type BlogPost } from '../data/blogUtils';
import type { UiLang } from '../hooks/useUiLanguage';
import { BLOG_I18N } from '../data/i18n/blogCopy';

interface BlogViewProps {
  onClose: () => void;
  uiLang?: UiLang;
}

export function BlogView({ onClose, uiLang = 'id' }: BlogViewProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(6);
  const t = BLOG_I18N[uiLang];
  const dateLocale = uiLang === 'en' ? 'en-US' : 'id-ID';

  // Fetch posts dari file markdown lokal
  useEffect(() => {
    setPostsLoading(true);
    try {
      setPosts(getBlogPosts());
    } finally {
      setPostsLoading(false);
    }
  }, []);

  // Filter and Pagination Logic
  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return posts.filter(post => 
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      post.content.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  const visiblePosts = useMemo(() => {
    return filteredPosts.slice(0, displayLimit);
  }, [filteredPosts, displayLimit]);

  const hasMore = displayLimit < filteredPosts.length;

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 6);
  };

  const blogContainerRef = React.useRef<HTMLDivElement>(null);

  // Initial scroll to blog header when mounting the view
  React.useEffect(() => {
    if (blogContainerRef.current && !window.location.pathname.includes('/blog/')) {
      blogContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // SEO Metadata Update
  React.useEffect(() => {
    const defaultTitle = "Martabak Gresik - Terang Bulan & Martabak Telor Autentik";
    const defaultDesc = "Nikmati kelezatan Martabak Gresik. Menu lengkap Terang Bulan (Manis) dan Martabak Telor (Asin) dengan bahan berkualitas.";
    const baseUrl = "https://martabakgresik.my.id";
    const defaultImage = `${baseUrl}/logo.webp`;

    const getMeta = (id: string, nameAttr: string, propertyAttr: string) => {
      return document.getElementById(id) || 
             document.querySelector(`meta[name="${nameAttr}"]`) || 
             document.querySelector(`meta[property="${propertyAttr}"]`);
    };

    const updateTag = (id: string, nameAttr: string, propertyAttr: string, value: string) => {
      const el = getMeta(id, nameAttr, propertyAttr);
      if (el) {
        el.setAttribute('content', value);
        console.log(`[SEO] Updated ${nameAttr || propertyAttr}:`, value);
      } else {
        console.warn(`[SEO] Tag not found: ${id} (${nameAttr || propertyAttr})`);
      }
    };

    if (selectedPost) {
      const fullTitle = `${selectedPost.title} | Blog Martabak Gresik`;
      const thumbUrl = selectedPost.thumbnail.startsWith('http') ? selectedPost.thumbnail : `${baseUrl}${selectedPost.thumbnail}`;
      
      document.title = fullTitle;
      console.log(`[SEO] Title set to: ${fullTitle}`);

      updateTag('meta-description', 'description', '', selectedPost.excerpt);
      updateTag('og-title', '', 'og:title', fullTitle);
      updateTag('og-description', '', 'og:description', selectedPost.excerpt);
      updateTag('og-image', '', 'og:image', thumbUrl);
      updateTag('og-url', '', 'og:url', window.location.href);
      updateTag('twitter-title', 'twitter:title', '', fullTitle);
      updateTag('twitter-description', 'twitter:description', '', selectedPost.excerpt);
      updateTag('twitter-image', 'twitter:image', '', thumbUrl);
    } else if (isNotFound) {
      const nfTitle = `Artikel Tidak Ditemukan | Blog Martabak Gresik`;
      document.title = nfTitle;
      console.log(`[SEO] 404 Title set to: ${nfTitle}`);

      updateTag('meta-description', 'description', '', "Maaf, artikel yang Anda cari tidak dapat ditemukan.");
      updateTag('og-title', '', 'og:title', nfTitle);
      updateTag('og-url', '', 'og:url', window.location.href);
    } else {
      document.title = defaultTitle;
      console.log(`[SEO] Reset to default title`);

      updateTag('meta-description', 'description', '', defaultDesc);
      updateTag('og-title', '', 'og:title', defaultTitle);
      updateTag('og-description', '', 'og:description', "Katalog menu digital Martabak Gresik. Terang Bulan Manis & Martabak Telor Asin Spesial.");
      updateTag('og-image', '', 'og:image', defaultImage);
      updateTag('og-url', '', 'og:url', baseUrl + '/');
      updateTag('twitter-title', 'twitter:title', '', defaultTitle);
      updateTag('twitter-description', 'twitter:description', '', "Katalog menu digital Martabak Gresik. Terang Bulan Manis & Martabak Telor Asin Spesial.");
      updateTag('twitter-image', 'twitter:image', '', defaultImage);
    }
  }, [selectedPost, isNotFound]);

  // Sync with URL slug on mount and popstate
  React.useEffect(() => {
    const handleUrlChange = () => {
      const pathname = window.location.pathname;
      console.log(`[URL] Path changed: ${pathname}`);
      if (pathname.startsWith('/blog/')) {
        const slug = pathname.split('/blog/')[1];
        if (!slug) {
          setSelectedPost(null);
          setIsNotFound(false);
          return;
        }
        const post = posts.find(p => p.slug === slug);
        if (post) {
          console.log(`[BLOG] Post found: ${post.slug}`);
          setSelectedPost(post);
          setIsNotFound(false);
        } else {
          console.log(`[BLOG] Post not found for slug: ${slug}`);
          setSelectedPost(null);
          setIsNotFound(true);
        }
      } else {
        setSelectedPost(null);
        setIsNotFound(false);
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [posts]);

  const updateUrl = (slug: string | null) => {
    const path = slug ? `/blog/${slug}` : '/blog';
    window.history.pushState({}, '', path);
  };

  const handleBack = () => {
    if (selectedPost || isNotFound) {
      setSelectedPost(null);
      setIsNotFound(false);
      updateUrl(null);
    } else {
      // Clear blog path when going back to catalog
      window.history.pushState({}, '', '/');
      onClose();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = () => {
    if (!selectedPost) return;
    const url = new URL(window.location.origin + `/blog/${selectedPost.slug}`);
    
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-brand-yellow dark:bg-brand-black transition-colors duration-300 font-sans">
      <div ref={blogContainerRef} className="max-w-4xl mx-auto px-4 py-12 focus:outline-none">
        <AnimatePresence mode="wait">
          {isNotFound ? (
            <motion.div
              key="404"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-20 text-center space-y-8 bg-white/10 rounded-[3rem] border-2 border-dashed border-brand-black/10 dark:border-white/10 backdrop-blur-sm"
            >
              <div className="space-y-4">
                <div className="text-8xl md:text-9xl font-black text-brand-black/10 dark:text-brand-yellow/10">404</div>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">{t.notFoundTitle}</h2>
                <p className="text-brand-black/60 dark:text-brand-yellow/60 font-medium max-w-md mx-auto px-6">
                  {t.notFoundDesc}
                </p>
              </div>
              <button
                onClick={handleBack}
                className="bg-brand-orange text-white px-10 py-4 rounded-full font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg hover:shadow-brand-orange/50 mx-auto active:scale-95"
              >
                <BookOpen className="w-5 h-5" /> Lihat Artikel Lainnya
              </button>
            </motion.div>
          ) : !selectedPost ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12 relative"
            >
              <div id="blog-top-anchor" className="absolute -top-32" />
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 font-black uppercase text-xs tracking-widest text-brand-orange hover:gap-3 transition-all p-2 rounded-full hover:bg-brand-orange/10"
                >
                  <ArrowLeft className="w-4 h-4" /> {t.backCatalog}
                </button>
                <div className="text-center space-y-4">
                  <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight dark:text-brand-yellow">
                    {t.blogTitle}
                  </h2>
                <p className="text-brand-black/60 dark:text-brand-yellow/60 font-medium">
                  {t.blogSubtitle}
                </p>
              </div>

              {/* Search Bar */}
              <div className="max-w-md mx-auto w-full relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-black/30 group-focus-within:text-brand-orange transition-colors" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setDisplayLimit(6); // Reset limit when searching
                  }}
                  className="w-full bg-white/40 dark:bg-white/5 backdrop-blur-md border-2 border-brand-black/5 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 font-bold text-sm focus:border-brand-orange outline-none transition-all placeholder:text-brand-black/30 shadow-lg"
                />
              </div>
            </div>

              <div className="grid gap-8">
                {visiblePosts.length > 0 ? (
                  visiblePosts.map((post) => (
                    <motion.article
                      key={post.slug}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-brand-black/5 dark:border-white/5 shadow-xl cursor-pointer group"
                      onClick={() => {
                        setSelectedPost(post);
                        updateUrl(post.slug);
                        // Explicit scroll to top using the ref
                        blogContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      <div className="flex flex-col md:flex-row h-full">
                        <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
                          <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="md:w-2/3 p-6 md:p-8 space-y-4 flex flex-col justify-center">
                          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-brand-orange">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {new Date(post.date).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                          <h3 className="text-2xl md:text-3xl font-black leading-tight group-hover:text-brand-orange transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-brand-black/60 dark:text-brand-yellow/60 line-clamp-2 md:line-clamp-3">
                            {post.excerpt}
                          </p>
                          <div className="pt-2 flex items-center text-brand-orange font-black uppercase text-xs tracking-widest gap-1 group-hover:gap-2 transition-all">
                            {t.readMore} <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))
                ) : posts.length === 0 ? (
                  <div className="text-center py-20 bg-white/10 rounded-3xl border-2 border-dashed border-brand-black/10 dark:border-white/10">
                    <p className="text-2xl font-bold opacity-50">{t.noPosts}</p>
                    <p className="text-sm opacity-40 mt-2 font-medium">{t.noPostsHint}</p>
                  </div>
                ) : null}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center pt-8">
                  <button
                    onClick={handleLoadMore}
                    className="group flex items-center gap-3 bg-white dark:bg-zinc-900 border-2 border-brand-orange text-brand-orange px-8 py-3 rounded-2xl font-black uppercase italic tracking-wider hover:bg-brand-orange hover:text-white transition-all shadow-xl active:scale-95"
                  >
                    {t.loadMore} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              {/* No Results Found */}
              {filteredPosts.length === 0 && posts.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20 bg-white/10 rounded-3xl border-2 border-dashed border-brand-black/10 dark:border-white/10"
                >
                  <Search className="w-12 h-12 mx-auto mb-4 text-brand-black/20" />
                  <p className="text-xl font-bold opacity-50 italic uppercase tracking-tighter">{t.noResultsTitle}</p>
                  <p className="text-sm opacity-40 mt-2 font-medium">{t.noResultsHint}</p>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="mt-6 text-brand-orange font-black text-xs uppercase tracking-widest hover:underline"
                  >
                    {t.resetSearch}
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <button
                onClick={handleBack}
                className="flex items-center gap-2 font-black uppercase text-xs tracking-widest text-brand-orange hover:gap-3 transition-all p-2 rounded-full hover:bg-brand-orange/10"
              >
                <ArrowLeft className="w-4 h-4" /> {selectedPost ? t.backBlogList : t.backCatalog}
              </button>

              <div className="space-y-6">
                <img
                  src={selectedPost.thumbnail}
                  alt={selectedPost.title}
                  className="w-full h-64 md:h-96 object-cover rounded-[2rem] shadow-2xl"
                />
                
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-6 text-xs font-bold uppercase tracking-widest text-brand-black/40 dark:text-brand-yellow/40">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-orange" /> {new Date(selectedPost.date).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 text-brand-orange" /> {selectedPost.author}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleShare}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all font-bold uppercase text-[10px] tracking-widest ${
                      copied 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white'
                    }`}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                    {copied ? t.copied : t.shareLink}
                  </button>
                </div>
                  
                  <h1 className="text-4xl md:text-6xl font-black leading-tight uppercase tracking-tighter">
                    {selectedPost.title}
                  </h1>
                </div>

                <div className="markdown-content space-y-6 text-brand-black/80 dark:text-brand-yellow/80 leading-relaxed
                  [&>h1]:text-3xl [&>h1]:font-black [&>h1]:uppercase [&>h1]:tracking-tight [&>h1]:text-brand-black [&>h1]:dark:text-brand-yellow
                  [&>h2]:text-2xl [&>h2]:font-black [&>h2]:uppercase [&>h2]:tracking-tight [&>h2]:text-brand-black [&>h2]:dark:text-brand-yellow [&>h2]:pt-4
                  [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-brand-orange [&>h3]:pt-2
                  [&>p]:font-medium
                  [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2
                  [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-2
                  [&>blockquote]:border-l-4 [&>blockquote]:border-brand-orange [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:bg-brand-orange/5 [&>blockquote]:py-2 [&>blockquote]:rounded-r-xl
                  [&>strong]:text-brand-orange [&>strong]:font-bold
                  [&>hr]:border-brand-black/10 [&>hr]:dark:border-white/10 [&>hr]:my-8
                  [&>img]:rounded-3xl [&>img]:shadow-xl [&>img]:mx-auto
                  [&>table]:w-full [&>table]:border-collapse [&>table]:my-6 [&>table]:text-[10px] md:[&>table]:text-sm
                  [&>table_th]:bg-brand-orange/10 [&>table_th]:text-brand-orange [&>table_th]:p-2 md:[&>table_th]:p-3 [&>table_th]:text-left [&>table_th]:border [&>table_th]:border-brand-black/10 [&>table_th]:dark:border-white/10
                  [&>table_td]:p-2 md:[&>table_td]:p-3 [&>table_td]:border [&>table_td]:border-brand-black/10 [&>table_td]:dark:border-white/10
                ">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedPost.content}
                  </ReactMarkdown>
                </div>
                
                <div className="pt-12 border-t border-brand-black/10 dark:border-white/10">
                  <button
                    onClick={handleBack}
                    className="bg-brand-orange text-white px-8 py-3 rounded-full font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg hover:shadow-brand-orange/50 mx-auto"
                  >
                    <BookOpen className="w-5 h-5" /> {t.otherArticles}
                  </button>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
