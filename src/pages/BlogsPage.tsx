import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowUpRight, X, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';

interface BlogPost {
  id: number;
  categoryId: number | null;
  category: string;
  title: string;
  description: string;
  date: string;
  image: string;
}

interface Category {
  id: number;
  name: string;
}

const API = 'http://localhost:3000/api/v1/blogs';

const CATEGORIES: Record<number, string> = {
  1: 'Actors & Extras',
  3: 'Dancers',
  11: 'MC/RJ/VJ/Voice Over',
};

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, [selectedCategory]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (selectedCategory) params.categoryId = selectedCategory;
      const res = await axios.get(API, { params });
      if (res.data?.success && res.data?.data?.blogs) {
        setBlogs(res.data.data.blogs);
      }
    } catch {
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image: string) => {
    if (!image) return 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=650';
    if (image.startsWith('http')) return image;
    return `https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/blogs/${image}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const categoryEntries = Object.entries(CATEGORIES).map(([id, name]) => ({
    id: Number(id),
    name,
  }));

  return (
    <div className="w-full bg-white py-12 border-b border-[#f2f2f2] min-h-screen relative overflow-hidden">
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#3835A4]/[0.03] filter blur-[120px] pointer-events-none" />
      <div className="absolute left-0 bottom-0 h-96 w-96 rounded-full bg-[#C6007E]/[0.02] filter blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mb-12">
          <h2 className="font-display text-3xl font-black text-neutral-900 sm:text-5xl tracking-tight leading-none mb-4">
            Our Work
          </h2>
          <p className="text-sm text-neutral-500 leading-relaxed font-medium">
            Browse our portfolio of casting projects, talent spotlights, and industry insights from the Yoocasta team.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-neutral-100/80 p-1.5 rounded-2xl border border-neutral-250/30 w-fit mb-10">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`relative px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-[#C6007E] to-[#3835A4] text-white shadow-md'
                : 'text-neutral-500 hover:text-[#3835A4]'
            }`}
          >
            All
          </button>
          {categoryEntries.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`relative px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-[#C6007E] to-[#3835A4] text-white shadow-md'
                  : 'text-neutral-500 hover:text-[#3835A4]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-[2rem] overflow-hidden bg-neutral-100 animate-pulse h-[420px]" />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-neutral-400 font-medium">No articles found.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            <AnimatePresence mode="popLayout">
              {blogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  onClick={() => setSelectedArticle(blog)}
                  className="bg-white flex flex-col rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl cursor-pointer group h-full border border-neutral-200/80 hover:border-[#3835A4]/30 transition-all duration-500 relative"
                >
                  <div className="absolute inset-2.5 border border-white/0 rounded-[1.5rem] pointer-events-none z-20 group-hover:border-neutral-900/10 transition-all duration-500" />

                  <div className="h-56 w-full overflow-hidden bg-neutral-100 relative shrink-0">
                    <img
                      src={getImageUrl(blog.image)}
                      alt={blog.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent" />
                    <span className="absolute top-5 left-5 bg-white/95 backdrop-blur-sm text-neutral-900 text-[9px] font-mono font-black tracking-widest capitalize py-1.5 px-3.5 rounded-xl border border-neutral-250/20 shadow-md">
                      {blog.category}
                    </span>
                  </div>

                  <div className="p-7 sm:p-8 flex flex-col flex-grow justify-between bg-white relative">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-[9px] font-mono tracking-wider font-bold text-neutral-400">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDate(blog.date)}</span>
                      </div>

                      <h3 className="font-display text-xl sm:text-2xl font-black text-neutral-900 group-hover:text-[#3835A4] transition-colors tracking-tight line-clamp-1 leading-tight">
                        {blog.title}
                      </h3>
                    </div>

                    <div className="mt-8 pt-5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-bold group-hover:text-neutral-900 transition-colors duration-300">
                      <span className="text-[9px] tracking-[0.25em] font-mono font-black">Read Article</span>
                      <div className="p-1.5 rounded-xl bg-neutral-50 border border-neutral-200/60 group-hover:bg-gradient-to-br group-hover:from-[#C6007E] group-hover:to-[#3835A4] group-hover:text-white group-hover:border-transparent transition-all duration-300">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="absolute inset-0"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 25 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-2xl rounded-3xl border border-neutral-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10"
            >
              <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between">
                <span className="p-1 px-3.5 rounded-xl bg-[#C6007E]/10 border border-[#C6007E]/20 text-[#C6007E] text-[9px] font-mono font-black capitalize tracking-widest">{selectedArticle.category}</span>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="p-2 rounded-xl hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer border border-transparent hover:border-neutral-250/20"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto space-y-6 bg-white">
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 relative">
                  <img src={getImageUrl(selectedArticle.image)} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 via-transparent to-transparent" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-[10px] font-mono tracking-wider font-bold text-neutral-400">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Published: {formatDate(selectedArticle.date)}</span>
                  </div>
                  <h1 className="font-display text-2xl md:text-3xl font-black text-neutral-900 leading-tight">{selectedArticle.title}</h1>
                </div>

                <div className="p-5 bg-[#3835A4]/5 border-l-2 border-[#3835A4] text-xs italic text-neutral-800 leading-relaxed rounded-r-xl font-medium">
                  {selectedArticle.description}
                </div>

                <div className="pt-8 border-t border-neutral-100 text-center flex flex-col items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#3835A4]/10 flex items-center justify-center text-[#3835A4]">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <p className="text-xs text-neutral-500 font-mono max-w-sm mx-auto">Want to secure absolute career exposure? Upgrade to premium modeling membership to land direct agency opportunities.</p>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="mt-2 bg-gradient-to-r from-[#C6007E] to-[#3835A4] hover:opacity-95 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    Close Article
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
