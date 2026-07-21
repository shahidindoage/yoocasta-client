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
    <div id="testimonials" className="w-full bg-[#fef1f5] text-stone-900 py-12 border-b border-[#f5d0e3] relative overflow-hidden">
      
      {/* Soft Pink Glow Elements */}
      <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-[#C6007E]/8 blur-[150px] pointer-events-none" />
      <div className="absolute left-[-10%] bottom-0 h-[400px] w-[400px] rounded-full bg-[#3835A4]/5 blur-[120px] pointer-events-none" />
      
      {/* Editorial Watermark background */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 select-none pointer-events-none text-[15vw] font-black text-[#C6007E]/[0.05] tracking-[0.1em] uppercase font-mono leading-none">
        DIARIES
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-8">
          <div className="space-y-4 max-w-2xl">
            <h2 className="font-display text-4xl font-black text-stone-900 sm:text-5xl tracking-tight leading-none">
              Success Diaries & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C6007E] to-[#3835A4]">Feedback</span>
            </h2>
            <p className="text-sm text-stone-500 leading-relaxed font-medium">
              Read verified experiences from Middle Eastern and international runway models, actors, and bilingual hosts booked through Yoocasta.
            </p>
          </div>
        </div>

        {/* Sliding card */}
        <div className="relative max-w-5xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Photo */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[340px] aspect-[4/5] group">
                {/* Pink Aura behind */}
                <div className="absolute inset-4 -right-2 -bottom-2 bg-gradient-to-tr from-[#C6007E] to-[#3835A4] rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-white rounded-[2.5rem] border border-[#f5d0e3] overflow-hidden shadow-lg relative z-10">
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={active.id}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      src={active.image} 
                      alt={active.name} 
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#C6007E]/30 via-[#C6007E]/5 to-transparent" />
                  
                  {/* Name Overlay on Photo */}
                  <div className="absolute bottom-6 left-6 right-6 z-20">
                    <span className="text-[9px] font-mono tracking-widest font-black text-white block mb-1">Booked Roster</span>
                    <h4 className="text-lg font-black text-white tracking-tight">{active.name}</h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Quote and metadata */}
            <div className="lg:col-span-7 space-y-8 relative">
              <Quote className="absolute -top-10 -left-6 h-20 w-20 text-[#C6007E]/10 pointer-events-none" />

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
                    {/* Stars */}
                    <div className="flex items-center gap-1">
                      {[...Array(active.rating)].map((_, i) => (
                        <Star key={i} className="h-4.5 w-4.5 fill-[#C6007E] text-[#C6007E]" />
                      ))}
                      <span className="ml-2 text-xs font-mono font-bold text-[#C6007E]">5.0 Star Booking</span>
                    </div>

                    {/* Quote */}
                    <blockquote className="text-xl md:text-2xl text-stone-700 leading-relaxed font-sans font-medium tracking-tight">
                      "{active.quote}"
                    </blockquote>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 pt-4">
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-[9px] font-mono font-black tracking-widest capitalize">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600 fill-current" /> Verified Cast
                      </span>
                      
                      <div className="bg-white border border-[#f5d0e3] py-1.5 px-4 rounded-xl text-xs text-stone-500 font-mono flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#C6007E] shrink-0" />
                        <span>Booked for: <strong className="text-stone-900 font-black">{active.project}</strong></span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Slider Controls & Thumbnails */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-8 border-t border-[#f5d0e3]">
                {/* Thumbnails */}
                <div className="flex items-center gap-3">
                  {INITIAL_TESTIMONIALS.map((t, idx) => {
                    const isSelected = idx === currentIndex;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`relative h-12 w-12 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                          isSelected ? 'border-[#C6007E] ring-2 ring-[#C6007E]/20 scale-105' : 'border-[#f5d0e3] opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={t.image} alt={t.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    );
                  })}
                </div>

                {/* Pagination controls */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    onClick={prevTestimonial}
                    className="p-3 rounded-xl bg-white border border-[#f5d0e3] text-stone-500 hover:text-[#C6007E] cursor-pointer hover:bg-[#fef1f5] transition-all shadow-sm active:scale-95"
                    aria-label="Previous Success Story"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  <span className="text-xs font-mono text-stone-400 tracking-wider">
                    {String(currentIndex + 1).padStart(2, '0')} / {String(INITIAL_TESTIMONIALS.length).padStart(2, '0')}
                  </span>

                  <button
                    onClick={nextTestimonial}
                    className="p-3 rounded-xl bg-white border border-[#f5d0e3] text-stone-500 hover:text-[#C6007E] cursor-pointer hover:bg-[#fef1f5] transition-all shadow-sm active:scale-95"
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