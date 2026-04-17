import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, User, ArrowLeft, ChevronRight, BookOpen, Share2, Check, Search, Clock, Tag, ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getBlogPosts, type BlogPost } from '../data/blogUtils';
import { useAppStore } from '../store/useAppStore';
import { BLOG_I18N } from '../data/i18n/blogCopy';
import { SEO } from './SEO';

interface BlogViewProps {
  onClose: () => void;
  isMainPage?: boolean;
}

export function BlogView({ onClose, isMainPage = false }: BlogViewProps) {
  const { uiState } = useAppStore();
  const { uiLang } = uiState;
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams<{ slug?: string }>();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [displayLimit, setDisplayLimit] = useState(6);
  const t = BLOG_I18N[uiLang] || BLOG_I18N["id"];
  const dateLocale = uiLang === 'en' ? 'en-US' : 'id-ID';

  // Category Translation Helper
  const getCategoryLabel = (cat: string) => {
    if (cat === 'All') return t.allCategories;
    return (t.categories as any)[cat] || cat;
  };

  // Fetch posts dari file markdown lokal
  useEffect(() => {
    setPostsLoading(true);
    try {
      setPosts(getBlogPosts());
    } finally {
      setPostsLoading(false);
    }
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = posts.map(p => p.category || 'Lainnya');
    return ['All', ...Array.from(new Set(cats))];
  }, [posts]);

  // Filter and Pagination Logic
  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return posts.filter(post => {
      const matchesSearch = (post.title || "").toLowerCase().includes(q) ||
        (post.excerpt || "").toLowerCase().includes(q) ||
        (post.content || "").toLowerCase().includes(q);
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchQuery, selectedCategory]);

  const visiblePosts = useMemo(() => {
    return filteredPosts.slice(0, displayLimit);
  }, [filteredPosts, displayLimit]);

  const hasMore = displayLimit < filteredPosts.length;

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 6);
  };

  const blogContainerRef = React.useRef<HTMLDivElement>(null);

  // Initial scroll to blog header
  React.useEffect(() => {
    if (blogContainerRef.current && !window.location.pathname.includes('/blog/')) {
      blogContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // SEO
  const BASE_URL = 'https://martabakgresik.my.id';
  const seoProps = React.useMemo(() => {
    if (selectedPost) {
      const thumbUrl = selectedPost.thumbnail.startsWith('http')
        ? selectedPost.thumbnail
        : `${BASE_URL}${selectedPost.thumbnail}`;
      return {
        title: `${selectedPost.title} | ${t.blogTitle}`,
        description: selectedPost.excerpt,
        image: thumbUrl,
        url: `${BASE_URL}/blog/${selectedPost.slug}`,
        type: 'article' as const,
        date: selectedPost.date,
        author: selectedPost.author,
      };
    }
    return {
      title: `${t.blogTitle} - ${t.blogSubtitle}`,
      description: t.blogSubtitle,
      url: `${BASE_URL}/blog`,
      image: `${BASE_URL}/metaseo.webp`,
    };
  }, [selectedPost]);

  React.useEffect(() => {
    if (slug) {
      const post = posts.find(p => p.slug === slug);
      if (post) {
        setSelectedPost(post);
        setIsNotFound(false);
      } else if (posts.length > 0) {
        setSelectedPost(null);
        setIsNotFound(true);
      }
    } else {
      setSelectedPost(null);
      setIsNotFound(false);
    }
  }, [posts, slug]);

  const updateUrl = (newSlug: string | null) => {
    const path = newSlug ? `/blog/${newSlug}` : '/blog';
    navigate(path);
  };

  const handleBack = () => {
    if (selectedPost || isNotFound) {
      navigate('/blog');
    } else {
      navigate('/');
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

  // Related Posts Logic
  const relatedPosts = useMemo(() => {
    if (!selectedPost) return [];
    return posts
      .filter(p => p.slug !== selectedPost.slug && (p.category === selectedPost.category || posts.indexOf(p) < 5))
      .slice(0, 3);
  }, [selectedPost, posts]);

  // Next/Prev Navigation
  const navigation = useMemo(() => {
    if (!selectedPost) return { next: null, prev: null };
    const idx = posts.findIndex(p => p.slug === selectedPost.slug);
    return {
      next: idx > 0 ? posts[idx - 1] : null,
      prev: idx < posts.length - 1 ? posts[idx + 1] : null
    };
  }, [selectedPost, posts]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-brand-black transition-colors duration-300 font-sans pb-20">
      <SEO {...seoProps} lang={uiLang} />
      
      <div ref={blogContainerRef} className="max-w-7xl mx-auto px-4 focus:outline-none">
        
        <AnimatePresence mode="wait">
          {!selectedPost && !isNotFound ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12 py-12"
            >
              {/* Compact Header */}
              <div className="flex flex-col items-center text-center space-y-6">
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest text-brand-orange hover:bg-brand-orange/10 px-4 py-2 rounded-full transition-all"
                >
                  <ArrowLeft className="w-3 h-3" /> {t.backCatalog}
                </button>
                
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight dark:text-brand-yellow">
                    {t.blogTitle}
                  </h2>
                  <p className="text-neutral-500 dark:text-neutral-400 font-medium max-w-lg mx-auto text-sm md:text-base">
                    {t.blogSubtitle}
                  </p>
                </div>

                {/* Filters & Search Row */}
                <div className="w-full max-w-4xl flex flex-col md:flex-row items-center gap-4 pt-4">
                  <div className="flex-1 w-full relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-brand-orange transition-colors" />
                    <input
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-3 pl-11 pr-4 text-sm focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all shadow-sm dark:text-white"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                          selectedCategory === cat 
                            ? 'bg-brand-orange border-brand-orange text-white shadow-lg shadow-brand-orange/20' 
                            : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-brand-orange/50'
                        }`}
                      >
                        {getCategoryLabel(cat)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {visiblePosts.map((post, idx) => (
                  <motion.article
                    key={post.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -8 }}
                    className="bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-2xl transition-all cursor-pointer group flex flex-col"
                    onClick={() => {
                      setSelectedPost(post);
                      updateUrl(post.slug);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <div className="aspect-[16/10] overflow-hidden relative">
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-orange shadow-sm">
                          {getCategoryLabel(post.category || 'Lainnya')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-8 flex flex-col flex-1 space-y-4">
                      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(post.date).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {t.readingTime(post.readingTime || 0)}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-black leading-tight group-hover:text-brand-orange transition-colors line-clamp-2 dark:text-white">
                        {post.title}
                      </h3>
                      
                      <p className="text-neutral-500 dark:text-neutral-400 text-sm line-clamp-3 leading-relaxed flex-1">
                        {post.excerpt}
                      </p>
                      
                      <div className="pt-4 flex items-center text-brand-orange font-black uppercase text-[10px] tracking-widest gap-2 group-hover:gap-3 transition-all">
                        {t.readMore} <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center pt-8">
                  <button
                    onClick={handleLoadMore}
                    className="bg-white dark:bg-neutral-900 border-2 border-brand-orange text-brand-orange px-10 py-4 rounded-2xl font-black uppercase tracking-wider hover:bg-brand-orange hover:text-white transition-all shadow-xl active:scale-95 text-xs"
                  >
                    {t.loadMore}
                  </button>
                </div>
              )}
            </motion.div>
          ) : isNotFound ? (
            <div className="py-32 text-center space-y-8">
               <h2 className="text-8xl font-black opacity-10">404</h2>
               <p className="text-xl font-bold">{t.notFoundTitle}</p>
               <button onClick={handleBack} className="bg-brand-orange text-white px-8 py-3 rounded-full font-black uppercase text-xs">
                 {t.backBtn}
               </button>
            </div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto py-12 space-y-12"
            >
              {/* Article Header */}
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest text-brand-orange hover:bg-brand-orange/10 px-4 py-2 rounded-full transition-all"
                  >
                    <ArrowLeft className="w-3 h-3" /> {t.backBlogList}
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all font-black uppercase text-[10px] tracking-widest ${
                      copied ? 'bg-green-500 border-green-500 text-white' : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-brand-orange hover:text-brand-orange'
                    }`}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                    {copied ? t.copied : t.shareLink}
                  </button>
                </div>

                <div className="space-y-6 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <span className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {getCategoryLabel(selectedPost.category || 'Lainnya')}
                    </span>
                    <span className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {t.readingTime(selectedPost.readingTime || 0)}
                    </span>
                  </div>
                  
                  <h1 className="text-4xl md:text-6xl font-black leading-[1.1] uppercase tracking-tighter dark:text-white max-w-3xl mx-auto">
                    {selectedPost.title}
                  </h1>

                  <div className="flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-orange" /> {new Date(selectedPost.date).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-2">
                       <User className="w-4 h-4 text-brand-orange" /> {selectedPost.author}
                    </span>
                  </div>
                </div>

                <div className="aspect-video rounded-[3rem] overflow-hidden shadow-2xl">
                  <img
                    src={selectedPost.thumbnail}
                    alt={selectedPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Reading Mode Content */}
              <div className="max-w-3xl mx-auto">
                <div className="markdown-content space-y-8 text-neutral-700 dark:text-neutral-300 leading-relaxed text-lg
                  [&>h2]:text-3xl [&>h2]:font-black [&>h2]:uppercase [&>h2]:tracking-tight [&>h2]:text-neutral-900 [&>h2]:dark:text-white [&>h2]:pt-8 [&>h2]:pb-2
                  [&>h3]:text-xl [&>h3]:font-black [&>h3]:text-brand-orange [&>h3]:pt-4
                  [&>p]:mb-6
                  [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-3 [&>ul]:mb-6
                  [&>blockquote]:border-l-8 [&>blockquote]:border-brand-orange [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:bg-brand-orange/5 [&>blockquote]:py-6 [&>blockquote]:rounded-r-3xl [&>blockquote]:text-xl [&>blockquote]:my-10
                  [&>strong]:text-brand-orange [&>strong]:font-black
                  [&>img]:rounded-[2.5rem] [&>img]:shadow-2xl [&>img]:my-12
                ">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedPost.content}
                  </ReactMarkdown>
                </div>

                {/* Next/Prev Navigation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-20 border-t border-neutral-100 dark:border-neutral-800">
                  {navigation.prev && (
                    <button 
                      onClick={() => {
                        setSelectedPost(navigation.prev);
                        updateUrl(navigation.prev!.slug);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:border-brand-orange transition-all text-left group"
                    >
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">
                        <ChevronLeft className="w-3 h-3" /> {t.prevPost}
                      </div>
                      <div className="font-bold dark:text-white group-hover:text-brand-orange transition-colors line-clamp-1">{navigation.prev.title}</div>
                    </button>
                  )}
                  {navigation.next && (
                    <button 
                      onClick={() => {
                        setSelectedPost(navigation.next);
                        updateUrl(navigation.next!.slug);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:border-brand-orange transition-all text-right group"
                    >
                      <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">
                        {t.nextPost} <ChevronRight className="w-3 h-3" />
                      </div>
                      <div className="font-bold dark:text-white group-hover:text-brand-orange transition-colors line-clamp-1">{navigation.next.title}</div>
                    </button>
                  )}
                </div>
              </div>

              {/* Related Posts Section */}
              <div className="pt-20 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                  <h4 className="text-sm font-black uppercase tracking-[0.3em] text-neutral-400">{t.relatedPosts}</h4>
                  <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map(post => (
                    <div 
                      key={post.slug}
                      onClick={() => {
                        setSelectedPost(post);
                        updateUrl(post.slug);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="group cursor-pointer space-y-3"
                    >
                      <div className="aspect-video rounded-2xl overflow-hidden">
                        <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <h5 className="font-bold dark:text-white group-hover:text-brand-orange transition-colors text-sm leading-tight line-clamp-2">
                        {post.title}
                      </h5>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center pt-20">
                <button
                  onClick={handleBack}
                  className="bg-brand-orange text-white px-10 py-4 rounded-full font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg hover:shadow-brand-orange/50 active:scale-95 text-xs"
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

