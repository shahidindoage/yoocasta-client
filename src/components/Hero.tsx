import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  'Actors & Extras', 'Cinematographers / Videographers', 'Dancers',
  'Directors', 'Hostesses', 'MC/RJ/VJ/Voice Over', 'Makeup & Hairstylists',
  'Models', 'Photographers', 'Promoters', 'Singers',
];

const LOCATIONS = [
  'Sharjah, United Arab Emirates', 'Dubai, United Arab Emirates',
  'Abu Dhabi, United Arab Emirates', 'Al Ayn, United Arab Emirates',
  '`Ajman, United Arab Emirates', 'Al Fujayrah, United Arab Emirates',
];

export default function Hero() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [keyword, setKeyword] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('search', keyword.trim());
    if (selectedGender) params.set('gender', selectedGender.toLowerCase());
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedLocation) {
      const cityName = selectedLocation.split(',')[0].trim();
      params.set('city', cityName);
    }
    navigate(`/browse-talents?${params.toString()}`);
  };

  return (
    <div className="relative min-h-[58vh] lg:min-h-[64vh] w-full overflow-hidden flex flex-col justify-center items-center text-stone-900 px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
      
      {/* CSS Injection for smooth wave text animation */}
    <style>{`
  @keyframes shimmer {
    0% { background-position: -200% 0; filter: drop-shadow(0 0 3px rgba(255,237,36,0.2)); }
    40% { background-position: 0% 0; filter: drop-shadow(0 0 25px rgba(255,255,255,1)) drop-shadow(0 0 50px rgba(255,237,36,0.6)) drop-shadow(0 0 80px rgba(198,0,126,0.3)); }
    60% { background-position: 0% 0; filter: drop-shadow(0 0 25px rgba(255,255,255,1)) drop-shadow(0 0 50px rgba(255,237,36,0.6)) drop-shadow(0 0 80px rgba(198,0,126,0.3)); }
    100% { background-position: 200% 0; filter: drop-shadow(0 0 3px rgba(255,237,36,0.2)); }
  }
  .shimmer-char {
    display: inline-block;
    color: transparent;
    background: linear-gradient(120deg, #FFED24 0%, #FFED24 30%, #ffffff 50%, #FFED24 70%, #FFED24 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    animation: shimmer 2.2s ease-in-out infinite;
  }
`}</style>

      {/* Full Screen Background Video with very subtle pink overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-70"
          src="https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/casting_video/casting_video_10107.mp4" 
        />
        <div className="absolute inset-0 bg-black/30" /> 
      </div>

      {/* Main Content (Centered) */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center space-y-7">
        
        {/* Typography */}
        <div className="space-y-4 max-w-4xl">
          <p className="font-display text-sm sm:text-base font-bold text-white tracking-wide" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            Apply to unlimited jobs at
          </p>
          <h1 className="font-display text-3xl sm:text-5xl lg:text-[56px] font-black tracking-[0.08em] leading-none" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>
            <span className="inline-block">
              {"AED 20 ONLY".split("").map((char, i) => (
                <span key={i} className="shimmer-char" style={{ animationDelay: `${i * 0.12}s` }}>
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </span>
          </h1>
          <p className="font-display text-sm sm:text-base font-bold text-white tracking-wide" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            Register or Login to become Premium!
          </p>
          <div className="pt-4 space-y-1">
            <p className="font-display text-3xl sm:text-4xl font-black text-[#FFED24] tracking-wider capitalize" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
              Connecting Talents & Opportunities
            </p>
            <p className="text-[10px] text-white/80 font-medium tracking-[0.2em]" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
              Your own online casting agency
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl w-full bg-white/80 backdrop-blur-xl rounded-2xl border border-[#f5d0e3] p-3 shadow-lg shadow-[#C6007E]/5">
          <form onSubmit={handleSearchSubmit}>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#fef1f5] rounded-xl border border-[#f5d0e3] focus-within:border-[#C6007E] transition-colors px-3 py-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-transparent text-xs text-stone-900 font-black focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-white">Any Specialization</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-white">{cat}</option>
                    ))}
                  </select>
              </div>
              <div className="flex-1 bg-[#fef1f5] rounded-xl border border-[#f5d0e3] focus-within:border-[#C6007E] transition-colors px-3 py-2">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full bg-transparent text-xs text-stone-900 font-black focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-white">All Locations</option>
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc} className="bg-white">{loc}</option>
                    ))}
                  </select>
              </div>
              <div className="flex-1 bg-[#fef1f5] rounded-xl border border-[#f5d0e3] focus-within:border-[#C6007E] transition-colors px-3 py-2">
                  <select
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                    className="w-full bg-transparent text-xs text-stone-900 font-black focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-white">All Genders</option>
                    <option value="male" className="bg-white">Male</option>
                    <option value="female" className="bg-white">Female</option>
                  </select>
              </div>
              <div className="flex-[2] bg-[#fef1f5] rounded-xl border border-[#f5d0e3] focus-within:border-[#C6007E] transition-colors px-3 py-2 flex items-center gap-2">
                <Search className="h-4 w-4 text-[#C6007E] shrink-0" />
                <input
                  type="text"
                  placeholder="Search talents..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full bg-transparent text-xs text-stone-900 font-bold focus:outline-none placeholder-stone-400"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C6007E] to-[#3835A4] hover:opacity-90 text-white transition-all duration-300 px-5 py-2.5 shadow-lg shadow-[#C6007E]/20"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}