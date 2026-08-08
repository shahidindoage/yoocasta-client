import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, Film, Disc } from 'lucide-react';
import api from '../api/axios';
import { getCachedCms, setCachedCms } from '../utils/cmsCache';

interface VideoClip {
  id: string;
  title: string;
  talentName: string;
  category: string;
  location: string;
  videoUrl: string;
  posterUrl: string;
  views: string;
  tags: string[];
}

const VIDEO_CLIPS: VideoClip[] = [
  {
    id: '1',
    title: 'Cyber Couture Editorial Walk',
    talentName: 'Amira Al-Mansoori',
    category: 'High Fashion Runway',
    location: 'Dubai Design District',
    videoUrl: 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/casting_video/casting_video_10005.mp4',
    posterUrl: 'c2.PNG',
    views: '12.4K views',
    tags: ['Aesthetic Walk', 'Silver Metallic', 'Elite Model']
  },
  {
    id: '2',
    title: 'Neo-Glow Audition Reel',
    talentName: 'Zayd Al-Hassan',
    category: 'Commercial Screen Play',
    location: 'Riyadh Studio',
    videoUrl: 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/casting_video/casting_video_10158.mp4',
    posterUrl: 'v3.PNG',
    views: '8.9K views',
    tags: ['Neon Cinematic', 'GCC Commercial', 'Acting Lead']
  },
  {
    id: '3',
    title: 'Golden Hour Beauty Portfolio',
    talentName: 'Elena Rostova',
    category: 'Editorial Portrait Reel',
    location: 'Jumeirah Beach Coast',
    videoUrl: 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/casting_video/casting_video_10107.mp4',
    posterUrl: 'v1.PNG',
    views: '15.2K views',
    tags: ['Gloss Gold', 'Luxury Cosmetics', 'Face Model']
  },
  {
    id: '4',
    title: 'Vanguard Motion Showreel',
    talentName: 'Malik Al-Sayed',
    category: 'Cinematic Movement Reel',
    location: 'Downtown Dubai',
    videoUrl: 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/casting_video/casting_video_11145.mp4',
    posterUrl: 'V4.PNG',
    views: '18.7K views',
    tags: ['Vanguard Look', 'Urban Luxury', 'Commercial Pro']
  }
];

