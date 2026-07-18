import React, { useState } from 'react';
import { Search, SlidersHorizontal, Users, ArrowRight } from 'lucide-react';
import { CATEGORIES, LOCATIONS } from '../data';

interface HeroProps {
  onSearch: (filters: { category: string; location: string; gender: string; keyword: string }) => void;
}

export default function Hero({ onSearch }: HeroProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedGender, setSelectedGender] = useState('All');
  const [keyword, setKeyword] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      category: selectedCategory,
      location: selectedLocation,
      gender: selectedGender,
      keyword,
    });
    
    const target = document.getElementById('talents-anchor');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative min-h-[58vh] lg:min-h-[64vh] w-full overflow-hidden flex flex-col justify-center items-center bg-neutral-950 text-white px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
      
      {/* CSS Injection for smooth running two-color text gradient animation */}
    <style>{`
  @keyframes brandGradientText {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .animate-brand-gradient {
    background-size: 200% auto;
    animation: brandGradientText 6s ease infinite;
    background-image: linear-gradient(to right, #FF00A0, #3375faa8, #FF00A0);
  }
`}</style>

      {/* Full Screen Background Video Autoplay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-60"
          src="https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/casting_video/casting_video_10107.mp4" 
        />
        {/* Cinematic dark gradient overlay for text readability */}
        {/* <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/50" /> */}
      </div>

      {/* Main Content (Centered) */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center space-y-7">
        
        {/* Typography Masterpiece Title */}
        <div className="space-y-3 max-w-4xl">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[50px] font-black tracking-tight text-white leading-[1.08]">
          
            <span className="text-transparent bg-clip-text animate-brand-gradient">
            DISCOVER THE MOST ELITE, HIGH-FASHION FACES ACROSS ARABIA.
            </span>{' '}
        
          </h1>
          <p className="max-w-2xl mx-auto text-sm text-neutral-300 font-medium leading-relaxed">
            Middle East‘s leading digital casting platform for luxury runway models, cinematic lead actors, event hosts, and premium production crews. No middleman agency fees.
          </p>
        </div>

        {/* Dynamic Search Terminal */}
        <div className=" max-w-4xl w-full bg-neutral-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-2xl shadow-black/50 text-left">
          <h2 className="text-xs uppercase font-mono tracking-widest text-neutral-400 font-bold mb-3.5 flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
            TACTILE ATTRIBUTES SEARCH
          </h2>
          
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* Category Selection */}
              <div className="flex flex-col gap-1 bg-neutral-950 p-3 rounded-xl border border-white/5 focus-within:border-white/20 transition-colors">
                <label className="text-[9px] uppercase tracking-widest font-mono font-black text-neutral-500">Specialization</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-transparent text-xs text-white font-black focus:outline-none cursor-pointer border-none p-0 mt-0.5"
                >
                  <option value="all" className="bg-neutral-900">Any Specialization</option>
                  {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.name} className="bg-neutral-900">{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Location Selection */}
              <div className="flex flex-col gap-1 bg-neutral-950 p-3 rounded-xl border border-white/5 focus-within:border-white/20 transition-colors">
                <label className="text-[9px] uppercase tracking-widest font-mono font-black text-neutral-500">Location Hub</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-transparent text-xs text-white font-black focus:outline-none cursor-pointer border-none p-0 mt-0.5"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} className="bg-neutral-900">{loc}</option>
                  ))}
                </select>
              </div>

              {/* Gender Selection */}
              <div className="flex flex-col gap-1 bg-neutral-950 p-3 rounded-xl border border-white/5 focus-within:border-white/20 transition-colors">
                <label className="text-[9px] uppercase tracking-widest font-mono font-black text-neutral-500">Gender Identity</label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full bg-transparent text-xs text-white font-black focus:outline-none cursor-pointer border-none p-0 mt-0.5"
                >
                  <option value="All" className="bg-neutral-900">All Genders</option>
                  <option value="Female" className="bg-neutral-900">Female</option>
                  <option value="Male" className="bg-neutral-900">Male</option>
                  <option value="Non-binary" className="bg-neutral-900">Non-binary</option>
                </select>
              </div>

              {/* Keywords Input */}
              <div className="flex flex-col gap-1 bg-neutral-950 p-3 rounded-xl border border-white/5 focus-within:border-white/20 transition-colors">
                <label className="text-[9px] uppercase tracking-widest font-mono font-black text-neutral-500">Custom Keywords</label>
                <div className="flex items-center gap-2 mt-0.5">
                  <Search className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                  <input 
                    type="text"
                    placeholder="e.g. Height 180, Blonde..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full bg-transparent text-xs text-white font-bold focus:outline-none placeholder-neutral-600 p-0"
                  />
                </div>
              </div>
            </div>

            {/* Submit Row */}
            <div className="pt-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5 mt-1">
              <div className="flex items-center gap-3 text-[10px] text-neutral-400 font-mono">
                <span className="flex items-center gap-1.5 font-bold">
                  <Users className="h-3.5 w-3.5 text-neutral-500" />
                  AED 20 Entry
                </span>
                <span>•</span>
                <span className="font-bold">Zero Agent Commissions</span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 transition-all duration-300 px-6 py-3 text-xs font-black shadow-lg shadow-amber-400/10 cursor-pointer uppercase tracking-wider group"
              >
                <span>Instant Audition Search</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}