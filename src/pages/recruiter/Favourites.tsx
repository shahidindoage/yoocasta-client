import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, X } from 'lucide-react';
import { getFavourites, removeFavourite } from '../../api/favourites.api';
import { getTalentFilterOptions } from '../../api/talent.api';

const MultiSelectDropdown = ({
  label, options, selected, onToggle,
}: {
  label: string; options: { id: string; name: string }[]; selected: string[]; onToggle: (id: string) => void;
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

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <span style={{ fontSize: '11px', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>
        {label.toUpperCase()}
      </span>
      <div
        onClick={() => setOpen(!open)}
        style={{
          background: '#1c1c24', color: selected.length ? '#fff' : '#888', border: '1px solid #333', padding: '12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <span>{selected.length === 0 ? `All ${label}` : `${selected.length} selected`}</span>
        <span>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#1c1c24', border: '1px solid #333', borderRadius: '6px', marginTop: '4px', padding: '4px', maxHeight: '220px', overflowY: 'auto' }}>
          {options.map(o => (
            <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', cursor: 'pointer', borderRadius: '4px', color: '#ccc', fontSize: '13px', background: selected.includes(o.id) ? '#333' : 'transparent' }}>
              <input type="checkbox" checked={selected.includes(o.id)} onChange={() => onToggle(o.id)} style={{ accentColor: '#C6007E' }} />
              {o.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const TalentCardSkeleton = () => (
  <div className="snap-start group relative h-[520px] w-full shrink-0 rounded-[2.25rem] overflow-hidden bg-neutral-800 animate-pulse" />
);

export default function Favourites() {
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<any>(null);

  const [search, setSearch] = useState('');
  const [nationalities, setNationalities] = useState<string[]>([]);
  const [gender, setGender] = useState('');
  const [ageFrom, setAgeFrom] = useState<number | ''>('');
  const [ageTo, setAgeTo] = useState<number | ''>('');

  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedNationalities, setAppliedNationalities] = useState<string[]>([]);
  const [appliedGender, setAppliedGender] = useState('');
  const [appliedAgeFrom, setAppliedAgeFrom] = useState<number | ''>('');
  const [appliedAgeTo, setAppliedAgeTo] = useState<number | ''>('');

  const fetchFavourites = async (params?: any) => {
    setLoading(true);
    try {
      const res = await getFavourites(params);
      setTalents(res.data.data?.data || res.data.data || []);
    } catch (err) {
      console.error(err);
      setTalents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTalentFilterOptions().then(res => setOptions(res.data.data)).catch(() => {});
    fetchFavourites();
  }, []);

  const applyFilters = () => {
    setAppliedSearch(search);
    setAppliedNationalities(nationalities);
    setAppliedGender(gender);
    setAppliedAgeFrom(ageFrom);
    setAppliedAgeTo(ageTo);
    fetchFavourites({
      search: search || undefined,
      nationalities: nationalities.length ? nationalities : undefined,
      gender: gender || undefined,
      ageFrom: ageFrom || undefined,
      ageTo: ageTo || undefined,
    });
  };

  const resetFilters = () => {
    setSearch('');
    setNationalities([]);
    setGender('');
    setAgeFrom('');
    setAgeTo('');
    setAppliedSearch('');
    setAppliedNationalities([]);
    setAppliedGender('');
    setAppliedAgeFrom('');
    setAppliedAgeTo('');
    fetchFavourites();
  };

  const handleRemove = async (talentUserId: string) => {
    try {
      await removeFavourite(talentUserId);
      setTalents(prev => prev.filter(t => t.id !== talentUserId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ background: '#f4f4f6', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', margin: 0 }}>
      <div style={{ position: 'relative', background: '#111115', color: '#fff', padding: '24px 40px', borderBottom: '1px solid #222' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900, letterSpacing: '-0.02em' }}>
              Favourite List ({talents.length})
            </h2>
            <button onClick={resetFilters} style={{ fontSize: '12px', color: '#C6007E', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Reset
            </button>
          </div>

          {options && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>SEARCH</span>
                <input
                  type="text"
                  placeholder="Search by name or description..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: '100%', background: '#1c1c24', color: '#fff', border: '1px solid #333', padding: '12px', borderRadius: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <MultiSelectDropdown
                label="Nationality"
                options={options.nationalities || []}
                selected={nationalities}
                onToggle={(id) => setNationalities(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
              />

              <div>
                <span style={{ fontSize: '11px', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>GENDER</span>
                <select value={gender} onChange={e => setGender(e.target.value)} style={{ width: '100%', background: '#1c1c24', color: '#fff', border: '1px solid #333', padding: '12px', borderRadius: '6px', fontSize: '12px', outline: 'none' }}>
                  <option value="">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>AGE</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select value={ageFrom} onChange={e => setAgeFrom(e.target.value ? parseInt(e.target.value as string) : '')} style={{ width: '100%', background: '#1c1c24', color: '#fff', border: '1px solid #333', padding: '12px', borderRadius: '6px', fontSize: '12px', outline: 'none' }}>
                    <option value="">Min</option>
                    {Array.from({ length: 101 }, (_, i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                  <select value={ageTo} onChange={e => setAgeTo(e.target.value ? parseInt(e.target.value as string) : '')} style={{ width: '100%', background: '#1c1c24', color: '#fff', border: '1px solid #333', padding: '12px', borderRadius: '6px', fontSize: '12px', outline: 'none' }}>
                    <option value="">Max</option>
                    {Array.from({ length: 101 }, (_, i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <button
                  onClick={applyFilters}
                  style={{ flex: 1, background: '#3835A4', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#C6007E'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#3835A4'}
                >
                  Apply Filters
                </button>
                <button
                  onClick={resetFilters}
                  style={{ background: '#333', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#555'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#333'}
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '40px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '30px' }}>
            {Array.from({ length: 4 }).map((_, i) => <TalentCardSkeleton key={i} />)}
          </div>
        ) : talents.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '60px 0' }}>
            No favourites yet. Browse talents and click the heart icon to add them here.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '30px' }}>
            {talents.map((talent: any) => (
              <div
                key={talent.id}
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

                <div className="absolute top-6 left-6 right-6 flex items-start justify-between z-30">
                  {talent.plan === 'premium' || talent.plan === 'PREMIUM' ? (
                    <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#C6007E] to-[#3835A4] text-white text-[9px] uppercase font-mono font-black tracking-[0.2em] px-3.5 py-1.5 rounded-xl shadow-lg">
                      <svg className="h-3 w-3 fill-current text-white" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      <span>PREMIUM</span>
                    </div>
                  ) : <div />}
                  <button
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleRemove(talent.id); }}
                    className="p-2.5 rounded-full bg-neutral-950/60 backdrop-blur-md border border-white/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                    title="Remove from favourites"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-7 z-30 flex flex-col justify-end">
                  <div className="flex items-end justify-between gap-4">
                    <div className="space-y-2">
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
