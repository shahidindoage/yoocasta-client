import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { getTalentFilterOptions, searchTalents } from '../../api/talent.api';
import {
  FaTheaterMasks,
  FaVideo,
  FaFilm,
  FaMicrophone,
  FaPaintBrush,
  FaCamera,
  FaBullhorn,
  FaMusic,
  IconType,
} from 'react-icons/fa';
import { FaPersonWalkingLuggage, FaPersonDress } from 'react-icons/fa6'; // hostess, dancer
import { GiWalk } from 'react-icons/gi'; // models
import { MapPin, X, Send, ChevronDown, ChevronUp, ChevronRight, Heart, Search, RotateCcw, Filter } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getCastBags, addTalentsToBag, createCastBag } from '../../api/castBag.api';
import { getFavouriteIds, addFavourite, removeFavourite } from '../../api/favourites.api';
import { getMyJobs } from '../../api/job.api';
import { sendInvitation } from '../../api/invitations.api';
import api from '../../api/axios';
import { getCachedVideoUrl, getCachedVideoUrlSync } from '../../utils/videoCache';
import { getCachedCms, setCachedCms } from '../../utils/cmsCache';


const MultiSelectDropdown = ({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { id: string; name: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const summary = selected.length === 0 ? `All ${label}` : `${selected.length} selected`;
  const filteredOptions = options.filter(opt => opt.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <span style={{ fontSize: '11px', color: '#C6007E', fontWeight: 'bold', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>
        {label.toUpperCase()}
      </span>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', textAlign: 'left', background: '#fff', color: selected.length ? '#C6007E' : '#333',
          border: '1px solid #f5d0e3', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        {summary}
        <span style={{ fontSize: '10px', color: '#C6007E' }}>{open ? <ChevronUp style={{ width: '15px', height: '15px' }} /> : <ChevronDown style={{ width: '15px', height: '15px' }} />}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
          background: '#fff', border: '1px solid #f5d0e3', borderRadius: '8px',
          overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          <div style={{ padding: '8px', borderBottom: '1px solid #f5d0e3' }}>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${label}...`}
              style={{
                width: '100%', border: '1px solid #f5d0e3', borderRadius: '6px', padding: '6px 10px',
                fontSize: '12px', color: '#333', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ maxHeight: '220px', overflowY: 'auto', padding: '8px' }}>
            {filteredOptions.length === 0 && (
              <p style={{ fontSize: '12px', color: '#999', padding: '6px 4px' }}>No options found</p>
            )}
            {filteredOptions.map(opt => (
              <label key={opt.id} style={{ fontSize: '12px', color: '#555', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 4px' }}>
                <input type="checkbox" checked={selected.includes(opt.id)} onChange={() => onToggle(opt.id)} />
                {opt.name}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const DEFAULT_FILTERS = { sort: 'newest' };

const STATIC_CATEGORIES = [
  'Actors & Extras', 'Cinematographers / Videographers', 'Dancers',
  'Directors', 'Hostesses', 'MC/RJ/VJ/Voice Over', 'Makeup & Hairstylists',
  'Models', 'Photographers', 'Promoters', 'Singers',
];

const STATIC_LOCATIONS = [
  'Sharjah, United Arab Emirates', 'Dubai, United Arab Emirates',
  'Abu Dhabi, United Arab Emirates', 'Al Ayn, United Arab Emirates',
  '`Ajman, United Arab Emirates', 'Al Fujayrah, United Arab Emirates',
];

const CATEGORY_ICONS: Record<string, IconType> = {
  'Actors & Extras': FaTheaterMasks,
  'Cinematographers / Videographers': FaVideo,
  'Dancers': FaPersonDress,
  'Directors': FaFilm,
  'Hostesses': FaPersonWalkingLuggage,
  'MC/RJ/VJ/Voice Over': FaMicrophone,
  'Makeup & Hairstylists': FaPaintBrush,
  'Models': GiWalk,
  'Photographers': FaCamera,
  'Promoters': FaBullhorn,
  'Singers': FaMusic,
};
const DEFAULT_CATEGORY_ICON: IconType = FaTheaterMasks;

const EAV_CONFIG: Record<string, Record<string, { label: string; type: 'multiSelect' | 'text'; staticOptions?: string[] }>> = {
  'Singers': {
    singing_language: { label: 'Singing Language', type: 'multiSelect' },
    style_of_songs: { label: 'Style of Songs', type: 'multiSelect' },
    singer_individual_or_band: { label: 'Individual or Band', type: 'multiSelect', staticOptions: ['Individual', 'Band'] },
  },
  'Dancers': {
    style_of_dance: { label: 'Style of Dance', type: 'multiSelect' },
    dancer_individual_or_band: { label: 'Individual or Troupe', type: 'multiSelect', staticOptions: ['Individual', 'Troupe'] },
  },
  'Photographers': {
    camera_worked_on: { label: 'Camera Worked On', type: 'text' },
    photography_types: { label: 'Photography Types', type: 'multiSelect' },
  },
  'Directors': {
    director_types_of_project: { label: 'Types of Project', type: 'multiSelect' },
    director_assistant_level: { label: 'Role Level', type: 'multiSelect' },
  },
  'Cinematographers / Videographers': {
    cinematographer_cameras: { label: 'Camera Worked On', type: 'text' },
    cinematographer_project_types: { label: 'Types of Project', type: 'multiSelect' },
  },
  'Makeup & Hairstylists': {
    makeup_project_types: { label: 'Types of Project', type: 'multiSelect' },
    makeup_or_hairstylist: { label: 'Specialization', type: 'multiSelect', staticOptions: ['Makeup', 'Hairstylist', 'Both'] },
  },
  'MC/RJ/VJ/Voice Over': {
    voiceover_project_types: { label: 'Types of Project', type: 'multiSelect' },
    voiceover_role_type: { label: 'Role Type', type: 'multiSelect', staticOptions: ['MC', 'RJ', 'VJ', 'Voiceover', 'TV Presenter'] },
  },
};

const shimmerStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, #fce7f3 25%, #fbcfe8 50%, #fce7f3 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s ease-in-out infinite',
  borderRadius: '8px',
};

const SkeletonBlock = ({ width = '100%', height = '40px' }: { width?: string; height?: string }) => (
  <div style={{ ...shimmerStyle, width, height }} />
);

const TalentCardSkeleton = () => (
  <div style={{
    position: 'relative',
    height: '440px',
    borderRadius: '24px',
    overflow: 'hidden',
    background: '#fff',
    border: '1.5px solid transparent',
  }}>
    <div style={{ ...shimmerStyle, width: '100%', height: '100%', borderRadius: 0 }} />

    {/* bottom content placeholder, mirrors the real card's text block */}
    <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
        <SkeletonBlock width="70px" height="18px" />
        <SkeletonBlock width="60px" height="18px" />
      </div>
      <SkeletonBlock width="65%" height="22px" />
      <div style={{ marginTop: '8px' }}>
        <SkeletonBlock width="45%" height="14px" />
      </div>
    </div>
  </div>
);

const BrowseTalents = () => {
  // const [options, setOptions] = useState<any>(null);
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  const [draftFilters, setDraftFilters] = useState<any>(DEFAULT_FILTERS);
  const [searchParams] = useSearchParams();
  const hasUrlParams = !!(searchParams.get('search') || searchParams.get('gender') || searchParams.get('category') || searchParams.get('city'));
  const [appliedFilters, setAppliedFilters] = useState<any>(hasUrlParams ? null : DEFAULT_FILTERS);
  // const [showFilters, setShowFilters] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [detailTalent, setDetailTalent] = useState<any>(null);
  const [detailPhoto, setDetailPhoto] = useState<string>('');
  const [bioExpanded, setBioExpanded] = useState(false);
  const [showAllCats, setShowAllCats] = useState(false);

  const [showFilters, setShowFilters] = useState(false); // now: Professional Attributes only
const [showPhysicalFilters, setShowPhysicalFilters] = useState(false); // new: Physical Filters tab
const [drawerOpen, setDrawerOpen] = useState(false);
const [drawerMounted, setDrawerMounted] = useState(false);


const [dynamicOptions, setDynamicOptions] = useState<any>(null);
const [dynamicLoading, setDynamicLoading] = useState(true);
const [filterData, setFilterData] = useState<any>(null);

const [cms, setCms] = useState<any>(() => getCachedCms('browse-talents'));
const [videoSrc, setVideoSrc] = useState<string | null>(() => {
  const cached = getCachedCms('browse-talents');
  const url = cached?.videoUrl || 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/casting_video/casting_video_10107.mp4';
  return getCachedVideoUrlSync(url);
});
const videoRef = useRef<HTMLVideoElement>(null);

const { user } = useAuthStore();
const [favouriteIds, setFavouriteIds] = useState<string[]>([]);
const [castBagTalent, setCastBagTalent] = useState<any>(null);
const [castBags, setCastBags] = useState<any[]>([]);
const [selectedBagIds, setSelectedBagIds] = useState<string[]>([]);
const [castBagsLoading, setCastBagsLoading] = useState(false);
const [castBagLoading, setCastBagLoading] = useState(false);
const [castBagMsg, setCastBagMsg] = useState('');
const [newBagName, setNewBagName] = useState('');
const [creatingBag, setCreatingBag] = useState(false);
const [toast, setToast] = useState<string | null>(null);

const showToast = (msg: string) => {
  setToast(msg);
  setTimeout(() => setToast(null), 3000);
};

const refreshCastBags = () => {
  setCastBagsLoading(true);
  getCastBags().then(res => setCastBags(res.data.data || [])).catch(() => {}).finally(() => setCastBagsLoading(false));
};

const [inviteTalent, setInviteTalent] = useState<any>(null);
const [inviteJobs, setInviteJobs] = useState<any[]>([]);
const [inviteJobsLoading, setInviteJobsLoading] = useState(false);
const [inviteSendingJobs, setInviteSendingJobs] = useState<Set<string>>(new Set());
const [inviteMsg, setInviteMsg] = useState('');

const [selectedTalentIds, setSelectedTalentIds] = useState<Set<string>>(new Set());
const [zCardLoading, setZCardLoading] = useState(false);

useEffect(() => {
  if (user?.role === 'RECRUITER') {
    getFavouriteIds().then(res => setFavouriteIds(res.data.data || [])).catch(() => {});
  }
}, [user]);

const toggleFavourite = async (talentUserId: string) => {
  try {
    if (favouriteIds.includes(talentUserId)) {
      await removeFavourite(talentUserId);
      setFavouriteIds(prev => prev.filter(id => id !== talentUserId));
    } else {
      await addFavourite(talentUserId);
      setFavouriteIds(prev => [...prev, talentUserId]);
    }
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  const url = 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/static/filterOptions.json?t=' + Date.now();
  fetch(url)
    .then(r => { if (!r.ok) throw new Error('R2 fetch failed'); return r.json(); })
    .then(setFilterData)
    .catch(() => fetch('/static/filterOptions.json').then(r => r.json()).then(setFilterData));
}, []);

useEffect(() => {
  const applyMeta = (d: any) => {
    if (d.metaTitle) document.title = d.metaTitle;
    if (d.metaDescription) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = d.metaDescription;
    }
  };

  const cached = getCachedCms('browse-talents');
  if (cached) applyMeta(cached);

  let active = true;
  api.get('/cms/browse-talents')
    .then((res) => {
      if (!active || !res.data?.success || !res.data?.data) return;
      const d = res.data.data;
      setCms(d);
      setCachedCms('browse-talents', d);
      applyMeta(d);
    })
    .catch(() => { if (!cached) setCms({}); });
  return () => { active = false; };
}, []);

useEffect(() => {
  const url = cms?.videoUrl || 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/casting_video/casting_video_10107.mp4';
  if (getCachedVideoUrlSync(url)) return;
  getCachedVideoUrl(url);
}, [cms?.videoUrl]);

useEffect(() => {
  const initial: any = { ...DEFAULT_FILTERS };
  let hasParam = false;

  const search = searchParams.get('search');
  const gender = searchParams.get('gender');
  const categoryName = searchParams.get('category');
  const cityName = searchParams.get('city');

  if (search) { initial.search = search; hasParam = true; }
  if (gender) { initial.gender = gender; hasParam = true; }

  if (categoryName && filterData) {
    const match = filterData.categories.find((c: any) => c.name === categoryName);
    if (match) { initial.categories = [match.id]; initial.categoryName = categoryName; hasParam = true; }
  }

  if (cityName && filterData) {
    const match = filterData.cities.find((c: any) => c.name === cityName);
    if (match) {
      initial.cityId = match.id;
      initial.countryId = match.countryId;
      const country = filterData.countries.find((c: any) => c.id === match.countryId);
      initial.location = country ? `${cityName}, ${country.name}` : cityName;
      hasParam = true;
    }
  }

  if (hasParam) {
    setDraftFilters(initial);
  }
  setAppliedFilters(initial);
}, [filterData, searchParams]);

useEffect(() => {
  if (searchParams.toString()) {
    const t = setTimeout(() => {
      const el = document.getElementById('talents-section');
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 16, behavior: 'smooth' });
    }, 50);
    return () => clearTimeout(t);
  }
}, [searchParams]);

useEffect(() => {
  if ((showFilters || showPhysicalFilters) && !dynamicOptions) {
    setDynamicLoading(true);
    getTalentFilterOptions()
      .then(res => setDynamicOptions(res.data.data))
      .finally(() => setDynamicLoading(false));
  }
}, [showFilters, showPhysicalFilters, dynamicOptions]);

  useEffect(() => {
    if (!appliedFilters) return;
    const fetchTalents = async () => {
      const cacheKey = JSON.stringify({ v: 2, filters: appliedFilters, page: pagination.page });
      let hasCached = false;

      try {
        const cached = sessionStorage.getItem('bt_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.key === cacheKey) {
            setTalents(parsed.talents);
            setPagination(parsed.pagination);
            hasCached = true;
          }
        }
      } catch {}

      if (hasCached) setLoading(false); else setLoading(true);

      try {
        const res = await searchTalents({ ...appliedFilters, page: pagination.page, limit: 12 });
        const talents = res.data.data.data;
        const pg = res.data.data.pagination;
        setTalents(talents);
        setPagination(pg);
        sessionStorage.setItem('bt_cache', JSON.stringify({ key: cacheKey, talents, pagination: pg }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTalents();
  }, [appliedFilters, pagination.page]);

  const handleFilterChange = (key: string, value: any) => {
    setDraftFilters((prev: any) => ({ ...prev, [key]: value || undefined }));
  };

  const handleMultiChange = (key: string, id: string) => {
    setDraftFilters((prev: any) => {
      const current = prev[key] || [];
      return { ...prev, [key]: current.includes(id) ? current.filter((x: string) => x !== id) : [...current, id] };
    });
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setAppliedFilters(draftFilters);
  };

  const resetFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setPagination({ total: 0, page: 1, totalPages: 1 });
  };

  const toggleProfessionalValue = (key: string, val: string) => {
  setDraftFilters((prev: any) => {
    const pro: { key: string; values: string[] }[] = prev.professional ? [...prev.professional] : [];
    const idx = pro.findIndex(p => p.key === key);
    if (idx === -1) {
      pro.push({ key, values: [val] });
    } else {
      const current = pro[idx].values;
      const nextValues = current.includes(val) ? current.filter(v => v !== val) : [...current, val];
      if (nextValues.length === 0) pro.splice(idx, 1);
      else pro[idx] = { key, values: nextValues };
    }
    return { ...prev, professional: pro };
  });
};

const setProfessionalText = (key: string, val: string) => {
  setDraftFilters((prev: any) => {
    const pro = (prev.professional || []).filter((p: any) => p.key !== key);
    if (val) pro.push({ key, values: [val] });
    return { ...prev, professional: pro };
  });
};



  const heroHeading = cms?.pageHeading || 'Talent Pool';
  const heroSubHeading = cms?.subHeading || "Discover the region's finest acting, modeling & creative talent";
  const heroDescription = cms?.pageDescription || 'Search, filter & shortlist the perfect fit in minutes';
  const rawVideoUrl = cms?.videoUrl || 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/casting_video/casting_video_10107.mp4';
  const heroVideo = videoSrc || rawVideoUrl;
  const cmsLoaded = cms !== null;

  return (
    <div style={{ background: '#ffffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', margin: 0 }}>
      
      {/* TOP FULL-WIDTH DARK FILTERS PANEL */}
    



<div style={{ position: 'relative', color: '#333', padding: '100px 40px', borderBottom: '1px solid #ffffffff' }}>

  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, background: 'linear-gradient(135deg, #FDEFF6 0%, #F8DFEF 100%)' }}>
    {cmsLoaded && heroVideo && (
      <video
        ref={videoRef}
        key={rawVideoUrl}
        autoPlay loop muted playsInline
        src={heroVideo}
        className="w-full h-full object-cover opacity-70"
      >
      </video>
    )}
  </div>

  <div className="absolute inset-0 bg-black/30" /> 

  {/* ⬇️ NEW WRAPPER — everything below must go INSIDE this div */}
  <div style={{ position: 'relative', zIndex: 2 }}>

    <style>{`
      @keyframes tp-shimmer {
        0% { background-position: -200% 0; filter: drop-shadow(0 0 3px rgba(255,237,36,0.2)); }
        40% { background-position: 0% 0; filter: drop-shadow(0 0 25px rgba(255,255,255,1)) drop-shadow(0 0 50px rgba(255,237,36,0.6)) drop-shadow(0 0 80px rgba(198,0,126,0.3)); }
        60% { background-position: 0% 0; filter: drop-shadow(0 0 25px rgba(255,255,255,1)) drop-shadow(0 0 50px rgba(255,237,36,0.6)) drop-shadow(0 0 80px rgba(198,0,126,0.3)); }
        100% { background-position: 200% 0; filter: drop-shadow(0 0 3px rgba(255,237,36,0.2)); }
      }
      .tp-shimmer-char {
        display: inline-block;
        color: transparent;
        background: linear-gradient(120deg, #FFED24 0%, #FFED24 30%, #ffffff 50%, #FFED24 70%, #FFED24 100%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        background-clip: text;
        animation: tp-shimmer 2.2s ease-in-out infinite;
      }
    `}</style>
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      {heroSubHeading && (
        <p className="font-display text-sm sm:text-base font-bold text-white tracking-wide" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
          {heroSubHeading}
        </p>
      )}
      <h2 className="font-display text-3xl sm:text-5xl lg:text-[56px]  font-black tracking-[0.08em] leading-none mt-3">
        {heroHeading.split("").map((char, i) => (
          <span key={i} className="tp-shimmer-char" style={{ animationDelay: `${i * 0.12}s` }}>
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h2>
      {heroDescription && (
        <p className="text-[10px] text-white/80 font-medium tracking-[0.2em] mt-3" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
          {heroDescription}
        </p>
      )}
    </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* PRIMARY CORE ROW — STATIC FILTERS (home hero style) */}
            <div className="max-w-4xl w-full mx-auto bg-white/80 backdrop-blur-xl rounded-2xl border border-[#f5d0e3] p-3 shadow-lg shadow-[#C6007E]/5">
              <div className="flex flex-wrap lg:flex-nowrap items-center gap-2">
                <div className="flex-1 min-w-[120px] bg-[#fef1f5] rounded-xl border border-[#f5d0e3] focus-within:border-[#C6007E] transition-colors px-3 py-2">
                  <select
                    value={draftFilters.categoryName || ''}
                    onChange={e => {
                      const val = e.target.value;
                      handleFilterChange('categoryName', val);
                      if (val && filterData) {
                        const match = filterData.categories.find((c: any) => c.name === val);
                        handleFilterChange('categories', match ? [match.id] : undefined);
                      } else {
                        handleFilterChange('categories', undefined);
                      }
                    }}
                    className="w-full bg-transparent text-xs text-stone-900 font-black focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-white">All Categories</option>
                    {STATIC_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-white">{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[120px] bg-[#fef1f5] rounded-xl border border-[#f5d0e3] focus-within:border-[#C6007E] transition-colors px-3 py-2">
                  <select
                    value={draftFilters.location || ''}
                    onChange={e => {
                      const val = e.target.value;
                      handleFilterChange('location', val);
                      const cityName = val ? val.split(',')[0].trim() : '';
                      if (val && filterData) {
                        const match = filterData.cities.find((c: any) => c.name === cityName);
                        handleFilterChange('cityId', match ? match.id : null);
                        handleFilterChange('countryId', match ? match.countryId : null);
                      } else {
                        handleFilterChange('cityId', null);
                        handleFilterChange('countryId', null);
                      }
                    }}
                    className="w-full bg-transparent text-xs text-stone-900 font-black focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-white">All Locations</option>
                    {STATIC_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc} className="bg-white">{loc}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[100px] bg-[#fef1f5] rounded-xl border border-[#f5d0e3] focus-within:border-[#C6007E] transition-colors px-3 py-2">
                  <select
                    value={draftFilters.gender || ''}
                    onChange={e => handleFilterChange('gender', e.target.value)}
                    className="w-full bg-transparent text-xs text-stone-900 font-black focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-white">All Genders</option>
                    <option value="male" className="bg-white">Male</option>
                    <option value="female" className="bg-white">Female</option>
                  </select>
                </div>
                <div className="flex-[2] min-w-[150px] bg-[#fef1f5] rounded-xl border border-[#f5d0e3] focus-within:border-[#C6007E] transition-colors px-3 py-2 flex items-center gap-2">
                  <Search className="h-4 w-4 text-[#C6007E] shrink-0" />
                  <input
                    type="text"
                    placeholder="Search talents..."
                    value={draftFilters.search || ''}
                    onChange={e => handleFilterChange('search', e.target.value)}
                    className="w-full bg-transparent text-xs text-stone-900 font-bold focus:outline-none placeholder-stone-400"
                  />
                </div>
                <button
                  onClick={applyFilters}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C6007E] to-[#3835A4] hover:opacity-90 text-white transition-all duration-300 px-5 py-2.5 shadow-lg shadow-[#C6007E]/20"
                >
                  <Search className="h-4 w-4" />
                </button>
                <button
                  onClick={resetFilters}
                  title="Reset Filters"
                  className="flex items-center justify-center rounded-xl bg-[#fef1f5] border border-[#f5d0e3] text-[#C6007E] hover:bg-[#f5d0e3] transition-colors duration-300 px-3 py-2.5"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* MORE FILTERS — OPENS FULL-SCREEN DRAWER */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
              <button
                onClick={() => { setDrawerMounted(true); setDrawerOpen(true); }}
                className="group flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white hover:border-[#C6007E] hover:text-[#FFED24] transition-all duration-300 px-8 py-3 shadow-lg shadow-black/20 cursor-pointer"
              >
                <Filter className="h-4 w-4 text-[#fff] group-hover:text-[#FFED24] transition-colors" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">More Filters</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
              </button>
            </div>
          </div>
  </div>
  {/* ⬆️ END NEW WRAPPER */}

</div>

      {/* ALL FILTERS DRAWER */}
      {drawerMounted && (
      <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.5)', opacity: drawerOpen ? 1 : 0, pointerEvents: drawerOpen ? 'auto' : 'none', transition: 'opacity 0.12s ease-in-out' }} onClick={() => setDrawerOpen(false)}>
        <div className="bg-white w-full max-w-md h-full shadow-2xl" style={{ overflowY: 'auto', overflowX: 'hidden', transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.12s ease-in-out', willChange: 'transform' }} onClick={(e) => e.stopPropagation()}>
            {/* Drawer header */}
            <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#3835A4', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 900 }}>All Filters</h2>
              <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* PRIMARY CONTROLS — SEARCH, COUNTRY, CITY, GENDER */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Search name or bio..."
                  value={draftFilters.search || ''}
                  onChange={e => handleFilterChange('search', e.target.value)}
                  style={{ background: '#fff', color: '#333', border: '1px solid #f5d0e3', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <select
                    value={draftFilters.countryId || ''}
                    onChange={e => { handleFilterChange('countryId', e.target.value); handleFilterChange('cityId', null); }}
                    style={{ width: '100%', background: '#fff', color: '#333', border: '1px solid #f5d0e3', padding: '10px', borderRadius: '8px', fontSize: '13px' }}
                  >
                    <option value="">All Countries</option>
                    {filterData?.countries.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <select
                    value={draftFilters.cityId || ''}
                    onChange={e => handleFilterChange('cityId', e.target.value)}
                    style={{ width: '100%', background: '#fff', color: '#333', border: '1px solid #f5d0e3', padding: '10px', borderRadius: '8px', fontSize: '13px' }}
                  >
                    <option value="">All Cities</option>
                    {filterData?.cities.filter((c: any) => !draftFilters.countryId || c.countryId === draftFilters.countryId).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <select
                  value={draftFilters.gender || ''}
                  onChange={e => handleFilterChange('gender', e.target.value)}
                  style={{ background: '#fff', color: '#333', border: '1px solid #f5d0e3', padding: '10px', borderRadius: '8px', fontSize: '13px' }}
                >
                  <option value="">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* CATEGORIES DROPDOWN — SINGLE SELECT */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#C6007E', fontWeight: 'bold', letterSpacing: '0.5px' }}>CATEGORIES</span>
                <select
                  value={draftFilters.categoryId || ''}
                  onChange={e => { const val = e.target.value; handleFilterChange('categoryId', val); handleFilterChange('categories', val ? [val] : undefined); }}
                  style={{ background: '#fff', color: '#333', border: '1px solid #f5d0e3', padding: '10px', borderRadius: '8px', fontSize: '13px' }}
                >
                  <option value="">All Categories</option>
                  {filterData?.categories.filter((c: any) => c.name !== 'Additional Category').map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* ALWAYS-VISIBLE FILTERS: AGE, ETHNICITY, NATIONALITY, LANGUAGES, DIALECTS */}
              {filterData && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #f5d0e3', width: '100%', minWidth: 0 }}>

                <div>
                  <span style={{ fontSize: '11px', color: '#C6007E', fontWeight: 'bold', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>AGE PARAMETERS</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select value={draftFilters.ageFrom || ''} onChange={e => handleFilterChange('ageFrom', e.target.value ? parseInt(e.target.value) : null)} style={{ width: '100%', background: '#fff', color: '#333', border: '1px solid #f5d0e3', padding: '12px', borderRadius: '6px', fontSize: '12px' }}>
                      <option value="">Min Age</option>
                      {Array.from({ length: 101 }, (_, i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                    <select value={draftFilters.ageTo || ''} onChange={e => handleFilterChange('ageTo', e.target.value ? parseInt(e.target.value) : null)} style={{ width: '100%', background: '#fff', color: '#333', border: '1px solid #f5d0e3', padding: '8px', borderRadius: '6px', fontSize: '12px' }}>
                      <option value="">Max Age</option>
                      {Array.from({ length: 101 }, (_, i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                </div>

                <MultiSelectDropdown
                  label="Ethnicity"
                  options={filterData.ethnicities}
                  selected={draftFilters.ethnicities || []}
                  onToggle={(id) => handleMultiChange('ethnicities', id)}
                />
                <MultiSelectDropdown
                  label="Nationality"
                  options={filterData.nationalities}
                  selected={draftFilters.nationalities || []}
                  onToggle={(id) => handleMultiChange('nationalities', id)}
                />

                <MultiSelectDropdown
                  label="Languages"
                  options={filterData.languages}
                  selected={draftFilters.languages || []}
                  onToggle={(id) => handleMultiChange('languages', id)}
                />

                <MultiSelectDropdown
                  label="Dialects"
                  options={filterData.dialects}
                  selected={draftFilters.dialects || []}
                  onToggle={(id) => handleMultiChange('dialects', id)}
                />

              </div>
              )}

              {/* Toggle Show Advanced Matrices Row */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={() => setShowFilters(!showFilters)} style={{ background: showFilters ? '#3835A4' : '#fff', color: showFilters ? '#fff' : '#C6007E', border: '1px solid #f5d0e3', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                  {showFilters ? 'Hide Advanced Filters ▲' : 'Show Advanced / Professional Filters ▼'}
                </button>
                <button onClick={() => setShowPhysicalFilters(!showPhysicalFilters)} style={{ background: showPhysicalFilters ? '#C6007E' : '#fff', color: showPhysicalFilters ? '#fff' : '#C6007E', border: '1px solid #f5d0e3', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                  {showPhysicalFilters ? 'Hide Physical Filters ▲' : 'Show Physical Filters ▼'}
                </button>
              </div>

              {/* Expanded Advanced Sub-Filters Array Panel Container */}
              {showFilters && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #f5d0e3', width: '100%', minWidth: 0 }}>

                  {dynamicLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '13px', gridColumn: '1 / -1' }}>
                      <div style={{ ...shimmerStyle, height: '16px', width: '180px', margin: '0 auto' }} />
                    </div>
                  ) : dynamicOptions.attributes && dynamicOptions.attributes.length > 0 && (
                    <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #f5d0e3', paddingTop: '20px', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#C6007E', fontWeight: 'bold', display: 'block', marginBottom: '16px', letterSpacing: '0.5px' }}>
                        PROFESSIONAL ATTRIBUTES
                      </span>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {Object.entries(EAV_CONFIG).map(([category, fields]) => {
                          const fieldKeys = Object.keys(fields).filter(k => dynamicOptions.attributes.includes(k));
                          if (fieldKeys.length === 0) return null;
                          // const currentEav = draftFilters.professional || [];

                          const setValue = (key: string, val: string) => {
                            setDraftFilters((prev: any) => {
                              const pro = (prev.professional || []).filter((p: any) => p.key !== key);
                              if (val) pro.push({ key, value: val });
                              return { ...prev, professional: pro };
                            });
                          };

                          return (
                            <div key={category} style={{ display: 'flex', flexDirection: 'column', background: '#fef1f5', borderRadius: '8px', width: '100%' }}>
                              <div style={{ background: '#3835A4', color: '#fcfcfcff', fontWeight: 900, fontSize: '13px', padding: '10px 20px', width: '100%', borderRadius: '8px 8px 0 0' }}>
                                {category}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '12px' }}>
                                {fieldKeys.map(key => {
                                  const field = fields[key];
                                  const currentValues: string[] = (draftFilters.professional || []).find((p: any) => p.key === key)?.values || [];
                                  const values = field.staticOptions ?? (dynamicOptions.attributeValues?.[key] || []);

                                  if (field.type === 'multiSelect') {
                                    return (
                                      <div key={key} style={{ width: '200px', maxWidth: '100%' }}>
                                        <MultiSelectDropdown
                                          label={field.label}
                                          options={values.map((v: string) => ({ id: v, name: v }))}
                                          selected={currentValues}
                                          onToggle={(v) => toggleProfessionalValue(key, v)}
                                        />
                                      </div>
                                    );
                                  }

                                  const textVal = currentValues[0] || '';
                                  return (
                                    <input
                                      key={key}
                                      type="text"
                                      placeholder={field.label}
                                      value={textVal}
                                      onChange={e => setProfessionalText(key, e.target.value)}
                                      style={{ background: '#fff', color: '#333', border: '1px solid #f5d0e3', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', width: '200px', maxWidth: '100%' }}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                        {/* Additional Category — categories with NO custom EAV fields, plain checkboxes tied to categories filter */}
                        {/* {options.categories.filter((c: any) => !Object.keys(EAV_CONFIG).includes(c.name)).length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', background: '#1c1c24', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{ background: '#E8B923', color: '#1c1c24', fontWeight: 900, fontSize: '13px', padding: '12px 20px', minWidth: '180px', clipPath: 'polygon(0 0, 100% 0, 92% 100%, 0% 100%)' }}>
                              Additional Category
                            </div>
                            <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', padding: '10px 20px', flex: 1 }}>
                              {options.categories
                                .filter((c: any) => !Object.keys(EAV_CONFIG).includes(c.name))
                                .map((c: any) => (
                                  <label key={c.id} style={{ fontSize: '13px', color: '#ddd', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                    <input
                                      type="checkbox"
                                      checked={(draftFilters.categories || []).includes(c.id)}
                                      onChange={() => handleMultiChange('categories', c.id)}
                                    />
                                    {c.name}
                                  </label>
                                ))}
                            </div>
                          </div>
                        )} */}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* NEW SEPARATE PANEL — PHYSICAL FILTERS TAB */}
              {showPhysicalFilters && (
                <div style={{ padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #f5d0e3', width: '100%', minWidth: 0 }}>
                  <span style={{ fontSize: '11px', color: '#C6007E', fontWeight: 'bold', display: 'block', marginBottom: '16px', letterSpacing: '0.5px' }}>PHYSICAL SPECIFICATIONS</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', minWidth: 0 }}>
                    {dynamicLoading ? (
                      <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '13px', gridColumn: '1 / -1' }}>
                        <div style={{ ...shimmerStyle, height: '16px', width: '140px', margin: '0 auto' }} />
                      </div>
                    ) : (<>
                      {([
                        ['height', 'Height'], ['weight', 'Weight'], ['chest', 'Chest'], ['waist', 'Waist'], ['shoeSize', 'Shoe Size'],
                      ] as const).map(([field, label]) => (
                        <div key={field} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: '#C6007E', width: '70px' }}>{label}</span>
                          <select
                            value={draftFilters.physical?.[`${field}From`] || ''}
                            onChange={e => setDraftFilters((p: any) => ({ ...p, physical: { ...p.physical, [`${field}From`]: e.target.value ? Number(e.target.value) : undefined } }))}
                            style={{ flex: 1, background: '#fff', color: '#333', border: '1px solid #f5d0e3', padding: '6px', borderRadius: '6px', fontSize: '12px' }}
                          >
                            <option value="">From</option>
                            {(dynamicOptions.physicalNumeric?.[field] || []).map((v: number) => <option key={v} value={v}>{v}</option>)}
                          </select>
                          <select
                            value={draftFilters.physical?.[`${field}To`] || ''}
                            onChange={e => setDraftFilters((p: any) => ({ ...p, physical: { ...p.physical, [`${field}To`]: e.target.value ? Number(e.target.value) : undefined } }))}
                            style={{ flex: 1, background: '#fff', color: '#333', border: '1px solid #f5d0e3', padding: '6px', borderRadius: '6px', fontSize: '12px' }}
                          >
                            <option value="">To</option>
                            {(dynamicOptions.physicalNumeric?.[field] || []).map((v: number) => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                      ))}

                      {([
                        ['hairColor', 'Hair Color'], ['hairType', 'Hair Type'], ['hairLength', 'Hair Length'],
                        ['eyeColor', 'Eye Color'], ['bodyStructure', 'Body Structure'], ['tattoo', 'Tattoo'],
                      ] as const).map(([field, label]) => (
                        <select
                          key={field}
                          value={draftFilters.physical?.[field] || ''}
                          onChange={e => setDraftFilters((p: any) => ({ ...p, physical: { ...p.physical, [field]: e.target.value || undefined } }))}
                          style={{ width: '100%', background: '#fff', color: '#333', border: '1px solid #f5d0e3', padding: '8px', borderRadius: '6px', fontSize: '12px' }}
                        >
                          <option value="">All {label}</option>
                          {(dynamicOptions.physicalCategorical?.[field] || []).map((v: string) => <option key={v} value={v}>{v}</option>)}
                        </select>
                      ))}
                    </>)}
                  </div>
                </div>
              )}

              {/* Drawer bottom: reset + apply buttons */}
              <div style={{ borderTop: '1px solid #f5d0e3', paddingTop: '16px', display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => { resetFilters(); setDrawerOpen(false); }}
                  style={{ flex: 1, background: '#fff', color: '#C6007E', border: '1px solid #f5d0e3', borderRadius: '8px', padding: '12px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f5d0e3'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => { applyFilters(); setDrawerOpen(false); }}
                  style={{ flex: 2, background: '#3835A4', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#C6007E'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#3835A4'}
                >
                  Apply Filters
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* COUNT + SORT ROW */}
      <div id="talents-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px 0' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, letterSpacing: '-0.02em', color: '#000' }}>
          {pagination.total > 0 && <span style={{ color: '#3835A4', marginRight: '3px' }}>{pagination.total}</span>} Matching Talents Found
        </h2>
        <select
          value={draftFilters.sort}
          onChange={e => { const val = e.target.value; setDraftFilters((prev: any) => ({ ...prev, sort: val })); setPagination(prev => ({ ...prev, page: 1 })); setAppliedFilters((prev: any) => ({ ...prev, sort: val })); }}
          style={{ background: '#fff', color: '#000000ff', border: '1px solid #f5d0e3', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}
        >
          <option value="newest">Newest Members</option>
          <option value="most_viewed">Most Viewed</option>
          <option value="a-z">Name (A-Z)</option>
          <option value="z-a">Name (Z-A)</option>
        </select>
      </div>



      <div style={{ padding: '40px' }}>
{loading ? (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '30px' }}>
    {Array.from({ length: 4 }).map((_, i) => <TalentCardSkeleton key={i} />)}
  </div>
) : (
  <>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '30px' }}>
      {talents.length === 0 ? (
        <p style={{ color: '#666' }}>No talents found matching your criteria.</p>
      ) : (
        talents.map((talent) => {
          const isHovered = hoveredCardId === talent.id;

          return (
            <div
              key={talent.id}
              onMouseEnter={() => setHoveredCardId(talent.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              className="snap-start group relative h-[520px] w-full shrink-0 rounded-[2.25rem] overflow-hidden cursor-pointer bg-neutral-950 border border-neutral-200/90 shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <div className="absolute inset-3 border border-white/10 rounded-[1.75rem] pointer-events-none z-20 transition-all duration-500 group-hover:inset-2.5 group-hover:border-[#C6007E]/35" />

              <div className="absolute inset-0 h-full w-full">
                <img
                  src={talent.image || 'https://via.placeholder.com/400x600?text=No+Photo'}
                  alt={talent.firstName}
                  className="h-full w-full object-cover transition-transform duration-1000 ease-out scale-100 group-hover:scale-105 filter brightness-95 group-hover:brightness-[0.82]"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent to-20% z-10" />
                {user?.role === 'RECRUITER' && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setCastBagTalent(talent);
                        setSelectedBagIds([]);
                        setCastBagMsg('');
                        setNewBagName('');
                        refreshCastBags();
                      }}
                      className="px-8 py-4 rounded-2xl bg-[#C6007E] text-white font-mono text-sm font-black tracking-widest uppercase shadow-xl hover:bg-[#a10065] transition-colors cursor-pointer"
                    >
                      Add to Cast Bag
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setInviteTalent(talent);
                        setInviteMsg('');
                        setInviteJobs([]);
                        setInviteJobsLoading(true);
                        getMyJobs().then(res => {
                          const allJobs = res.data.data || [];
                          const now = new Date();
                          setInviteJobs(allJobs.filter((j: any) =>
                            j.status === 'APPROVED' &&
                            (!j.lastDateToApply || new Date(j.lastDateToApply) >= now)
                          ));
                        }).catch(() => {}).finally(() => setInviteJobsLoading(false));
                      }}
                      className="px-8 py-4 rounded-2xl bg-[#3835A4] text-white font-mono text-sm font-black tracking-widest uppercase shadow-xl hover:bg-[#C6007E] transition-colors cursor-pointer"
                    >
                      Invite to Apply
                    </div>
                  </div>
    )}
    {(!user || user?.role === 'TALENT') && (
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div
          onClick={async (e) => {
            e.stopPropagation();
            e.preventDefault();
            setZCardLoading(true);
            try {
              const token = localStorage.getItem('accessToken');
              const headers: Record<string, string> = { 'Content-Type': 'application/json' };
              if (token) headers['Authorization'] = `Bearer ${token}`;
              const res = await fetch(`${import.meta.env.VITE_API_URL}/recruiter/z-card`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ talentIds: [talent.id] }),
              });
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `zcard-${talent.firstName || talent.id}.pdf`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              setTimeout(() => URL.revokeObjectURL(url), 10000);
            } catch (err: any) {
              alert('Z Card failed: ' + (err?.message || 'Unknown error'));
            } finally {
              setZCardLoading(false);
            }
          }}
          className="px-8 py-4 rounded-2xl bg-[#C6007E] text-white font-mono text-sm font-black tracking-widest uppercase shadow-xl hover:bg-[#a10065] transition-colors cursor-pointer"
        >
          Download Z Card
        </div>
      </div>
    )}
    </div>

              <div className="absolute top-6 left-6 right-6 flex items-start z-30">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[#3835A4] opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                    {/* <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-xs font-mono font-bold">{talent.views ?? 0}</span> */}
                  </div>
                  {user?.role === 'RECRUITER' && (
                    <div
                      onClick={(e) => { e.stopPropagation(); e.preventDefault(); setSelectedTalentIds(prev => { const next = new Set(prev); if (next.has(talent.id)) next.delete(talent.id); else next.add(talent.id); return next; }); }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer border-2 ${
                        selectedTalentIds.has(talent.id)
                          ? 'bg-[#C6007E] border-[#C6007E] text-white opacity-100'
                          : 'bg-white/20 border-white/40 text-white opacity-0 group-hover:opacity-100 hover:bg-white/30'
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        {selectedTalentIds.has(talent.id)
                          ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          : <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        }
                      </svg>
                    </div>
                  )}
                  {talent.plan === 'premium' || talent.plan === 'PREMIUM' ? (
                    <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#C6007E] to-[#3835A4] text-white text-[9px] uppercase font-mono font-black tracking-[0.2em] px-3.5 py-1.5 rounded-xl shadow-lg">
                      <svg className="h-3 w-3 fill-current text-white" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      <span>PREMIUM</span>
                    </div>
                  ) : <div />}
                </div>
                <div className="ml-auto flex items-center">
                  <div className="relative flex items-center">
                    {/* Views counter — visible by default, hidden on hover */}
                    <div className="flex items-center gap-1 bg-[#C6007E] text-white px-2 py-0.5 rounded-lg opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-[14px] font-mono font-bold">{talent.views ?? 0}</span>
                    </div>

                    {/* Recruiter hover actions — Z Card + Heart, overlaying the views counter spot */}
                    {user?.role === 'RECRUITER' && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setZCardLoading(true);
                            try {
                              const token = localStorage.getItem('accessToken');
                              const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                              if (token) headers['Authorization'] = `Bearer ${token}`;
                              const res = await fetch(`${import.meta.env.VITE_API_URL}/recruiter/z-card`, {
                                method: 'POST',
                                headers,
                                body: JSON.stringify({ talentIds: [talent.id] }),
                              });
                              if (!res.ok) throw new Error(`HTTP ${res.status}`);
                              const blob = await res.blob();
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `zcard-${talent.firstName || talent.id}.pdf`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              setTimeout(() => URL.revokeObjectURL(url), 10000);
                            } catch (err: any) {
                              alert('Z Card failed: ' + (err?.message || 'Unknown error'));
                            } finally {
                              setZCardLoading(false);
                            }
                          }}
                          className="p-1.5 rounded-full transition-all duration-300 cursor-pointer text-white hover:text-[#C6007E]"
                          title="Download Z Card"
                        >
                          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4a1 1 0 001 1h4" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14h6" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v6" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleFavourite(talent.id); }}
                          className={`p-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            favouriteIds.includes(talent.id) ? 'text-red-500' : 'text-white hover:text-red-400'
                          }`}
                          title={favouriteIds.includes(talent.id) ? 'Remove from favourites' : 'Add to favourites'}
                        >
                          <Heart className={`h-7 w-7 ${favouriteIds.includes(talent.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-7 z-30 flex flex-col justify-end">
                <div className="flex items-end justify-between gap-4">
                  <div className="space-y-2">
                    <Link to={`/talent/${talent.username}`} className="block no-underline">
                      <h3 className="font-display text-2xl sm:text-3xl font-black text-white hover:text-[#C6007E] transition-colors leading-none">
                        {talent.firstName} 
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-bold">
                      <MapPin className="h-3.5 w-3.5 text-[#FFF] group-hover:text-[#FFF]" />
                      <span>{talent.city}{talent.country ? `, ${talent.country}` : ''}</span>
                    </div>
                  </div>

                    <div
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); setDetailTalent(talent); setDetailPhoto(talent.image); setBioExpanded(false); setShowAllCats(false); }}
                    className="p-4 rounded-2xl bg-[#3835A4] text-white transition-all duration-300 shadow-xl group-hover:bg-[#C6007E] shrink-0 border border-white/10 cursor-pointer"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </div>

                </div>

                <div className="h-0 opacity-0 overflow-hidden group-hover:h-16 group-hover:opacity-100 group-hover:mt-6 transition-all duration-500 ease-out border-t border-white/10 pt-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-[8px] text-[#fff] uppercase font-mono">Shoe Size</p>
                      <p className="text-xs font-black text-white font-mono">{talent.physical?.shoeSize || 'N/A'} EU</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-[#fff] uppercase font-mono">Hair Color</p>
                      <p className="text-xs font-black text-white font-mono">{talent.physical?.hairColor || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-[#fff] uppercase font-mono">Waistline</p>
                      <p className="text-xs font-black text-white font-mono">{talent.physical?.waist ? `${talent.physical.waist} CM` : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>

    {pagination.totalPages > 1 && (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '40px' }}>
        {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '40px' }}>
                <button 
                className='px-4 py-2 rounded-xl bg-[#3835A4] text-white font-bold cursor-pointer hover:bg-[#C6007E] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={pagination.page === 1} 
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} 
                //   style={{ padding: '10px 20px', background: '#fff', border: '1px solid #ddd', borderRadius: '10px', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold', color: '#3835A4' }}
                >
                  Previous
                </button>
                <span style={{ padding: '10px', color: '#666', fontSize: '14px' }}>Page {pagination.page} of {pagination.totalPages}</span>
                <button 
                className='px-4 py-2 rounded-xl bg-[#3835A4] text-white font-bold cursor-pointer hover:bg-[#C6007E] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={pagination.page === pagination.totalPages} 
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} 
                //   style={{ padding: '10px 20px', background: '#fff', border: '1px solid #ddd', borderRadius: '10px', cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer', fontWeight: 'bold', color: '#3835A4' }}
                >
                  Next
                </button>
              </div>
            )}
      </div>
    )}
  </>
)}
</div>

       
      {/* Z Card Loading Overlay */}
      {zCardLoading && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-[#C6007E] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white font-mono text-sm font-bold tracking-widest uppercase">Generating Z Card...</p>
        </div>
      )}

      {/* Selection Tray */}
      {user?.role === 'RECRUITER' && selectedTalentIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-[#C6007E]/15 backdrop-blur-md border-t border-[#C6007E]/20">
          <div className="flex items-center gap-3 py-8 px-4 w-full justify-center">
            <span className="text-white text-sm font-bold font-mono">
              {selectedTalentIds.size} talent{selectedTalentIds.size > 1 ? 's' : ''} selected
            </span>
            <div className="h-6 w-px bg-white/10" />
            <button
              onClick={() => {
                setCastBagTalent({ ids: Array.from(selectedTalentIds), name: `${selectedTalentIds.size} talents` });
                setSelectedBagIds([]);
                setCastBagMsg('');
                setNewBagName('');
                refreshCastBags();
              }}
              className="px-5 py-2.5 rounded-xl bg-[#C6007E] text-white font-mono text-xs font-black tracking-widest uppercase hover:bg-[#a10065] transition-colors"
            >
              Add to Cast Bags
            </button>
            <button
              onClick={() => {
                const ids = Array.from(selectedTalentIds);
                setInviteTalent({ id: 'bulk', ids, firstName: `${ids.length} talents`, lastName: '' });
                setInviteMsg('');
                setInviteJobs([]);
                setInviteJobsLoading(true);
                getMyJobs().then(res => {
                  const allJobs = res.data.data || [];
                  const now = new Date();
                  setInviteJobs(allJobs.filter((j: any) =>
                    j.status === 'APPROVED' &&
                    (!j.lastDateToApply || new Date(j.lastDateToApply) >= now)
                  ));
                }).catch(() => {}).finally(() => setInviteJobsLoading(false));
              }}
              className="px-5 py-2.5 rounded-xl bg-[#3835A4] text-white font-mono text-xs font-black tracking-widest uppercase hover:bg-[#C6007E] transition-colors"
            >
              Invite to Apply
            </button>
            <button
              onClick={async () => {
                const ids = Array.from(selectedTalentIds);
                for (const id of ids) {
                  try { await addFavourite(id); } catch {}
                }
                setFavouriteIds(prev => [...new Set([...prev, ...ids])]);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#C6007E] text-white font-mono text-xs font-black tracking-widest uppercase hover:bg-[#a10065] transition-colors"
            >
              Add to Favorites
            </button>
            <button
              onClick={async () => {
                const ids = Array.from(selectedTalentIds);
                if (ids.length === 0) return;
                setZCardLoading(true);
                try {
                  const token = localStorage.getItem('accessToken');
                  const res = await fetch(`${import.meta.env.VITE_API_URL}/recruiter/z-card`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ talentIds: ids }),
                  });
                  if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(errText || `HTTP ${res.status}`);
                  }
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `zcard-${ids.length}-talents.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  setTimeout(() => URL.revokeObjectURL(url), 10000);
                } catch (err: any) {
                  alert('Z Card failed: ' + (err?.message || 'Unknown error'));
                } finally {
                  setZCardLoading(false);
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C6007E] to-[#3835A4] text-white font-mono text-xs font-black tracking-widest uppercase hover:opacity-90 transition-opacity"
            >
              {zCardLoading ? 'Generating...' : 'Create Z Card'}
            </button>
            <div className="h-6 w-px bg-white/10" />
            <button
              onClick={() => setSelectedTalentIds(new Set())}
              className="px-5 py-2.5 rounded-xl bg-white/10 text-white/70 font-mono text-xs font-black tracking-widest uppercase hover:bg-white/20 hover:text-white transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Talent Detail Modal */}
      {detailTalent && (() => {
        const allMedia = detailTalent.media?.filter((m: any) => m.type === 'IMAGE' || !m.type) || [];
        const galleryImages = [detailTalent.image, ...allMedia.map((m: any) => m.url)].filter(Boolean);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-md">
            <div className="relative w-full max-w-4xl rounded-3xl border border-neutral-200 bg-white shadow-2xl overflow-y-auto md:overflow-hidden flex flex-col md:flex-row max-h-[92vh] md:h-[700px]">
              <button
                onClick={() => setDetailTalent(null)}
                className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/80 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 border border-neutral-200 shadow-sm transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="w-full md:w-[45%] bg-neutral-50 p-6 flex flex-col justify-between shrink-0 border-r border-neutral-200">
                <div className="h-[380px] md:h-[450px] rounded-2xl overflow-hidden bg-white border border-neutral-100 relative shadow-sm">
                  <img
                    src={detailPhoto}
                    alt={`${detailTalent.firstName} ${detailTalent.lastName}`}
                    className="h-full w-full object-cover transition-all"
                    referrerPolicy="no-referrer"
                  />
                  {(detailTalent.plan === 'premium' || detailTalent.plan === 'PREMIUM') && (
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1 bg-gradient-to-r from-[#C6007E] to-[#3835A4] text-white text-[9px] uppercase font-black px-2 py-0.5 rounded-full shadow-md tracking-wider">
                      PREMIUM
                    </span>
                  )}
                </div>

                <div className="mt-4 flex gap-2.5 overflow-x-auto pb-1">
                  {galleryImages.slice(0, 4).map((imgUrl: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setDetailPhoto(imgUrl)}
                      className={`h-16 w-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border-2 transition-all cursor-pointer ${
                        detailPhoto === imgUrl ? 'border-[#C6007E] scale-[1.03]' : 'border-transparent hover:border-neutral-300'
                      }`}
                    >
                      <img src={imgUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-[55%] flex flex-col justify-between md:overflow-y-auto p-6 md:p-8">
                <div className="space-y-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-1 mb-1">
                      {(detailTalent.categories || []).slice(0, showAllCats ? detailTalent.categories.length : 2).map((cat: string, idx: number) => (
                        <span key={idx} className="text-[10px] uppercase font-mono text-[#C6007E] font-bold tracking-wider">
                          {idx > 0 && ' • '} {cat}
                        </span>
                      ))}
                      {(detailTalent.categories || []).length > 2 && !showAllCats && (
                        <button
                          onClick={() => setShowAllCats(true)}
                          className="text-[10px] uppercase font-mono text-[#3835A4] font-black tracking-wider cursor-pointer hover:underline ml-1"
                        >
                          +{(detailTalent.categories || []).length - 2} more
                        </button>
                      )}
                    </div>
                    <h1 className="font-display text-3xl font-black text-neutral-900">
                      {detailTalent.firstName} {detailTalent.lastName}
                    </h1>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-600">
                      <MapPin className="h-4 w-4 text-neutral-400" />
                      <span>Based in {detailTalent.city}{detailTalent.country ? `, ${detailTalent.country}` : ''}</span>
                      <span className="text-neutral-300">•</span>
                      <span className="text-[#C6007E] font-mono font-bold">Verified</span>
                    </div>
                  </div>

                  {detailTalent.bio && (() => {
                    const isLong = detailTalent.bio.length > 150;
                    return (
                      <div>
                        <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500">Bio</h3>
                        <p className="mt-1 text-xs text-neutral-700 leading-relaxed">
                          {isLong && !bioExpanded ? detailTalent.bio.slice(0, 150) + '...' : detailTalent.bio}
                        </p>
                        {isLong && (
                          <button
                            onClick={() => setBioExpanded(!bioExpanded)}
                            className="text-[10px] font-bold text-[#C6007E] hover:text-[#3835A4] mt-1 transition-colors cursor-pointer bg-none border-none p-0"
                          >
                            {bioExpanded ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4">
                    <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#C6007E] font-bold">Physical Specifications</h3>
                    <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-center">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono">Height</p>
                        <p className="text-sm font-black text-neutral-900 font-mono mt-0.5">{detailTalent.physical?.height || '—'} cm</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono">Weight</p>
                        <p className="text-sm font-black text-neutral-900 font-mono mt-0.5">{detailTalent.physical?.weight || '—'} kg</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono">Chest</p>
                        <p className="text-sm font-black text-neutral-900 font-mono mt-0.5">{detailTalent.physical?.chest || '—'} cm</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono">Waist</p>
                        <p className="text-sm font-black text-neutral-900 font-mono mt-0.5">{detailTalent.physical?.waist || '—'} cm</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono">Shoe Size</p>
                        <p className="text-sm font-black text-neutral-900 font-mono mt-0.5">{detailTalent.physical?.shoeSize || '—'} EU</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono">Hair Color</p>
                        <p className="text-sm font-black text-neutral-900 font-mono mt-0.5">{detailTalent.physical?.hairColor || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {detailTalent.skillDescription && (
                    <div>
                      <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500">Skills</h3>
                      <p className="mt-1 text-xs text-neutral-700 leading-relaxed">{detailTalent.skillDescription}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100">
                  <Link
                    to={`/talent/${detailTalent.username}`}
                    onClick={() => setDetailTalent(null)}
                    className="w-full bg-[#C6007E] text-white hover:bg-[#a10065] font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow no-underline"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>View Full Profile</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add to Cast Bag Popup */}
      {castBagTalent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={e => { if (e.target === e.currentTarget) setCastBagTalent(null); }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-[#3835A4]">Add to Cast Bag</h2>
              <button onClick={() => setCastBagTalent(null)} className="text-stone-400 hover:text-stone-600 text-xl leading-none">&times;</button>
            </div>
            <p className="text-xs text-stone-500 font-medium">Adding <span className="font-bold text-[#3835A4]">{castBagTalent.ids ? castBagTalent.name : `${castBagTalent.firstName} ${castBagTalent.lastName}`}</span></p>

            {castBagMsg && <p className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-2 rounded-lg">{castBagMsg}</p>}

            {castBagsLoading ? (
              <p className="text-xs text-stone-400 italic py-4 text-center">Loading cast bags...</p>
            ) : castBags.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-4 text-center">No cast bags yet. Create one below.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {castBags.map(bag => (
                  <label key={bag.id} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-stone-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedBagIds.includes(bag.id)}
                      onChange={() => setSelectedBagIds(prev => prev.includes(bag.id) ? prev.filter(x => x !== bag.id) : [...prev, bag.id])}
                      className="accent-[#C6007E]"
                    />
                    <div>
                      <p className="text-sm font-bold text-[#3835A4]">{bag.name}</p>
                      <p className="text-[10px] text-stone-400">{bag.talentCount || 0} talent(s)</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Create New Cast Bag */}
            <div className="border-t border-stone-100 pt-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Create New Cast Bag</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBagName}
                  onChange={(e) => setNewBagName(e.target.value)}
                  placeholder="Enter cast bag name"
                  className="flex-1 bg-transparent border-b-2 border-stone-200 py-2 text-sm outline-none focus:border-[#C6007E]"
                />
                <button
                  onClick={async () => {
                    if (!newBagName.trim()) return;
                    setCreatingBag(true);
                    try {
                      const res = await createCastBag(newBagName.trim());
                      setNewBagName('');
                      setCastBagMsg(`Cast bag "${res.data.data.name}" created`);
                      refreshCastBags();
                    } catch {
                      setCastBagMsg('Failed to create cast bag');
                    } finally {
                      setCreatingBag(false);
                    }
                  }}
                  disabled={creatingBag || !newBagName.trim()}
                  className="bg-[#3835A4] disabled:opacity-40 text-white px-5 py-2 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#2a2899] transition-all"
                >
                  {creatingBag ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setCastBagTalent(null)} className="text-xs font-bold text-stone-500 hover:text-stone-800 uppercase tracking-wider">Cancel</button>
              <button
                onClick={async () => {
                  if (!selectedBagIds.length) return;
                  setCastBagLoading(true);
                  try {
                    const talentIds = castBagTalent.ids || [castBagTalent.id];
                    await Promise.all(selectedBagIds.map(bagId => addTalentsToBag(bagId, talentIds)));
                    const count = talentIds.length;
                    setCastBagTalent(null);
                    showToast(`Added ${count} talent${count > 1 ? 's' : ''} to ${selectedBagIds.length} bag(s)`);
                  } catch {
                    setCastBagMsg('Failed to add');
                    showToast('Failed to add talents to cast bag');
                  }
                  finally { setCastBagLoading(false); }
                }}
                disabled={!selectedBagIds.length || castBagLoading}
                className="bg-[#C6007E] disabled:opacity-40 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#a10065] transition-all"
              >
                {castBagLoading ? 'Adding...' : 'Add Talents'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite to Apply Popup */}
      {inviteTalent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={e => { if (e.target === e.currentTarget) setInviteTalent(null); }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-[#3835A4]">Invite to Apply</h2>
              <button onClick={() => setInviteTalent(null)} className="text-stone-400 hover:text-stone-600 text-xl leading-none">&times;</button>
            </div>
            <p className="text-xs text-stone-500 font-medium">Inviting <span className="font-bold text-[#3835A4]">{inviteTalent.ids ? inviteTalent.name : `${inviteTalent.firstName} ${inviteTalent.lastName}`}</span></p>

            {inviteMsg && <p className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-2 rounded-lg">{inviteMsg}</p>}

            {inviteJobsLoading ? (
              <p className="text-xs text-stone-400 italic py-4 text-center">Loading jobs...</p>
            ) : inviteJobs.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-4 text-center">No active jobs available. Create a job first.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {inviteJobs.map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between p-3 rounded-xl border border-stone-100 hover:bg-stone-50 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-[#3835A4]">{job.title || 'Untitled'}</p>
                      <p className="text-[10px] text-stone-400">{job.roles?.length || 0} role(s)</p>
                    </div>
                    <button
                      onClick={async () => {
                        setInviteSendingJobs(prev => new Set(prev).add(job.id));
                        setInviteMsg('');
                        try {
                          const talentIds = inviteTalent.ids || [inviteTalent.id];
                          await Promise.all(talentIds.map((tid: string) => sendInvitation(job.id, tid)));
                          setInviteMsg(`Invitation sent for "${job.title}"`);
                        } catch (err: any) {
                          setInviteMsg(err?.response?.data?.message || 'Failed to send invitation');
                        } finally {
                          setInviteSendingJobs(prev => { const next = new Set(prev); next.delete(job.id); return next; });
                        }
                      }}
                      disabled={inviteSendingJobs.has(job.id)}
                      className="bg-[#C6007E] disabled:opacity-40 text-white px-4 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#a10065] transition-all"
                    >
                      {inviteSendingJobs.has(job.id) ? 'Sending...' : 'Invite'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-[#3835A4] text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-bold flex items-center gap-2 animate-fadeIn">
          <span className="h-2 w-2 rounded-full bg-green-400 shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
};

export default BrowseTalents;