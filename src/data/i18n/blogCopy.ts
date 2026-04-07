import type { UiLang } from "../../hooks/useUiLanguage";

export const BLOG_I18N: Record<UiLang, {
  backCatalog: string;
  blogTitle: string;
  blogSubtitle: string;
  searchPlaceholder: string;
  readMore: string;
  loadMore: string;
  noPosts: string;
  noPostsHint: string;
  noResultsTitle: string;
  noResultsHint: string;
  resetSearch: string;
  backBlogList: string;
  copied: string;
  shareLink: string;
  otherArticles: string;
  notFoundTitle: string;
  notFoundDesc: string;
  allCategories: string;
  relatedPosts: string;
  prevPost: string;
  nextPost: string;
  backBtn: string;
  categories: Record<string, string>;
  readingTime: (min: number) => string;
}> = {
  id: {
    backCatalog: 'Kembali ke Katalog',
    blogTitle: 'Blog Martabak',
    blogSubtitle: 'Cerita, Tips, dan Promo Menarik dari Martabak Gresik',
    searchPlaceholder: 'Cari artikel menarik...',
    readMore: 'Baca Selengkapnya',
    loadMore: 'Muat Lebih Banyak',
    noPosts: 'Belum ada artikel blog.',
    noPostsHint: 'Pastikan file .md sudah ada di src/content/blog/',
    noResultsTitle: 'Yah, Artikelnya Tidak Ketemu...',
    noResultsHint: 'Coba cari dengan kata kunci lain ya Kak!',
    resetSearch: 'Reset Pencarian',
    backBlogList: 'Kembali ke Daftar Blog',
    copied: 'Tersalin',
    shareLink: 'Bagikan Link',
    otherArticles: 'Lihat Artikel Lainnya',
    notFoundTitle: 'Opps! Artikel Hilang',
    notFoundDesc: 'Maaf Kak, artikel yang Kakak cari sepertinya sudah dipindahkan atau dihapus. Jangan sedih, masih banyak cerita lezat lainnya!',
    allCategories: 'Semua',
    relatedPosts: 'Baca Juga',
    prevPost: 'Sebelumnya',
    nextPost: 'Berikutnya',
    backBtn: 'Kembali',
    categories: {
      Tips: 'Tips',
      Menu: 'Menu',
      Info: 'Info',
      UMKM: 'UMKM',
      Lainnya: 'Lainnya'
    },
    readingTime: (min: number) => `${min} mnt baca`
  },
  en: {
    backCatalog: 'Back to Catalog',
    blogTitle: 'Martabak Blog',
    blogSubtitle: 'Stories, Tips, and Promo Updates from Martabak Gresik',
    searchPlaceholder: 'Search interesting articles...',
    readMore: 'Read More',
    loadMore: 'Load More',
    noPosts: 'No blog posts yet.',
    noPostsHint: 'Make sure .md files exist in src/content/blog/',
    noResultsTitle: 'Oops, No Article Found...',
    noResultsHint: 'Try a different keyword!',
    resetSearch: 'Reset Search',
    backBlogList: 'Back to Blog List',
    copied: 'Copied',
    shareLink: 'Share Link',
    otherArticles: 'See Other Articles',
    notFoundTitle: 'Oops! Article Missing',
    notFoundDesc: 'Sorry, the article you are looking for was moved or removed. There are still many other tasty stories!',
    allCategories: 'All',
    relatedPosts: 'Related Posts',
    prevPost: 'Previous',
    nextPost: 'Next',
    backBtn: 'Back',
    categories: {
      Tips: 'Tips',
      Menu: 'Menu',
      Info: 'Info',
      UMKM: 'SME',
      Lainnya: 'Others'
    },
    readingTime: (min: number) => `${min} min read`
  },
};