export default function VideoSection() {
  const [clips, setClips] = useState<VideoClip[]>(VIDEO_CLIPS);
  const [activeClipId, setActiveClipId] = useState<string>(VIDEO_CLIPS[0].id);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let active = true;
    api.get('/cms/home')
      .then((res) => {
        if (!active || !res.data?.success || !res.data?.data) return;
        const cms = res.data.data;
        setCachedCms('home', cms);
        if (active) {
          const section = cms?.videoSection;
          if (section && Array.isArray(section) && section.length > 0) {
            setClips(section as VideoClip[]);
            setActiveClipId(section[0]?.id || VIDEO_CLIPS[0].id);
          }
        }
      })
      .catch(() => {
        const cached = getCachedCms('home');
        if (active && cached?.videoSection && Array.isArray(cached.videoSection) && cached.videoSection.length > 0) {
          setClips(cached.videoSection as VideoClip[]);
          setActiveClipId(cached.videoSection[0]?.id || VIDEO_CLIPS[0].id);
        }
      });
    return () => { active = false; };
  }, []);

  const activeClip = clips.find(clip => clip.id === activeClipId) || clips[0];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      }
    }
  }, [activeClipId]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="w-full bg-[#fef1f5] text-stone-900 py-12 border-b border-[#f5d0e3] relative overflow-hidden">
      {/* Soft Pink Lighting Flares */}
      <div className="absolute right-[-10%] top-0 h-[500px] w-[500px] rounded-full bg-[#C6007E]/10 blur-[150px] pointer-events-none" />
      <div className="absolute left-[-10%] bottom-0 h-[500px] w-[500px] rounded-full bg-[#3835A4]/8 blur-[150px] pointer-events-none" />

      {/* Dot Pattern Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#C6007E_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Headings */}
        <div className="mb-16 pb-8 border-b border-[#f5d0e3]">
          <div className="space-y-4 max-w-2xl">
            <h2 className="font-display text-3xl font-black text-stone-900 sm:text-5xl tracking-tight leading-none">
              High-Energy <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C6007E] to-[#3835A4]">Casting Reels</span>
            </h2>
            <p className="text-sm text-stone-500 leading-relaxed font-medium">
              Witness our premier talents in motion. Immersive video audition files, lookbooks, and high fashion digital runway walks vetted by elite international casting curators.
            </p>
          </div>
        </div>

        {/* Large Layout Video Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Trendy Video Player (Takes 7 Cols on Large Screens) */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-white border border-[#f5d0e3] shadow-xl group flex flex-col justify-end">
              
              {/* Hair-thin visual premium lens flare frame */}
              <div className="absolute inset-4 border border-[#C6007E]/10 rounded-[2rem] pointer-events-none z-20" />
              
              {/* The Actual Autoplay Video Component */}
              <video
                ref={videoRef}
                key={activeClip.id}
                src={activeClip.videoUrl}
                poster={activeClip.posterUrl || undefined}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-700"
              />


              {/* Soft Pink Gradient Vignette for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#C6007E]/25 via-[#C6007E]/3 to-transparent z-10 pointer-events-none" />

              {/* Status Ribbon & Badge */}
              <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-[#C6007E] text-white text-[9px] capitalize font-mono font-black tracking-widest px-3 py-1.5 rounded-xl shadow-lg">
                  <Film className="h-3 w-3 animate-spin-slow" />
                  <span>Playing</span>
                </div>
                <div className="bg-white/80 backdrop-blur-md text-stone-600 text-[9px] font-mono font-black tracking-widest px-3 py-1.5 rounded-xl border border-[#f5d0e3]">
                  {activeClip.location}
                </div>
              </div>

              {/* Interactive Player Controls floating overlay */}
              <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
                {/* Volume Toggle */}
                <button
                  onClick={toggleMute}
                  className="p-3 rounded-full bg-white/80 backdrop-blur-md hover:bg-white border border-[#f5d0e3] transition-all scale-95 hover:scale-100 cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="h-4.5 w-4.5 text-stone-400" /> : <Volume2 className="h-4.5 w-4.5 text-[#C6007E]" />}
                </button>
                {/* Pause/Play Toggle */}
                <button
                  onClick={togglePlay}
                  className="p-3 rounded-full bg-white/80 backdrop-blur-md hover:bg-white border border-[#f5d0e3] transition-all scale-95 hover:scale-100 cursor-pointer"
                >
                  {isPlaying ? <Pause className="h-4.5 w-4.5 text-stone-400" /> : <Play className="h-4.5 w-4.5 text-[#C6007E]" />}
                </button>
              </div>

              {/* Inside Metadata Overlay Details */}
              <div className="relative z-20 p-8 sm:p-10 pointer-events-none max-w-xl">
                <div className="flex flex-wrap gap-1.5 mb-3.5">
                  {activeClip.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="text-[9px] font-mono font-black capitalize tracking-widest px-2.5 py-1 bg-white/80 border border-[#f5d0e3] rounded-lg text-stone-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold tracking-wider text-[#C6007E] block">
                    {activeClip.category}
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                    {activeClip.title}
                  </h3>
                  
                  <div className="pt-4 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#C6007E] to-[#3835A4] p-[1.5px]">
                      <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-[#C6007E] text-[9px] font-black">
                        {activeClip.talentName.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">{activeClip.talentName}</p>
                      <p className="text-[9px] font-mono text-white/70 font-bold">{activeClip.views} • GCC Audition File</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Animated Seek line */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/30 overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#C6007E] to-[#3835A4]"
                  initial={{ width: "0%" }}
                  animate={isPlaying ? { width: "100%" } : {}}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
              </div>

            </div>
          </div>

          {/* Sidebar Playlist - Right Panel (Takes 4 Cols on Large Screens) */}
          <div className="lg:col-span-4 flex flex-col justify-start space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-mono font-black capitalize tracking-[0.2em] text-[#C6007E] flex items-center gap-2">
                <Disc className="h-4 w-4 animate-spin-slow text-[#C6007E]" />
                Select Reel
              </h4>
              <span className="text-[9px] font-mono text-stone-400 font-bold">{clips.length} Reels</span>
            </div>

            <div className="space-y-3.5">
              {clips.map((clip) => {
                const isActive = clip.id === activeClipId;
                return (
                  <motion.button
                    key={clip.id}
                    onClick={() => {
                      setActiveClipId(clip.id);
                      setIsPlaying(true);
                    }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left p-4 rounded-3xl border transition-all duration-300 flex items-center gap-4 relative overflow-hidden group cursor-pointer ${
                      isActive 
                        ? 'bg-white border-[#C6007E] shadow-lg shadow-[#C6007E]/10' 
                        : 'bg-white/60 border-[#f5d0e3] hover:bg-white hover:border-[#C6007E]/40'
                    }`}
                  >
                    {/* Interactive glow effect */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-[#C6007E] to-[#3835A4]" />
                    )}

                    {/* Poster Thumbnail */}
                    <div className="h-14 w-14 rounded-2xl overflow-hidden shrink-0 relative bg-stone-100 border border-[#f5d0e3]">
                      {clip.posterUrl ? (
                        <img 
                          src={clip.posterUrl} 
                          alt={clip.talentName} 
                          className="h-full w-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-tr from-[#C6007E]/20 to-[#3835A4]/20">
                          <Film className="h-5 w-5 text-[#C6007E]/60" />
                        </div>
                      )}
                      {isActive ? (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <span className="flex gap-1 items-end">
                            <span className="w-1 h-3 bg-[#C6007E] animate-pulse" />
                            <span className="w-1 h-4 bg-[#3835A4] animate-pulse [animation-delay:0.15s]" />
                            <span className="w-1 h-2 bg-[#C6007E] animate-pulse [animation-delay:0.3s]" />
                          </span>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-[#C6007E]/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-4 w-4 text-[#C6007E] fill-current" />
                        </div>
                      )}
                    </div>

                    {/* Info Metadata */}
                    <div className="space-y-0.5 min-w-0">
                      <span className={`text-[9px] font-mono capitalize font-black tracking-wider ${
                        isActive ? 'text-[#C6007E]' : 'text-stone-400 group-hover:text-[#C6007E]'
                      }`}>
                        {clip.category}
                      </span>
                      <h5 className="font-display text-xs font-black text-stone-900 truncate">
                        {clip.title}
                      </h5>
                      <p className="text-[10px] text-stone-500 font-bold">
                        {clip.talentName} • <span className="font-mono text-[9px]">{clip.location}</span>
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}