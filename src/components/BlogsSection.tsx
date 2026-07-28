import React, { useState, useEffect } from 'react';
import { Calendar, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface BlogPost {
  id: number;
  categoryId: number | null;
  category: string;
  title: string;
  description: string;
  date: string;
  image: string;
}

const CATEGORIES: Record<number, string> = {
  1: 'Actors & Extras',
  3: 'Dancers',
  11: 'MC/RJ/VJ/Voice Over',
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

export default function BlogsSection() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryEntries = Object.entries(CATEGORIES).map(([id, name]) => ({
    id: Number(id),
    name,
  }));

  useEffect(() => {
    fetchBlogs();
  }, [selectedCategory]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params: any = { page: 1, limit: 3 };
      if (selectedCategory) params.categoryId = selectedCategory;
      const res = await api.get('/blogs', { params });
      if (res.data?.success && res.data?.data?.blogs) {
        setBlogs(res.data.data.blogs);
      } else {
        setBlogs([]);
      }
    } catch {
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white py-12 border-b border-[#f2f2f2] mx-auto relative overflow-hidden">
      
      {/* High fashion background details */}
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#3835A4]/[0.03] filter blur-[120px] pointer-events-none" />
      <div className="absolute left-0 bottom-0 h-96 w-96 rounded-full bg-[#C6007E]/[0.02] filter blur-[120px] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex items-start justify-between gap-4 mb-12">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-black text-neutral-900 sm:text-5xl tracking-tight leading-none mb-4">
              Creative Industry Journal
            </h2>
            <p className="text-sm text-neutral-500 leading-relaxed font-medium">
              Vetted tips, professional guide briefs, and industry guidelines compiled by international casting directors and executive model scouts.
            </p>
          </div>
          <Link
            to="/blogs"
            className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-[#C6007E] to-[#3835A4] text-white px-6 py-3 rounded-2xl font-black text-xs tracking-wider hover:opacity-90 transition-all shadow-lg shrink-0"
          >
            View All Blogs
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <Link
          to="/blogs"
          className="sm:hidden inline-flex items-center gap-2 bg-gradient-to-r from-[#C6007E] to-[#3835A4] text-white px-6 py-3 rounded-2xl font-black text-xs tracking-wider uppercase hover:opacity-90 transition-all shadow-lg mb-8"
        >
          View All Blogs
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>

        {/* Filter Bar - same as BlogsPage */}
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-[2rem] overflow-hidden bg-neutral-100 animate-pulse h-[420px]" />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-neutral-400 font-medium">No articles found.</p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
          >
            <AnimatePresence mode="popLayout">
              {blogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  onClick={() => navigate(`/blogs/${blog.id}`)}
                  className="bg-white flex flex-col rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl cursor-pointer group h-full border border-neutral-200/80 hover:border-[#3835A4]/30 transition-all duration-500 relative"
                  style={{ contentVisibility: 'auto' }}
                >
                  {/* Visual Hair-thin Accent Outline */}
                  <div className="absolute inset-2.5 border border-white/0 rounded-[1.5rem] pointer-events-none z-20 group-hover:border-neutral-900/10 transition-all duration-500" />

                  {/* Cover Photo */}
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

                  {/* Text contents with beautiful balance */}
                  <div className="p-7 sm:p-8 flex flex-col flex-grow justify-between bg-white relative">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-[9px] font-mono tracking-wider font-bold text-neutral-400">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDate(blog.date)}</span>
                      </div>
                      
                      <h3 className="font-display text-xl sm:text-2xl font-black text-neutral-900 group-hover:text-[#3835A4] transition-colors tracking-tight line-clamp-1 leading-tight">
                        {blog.title}
                      </h3>

                      <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3 font-medium">
                        {blog.description}
                      </p>
                    </div>

                    <div className="mt-8 pt-5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-bold group-hover:text-neutral-900 transition-colors duration-300">
                      <span className="text-[9px] tracking-[0.25em] font-mono font-black">Read Journal Article</span>
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

    </div>
  );
}
