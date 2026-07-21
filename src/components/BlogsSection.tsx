import React, { useState } from 'react';
import { INITIAL_BLOGS } from '../data';
import { BlogItem } from '../types';
import { Calendar, Clock, ChevronRight, X, Sparkles, Filter, ArrowUpRight, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function BlogsSection() {
  const [selectedArticle, setSelectedArticle] = useState<BlogItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Dynamically extract categories
  const categories = ['All', 'Advice & Tips', 'Industry Secrets', 'Auditions'];

  const filteredBlogs = selectedCategory === 'All' 
    ? INITIAL_BLOGS 
    : INITIAL_BLOGS.filter(blog => blog.category === selectedCategory);

  return (
    <div className="w-full bg-white py-12 border-b border-[#f2f2f2] mx-auto relative overflow-hidden">
      
      {/* High fashion background details */}
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#3835A4]/[0.03] filter blur-[120px] pointer-events-none" />
      <div className="absolute left-0 bottom-0 h-96 w-96 rounded-full bg-[#C6007E]/[0.02] filter blur-[120px] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <h2 className="font-display text-3xl font-black text-neutral-900 sm:text-5xl tracking-tight leading-none mb-4">
            Creative Industry Journal
          </h2>
          <p className="text-sm text-neutral-500 leading-relaxed font-medium">
            Vetted tips, professional guide briefs, and industry guidelines compiled by international casting directors and executive model scouts.
          </p>
        </div>

        {/* Interactive Categories Bar - Placed Directly Above the Blogs */}
        <div className="flex flex-wrap items-center gap-2 bg-neutral-100/80 p-1.5 rounded-2xl border border-neutral-250/30 w-fit mb-10">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`relative px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-gradient-to-r from-[#C6007E] to-[#3835A4] text-white shadow-md' 
                    : 'text-neutral-500 hover:text-[#3835A4]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Dynamic Blog Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
        >
          <AnimatePresence mode="popLayout">
            {filteredBlogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                onClick={() => setSelectedArticle(blog)}
                className="bg-white flex flex-col rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl cursor-pointer group h-full border border-neutral-200/80 hover:border-[#3835A4]/30 transition-all duration-500 relative"
                style={{ contentVisibility: 'auto' }}
              >
                {/* Visual Hair-thin Accent Outline */}
                <div className="absolute inset-2.5 border border-white/0 rounded-[1.5rem] pointer-events-none z-20 group-hover:border-neutral-900/10 transition-all duration-500" />

                {/* Cover Photo */}
                <div className="h-56 w-full overflow-hidden bg-neutral-100 relative shrink-0">
                  <img 
                    src={blog.imageUrl} 
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
                      <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {blog.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {blog.readTime}</span>
                    </div>
                    
                    <h3 className="font-display text-xl sm:text-2xl font-black text-neutral-900 group-hover:text-[#3835A4] transition-colors tracking-tight line-clamp-1 leading-tight">
                      {blog.title}
                    </h3>

                    <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3 font-medium">
                      {blog.summary}
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

      </div>

      {/* Immersive Gazette Reader Modal Dialog with motion */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md">
            
            {/* Modal Backdrop overlay to support click-out */}
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
              
              {/* Header Details bar */}
              <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between">
                <span className="p-1 px-3.5 rounded-xl bg-[#C6007E]/10 border border-[#C6007E]/20 text-[#C6007E] text-[9px] font-mono font-black uppercase tracking-widest">{selectedArticle.category}</span>
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="p-2 rounded-xl hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer border border-transparent hover:border-neutral-250/20"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Contents details */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 bg-white">
                
                {/* Hero Feature Banner */}
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 relative">
                  <img src={selectedArticle.imageUrl} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 via-transparent to-transparent" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-[10px] font-mono tracking-wider font-bold text-neutral-400">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Published: {selectedArticle.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Read time: {selectedArticle.readTime}</span>
                  </div>
                  <h1 className="font-display text-2xl md:text-3xl font-black text-neutral-900 leading-tight">{selectedArticle.title}</h1>
                </div>

                {/* Styled Pull-quote Summary */}
                <div className="p-5 bg-[#3835A4]/5 border-l-2 border-[#3835A4] text-xs italic text-neutral-800 leading-relaxed rounded-r-xl font-medium">
                  {selectedArticle.summary}
                </div>

                {/* Core Article Markdown/Copy */}
                <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line font-medium">
                  {selectedArticle.content}
                </p>

                {/* Deluxe Footer Branding inside Reader */}
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