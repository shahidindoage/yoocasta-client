import React, { useState } from 'react';
import { INITIAL_TESTIMONIALS } from '../data';
import { Star, CheckCircle, ChevronLeft, ChevronRight, Quote, Sparkles, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev === 0 ? INITIAL_TESTIMONIALS.length - 1 : prev - 1));
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev === INITIAL_TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  const active = INITIAL_TESTIMONIALS[currentIndex];

  return (
    <div id="testimonials" className="w-full bg-[#222222] text-white py-12 border-b border-[#f2f2f2] relative overflow-hidden">
      
      {/* Decorative High-Contrast Glow Elements */}
      <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-amber-500/[0.03] filter blur-[150px] pointer-events-none" />
      <div className="absolute left-[-10%] bottom-0 h-[400px] w-[400px] rounded-full bg-amber-600/[0.02] filter blur-[120px] pointer-events-none" />
      
      {/* Editorial Watermark background */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 select-none pointer-events-none text-[15vw] font-black text-white/[0.03] tracking-[0.1em] uppercase font-mono leading-none">
        DIARIES
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header - Elite Editorial Dark Design */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-8">
          <div className="space-y-4 max-w-2xl">
            <h2 className="font-display text-4xl font-black text-white sm:text-5xl tracking-tight leading-none">
              Success Diaries & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">Feedback</span>
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed font-medium">
              Read verified experiences from Middle Eastern and international runway models, actors, and bilingual hosts booked through Yoocasta.
            </p>
          </div>
        </div>

        {/* Sliding card luxury portfolio style */}
        <div className="relative max-w-5xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Huge, creative photo representation with parallax look */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[340px] aspect-[4/5] group">
                {/* Visual Golden Aura Card behind */}
                <div className="absolute inset-4 -right-2 -bottom-2 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-[2.5rem] filter blur-[1xl] opacity-30 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-neutral-800 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl relative z-10">
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={active.id}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      src={active.image} 
                      alt={active.name} 
                      className="h-full w-full object-cover filter brightness-90 group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
                  
                  {/* Subtle Name Overlay on Photo */}
                  <div className="absolute bottom-6 left-6 right-6 z-20">
                    <span className="text-[9px] uppercase font-mono tracking-widest font-black text-amber-400 block mb-1">BOOKED ROSTER</span>
                    <h4 className="text-lg font-black text-white tracking-tight">{active.name}</h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Immersive quote and metadata */}
            <div className="lg:col-span-7 space-y-8 relative">
              <Quote className="absolute -top-10 -left-6 h-20 w-20 text-white/[0.05] pointer-events-none" />

              <div className="min-h-[220px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    {/* Stars rating with pulsing sparkle */}
                    <div className="flex items-center gap-1">
                      {[...Array(active.rating)].map((_, i) => (
                        <Star key={i} className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="ml-2 text-xs font-mono font-bold text-amber-400">5.0 Star Booking</span>
                    </div>

                    {/* Quote text */}
                    <blockquote className="text-xl md:text-2xl text-neutral-100 leading-relaxed font-sans font-medium tracking-tight">
                      "{active.quote}"
                    </blockquote>

                    {/* Meta stack */}
                    <div className="flex flex-wrap items-center gap-4 pt-4">
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-[9px] font-mono font-black tracking-widest uppercase">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400 fill-current" /> VERIFIED CAST
                      </span>
                      
                      <div className="bg-white/5 border border-white/10 py-1.5 px-4 rounded-xl text-xs text-neutral-300 font-mono flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                        <span>Booked for: <strong className="text-white font-black">{active.project}</strong></span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Slider Controls & Thumbnail Selectors */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-8 border-t border-white/5">
                {/* Thumbnails to click on directly */}
                <div className="flex items-center gap-3">
                  {INITIAL_TESTIMONIALS.map((t, idx) => {
                    const isSelected = idx === currentIndex;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`relative h-12 w-12 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                          isSelected ? 'border-amber-400 ring-2 ring-amber-400/20 scale-105' : 'border-white/10 filter opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={t.image} alt={t.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    );
                  })}
                </div>

                {/* Classic elegant pagination controls */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    onClick={prevTestimonial}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all shadow-md active:scale-95"
                    aria-label="Previous Success Story"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  <span className="text-xs font-mono text-neutral-400 tracking-wider">
                    {String(currentIndex + 1).padStart(2, '0')} / {String(INITIAL_TESTIMONIALS.length).padStart(2, '0')}
                  </span>

                  <button
                    onClick={nextTestimonial}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all shadow-md active:scale-95"
                    aria-label="Next Success Story"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}