import { useState, useEffect , useRef} from 'react';
import { Link } from 'react-router-dom';
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
import { MapPin, X, Send, Ruler, ChevronDown, ChevronUp } from 'lucide-react';


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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const summary = selected.length === 0 ? `All ${label}` : `${selected.length} selected`;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <span style={{ fontSize: '11px', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>
        {label.toUpperCase()}
      </span>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', textAlign: 'left', background: '#1c1c24', color: selected.length ? '#fff' : '#ffffffff',
          border: '1px solid #333', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        {summary}
        <span style={{ fontSize: '10px', color: '#ffffffff' }}>{open ? <ChevronUp style={{ width: '15px', height: '15px' }} /> : <ChevronDown style={{ width: '15px', height: '15px' }} />}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 20,
          background: '#1c1c24', border: '1px solid #333', borderRadius: '8px',
          maxHeight: '220px', overflowY: 'auto', padding: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          {options.map(opt => (
            <label key={opt.id} style={{ fontSize: '12px', color: '#ccc', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 4px' }}>
              <input type="checkbox" checked={selected.includes(opt.id)} onChange={() => onToggle(opt.id)} />
              {opt.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const DEFAULT_FILTERS = { sort: 'newest' };

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
  background: 'linear-gradient(90deg, #1c1c24 25%, #2a2a35 50%, #1c1c24 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s ease-in-out infinite',
  borderRadius: '8px',
};

const SkeletonBlock = ({ width = '100%', height = '40px' }: { width?: string; height?: string }) => (
  <div style={{ ...shimmerStyle, width, height }} />
);

const FiltersSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    {/* category icon grid placeholders */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
      {Array.from({ length: 10 }).map((_, i) => <SkeletonBlock key={i} height="70px" />)}
    </div>

    {/* search/sort/gender/country/city/apply row */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
      {Array.from({ length: 5 }).map((_, i) => <SkeletonBlock key={i} height="40px" />)}
    </div>

    {/* age/ethnicity/nationality/languages/dialects row */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', padding: '20px', background: '#16161f', borderRadius: '12px', border: '1px solid #262630' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i}>
          <SkeletonBlock height="12px" width="60%" />
          <div style={{ marginTop: '8px' }}><SkeletonBlock height="40px" /></div>
        </div>
      ))}
    </div>

    {/* toggle buttons */}
    <div style={{ display: 'flex', gap: '10px' ,justifyContent:'center'}}>
      <SkeletonBlock width="180px" height="32px" />
      <SkeletonBlock width="160px" height="32px" />
    </div>
  </div>
);

const TalentCardSkeleton = () => (
  <div style={{
    position: 'relative',
    height: '440px',
    borderRadius: '24px',
    overflow: 'hidden',
    background: '#111',
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
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  const [draftFilters, setDraftFilters] = useState<any>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<any>(DEFAULT_FILTERS);
  // const [showFilters, setShowFilters] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [detailTalent, setDetailTalent] = useState<any>(null);
  const [detailPhoto, setDetailPhoto] = useState<string>('');
  const [bioExpanded, setBioExpanded] = useState(false);

  const [showFilters, setShowFilters] = useState(false); // now: Professional Attributes only
const [showPhysicalFilters, setShowPhysicalFilters] = useState(false); // new: Physical Filters tab


const [options, setOptions] = useState<any>(null);
const [optionsLoading, setOptionsLoading] = useState(true);

useEffect(() => {
  setOptionsLoading(true);
  getTalentFilterOptions()
    .then(res => setOptions(res.data.data))
    .finally(() => setOptionsLoading(false));
}, []);


  useEffect(() => {
    getTalentFilterOptions().then(res => setOptions(res.data.data));
  }, []);

  useEffect(() => {
    const fetchTalents = async () => {
      setLoading(true);
      try {
        const res = await searchTalents({ ...appliedFilters, page: pagination.page, limit: 12 });
        setTalents(res.data.data.data);
        setPagination(res.data.data.pagination);
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

  return (
    <div style={{ background: '#f4f4f6', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', margin: 0 }}>
      
      {/* TOP FULL-WIDTH DARK FILTERS PANEL */}
    



<div style={{ position: 'relative', background: '#111115', color: '#fff', padding: '24px 40px', borderBottom: '1px solid #222' }}>

  {/* BACKGROUND VIDEO */}
  <video
    autoPlay loop muted playsInline
    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, opacity: 0.55 }}
  >
    <source src="https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/casting_video/casting_video_10107.mp4" type="video/mp4" />
  </video>

  {/* DARK OVERLAY for contrast */}
  {/* <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(17, 17, 21, 0.49) 0%, rgba(17,17,21,0.95) 100%)', zIndex: 1 }} /> */}

  {/* ⬇️ NEW WRAPPER — everything below must go INSIDE this div */}
  <div style={{ position: 'relative', zIndex: 2 }}>

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900, letterSpacing: '-0.02em' }}>
        Talents Pool
      </h2>
      <button onClick={resetFilters} style={{ fontSize: '12px', color: '#C6007E', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Reset All
      </button>
    </div>

    {optionsLoading ? (
      <FiltersSkeleton />
    ) : options && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
           
          {/* CATEGORY ICON GRID — MULTI-SELECT */}
<svg width="0" height="0" style={{ position: 'absolute' }}>
  <defs>
    <linearGradient id="categoryIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#C6007E" />
      <stop offset="100%" stopColor="#3835A4" />
    </linearGradient>
  </defs>
</svg>

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
  {options.categories
    .filter((c: any) => c.name !== 'Additional Category')
    .map((c: any) => {
      const isSelected = (draftFilters.categories || []).includes(c.id);
      const Icon = CATEGORY_ICONS[c.name] || DEFAULT_CATEGORY_ICON;
      return (
        <button
          key={c.id}
          type="button"
          onClick={() => handleMultiChange('categories', c.id)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '14px 8px',
            borderRadius: '12px',
            cursor: 'pointer',
            background: isSelected ? 'linear-gradient(135deg, #C6007E 0%, #3835A4 100%)' : '#1c1c24',
            border: isSelected ? '1.5px solid #C6007E' : '1.5px solid #333',
            color: '#fff',
            transition: 'all 0.2s',
          }}
        >
          <Icon size={24} style={isSelected ? { fill: '#fff' } : { fill: 'url(#categoryIconGradient)' }} />
          <span style={{ fontSize: '11px', fontWeight: 'bold', textAlign: 'center', lineHeight: 1.2 }}>{c.name}</span>
        </button>
      );
    })}
</div>
           
           
            {/* Primary Core Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Search name or bio..." 
                value={draftFilters.search || ''} 
                onChange={e => handleFilterChange('search', e.target.value)} 
                style={{ background: '#1c1c24', color: '#fff', border: '1px solid #333', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', outline: 'none' }} 
              />

              {/* <select value={draftFilters.sort} onChange={e => handleFilterChange('sort', e.target.value)} style={{ background: '#1c1c24', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '8px', fontSize: '13px' }}>
                <option value="newest">Newest Members</option>
                <option value="most_viewed">Most Viewed</option>
                <option value="a-z">Name (A-Z)</option>
                <option value="z-a">Name (Z-A)</option>
              </select> */}

              <select value={draftFilters.gender || ''} onChange={e => handleFilterChange('gender', e.target.value)} style={{ background: '#1c1c24', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '8px', fontSize: '13px' }}>
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <select value={draftFilters.countryId || ''} onChange={e => { handleFilterChange('countryId', e.target.value); handleFilterChange('cityId', null); }} style={{ background: '#1c1c24', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '8px', fontSize: '13px' }}>
                <option value="">All Countries</option>
                {options.countries.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <select value={draftFilters.cityId || ''} onChange={e => handleFilterChange('cityId', e.target.value)} style={{ background: '#1c1c24', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '8px', fontSize: '13px' }}>
                <option value="">All Cities</option>
                {options.cities.filter((c: any) => !draftFilters.countryId || c.countryId === draftFilters.countryId).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <button 
                onClick={applyFilters}
                style={{ background: '#3835A4', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#C6007E'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#3835A4'}
              >
                Apply Filters
              </button>
            </div>

            {/* ALWAYS-VISIBLE FILTERS: AGE, ETHNICITY, NATIONALITY, LANGUAGES, DIALECTS */}
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', padding: '20px', background: '#16161f', borderRadius: '12px', border: '1px solid #262630' }}>

  <div>
    <span style={{ fontSize: '11px', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>AGE PARAMETERS</span>
    <div style={{ display: 'flex', gap: '8px' }}>
      <select value={draftFilters.ageFrom || ''} onChange={e => handleFilterChange('ageFrom', e.target.value ? parseInt(e.target.value) : null)} style={{ width: '100%', background: '#1c1c24', color: '#fff', border: '1px solid #333', padding: '12px', borderRadius: '6px', fontSize: '12px' }}>
        <option value="">Min Age</option>
        {Array.from({ length: 101 }, (_, i) => <option key={i} value={i}>{i}</option>)}
      </select>
      <select value={draftFilters.ageTo || ''} onChange={e => handleFilterChange('ageTo', e.target.value ? parseInt(e.target.value) : null)} style={{ width: '100%', background: '#1c1c24', color: '#fff', border: '1px solid #333', padding: '8px', borderRadius: '6px', fontSize: '12px' }}>
        <option value="">Max Age</option>
        {Array.from({ length: 101 }, (_, i) => <option key={i} value={i}>{i}</option>)}
      </select>
    </div>
  </div>

  <MultiSelectDropdown
  label="Ethnicity"
  options={options.ethnicities}
  selected={draftFilters.ethnicities || []}
  onToggle={(id) => handleMultiChange('ethnicities', id)}
/>
  <MultiSelectDropdown
  label="Nationality"
  options={options.nationalities}
  selected={draftFilters.nationalities || []}
  onToggle={(id) => handleMultiChange('nationalities', id)}
/>

<MultiSelectDropdown
  label="Languages"
  options={options.languages}
  selected={draftFilters.languages || []}
  onToggle={(id) => handleMultiChange('languages', id)}
/>

<MultiSelectDropdown
  label="Dialects"
  options={options.dialects}
  selected={draftFilters.dialects || []}
  onToggle={(id) => handleMultiChange('dialects', id)}
/>

</div>

            {/* Toggle Show Advanced Matrices Row */}
           <div style={{ display: 'flex', gap: '10px',justifyContent:'center' }}>
  <button onClick={() => setShowFilters(!showFilters)} style={{ background: showFilters ? '#3835A4' : 'transparent', color: showFilters ? '#fff' : '#aaa', border: '1px solid #333', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
    {showFilters ? 'Hide Advanced Filters ▲' : 'Show Advanced / Professional Filters ▼'}
  </button>
  <button onClick={() => setShowPhysicalFilters(!showPhysicalFilters)} style={{ background: showPhysicalFilters ? '#C6007E' : 'transparent', color: showPhysicalFilters ? '#fff' : '#aaa', border: '1px solid #333', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
    {showPhysicalFilters ? 'Hide Physical Filters ▲' : 'Show Physical Filters ▼'}
  </button>
</div>

            {/* Expanded Advanced Sub-Filters Array Panel Container */}
            {showFilters && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', padding: '24px', background: '#16161f', borderRadius: '12px', border: '1px solid #262630' }}>
             

                {/* 8. PROFESSIONAL FILTERS (CATEGORIZED EAV) */}
{options.attributes && options.attributes.length > 0 && (
  <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #262630', paddingTop: '20px', marginTop: '4px' }}>
    <span style={{ fontSize: '11px', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '16px', letterSpacing: '0.5px' }}>
      PROFESSIONAL ATTRIBUTES
    </span>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {Object.entries(EAV_CONFIG).map(([category, fields]) => {
        const fieldKeys = Object.keys(fields).filter(k => options.attributes.includes(k));
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
          <div key={category} style={{ display: 'flex', alignItems: 'center', background: '#1c1c24', borderRadius: '8px' }}>
            <div style={{ background: '#E8B923', color: '#1c1c24', fontWeight: 900, fontSize: '13px', padding: '12px 20px', minWidth: '180px', clipPath: 'polygon(0 0, 100% 0, 92% 100%, 0% 100%)' }}>
              {category}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', padding: '10px 20px', flex: 1 }}>
             {fieldKeys.map(key => {
  const field = fields[key];
  const currentValues: string[] = (draftFilters.professional || []).find((p: any) => p.key === key)?.values || [];
  const values = field.staticOptions ?? (options.attributeValues?.[key] || []);

  if (field.type === 'multiSelect') {
    return (
      <div key={key} style={{ minWidth: '220px' }}>
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
      style={{ background: '#1c1c24', color: '#fff', border: '1px solid #262630', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', minWidth: '160px',marginTop:'25px' }}
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
  <div style={{ padding: '24px', background: '#16161f', borderRadius: '12px', border: '1px solid #262630' }}>
    <span style={{ fontSize: '11px', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '16px', letterSpacing: '0.5px' }}>PHYSICAL SPECIFICATIONS</span>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>

      {([
        ['height', 'Height'], ['weight', 'Weight'], ['chest', 'Chest'], ['waist', 'Waist'], ['shoeSize', 'Shoe Size'],
      ] as const).map(([field, label]) => (
        <div key={field} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#aaa', width: '70px' }}>{label}</span>
          <select
            value={draftFilters.physical?.[`${field}From`] || ''}
            onChange={e => setDraftFilters((p: any) => ({ ...p, physical: { ...p.physical, [`${field}From`]: e.target.value ? Number(e.target.value) : undefined } }))}
            style={{ flex: 1, background: '#1c1c24', color: '#fff', border: '1px solid #333', padding: '6px', borderRadius: '6px', fontSize: '12px' }}
          >
            <option value="">From</option>
            {(options.physicalNumeric?.[field] || []).map((v: number) => <option key={v} value={v}>{v}</option>)}
          </select>
          <select
            value={draftFilters.physical?.[`${field}To`] || ''}
            onChange={e => setDraftFilters((p: any) => ({ ...p, physical: { ...p.physical, [`${field}To`]: e.target.value ? Number(e.target.value) : undefined } }))}
            style={{ flex: 1, background: '#1c1c24', color: '#fff', border: '1px solid #333', padding: '6px', borderRadius: '6px', fontSize: '12px' }}
          >
            <option value="">To</option>
            {(options.physicalNumeric?.[field] || []).map((v: number) => <option key={v} value={v}>{v}</option>)}
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
          style={{ width: '100%', background: '#1c1c24', color: '#fff', border: '1px solid #333', padding: '8px', borderRadius: '6px', fontSize: '12px' }}
        >
          <option value="">All {label}</option>
          {(options.physicalCategorical?.[field] || []).map((v: string) => <option key={v} value={v}>{v}</option>)}
        </select>
      ))}

    </div>
  </div>
)}
          </div>
    )}

  </div>
  {/* ⬆️ END NEW WRAPPER */}

</div>

      {/* COUNT + SORT ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px 0' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, letterSpacing: '-0.02em', color: '#111' }}>
          {pagination.total > 0 && <span style={{ color: '#C6007E', marginRight: '3px' }}>{pagination.total}</span>} Matching Talents Found
        </h2>
        <select
          value={draftFilters.sort}
          onChange={e => { handleFilterChange('sort', e.target.value); applyFilters(); }}
          style={{ background: '#fff', color: '#111', border: '1px solid #ddd', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}
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
          const sortedCategories = [...(talent.categories || [])].sort();
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
              </div>

              <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30">
                {talent.plan === 'premium' || talent.plan === 'PREMIUM' ? (
                  <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#C6007E] to-[#3835A4] text-white text-[9px] uppercase font-mono font-black tracking-[0.2em] px-3.5 py-1.5 rounded-xl shadow-lg">
                    <svg className="h-3 w-3 fill-current text-white" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    <span>PREMIUM</span>
                  </div>
                ) : <div />}

                {talent.physical?.height && (
                  <div className="bg-neutral-950/80 backdrop-blur-md text-white/90 text-[10px] font-mono tracking-wider px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-1">
                    <Ruler className="h-3 w-3 text-neutral-400" />
                    <span>{talent.physical.height} CM</span>
                  </div>
                )}
              </div>

              <div className="absolute inset-x-0 bottom-0 p-7 z-30 flex flex-col justify-end">
                <div className="flex items-end justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {sortedCategories.slice(0, 2).map((cat: string, idx: number) => (
                        <span key={idx} className="text-[9px] uppercase font-mono tracking-widest font-black text-[#FFF] px-2 py-0.5 bg-[#3835A4] rounded-md group-hover:bg-[#C6007E]">
                          {cat}
                        </span>
                      ))}
                    </div>
                    <Link to={`/talent/${talent.username}`} className="block no-underline">
                      <h3 className="font-display text-2xl sm:text-3xl font-black text-white hover:text-[#C6007E] transition-colors leading-none">
                        {talent.firstName} {talent.lastName}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-bold">
                      <MapPin className="h-3.5 w-3.5 text-[#FFF] group-hover:text-[#FFF]" />
                      <span>{talent.city}{talent.country ? `, ${talent.country}` : ''}</span>
                    </div>
                  </div>

                    <div
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); setDetailTalent(talent); setDetailPhoto(talent.image); setBioExpanded(false); }}
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
                  disabled={pagination.page === 1} 
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} 
                  style={{ padding: '10px 20px', background: '#fff', border: '1px solid #ddd', borderRadius: '10px', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold', color: '#3835A4' }}
                >
                  Previous
                </button>
                <span style={{ padding: '10px', color: '#666', fontSize: '14px' }}>Page {pagination.page} of {pagination.totalPages}</span>
                <button 
                  disabled={pagination.page === pagination.totalPages} 
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} 
                  style={{ padding: '10px 20px', background: '#fff', border: '1px solid #ddd', borderRadius: '10px', cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer', fontWeight: 'bold', color: '#3835A4' }}
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
                    <div className="flex flex-wrap gap-1 mb-1">
                      {(detailTalent.categories || []).map((cat: string, idx: number) => (
                        <span key={idx} className="text-[10px] uppercase font-mono text-[#C6007E] font-bold tracking-wider">
                          {idx > 0 && ' • '} {cat}
                        </span>
                      ))}
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
    </div>
  );
};

export default BrowseTalents;