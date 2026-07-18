import { useState, useEffect, useRef, CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { getJobOptions, getPublicJobs } from '../../api/job.api';
import { useAuthStore } from '../../store/authStore';
import ApplicationPopup from '../../components/ApplicationPopup';
import { ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORY_IMAGES: Record<string, string> = {
  'Actors & Extras': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/actors_image.jpg',
  'Dancers': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/category.jpg',
  'Models': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/WhatsApp_Image_2024-10-11_at_3_22_56_PM.jpeg',
  'Photographers': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/2892613_8705625.jpg',
  'Makeup & Hairstylists': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/makeup.jpg',
  'Singers': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/singers.jpg',
  'Directors': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/Directors.jpg',
  'Cinematographers / Videographers': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/Videographers.jpg',
};

const DEFAULT_CATEGORY_IMAGE = 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/pexels-bertellifotografia-2608515.jpg';
const getCategoryImage = (name: string | undefined) => CATEGORY_IMAGES[name || ''] || DEFAULT_CATEGORY_IMAGE;

const stripHtml = (str: string) => str.replace(new RegExp('<[^>]*>', 'g'), '');

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

const DEFAULT_FILTERS = {
  status: 'all',
  sort: 'latest',
};

const daysUntil = (dateStr: string) => {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const truncate = (str: string, len: number) =>
  str && str.length > len ? str.slice(0, len) + '...' : str;

const formatBudget = (role: any): string | null => {
  if (!role?.payment) return null;
  const p = role.payment;
  switch (role.paymentType) {
    case 'per_hour': return p.hourBudgetPerHour ? `${p.hourBudgetPerHour} AED / HOUR` : null;
    case 'per_day': {
      if (p.dayBudgetFullDay && p.dayBudgetHalfDay) return `${p.dayBudgetFullDay} AED / DAY (Full) • ${p.dayBudgetHalfDay} AED / HALF DAY`;
      if (p.dayBudgetFullDay) return `${p.dayBudgetFullDay} AED / DAY`;
      if (p.dayBudgetHalfDay) return `${p.dayBudgetHalfDay} AED / HALF DAY`;
      return p.dayTotalBudget ? `${p.dayTotalBudget} AED` : null;
    }
    case 'per_week': return p.weekBudgetPerWeek ? `${p.weekBudgetPerWeek} AED / WEEK` : null;
    case 'per_month': return p.monthBudgetPerMonth ? `${p.monthBudgetPerMonth} AED / MONTH` : null;
    case 'package': return p.packageTotalBudget ? `${p.packageTotalBudget} AED` : null;
    default: return null;
  }
};

const shimmerStyle: CSSProperties = {
  background: 'linear-gradient(90deg, #1c1c24 25%, #2a2a35 50%, #1c1c24 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s ease-in-out infinite',
  borderRadius: '8px',
};

const SkeletonBlock = ({ width = '100%', height = '40px' }: { width?: string; height?: string } & { [key: string]: any }) => (
  <div style={{ ...shimmerStyle, width, height }} />
);

const JobCardSkeleton = () => (
  <div style={{
    borderRadius: '24px', overflow: 'hidden', background: '#111',
    border: '1.5px solid transparent', height: '320px',
  }}>
    <div style={{ ...shimmerStyle, width: '100%', height: '100%', borderRadius: 0 }} />
  </div>
);

const BrowseJobs = () => {
  const { user } = useAuthStore();
  const [options, setOptions] = useState<any>(null);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [draftFilters, setDraftFilters] = useState<any>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<any>(DEFAULT_FILTERS);
  const [quickJob, setQuickJob] = useState<any>(null);
  const [applyRole, setApplyRole] = useState<any>(null);
  const draftRef = useRef(draftFilters);
  draftRef.current = draftFilters;

  useEffect(() => {
    setOptionsLoading(true);
    getJobOptions()
      .then(res => setOptions(res.data.data))
      .finally(() => setOptionsLoading(false));
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getPublicJobs({ ...appliedFilters, page: pagination.page, limit: 12 });
        setJobs(res.data.data.data);
        setPagination(res.data.data.pagination);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [appliedFilters, pagination.page]);

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setAppliedFilters(draftRef.current);
  };

  const handleFilterChange = (key: string, value: any) => {
    setDraftFilters((prev: any) => ({ ...prev, [key]: value || undefined }));
  };

  const handleMultiChange = (key: string, id: string) => {
    setDraftFilters((prev: any) => {
      const current = prev[key] || [];
      return { ...prev, [key]: current.includes(id) ? current.filter((x: string) => x !== id) : [...current, id] };
    });
  };

  const handleAutoFilterChange = (key: string, value: any) => {
    const next = { ...draftRef.current, [key]: value || undefined };
    setDraftFilters(next);
    setPagination(prev => ({ ...prev, page: 1 }));
    setAppliedFilters(next);
  };

  const resetFilters = () => {
    const defaults = { ...DEFAULT_FILTERS };
    setDraftFilters(defaults);
    setAppliedFilters(defaults);
    draftRef.current = defaults;
    setPagination({ total: 0, page: 1, totalPages: 1 });
  };

  return (
    <div style={{ background: '#f4f4f6', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', margin: 0 }}>

      {/* TOP DARK FILTERS PANEL */}
      <div style={{ position: 'relative', background: '#111115', color: '#fff', padding: '24px 40px', borderBottom: '1px solid #222' }}>
        
        {/* BACKGROUND VIDEO */}
        <video autoPlay loop muted playsInline style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, opacity: 0.55 }}>
          <source src="https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/casting_video/casting_video_10107.mp4" type="video/mp4" />
        </video>
        {/* <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(17, 17, 21, 0.49) 0%, rgba(17,17,21,0.95) 100%)', zIndex: 1 }} /> */}

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900, letterSpacing: '-0.02em' }}>
              Browse Jobs
            </h2>
            <button onClick={resetFilters} style={{ fontSize: '12px', color: '#C6007E', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Reset All
            </button>
          </div>

          {optionsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                {Array.from({ length: 8 }).map((_, i) => <SkeletonBlock key={i} height="60px" />)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                {Array.from({ length: 6 }).map((_, i) => <SkeletonBlock key={i} height="40px" />)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', padding: '20px', background: '#16161f', borderRadius: '12px', border: '1px solid #262630' }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}><SkeletonBlock height="12px" width="60%" /><div style={{ marginTop: '8px' }}><SkeletonBlock height="40px" /></div></div>
                ))}
              </div>
            </div>
          ) : options && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Primary Core Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                <div>
                  {/* <span style={{ fontSize: '11px', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>CATEGORY</span> */}
                  <select value={draftFilters.categoryIds || ''} onChange={e => handleFilterChange('categoryIds', e.target.value)} style={{ width: '100%', background: '#1c1c24', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '8px', fontSize: '13px' }}>
                    <option value="">All Categories</option>
                    {options.categories?.filter((c: any) => c.name !== 'Additional Category').map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  {/* <span style={{ fontSize: '11px', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>GENDER</span> */}
                  <select value={draftFilters.gender || ''} onChange={e => handleFilterChange('gender', e.target.value)} style={{ width: '100%', background: '#1c1c24', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '8px', fontSize: '13px' }}>
                    <option value="">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div>
                  {/* <span style={{ fontSize: '11px', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>PAYMENT</span> */}
                  <select value={draftFilters.paymentType || ''} onChange={e => handleFilterChange('paymentType', e.target.value)} style={{ width: '100%', background: '#1c1c24', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '8px', fontSize: '13px' }}>
                    <option value="">All Payment</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>

                <div>
                  {/* <span style={{ fontSize: '11px', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>PROJECT TYPE</span> */}
                  <select value={draftFilters.projectTypeId || ''} onChange={e => handleFilterChange('projectTypeId', e.target.value)} style={{ width: '100%', background: '#1c1c24', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '8px', fontSize: '13px' }}>
                    <option value="">All Project Types</option>
                    {options.projectTypes?.map((pt: any) => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Age + Multi-select Filters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', padding: '20px', background: '#16161f', borderRadius: '12px', border: '1px solid #262630' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#888', fontWeight: 'bold', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>AGE PARAMETERS</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select value={draftFilters.ageFrom || ''} onChange={e => handleFilterChange('ageFrom', e.target.value)} style={{ width: '100%', background: '#1c1c24', color: '#fff', border: '1px solid #333', padding: '12px', borderRadius: '6px', fontSize: '12px' }}>
                      <option value="">Min Age</option>
                      {Array.from({ length: 101 }, (_, i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                    <select value={draftFilters.ageTo || ''} onChange={e => handleFilterChange('ageTo', e.target.value)} style={{ width: '100%', background: '#1c1c24', color: '#fff', border: '1px solid #333', padding: '8px', borderRadius: '6px', fontSize: '12px' }}>
                      <option value="">Max Age</option>
                      {Array.from({ length: 101 }, (_, i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                </div>

                <MultiSelectDropdown label="Country" options={options.countries || []} selected={draftFilters.countryIds || []} onToggle={(id) => handleMultiChange('countryIds', id)} />
                <MultiSelectDropdown label="Language" options={options.languages || []} selected={draftFilters.languageIds || []} onToggle={(id) => handleMultiChange('languageIds', id)} />
                <MultiSelectDropdown label="Nationality" options={options.nationalities || []} selected={draftFilters.nationalityIds || []} onToggle={(id) => handleMultiChange('nationalityIds', id)} />
              </div>

              <button
                onClick={applyFilters}
                style={{ background: '#3835A4', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', alignSelf: 'flex-start' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#C6007E'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#3835A4'}
              >
                Apply Filters
              </button>

            </div>
          )}

        </div>
      </div>

      {/* Count + Status Filter + Sort Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px 0', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, letterSpacing: '-0.02em', color: '#111' }}>
          {pagination.total > 0 && <span style={{ color: '#C6007E', marginRight: '3px' }}>{pagination.total}</span>} Matching Jobs Found
        </h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={draftFilters.status}
            onChange={e => handleAutoFilterChange('status', e.target.value)}
            style={{ background: '#fff', color: '#111', border: '1px solid #ddd', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}
          >
            <option value="all">All Jobs</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
          <select
            value={draftFilters.sort}
            onChange={e => handleAutoFilterChange('sort', e.target.value)}
            style={{ background: '#fff', color: '#111', border: '1px solid #ddd', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="most_viewed">Most Viewed</option>
          </select>
        </div>
      </div>

      {/* Job Cards Grid */}
      <div style={{ padding: '40px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : (
          <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {jobs.length === 0 ? (
                <p style={{ color: '#666' }}>No jobs found matching your criteria.</p>
              ) : (
                  jobs.map((job: any) => {
                  const firstRole = job.roles?.[0];
                  const daysLeft = job.lastDateToApply ? daysUntil(job.lastDateToApply) : null;
                  const isExpired = daysLeft !== null && daysLeft <= 0;

                  return (
                    <div
                      key={job.id}
                      className="bg-white flex flex-col rounded-[2.25rem] overflow-hidden border border-neutral-200 hover:border-[#3835A4]/40 hover:shadow-2xl transition-all duration-500 cursor-pointer h-full group relative"
                    >
                      <div className="relative h-56 w-full overflow-hidden bg-neutral-100 shrink-0">
                        <img
                          src={getCategoryImage(job.category?.name)}
                          alt={job.title}
                          className="h-full w-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-105 filter brightness-95 group-hover:brightness-90"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/75 via-neutral-950/25 to-transparent transition-opacity group-hover:via-neutral-950/30" />
                        <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
                          <span className="bg-white/95 backdrop-blur-md text-neutral-900 text-[9px] font-mono font-black tracking-[0.15em] uppercase px-3.5 py-1.5 rounded-xl shadow-md border border-neutral-200/50">
                            {job.category?.name || 'General'}
                          </span>
                          {job.paymentInfo && (
                            <span className="bg-gradient-to-r from-[#C6007E] to-[#3835A4] text-white text-[9px] font-mono font-black tracking-[0.15em] px-3.5 py-1.5 rounded-xl border border-white/10 shadow-lg">
                              {job.paymentInfo === 'paid' ? 'PAID' : 'UNPAID'}
                            </span>
                          )}
                        </div>
                        
                        {!isExpired && daysLeft !== null && (
                          <div className="absolute bottom-5 left-5 z-10 flex items-center gap-1.5 text-[9px] font-mono text-neutral-200 bg-neutral-950/80 backdrop-blur-md py-2 px-3.5 rounded-xl border border-white/10 shadow-sm font-bold">
                            <svg className="h-3.5 w-3.5 text-[#C6007E] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>EXPIRES IN {daysLeft} DAYS</span>
                          </div>
                        )}
                      </div>

                      <div className="p-8 flex flex-col flex-grow justify-between relative bg-white">
                        <div className="space-y-3">
                          <div className="flex items-center gap-1.5 text-[9px] text-neutral-400 tracking-wider uppercase font-black">
                            <svg className="h-3 w-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            <span>{job.company?.companyName || 'Company'}</span>
                            {job.company?.user?.isVerified && (
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            )}
                          </div>

                          <Link to={`/jobs/${job.id}`} className="no-underline">
                            <h3 className="font-display text-xl sm:text-2xl font-black text-neutral-900 hover:text-[#3835A4] transition-colors tracking-tight line-clamp-1 leading-tight">
                              {job.title || 'Untitled'}
                            </h3>
                          </Link>

                          <p className="text-xs text-neutral-500 line-clamp-3 leading-relaxed font-medium">
                            {job.description ? stripHtml(job.description) : ''}
                          </p>
                        </div>

                        <div className="pt-6 mt-6 border-t border-neutral-100 flex flex-col gap-4">
                          {job.castingCity && (
                            <div className="flex items-start gap-3.5 group/meta">
                              <div className="h-9 w-9 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-center text-neutral-500 shrink-0 group-hover/meta:border-neutral-900/40 transition-colors">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-xs text-neutral-900 font-extrabold tracking-wide">
                                  {job.castingCity.name}{job.castingCity.country ? `, ${job.castingCity.country.name}` : ''}
                                </span>
                              </div>
                            </div>
                          )}

                          {firstRole && (formatBudget(firstRole) || firstRole.paymentType) && (
                            <div className="flex items-start gap-3.5 group/meta">
                              <div className="h-9 w-9 rounded-xl bg-[#3835A4]/5 border border-[#3835A4]/10 flex items-center justify-center text-[#3835A4] shrink-0 group-hover/meta:border-[#3835A4] transition-colors">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-xs text-neutral-950 font-black font-mono tracking-wide">
                                  {formatBudget(firstRole) || firstRole.paymentType?.replace(/_/g, ' ').toUpperCase()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-6 mt-6 border-t border-dashed border-neutral-200 flex items-center justify-between">
                          <div>
                            {isExpired ? (
                              <span className="inline-flex items-center text-[9px] font-mono font-black bg-red-50 text-red-600 border border-red-200/60 px-2.5 py-1 rounded-lg tracking-wider">
                                EXPIRED
                              </span>
                            ) : (
                              <div className="w-1" />
                            )}
                          </div>

                          {!isExpired && (
                            <div
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!user) { alert('Please login to apply'); return; }
                                setQuickJob(job);
                              }}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <span className="text-[10px] font-mono font-black uppercase text-neutral-500 group-hover:text-[#3835A4] transition-colors duration-300">
                                Quick Apply
                              </span>
                              <div className="p-1.5 rounded-xl bg-neutral-50 border border-neutral-200/60 group-hover:bg-gradient-to-br group-hover:from-[#C6007E] group-hover:to-[#3835A4] group-hover:text-white group-hover:border-transparent transition-all duration-300">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                              </div>
                            </div>
                          )}
                          {isExpired && (
                            <span className="text-[10px] font-mono font-black uppercase text-neutral-500">
                              Application Closed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

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
          </>
        )}
      </div>

      {/* Quick Apply Popup */}
      {quickJob && !applyRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) setQuickJob(null); }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white z-10 border-b border-stone-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <h2 className="text-lg font-black tracking-tight text-[#3835A4]">{quickJob.title || 'Untitled'}</h2>
                <p className="text-xs text-stone-500 font-medium mt-0.5">{quickJob.company?.companyName || ''}</p>
              </div>
              <button onClick={() => setQuickJob(null)} className="text-stone-400 hover:text-stone-600 text-xl leading-none">&times;</button>
            </div>
            <div className="px-6 py-5 space-y-5">
              {quickJob.description && (
                <div>
                  <p className="text-[10px] font-extrabold tracking-widest text-stone-400 uppercase mb-2">Description</p>
                  <p className="text-sm text-stone-700 leading-relaxed">{stripHtml(quickJob.description).slice(0, 300)}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-extrabold tracking-widest text-stone-400 uppercase mb-3">
                  Roles ({quickJob.roles?.length || 0})
                </p>
                <div className="space-y-2">
                  {(quickJob.roles || []).map((role: any) => (
                    <div key={role.id} className="flex items-center justify-between bg-stone-50 rounded-xl px-4 py-3 border border-stone-100">
                      <div>
                        <p className="text-sm font-bold text-[#3835A4]">{role.title || 'Untitled Role'}</p>
                        <p className="text-[10px] text-stone-500">
                          {role.gender && `${role.gender} · `}{role.ageMin && `${role.ageMin}${role.ageMax ? `-${role.ageMax}` : '+'} yrs`}
                          {role.noOfCast && ` · ${role.noOfCast} talent${role.noOfCast > 1 ? 's' : ''}`}
                        </p>
                      </div>
                      <button
                        onClick={() => setApplyRole(role)}
                        className="bg-[#C6007E] text-white px-4 py-2 rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-[#a10065] transition-all whitespace-nowrap ml-3"
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Application Popup */}
      {applyRole && (
        <ApplicationPopup
          jobId={quickJob?.id}
          role={applyRole}
          isExpired={false}
          onClose={() => setApplyRole(null)}
          onApplied={() => { setApplyRole(null); setQuickJob(null); }}
        />
      )}
    </div>
  );
};

export default BrowseJobs;