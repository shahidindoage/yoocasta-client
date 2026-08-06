import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicProfile } from '../../api/talent.api';
import { useAuthStore } from '../../store/authStore';

import {
  FaTheaterMasks,
  FaVideo,
  FaFilm,
  FaMicrophone,
  FaPaintBrush,
  FaCamera,
  FaMusic,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  IconType,
} from 'react-icons/fa';
import { FaPersonDress } from 'react-icons/fa6';


const getYoutubeId = (url: string | null | undefined): string | null => {
  const m = (url || '').match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
};

const getVimeoId = (url: string | null | undefined): string | null => {
  const m = (url || '').match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
};

const isDirectVideoUrl = (url: string | null | undefined): boolean =>
  /\.(mp4|webm|ogg|m4v|mov|ogv)(\?.*)?$/i.test((url || '').trim());


function AudioCard({ src, title }: { src: string; title?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);
    const handleTime = () => {
      if (a.duration) setProgress((a.currentTime / a.duration) * 100);
    };
    a.addEventListener('play', handlePlay);
    a.addEventListener('pause', handlePause);
    a.addEventListener('timeupdate', handleTime);
    return () => {
      a.removeEventListener('play', handlePlay);
      a.removeEventListener('pause', handlePause);
      a.removeEventListener('timeupdate', handleTime);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play();
    else a.pause();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    const bar = progressRef.current;
    if (!a || !bar || !a.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    a.currentTime = ratio * a.duration;
    setProgress(ratio * 100);
  };

  return (
    <div className="relative w-full">
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
      {title && (
        <p className="text-[10px] font-black text-stone-800 font-mono truncate mb-1.5">{title}</p>
      )}
      <div className="flex items-center gap-2 bg-white border-2 border-[#008dc9] rounded-xl px-2 py-1.5 shadow-sm">
        <button
          type="button"
          onClick={togglePlay}
          className="w-8 h-8 shrink-0 rounded-full bg-[#008dc9] text-white flex items-center justify-center hover:bg-[#ff24b0] transition-colors cursor-pointer"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <FaPause className="text-[10px]" /> : <FaPlay className="text-[10px] ml-0.5" />}
        </button>

        <div
          ref={progressRef}
          onClick={handleSeek}
          className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden cursor-pointer group relative"
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div className="h-full bg-[#ff24b0] rounded-full" style={{ width: `${progress}%` }} />
          <div className="absolute top-[4px] bottom-0 w-2 h-2 rounded-full bg-[#ff24b0] shadow ring-2 ring-white -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `calc(${progress}% - 5px)` }} />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowVolume((v) => !v)}
            onMouseEnter={() => setShowVolume(true)}
            className="w-8 h-8 shrink-0 flex items-center justify-center text-stone-600 hover:text-[#008dc9] transition-colors cursor-pointer"
            aria-label="Volume"
          >
            {volume === 0 ? <FaVolumeMute className="text-sm" /> : <FaVolumeUp className="text-sm" />}
          </button>
          {showVolume && (
            <div
              className="absolute bottom-full mb-2 right-0 z-50 bg-white border-2 border-[#008dc9] rounded-lg p-2 shadow-xl flex items-center justify-center"
              onMouseLeave={() => setShowVolume(false)}
            >
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                style={{ writingMode: 'vertical-lr', direction: 'rtl', height: '88px', accentColor: '#008dc9' }}
                className="cursor-pointer"
                aria-label="Volume slider"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


const ATTRIBUTE_VALUE_LABELS: Record<string, Record<string, string>> = {
  makeup_or_hairstylist: {
    makeup: 'Makeup',
    hairstlyist: 'Hairstylist', // source typo, normalized here
    hairstylist: 'Hairstylist',
    both: 'Both',
  },
  voiceover_role_type: {
    mc: 'MC',
    rj: 'RJ',
    vj: 'VJ',
    voiceover: 'Voiceover',
    tv_presenter: 'TV Presenter',
  },
};
// Maps each raw attribute key -> { category, subGroup? }
// subGroup is the sub-heading shown under the category (e.g. "Types of Project").
// Omit subGroup for keys that render as direct features under the category.
const KEY_CONFIG: Record<string, { category: string; subGroup?: string }> = {
  singing_language: { category: 'Singers', subGroup: 'Singing Language' },
  style_of_songs: { category: 'Singers', subGroup: 'Style of Songs' },
  singer_individual_or_band: { category: 'Singers' }, // direct feature, no sub-group

  style_of_dance: { category: 'Dancers', subGroup: 'Style of Dance' },
  dancer_individual_or_band: { category: 'Dancers' },

  camera_worked_on: { category: 'Photographers', subGroup: 'Camera Worked On' },
  photography_types: { category: 'Photographers', subGroup: 'Types of Project' },

  director_types_of_project: { category: 'Directors', subGroup: 'Types of Project' },
  director_assistant_level: { category: 'Directors', subGroup: 'Role Level' },

  cinematographer_cameras: { category: 'Cinematographers / Videographers', subGroup: 'Camera Worked On' },
  cinematographer_project_types: { category: 'Cinematographers / Videographers', subGroup: 'Types of Project' },

  makeup_project_types: { category: 'Makeup & Hairstylists', subGroup: 'Types of Project' },
  makeup_or_hairstylist: { category: 'Makeup & Hairstylists' },

  voiceover_project_types: { category: 'MC/RJ/VJ/Voice Over', subGroup: 'Types of Project' },
  voiceover_role_type: { category: 'MC/RJ/VJ/Voice Over' },
};

const CATEGORY_ICONS_PROFILE: Record<string, IconType> = {
  'Singers': FaMusic,
  'Dancers': FaPersonDress,
  'Photographers': FaCamera,
  'Directors': FaFilm,
  'Cinematographers / Videographers': FaVideo,
  'Makeup & Hairstylists': FaPaintBrush,
  'MC/RJ/VJ/Voice Over': FaMicrophone,
};
const DEFAULT_CATEGORY_ICON_PROFILE: IconType = FaTheaterMasks;
// Fields where: 0 = not present/not answered, 1 = Individual, >1 = Band/Troupe
const INDIVIDUAL_OR_GROUP_FIELDS: Record<string, { individual: string; group: string }> = {
  singer_individual_or_band: { individual: 'Individual', group: 'Band' },
  dancer_individual_or_band: { individual: 'Individual', group: 'Troupe' },
};

const humanizeToken = (token: string) =>
  token
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatAttributeValue = (key: string, rawValue: string): string | null => {
  if (!rawValue) return null;

  // Special numeric-coded fields: 0 = not present, 1 = Individual, >1 = group
  const groupConfig = INDIVIDUAL_OR_GROUP_FIELDS[key];
  if (groupConfig && /^\d+$/.test(rawValue.trim())) {
    const num = parseInt(rawValue.trim(), 10);
    if (num === 0) return null; // "0 mean not show (not present)"
    if (num === 1) return groupConfig.individual;
    return groupConfig.group; // any value > 1
  }

  const tokens = rawValue.split(',').map((v) => v.trim()).filter(Boolean);
  const labelMap = ATTRIBUTE_VALUE_LABELS[key];

  const formatted = tokens.map((token) => {
    if (labelMap?.[token.toLowerCase()]) return labelMap[token.toLowerCase()];
    return humanizeToken(token);
  });

  return formatted.join(', ');
};
type FeatureGroups = Record<string,
  {
    direct: { key: string; value: string }[]; // features with no subGroup
    subGroups: Record<string, { key: string; value: string }[]>; // subGroup label -> features
  }
>;

const groupAttributesByCategory = (attributes: any[]): FeatureGroups => {
  const groups: FeatureGroups = {};

  for (const attr of attributes) {
    const displayValue = formatAttributeValue(attr.key, attr.value);
    if (displayValue === null) continue;

    const config = KEY_CONFIG[attr.key] || { category: 'Other' };
    if (!groups[config.category]) groups[config.category] = { direct: [], subGroups: {} };

    const values = displayValue.split(',').map(v => v.trim()).filter(Boolean);

    if (config.subGroup) {
      if (!groups[config.category].subGroups[config.subGroup]) {
        groups[config.category].subGroups[config.subGroup] = [];
      }
      values.forEach(v => groups[config.category].subGroups[config.subGroup].push({ key: attr.key, value: v }));
    } else {
      values.forEach(v => groups[config.category].direct.push({ key: attr.key, value: v }));
    }
  }

  return groups;
};

const PublicTalentProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Photos');
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [showAllPortfolio, setShowAllPortfolio] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const { user } = useAuthStore();
  const isRecruiter = user?.role === 'RECRUITER';

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!username) return;
    if (hasFetched.current) return;
    hasFetched.current = true;

    getPublicProfile(username)
      .then(res => setProfile(res.data.data))
      .catch(() => setError('Profile not found or invalid username'))
      .finally(() => setLoading(false));
  }, [username]);

  const calculateAge = (dob: string) => {
    if (!dob) return '—';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const formatTalentId = (id: any) => {
    if (!id) return '—';
    const strId = String(id);
    const lastEight = strId.slice(-8);
    return `YC${lastEight}`;
  };

  const filterPortfolio = (type: string) => {
    if (!profile?.talentProfile?.media) return [];
    return profile.talentProfile.media.filter((m: any) => {
      if (type === 'Photos') return m.type === 'IMAGE';
      if (type === 'Videos') return m.type === 'ACTING_VIDEO' || m.type === 'VIDEO_LINK' || m.type === 'VIDEO';
      if (type === 'Casting') return m.type === 'CASTING_VIDEO';
      if (type === 'Audio') return m.type === 'AUDIO';
      return false;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfbf7]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#008dc9] border-t-[#ff24b0] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black font-mono text-[#008dc9]">GO</div>
        </div>
        <span className="mt-4 text-[9px] font-black  text-[#008dc9]/60  font-mono animate-pulse">
          Rendering Creative Ecosystem...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4">
        <div className="bg-white border-4 border-[#008dc9] p-8 rotate-1 max-w-md text-center space-y-4 shadow-[8px_8px_0px_0px_#ff24b0]">
          <span className="text-4xl block animate-bounce">⚡</span>
          <p className="text-sm font-black text-[#008dc9] tracking-wider  font-mono bg-red-100 px-2 py-1 inline-block">
            {error}
          </p>
          <Link to="/browse-talents" className="block text-[10px] font-black   bg-[#008dc9] text-white px-6 py-3 transition-transform active:scale-95 hover:-translate-y-0.5">
            ← Return to Hub
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const tp = profile.talentProfile;
  const planName = profile.subscription?.plan?.name || 'Basic';

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-stone-900 selection:bg-[#ff24b0]/30 selection:text-stone-900 pb-32 relative overflow-hidden font-sans">
      
      {/* ABSTRACT AVANT-GARDE GRAPHIC LAYERS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-[#008dc9]/10 to-[#ff24b0]/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-[#ff24b0]/10 to-cyan-200/40 blur-[100px] pointer-events-none -z-10" />
      
      {/* BACKGROUND GRID PATTERN TO EMULATE A DESIGNER'S CANVAS */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#008dc905_1px,transparent_1px),linear-gradient(to_bottom,#008dc905_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-16 space-y-16 relative z-10">
        
        {/* ASYMMETRICAL EDITORIAL HERO CANVAS */}
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* STICKY LUXURY AVATAR WRAPPER */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start lg:sticky lg:top-8">
            <div className="relative group w-full max-w-[340px]">
              {/* Brutalist Shadow Offset */}
              <div className="absolute inset-0 bg-[#008dc9] rounded-[32px] translate-x-3 translate-y-3 transition-transform group-hover:translate-x-4 group-hover:translate-y-4 duration-300" />
              
              <div className="relative bg-white border-2 border-[#008dc9] rounded-[32px] p-3 shadow-sm overflow-hidden z-10">
                {profile.image ? (
                  <img 
                    src={profile.image} 
                    alt={profile.firstName} 
                    className="w-full aspect-[4/5] object-cover rounded-[24px] transition-all duration-700 ease-out" 
                  />
                ) : (
                  <div className="w-full aspect-[4/5] bg-stone-100 text-stone-400 flex items-center justify-center font-black text-7xl font-display rounded-[24px]">
                    {profile.firstName?.[0]}
                  </div>
                )}
                
                {/* Float Badge */}
                {profile.isVerified && (
                  <div className="absolute bottom-6 right-6 bg-[#ff24b0] text-white font-mono text-[10px] font-black  px-3 py-1.5 rounded-full border-2 border-[#008dc9] shadow-md transform rotate-3">
                    Verified ✓
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* HIGH-END TYPOGRAPHY & IDENTITY CORE */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <span className="font-sans text-[10px] font-black  text-[#ff24b0]  bg-[#ff24b0]/5 px-3 py-1 rounded-md border border-[#ff24b0]/20">
                  {planName} Tier
                </span>
                <span className="font-sans text-[10px] font-bold text-stone-400">//@{profile.username}</span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight  leading-[0.95] font-display text-stone-900">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008dc9] via-[#ff24b0] to-amber-500">
                  {profile.firstName}
                </span>
              </h1>
            </div>

            {/* QUICK STATS AS A KINETIC GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white border-2 border-[#008dc9] p-4 rounded-2xl shadow-[4px_4px_0px_0px_#008dc9] flex flex-col justify-between h-18 text-left transform -rotate-1">
                <span className="text-[8px] font-black  text-stone-400  font-sans">Profile ID</span>
                <span className="text-sm font-black font-display text-[#008dc9]">{formatTalentId(profile.id)}</span>
              </div>
              <div className="bg-[#ff24b0]/10 border-2 border-[#008dc9] p-4 rounded-2xl shadow-[4px_4px_0px_0px_#008dc9] flex flex-col justify-between h-18 text-left transform rotate-1">
                <span className="text-[8px] font-black  text-[#ff24b0]  font-sans">Profile Views</span>
                <span className="text-xl font-black font-display text-[#008dc9]">👁 {tp?.views ?? 0}</span>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-white border-2 border-[#008dc9] p-4 rounded-2xl shadow-[4px_4px_0px_0px_#008dc9] flex flex-col justify-between h-18 text-left transform -rotate-1">
                <span className="text-[8px] font-black  text-stone-400  font-sans">Location</span>
                <span className="text-xs font-display text-stone-900 truncate block">
                  {tp?.city?.name ? `${tp.city.name}, ${tp.city.country?.name || ''}` : 'Global Hub'}
                </span>
              </div>
              {isRecruiter && profile.email && (
                <div className="bg-white border-2 border-[#ff24b0] p-4 rounded-2xl shadow-[4px_4px_0px_0px_#ff24b0] flex flex-col justify-between h-18 text-left transform rotate-1">
                  <span className="text-[8px] font-black text-[#ff24b0] font-sans">Email</span>
                  <span className="text-xs font-display text-stone-900 truncate block">{profile.email}</span>
                </div>
              )}
              {isRecruiter && profile.phone && (
                <div className="col-span-2 sm:col-span-1 bg-white border-2 border-[#ff24b0] p-4 rounded-2xl shadow-[4px_4px_0px_0px_#ff24b0] flex flex-col justify-between h-18 text-left transform -rotate-1">
                  <span className="text-[8px] font-black text-[#ff24b0] font-sans">Phone</span>
                  <span className="text-xs font-display text-stone-900 truncate block">{profile.phone}</span>
                </div>
              )}
            </div>

            {/* CATEGORIES DISPLAYED AS HIGH-CONTRAST CHIPS */}
            <div className="space-y-2 text-left">
              <span className="block text-[9px] font-black  text-stone-400  font-sans">Categories</span>
              <div className="flex flex-wrap gap-2">
                {tp?.categories?.map((c: any) => (
                  <span key={c.category.id} className="px-4 py-2 bg-[#008dc9] text-white rounded-xl text-[10px] font-display   border border-[#008dc9] hover:bg-transparent hover:text-[#008dc9] transition-all duration-300">
                     {c.category.name}
                  </span>
                )) || <span className="text-xs italic font-display text-stone-400">Uncategorized Vector</span>}
              </div>
            </div>

            {/* NARRATIVE STATEMENT BLOCK */}
            {tp?.bioDescription && (
              <div className="text-left relative border-l-4 border-[#ff24b0] pl-6 space-y-2">
                <span className="text-[9px] font-black  text-stone-400  font-sans block">About</span>
                <p className="text-sm text-stone-600 font-display leading-relaxed whitespace-pre-line max-w-2xl">
                  {tp.bioDescription}
                </p>
              </div>
            )}
          </div>
        </div>


         {user && (<>

        {/* BRUTALIST GRID BLOCK: BIOMETRICS & SPECS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* IDENTITY MATRIX GRID */}
        <div className="lg:col-span-7 bg-white border-2 border-[#008dc9] rounded-[32px] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#008dc9] flex flex-col justify-between space-y-6">
  <div className="flex items-center justify-between border-b-2 border-[#008dc9] pb-4">
    <h3 className="text-xs font-black  text-[#008dc9]  font-sans">              Identity</h3>
  </div>

  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
    {[
      { label: 'Age', val: calculateAge(tp?.dob) },
      { label: 'Gender', val: tp?.gender },
      { label: 'Ethnicity', val: tp?.ethnicity?.name },
      { label: 'Nationality', val: profile.nationality?.name },
      { label: 'Languages', val: tp?.languages?.map((l: any) => l.language.name).join(', ') },
      { label: 'Dialects', val: tp?.dialects?.map((d: any) => d.dialect.name).join(', ') }
    ].map((item, idx) => (
      <div key={idx} className="border-b border-stone-200 pb-2">
        <span className="block text-[8px] font-black  text-stone-400 font-sans tracking-wider">{item.label}</span>
        <span className="text-xs font-display text-stone-900 mt-0.5 block">{item.val || '—'}</span>
      </div>
    ))}
  </div>

  {/* TECHNICAL EXECUTION DESCRIPTION FOOTER */}
  {tp?.skillDescription ? (
    <div className="bg-amber-50 border-2 border-dashed border-amber-400/80 p-4 rounded-2xl mt-4">
      <span className="block text-[8px] font-black  text-amber-600 font-sans tracking-wider mb-1">Skills</span>
      <p className="text-xs font-display text-amber-900 leading-relaxed">{tp.skillDescription}</p>
    </div>
  ) : (
    <div className="bg-stone-50 border-2 border-dashed border-stone-200 p-4 rounded-2xl mt-4 text-center">
      <span className="block text-[8px] font-black  text-stone-400 font-sans tracking-wider mb-1">Skills</span>
      <p className="text-xs font-display text-stone-400">No skills added yet.</p>
    </div>
  )}
</div>

          {/* PHYSICAL ARCHITECTURE FRAMEWORK */}
          <div className="lg:col-span-5 bg-[#008dc9] text-stone-100 rounded-[32px] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#ff24b0] flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between border-b border-[#008dc9]/30 pb-4">
              <h3 className="text-xs font-black  text-[#FFF]  font-sans">Physical</h3>
              {/* <span className="text-white/40 font-mono text-[10px]">SPEC_02</span> */}
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[
      { label: 'Height', val: tp?.height ? `${tp.height} cm` : null },
      { label: 'Weight', val: tp?.weight ? `${tp.weight} kg` : null },
      { label: 'Chest', val: tp?.chest ? `${tp.chest} cm` : null },
      { label: 'Waist', val: tp?.waist ? `${tp.waist} cm` : null },
      { label: 'Eye Color', val: tp?.eyeColor },
      { label: 'Shoe Size', val: tp?.shoeSize },
      { label: 'Hair', val: tp?.hairColor ? `${tp.hairColor} (${tp.hairLength || 'Short'})` : null },
      { label: 'Body Type', val: tp?.bodyStructure }
              ].map((item, idx) => (
                <div key={idx} className="border-b border-white/10 pb-2">
                  <span className="block text-[8px] font-black  text-white/40 font-sans tracking-wider">{item.label}</span>
                  <span className="text-xs font-display text-white mt-0.5 block">{item.val || '—'}</span>
                </div>
              ))}
            </div>

            {tp?.tattoo && (
              <div className="pt-2 text-left">
                <span className="block text-[8px] font-black  text-white/40 font-sans tracking-wider">Tattoos</span>
                <p className="text-xs font-display text-white mt-0.5 block">{tp.tattoo}</p>
              </div>
            )}
          </div>
        </div>

        {/* HIGH-END SPECTRUM PORTFOLIO FRAMEWORK */}
        <div className="bg-white border-2 border-[#008dc9] rounded-[40px] p-6 sm:p-10 shadow-[12px_12px_0px_0px_#ff24b0] space-y-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b-2 border-[#008dc9] pb-6 gap-6">
            <div className="space-y-1">
              <h3 className="text-lg font-black tracking-tight  font-sans text-stone-900">Portfolio</h3>
              <p className="text-[10px] font-display text-stone-400">Photos / Videos / Casting / Audio</p>
            </div>
            
            {/* Neo-Brutalist Segment Controller */}
            <div className="flex flex-wrap bg-stone-100 p-1.5 rounded-2xl border-2 border-[#008dc9] w-full md:w-auto">
              {['Photos', 'Videos', 'Casting', 'Audio'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 md:flex-none px-6 py-2.5 text-[10px] font-bold   rounded-xl transition-all font-display ${
                    activeTab === tab
                      ? 'bg-[#008dc9] text-white shadow-md'
                      : 'text-stone-400 hover:text-[#008dc9]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          {/* Dynamic Asset Stream Grid */}
          {(() => {
            const items = filterPortfolio(activeTab);
            const visible = showAllPortfolio ? items : items.slice(0, 4);
            if (items.length === 0) {
              return (
                <div className="py-16 col-span-full text-center bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
                  <span className="text-2xl block mb-2">🪐</span>
                  <p className="text-xs font-sans text-stone-400 tracking-wider">
                    No media found in [{activeTab}].
                  </p>
                </div>
              );
            }
            return (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {visible.map((item: any) => (
                    <div key={item.id} className={`group relative aspect-[3/4] bg-stone-50 border-2 border-[#008dc9] rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${item.type === 'AUDIO' ? 'overflow-visible z-50' : 'overflow-hidden'}`}>
                  
                  {item.type === 'IMAGE' && (
                    <button onClick={() => setLightboxImage(item.url)} className="w-full h-full block text-left">
                      <img
                        src={item.url}
                        alt=""
                        className="w-full h-full object-cover opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                      />
                    </button>
                  )}
                  
                  {(item.type === 'ACTING_VIDEO' || item.type === 'VIDEO') && (() => {
                    const url = item.url || '';
                    const youtubeId = getYoutubeId(url);
                    const vimeoId = getVimeoId(url);
                    if (youtubeId) {
                      return (
                        <iframe
                          src={`https://www.youtube.com/embed/${youtubeId}`}
                          title={item.caption || 'YouTube video'}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      );
                    }
                    if (vimeoId) {
                      return (
                        <iframe
                          src={`https://player.vimeo.com/video/${vimeoId}`}
                          title={item.caption || 'Vimeo video'}
                          className="w-full h-full"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                        />
                      );
                    }
                    if (isDirectVideoUrl(url)) {
                      return (
                        <video src={url} controls className="w-full h-full object-cover bg-stone-950" />
                      );
                    }
                    if (/^https?:\/\//.test(url)) {
                      return (
                        <div className="w-full h-full flex flex-col justify-between p-6 bg-[#008dc9] text-white font-mono">
                          <span className="text-3xl">💎</span>
                          <div className="space-y-3">
                            <p className="text-[10px] font-bold leading-relaxed text-white/70">{item.caption || 'External Link'}</p>
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block text-[9px] font-black bg-[#ff24b0] text-white px-3 py-2 rounded-lg border border-[#008dc9] shadow-[2px_2px_0px_0px_#008dc9]"
                            >
                              Open Link →
                            </a>
                          </div>
                        </div>
                      );
                    }
                    return <video src={url} controls className="w-full h-full object-cover bg-stone-950" />;
                  })()}
                  
                  {item.type === 'VIDEO_LINK' && (
                    <div className="w-full h-full relative bg-stone-950 rounded-2xl overflow-hidden">
                      {(() => {
                        const url = item.videoLink || item.url;
                        const youtubeId = getYoutubeId(url);
                        const vimeoId = getVimeoId(url);
                        if (youtubeId) {
                          return (
                            <iframe
                              src={`https://www.youtube.com/embed/${youtubeId}`}
                              title={item.caption || 'YouTube video'}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          );
                        }
                        if (vimeoId) {
                          return (
                            <iframe
                              src={`https://player.vimeo.com/video/${vimeoId}`}
                              title={item.caption || 'Vimeo video'}
                              className="w-full h-full"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                            />
                          );
                        }
                        return (
                          <div className="w-full h-full flex flex-col justify-between p-6 bg-[#008dc9] text-white font-mono">
                            <span className="text-3xl">💎</span>
                            <div className="space-y-3">
                              <p className="text-[10px] font-bold leading-relaxed text-white/70">{item.caption || 'External Link'}</p>
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block text-[9px] font-black bg-[#ff24b0] text-white px-3 py-2 rounded-lg border border-[#008dc9] shadow-[2px_2px_0px_0px_#008dc9]"
                              >
                                Open Link →
                              </a>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  
                  {item.type === 'CASTING_VIDEO' && (
                    <div className="w-full h-full relative bg-stone-950">
                      <video src={item.url} controls className="w-full h-full object-cover" />
                      <span className="absolute top-4 left-4 bg-[#ff24b0] text-white text-[8px] font-black   px-2.5 py-1 rounded-md border border-[#008dc9] shadow-md">
                        Casting Video
                      </span>
                    </div>
                  )}
                  
                  {item.type === 'AUDIO' && (
                    <div className="w-full h-full flex flex-col justify-between p-5 bg-amber-50 border-2 border-[#008dc9] rounded-xl">
                      <div className="flex justify-between items-start">
                        <span className="text-3xl">🔊</span>
                        <span className="text-[8px] font-black  text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded  font-mono">Audio</span>
                      </div>
                      <div className="space-y-3 w-full">
                        <AudioCard src={item.url} title={item.caption || item.title || 'Untitled Track'} />
                      </div>
                    </div>
                  )}

                    </div>
                  ))}
                </div>
                {items.length > 4 && (
                  <button
                    onClick={() => setShowAllPortfolio(!showAllPortfolio)}
                    className="mt-6 w-full text-[10px] font-black bg-[#008dc9] text-white px-6 py-3 rounded-xl border-2 border-[#008dc9] shadow-[4px_4px_0px_0px_#ff24b0] transition-transform active:scale-95 hover:-translate-y-0.5"
                  >
                    {showAllPortfolio ? 'Show Less ↑' : `Show More (${items.length}) ↓`}
                  </button>
                )}
              </>
            );
          })()}
        </div>

       {/* ROW 1: HISTORICAL PLACEMENT + ACADEMIC, SIDE BY SIDE */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">

  {/* Historical Placement */}
  <div className="bg-white border-2 border-[#008dc9] rounded-[32px] p-6 sm:p-10 shadow-[8px_8px_0px_0px_#008dc9] space-y-8">
    <div className="flex items-center justify-between border-b-2 border-[#008dc9] pb-4">
      <h3 className="text-xs font-black  text-[#008dc9]  font-sans">Career History</h3>
    </div>

    {tp?.careerHistory && tp.careerHistory.length > 0 ? (
      <div className="grid grid-cols-1 gap-6 relative">
        {(showAllHistory ? tp.careerHistory : tp.careerHistory.slice(0, 1)).map((ch: any) => (
          <div key={ch.id} className="bg-[#fdfbf7] border-2 border-[#008dc9] p-6 rounded-2xl relative space-y-2 group transition-transform hover:-translate-y-0.5 hover:bg-white shadow-[4px_4px_0px_0px_#008dc9]">
            <div className="flex justify-between items-start gap-4">
              <h4 className="text-sm font-black tracking-tight text-stone-900  font-display">{ch.title}</h4>
              <span className="text-[8px] font-sans font-black text-[#ff24b0] bg-[#ff24b0]/5 border border-[#ff24b0]/20 px-2 py-0.5 rounded whitespace-nowrap">
                {ch.startDate ? new Date(ch.startDate).toLocaleDateString(undefined, { year: 'numeric' }) : ''}
                {ch.endDate ? ` — ${new Date(ch.endDate).toLocaleDateString(undefined, { year: 'numeric' })}` : ' — Pres'}
              </span>
            </div>
            {ch.description && (
              <p className="text-xs text-stone-500 font-medium leading-relaxed pt-1 border-t border-dashed border-stone-200">{ch.description}</p>
            )}
          </div>
        ))}
        {tp.careerHistory.length > 1 && (
          <button
            onClick={() => setShowAllHistory(!showAllHistory)}
            className="w-full text-[10px] font-black   bg-[#008dc9] text-white px-6 py-3 rounded-xl border-2 border-[#008dc9] shadow-[4px_4px_0px_0px_#ff24b0] transition-transform active:scale-95 hover:-translate-y-0.5"
          >
            {showAllHistory ? 'Show Less ↑' : `Show More (${tp.careerHistory.length}) ↓`}
          </button>
        )}
      </div>
    ) : (
      <div className="py-10 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
        <span className="text-2xl block mb-2">🗂️</span>
        <p className="text-xs font-sans text-stone-400  tracking-wider">No career history added yet.</p>
      </div>
    )}
  </div>

  {/* Academic Matrix & Training */}
  <div className="bg-white border-2 border-[#008dc9] rounded-[32px] p-6 sm:p-8 space-y-4 shadow-[6px_6px_0px_0px_#008dc9]">
    <div className="flex items-center gap-2 border-b border-[#008dc9] pb-3">
      {/* <span className="text-xl">🎓</span> */}
      <h3 className="text-xs font-black  text-[#008dc9]  font-sans">Education & Training</h3>
    </div>

    {tp?.courses && tp.courses.length > 0 ? (
      <div className="space-y-3">
        {(showAllCourses ? tp.courses : tp.courses.slice(0, 1)).map((c: any) => (
          <div key={c.id} className="bg-stone-50 border border-stone-200 p-4 rounded-xl flex justify-between items-center gap-4 hover:border-[#008dc9] transition-colors">
            <div className="space-y-0.5">
              <strong className="block text-xs font-display text-stone-900  tracking-wide">{c.title}</strong>
              {c.institution && <span className="block text-[10px] font-sans font-bold text-stone-400">{c.institution}</span>}
            </div>
            {c.year && <span className="text-xs font-sans font-black bg-[#008dc9] text-white px-2.5 py-1 rounded-md">{c.year}</span>}
          </div>
        ))}
        {tp.courses.length > 1 && (
          <button
            onClick={() => setShowAllCourses(!showAllCourses)}
            className="w-full text-[10px] font-black   bg-[#008dc9] text-white px-6 py-3 rounded-xl border-2 border-[#008dc9] shadow-[4px_4px_0px_0px_#ff24b0] transition-transform active:scale-95 hover:-translate-y-0.5"
          >
            {showAllCourses ? 'Show Less ↑' : `Show More (${tp.courses.length}) ↓`}
          </button>
        )}
      </div>
    ) : (
      <div className="py-10 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
        <span className="text-2xl block mb-2">🎓</span>
        <p className="text-xs font-sans text-stone-400  tracking-wider">No education or training added yet.</p>
      </div>
    )}
  </div>

</div>

{/* ROW 2: ATTRIBUTES, FULL WIDTH */}
<div className="bg-white border-2 border-[#008dc9] rounded-[32px] p-6 sm:p-8 space-y-6 shadow-[6px_6px_0px_0px_#ff24b0]">
  <div className="flex items-center gap-2 border-b border-[#008dc9] pb-3">
    {/* <span className="text-xl">📋</span> */}
    <h3 className="text-xs font-black  text-[#008dc9]  font-sans">Professional Details</h3>
  </div>

  {tp?.attributes && tp.attributes.filter((a: any) => formatAttributeValue(a.key, a.value) !== null).length > 0 ? (
    Object.entries(groupAttributesByCategory(tp.attributes)).map(([category, { direct, subGroups }]) => {
      const Icon = CATEGORY_ICONS_PROFILE[category] || DEFAULT_CATEGORY_ICON_PROFILE;
      return (
        <div key={category} className="space-y-4">
          <div className="flex items-center  gap-2">
            <Icon size={16} color="#008dc9" />
            <h4 className="text-xs font-black  text-[#008dc9]  font-sans">{category}</h4>
          </div>

          {direct.length > 0 && (
            <div className="flex flex-wrap gap-2 pl-6">
              {direct.map((f, idx) => (
                <span key={`${f.key}-${idx}`} className="flex items-center gap-1.5 text-xs font-black font-display text-[#008dc9] bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5">
                  <Icon size={12} color="#008dc9" />
                  {f.value}
                </span>
              ))}
            </div>
          )}

          {Object.entries(subGroups).map(([subGroupLabel, features]) => (
            <div key={subGroupLabel} className="pl-6 space-y-2">
              <span className="block text-[10px] font-bold text-stone-400  tracking-wider">{subGroupLabel}</span>
              <div className="flex flex-wrap gap-2">
                {features.map((f, idx) => (
                  <span key={`${f.key}-${idx}`} className="flex items-center gap-1.5 text-xs font-black font-display text-[#008dc9] bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5">
                    <Icon size={12} color="#008dc9" />
                    {f.value}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    })
  ) : (
    <div className="py-10 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
      <span className="text-2xl block mb-2">📋</span>
      <p className="text-xs font-sans text-stone-400  tracking-wider">No professional attributes added yet.</p>
    </div>
  )}
</div>

  </>)}

      </div>

      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white text-3xl leading-none hover:opacity-70 z-10"
          >
            &times;
          </button>
          <img
            src={lightboxImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default PublicTalentProfile;