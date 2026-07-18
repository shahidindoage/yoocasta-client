import React, { useState, useRef } from 'react';
import { Talent } from '../types';
import { Star, MapPin, Eye, Ruler, ChevronDown, RefreshCw, Layers, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FeaturedTalentProps {
  talents: Talent[];
  onTalentClick: (talent: Talent) => void;
  selectedCategory: string;
  selectedGender: string;
  selectedLocation: string;
  onGenderChange: (gender: string) => void;
  onLocationChange: (location: string) => void;
  onCategoryChange: (category: string) => void;
}

export default function FeaturedTalent({
  talents,
  onTalentClick,
  selectedCategory,
  selectedGender,
  selectedLocation,
  onGenderChange,
  onLocationChange,
  onCategoryChange, // Re-introduced to clear empty states
}: FeaturedTalentProps) {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const locationOptions = [
    { value: 'All Locations', label: 'All Gulf Regions' },
    { value: 'Dubai, UAE', label: 'Dubai, UAE' },
    { value: 'Sharjah, UAE', label: 'Sharjah, UAE' },
    { value: 'Abu Dhabi, UAE', label: 'Abu Dhabi, UAE' },
    { value: 'Riyadh, Saudi Arabia', label: 'Riyadh, Saudi' },
  ];

  const currentLocationLabel = locationOptions.find(opt => opt.value === selectedLocation)?.label || selectedLocation;

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400; 
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div 
      id="talents-anchor" 
      className="bg-neutral-50/50 py-8 border-b border-[#f2f2f2] relative overflow-hidden"
    >
      {/* Ambient lights */}
      <div className="absolute left-0 top-1/4 h-96 w-96 rounded-full bg-[#3835A4]/[0.035] filter blur-[120px] pointer-events-none" />
      <div className="absolute right-0 bottom-1/4 h-96 w-96 rounded-full bg-[#C6007E]/[0.025] filter blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Selection Headings */}
        <div className="mb-8 pb-6 border-b border-neutral-200/60">
          <div className="space-y-4 max-w-2xl">
            <h2 className="font-display text-3xl font-black text-neutral-900 sm:text-5xl tracking-tight leading-none">
              Featured Talent Showroom
            </h2>
            <p className="text-sm text-neutral-500 leading-relaxed font-medium">
              Explore professional composite cards vetted for cinematic presence, runway posture, and regional versatility. Click any portfolio card to review digital portfolios, precise measurements, and verified bookers.
            </p>
          </div>
        </div>

        {/* Filter Control Center */}
       <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 w-full">
  {/* Filter Control Center - w-fit keeps it shrunk to its contents */}
  <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-neutral-200/90 w-fit">
    
    {/* Segmented Gender Controller */}
    <div className="flex items-center gap-2">
      {['All', 'Female', 'Male'].map((genderOption) => {
        const isSelected = selectedGender === genderOption;
        return (
          <button
            key={genderOption}
            onClick={() => onGenderChange(genderOption)}
            className={`relative px-4 py-3 text-xs font-black tracking-wider uppercase transition-all duration-300 z-10 cursor-pointer rounded-xl border min-w-[80px] text-center ${
              isSelected
                ? 'text-white border-transparent bg-gradient-to-r from-[#C6007E] to-[#3835A4] shadow-sm'
                : 'text-neutral-700 bg-white border-neutral-200 hover:border-neutral-300 hover:text-neutral-900 shadow-xs'
            }`}
          >
            {genderOption}
          </button>
        );
      })}
    </div>

    {/* Custom Location Dropdown */}
    <div className="relative">
      <button
        onClick={() => setIsLocationOpen(!isLocationOpen)}
        className="bg-white text-xs text-neutral-900 font-black px-4 py-3 rounded-xl border border-neutral-200 hover:border-neutral-300 focus:outline-none cursor-pointer flex items-center gap-2 shadow-xs min-w-[150px] justify-between transition-all"
      >
        <span className="flex items-center gap-1.5 text-neutral-700">
          <MapPin className="h-3.5 w-3.5 text-neutral-500" />
          {currentLocationLabel}
        </span>
        <ChevronDown className={`h-3 w-3 text-neutral-400 transition-transform duration-300 ${isLocationOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isLocationOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsLocationOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 mt-2 w-56 bg-white border border-neutral-200 rounded-2xl shadow-xl p-2 z-50 overflow-hidden"
            >
              <div className="px-3 py-1.5 border-b border-neutral-100 mb-1">
                <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-neutral-400">Filter Location</span>
              </div>
              {locationOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onLocationChange(opt.value);
                    setIsLocationOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    selectedLocation === opt.value
                      ? 'bg-[#3835A4]/10 text-[#3835A4] font-black'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  {selectedLocation === opt.value && <div className="h-1.5 w-1.5 rounded-full bg-[#3835A4]" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>

    {/* Inline Reset Button */}
    {(selectedGender !== 'All' || selectedLocation !== 'All Locations') && (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          onGenderChange('All');
          onLocationChange('All Locations');
        }}
        className="text-xs text-neutral-900 hover:text-[#3835A4] transition-colors px-3 py-2.5 font-bold flex items-center gap-1.5 border border-dashed border-neutral-300 rounded-xl hover:border-[#3835A4] bg-neutral-50 cursor-pointer"
      >
        <RefreshCw className="h-3 w-3 text-[#3835A4]" />
        Reset Filters
      </motion.button>
    )}
  </div>

  {/* Standalone Circular Navigation Elements (Forced to the last position on the right side) */}
  {talents.length > 0 && (
    <div className="flex items-center gap-2 self-center md:self-stretch justify-end pl-2 ml-auto">
      <button
        onClick={() => handleScroll('left')}
        className="h-12 w-12 rounded-full bg-white border border-neutral-200 text-neutral-700 flex items-center justify-center cursor-pointer hover:bg-neutral-950 hover:text-white hover:border-neutral-950 transition-all shadow-sm shrink-0"
        aria-label="Scroll left"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleScroll('right')}
        className="h-12 w-12 rounded-full bg-white border border-neutral-200 text-neutral-700 flex items-center justify-center cursor-pointer hover:bg-neutral-950 hover:text-white hover:border-neutral-950 transition-all shadow-sm shrink-0"
        aria-label="Scroll right"
      >
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  )}
</div>

        {/* Talent Grid Track */}
        <AnimatePresence mode="wait">
          {talents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-24 bg-white border border-dashed border-neutral-200/80 rounded-[2rem] shadow-sm max-w-3xl mx-auto"
            >
              <div className="h-14 w-14 rounded-2xl bg-[#3835A4]/10 flex items-center justify-center mx-auto mb-6">
                <Star className="h-7 w-7 text-[#3835A4]" />
              </div>
              <h3 className="font-display text-xl font-black text-neutral-950">No talents found</h3>
              
              {/* This master reset clears everything to unbreak the layout */}
              <button
                onClick={() => {
                  onCategoryChange('all');
                  onGenderChange('All');
                  onLocationChange('All Locations');
                }}
                className="mt-6 px-6 py-3 bg-neutral-950 text-white rounded-xl font-bold text-xs uppercase inline-flex items-center gap-2 cursor-pointer"
              >
                <Layers className="h-4 w-4" /> Reset All Filters
              </button>
            </motion.div>
          ) : (
            <div className="relative w-full group/carousel">
              {/* <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-neutral-50/90 to-transparent z-20 pointer-events-none" /> */}
              {/* <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-neutral-50/90 to-transparent z-20 pointer-events-none" /> */}

              <div 
                ref={scrollContainerRef}
                className="flex gap-6 sm:gap-8 pb-6 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth relative px-2"
              >
                {talents.map((talent, index) => {
                  const sortedCategories = [...talent.categories].sort((a, b) => {
                    if (a.toLowerCase() === selectedCategory.toLowerCase()) return -1;
                    if (b.toLowerCase() === selectedCategory.toLowerCase()) return 1;
                    return 0;
                  });

                  return (
                    <motion.div
                      key={talent.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      onClick={() => onTalentClick(talent)}
                      className="snap-start group relative h-[520px] w-[290px] sm:w-[350px] md:w-[360px] shrink-0 rounded-[2.25rem] overflow-hidden cursor-pointer bg-neutral-950 border border-neutral-200/90 shadow-lg hover:shadow-2xl transition-all duration-500"
                    >
                      <div className="absolute inset-3 border border-white/10 rounded-[1.75rem] pointer-events-none z-20 transition-all duration-500 group-hover:inset-2.5 group-hover:border-[#C6007E]/35" />

                      <div className="absolute inset-0 h-full w-full">
                        <img
                          src={talent.profileImage}
                          alt={talent.name}
                          className="h-full w-full object-cover transition-transform duration-1000 ease-out scale-100 group-hover:scale-105 filter brightness-95 group-hover:brightness-[0.82]"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent to-20% z-10" />
                      </div>

                      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30">
                        {talent.isPremium ? (
                          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#C6007E] to-[#3835A4] text-white text-[9px] uppercase font-mono font-black tracking-[0.2em] px-3.5 py-1.5 rounded-xl shadow-lg">
                            <Star className="h-3 w-3 fill-current text-white" />
                            <span>PREMIUM</span>
                          </div>
                        ) : <div />}
                        
                        <div className="bg-neutral-950/80 backdrop-blur-md text-white/90 text-[10px] font-mono tracking-wider px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-1">
                          <Ruler className="h-3 w-3 text-neutral-400" />
                          <span>{talent.stats.height} CM</span>
                        </div>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-7 z-30 flex flex-col justify-end">
                        <div className="flex items-end justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1.5">
                              {sortedCategories.slice(0, 2).map((cat, idx) => (
                                <span key={idx} className="text-[9px] uppercase font-mono tracking-widest font-black text-[#FFF] px-2 py-0.5 bg-[#3835A4] rounded-md group-hover:bg-[#C6007E]">
                                  {cat}
                                </span>
                              ))}
                            </div>
                            <h3 className="font-display text-2xl sm:text-3xl font-black text-white group-hover:text-[#C6007E] transition-colors leading-none">
                              {talent.name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-[#FFF] font-bold">
                              <MapPin className="h-3.5 w-3.5 text-[#FFF] group-hover:text-[#FFF]" />
                              <span>{talent.location}</span>
                            </div>
                          </div>

                          <div className="p-4 rounded-2xl bg-[#3835A4] text-white transition-all duration-300 shadow-xl group-hover:bg-[#C6007E] shrink-0 border border-white/10">
                            <Eye className="h-5 w-5" />
                          </div>
                        </div>

                        <div className="h-0 opacity-0 overflow-hidden group-hover:h-16 group-hover:opacity-100 group-hover:mt-6 transition-all duration-500 ease-out border-t border-white/10 pt-4">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-[8px] text-[#FFF] uppercase font-mono">Shoe Size</p>
                              <p className="text-xs font-black text-[#FFF] font-mono">{talent.stats.shoeSize || 'N/A'} EU</p>
                            </div>
                            <div>
                              <p className="text-[8px] text-[#FFF] uppercase font-mono">Hair Color</p>
                              <p className="text-xs font-black text-[#FFF] font-mono">{talent.stats.hairColor}</p>
                            </div>
                            <div>
                              <p className="text-[8px] text-[#FFF] uppercase font-mono">Waistline</p>
                              <p className="text-xs font-black text-white font-mono">{talent.stats.waist || 'N/A'} CM</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}