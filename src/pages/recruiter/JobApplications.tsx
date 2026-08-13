import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { getJobApplications, bulkUpdateStatus } from '../../api/application.api';
import { getCastBags, addTalentsToBag, createCastBag } from '../../api/castBag.api';
import { getFavouriteIds, addFavourite, removeFavourite } from '../../api/favourites.api';
import { getMyJobs } from '../../api/job.api';
import { sendInvitation } from '../../api/invitations.api';
import { useAuthStore } from '../../store/authStore';
import { MapPin, Heart } from 'lucide-react';

const parseIds = (val: string | null | undefined): string[] => {
  if (!val) return [];
  try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; }
  catch { return []; }
};

const isMatching = (role: any, talent: any): boolean => {
  if (!role || !talent) return true;

  // Gender
  if (role.gender && role.gender !== 'any' && talent.gender && role.gender.toLowerCase() !== talent.gender.toLowerCase()) {
    return false;
  }

  // Age
  if (role.ageMin != null && talent.age != null && talent.age < role.ageMin) return false;
  if (role.ageMax != null && talent.age != null && talent.age > role.ageMax) return false;

  // Ethnicity
  if (!role.ethnicityAll && role.ethnicity) {
    const ethnicIds = parseIds(role.ethnicity);
    if (ethnicIds.length > 0 && talent.ethnicityId && !ethnicIds.includes(talent.ethnicityId)) {
      return false;
    }
  }

  // Nationality
  if (!role.nationalityAll && role.nationality) {
    const natIds = parseIds(role.nationality);
    if (natIds.length > 0 && talent.nationalityId && !natIds.includes(talent.nationalityId)) {
      return false;
    }
  }

  // Languages
  if (role.languageSpoken) {
    const langIds = parseIds(role.languageSpoken);
    if (langIds.length > 0 && talent.languageIds) {
      const hasAny = langIds.some((id: string) => talent.languageIds.includes(id));
      if (!hasAny) return false;
    }
  }

  // Location
  if (role.locationCityId && talent.cityId && role.locationCityId !== talent.cityId) {
    return false;
  }

  return true;
};

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

const statusColors: Record<string, string> = {
  APPLIED: '#3835A4',
  UNDER_REVIEW: '#E8B923',
  SHORTLISTED: '#C6007E',
  SELECTED: '#16a34a',
  REJECTED: '#dc2626',
};

const STATUS_ACTIONS = [
  { key: 'UNDER_REVIEW', label: 'Under Review', color: '#E8B923' },
  { key: 'SHORTLISTED', label: 'Shortlist', color: '#C6007E' },
  { key: 'SELECTED', label: 'Select', color: '#16a34a' },
  { key: 'REJECTED', label: 'Reject', color: '#dc2626' },
];

const STATUS_DEFAULTS: Record<string, { subject: string; body: string }> = {
  UNDER_REVIEW: {
    subject: 'Application Under Review — {jobTitle} — Yoocasta',
    body: 'Your application for the role of {roleTitle} in {jobTitle} is now under review. We will update you once a decision has been made. Thank you for your interest.',
  },
  SHORTLISTED: {
    subject: 'Congratulations — Shortlisted for {jobTitle}! — Yoocasta',
    body: 'We are pleased to inform you that you have been shortlisted for the role of {roleTitle} in {jobTitle}. We will contact you shortly with further details regarding the next steps.',
  },
  SELECTED: {
    subject: 'Congratulations — Selected for {jobTitle}! — Yoocasta',
    body: 'We are delighted to inform you that you have been selected for the role of {roleTitle} in {jobTitle}. Our team will reach out to you soon with the contract and further instructions.',
  },
  REJECTED: {
    subject: 'Application Status Update — {jobTitle} — Yoocasta',
    body: 'Thank you for your interest in the role of {roleTitle} in {jobTitle}. After careful consideration, we regret to inform you that your application has not been selected for this role. We encourage you to apply for future opportunities that match your profile.',
  },
};

const JobApplications = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [matchFilter, setMatchFilter] = useState<string>('all');
  const initialStatus = searchParams.get('status') || 'all';
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modalStatus, setModalStatus] = useState<string | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);

  const [filteredApplications, setFilteredApplications] = useState<any[]>([]);

  // BrowseTalents-style helpers
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

  const getSelectedTalentIds = (): string[] => {
    const apps = (data?.applications || []).filter((a: any) => selectedIds.has(a.id));
    return apps.map((a: any) => a.talent.id);
  };

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    getJobApplications(jobId)
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [jobId]);

  useEffect(() => {
    const s = searchParams.get('status');
    if (s && ['SHORTLISTED', 'SELECTED', 'REJECTED'].includes(s)) setStatusFilter(s);
    else setStatusFilter('all');
  }, [searchParams]);

  useEffect(() => {
    if (!data) { setFilteredApplications([]); return; }
    const { job, applications } = data;
    const roles = job.roles || [];
    const roleFiltered = selectedRole === 'all'
      ? applications
      : applications.filter((app: any) => app.role.id === selectedRole);
    const matchResult = roleFiltered.filter((app: any) => {
      if (matchFilter === 'all') return true;
      const role = roles.find((r: any) => r.id === app.role.id);
      const match = isMatching(role, app.talent);
      return matchFilter === 'matching' ? match : !match;
    });
    const result = statusFilter === 'all'
      ? matchResult
      : matchResult.filter((app: any) => app.status === statusFilter);
    setFilteredApplications(result);
    setSelectedIds(new Set());
  }, [data, selectedRole, matchFilter, statusFilter]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openModal = (statusKey: string) => {
    const jobTitle = data?.job?.title || 'a role';
    const selectedApps = data?.applications?.filter((a: any) => selectedIds.has(a.id)) || [];
    const roleTitles: string[] = [...new Set(selectedApps.map((a: any) => a.role?.title).filter(Boolean))] as string[];
    const roleTitle: string = roleTitles.length === 1 ? roleTitles[0] : roleTitles.join(', ');
    const defaults = STATUS_DEFAULTS[statusKey] || { subject: '', body: '' };
    setModalStatus(statusKey);
    setEmailSubject(defaults.subject.replace(/\{jobTitle\}/g, jobTitle));
    setEmailBody(defaults.body.replace(/\{roleTitle\}/g, roleTitle).replace(/\{jobTitle\}/g, jobTitle));
  };

  const handleSend = async () => {
    if (!modalStatus || selectedIds.size === 0) return;
    setSending(true);
    try {
      await bulkUpdateStatus(Array.from(selectedIds), modalStatus, emailSubject, emailBody);
      const updated = [...(data?.applications || [])];
      for (const app of updated) {
        if (selectedIds.has(app.id)) {
          app.status = modalStatus;
        }
      }
      setData({ ...data, applications: updated });
      setSelectedIds(new Set());
      setModalStatus(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-[#3835A4]">
        <div className="animate-pulse text-xs font-black tracking-widest uppercase">Loading Applications Ledger...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-[#3835A4]">
        <p className="text-sm font-bold">Job not found.</p>
      </div>
    );
  }

  const { job, applications } = data;
  const roles = job.roles || [];

  return (
    <div className="min-h-screen bg-neutral-50 text-[#3835A4] font-sans p-4 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-8 pb-24">

        {/* Back navigation */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard/recruiter/jobs')} className="text-[10px] font-black tracking-widest uppercase text-[#3835A4]/40 hover:text-[#C6007E] transition-colors">
            ← Back to Jobs
          </button>
        </div>

        {/* Job Header Card with Category Image */}
        <div className="bg-white border-2 border-[#3835A4]/10 rounded-2xl overflow-hidden shadow-sm">
          {(() => {
            const img = job.image || getCategoryImage(job.category?.name);
            return (
              <div
                className="h-40 md:h-48 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${img})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase text-white">
                    {job.title || 'Untitled Job'}
                  </h1>

                  <div className="flex flex-wrap gap-4 text-xs font-bold text-white/60 mt-3">
                    {job.location && (
                      <span className="flex items-center gap-1">📍 {job.location}</span>
                    )}
                    <span className="flex items-center gap-1">🎭 {roles.length} Role{roles.length !== 1 ? 's' : ''}</span>
                    <span className="flex items-center gap-1">📥 {applications.length} Application{applications.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Filters */}
        <div className="bg-white border border-[#3835A4]/10 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-20 items-start lg:items-center ">

            {/* Filter by Role */}
            <div className="w-full lg:w-auto space-y-1 min-w-[200px]">
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="w-full bg-[#3835A4]/5 border border-[#3835A4]/10 rounded-lg p-2 text-sm font-bold text-[#3835A4] outline-none cursor-pointer"
              >
                <option value="all">All Roles ({applications.length})</option>
                {roles.map((role: any) => (
                  <option key={role.id} value={role.id}>
                    {role.title} ({role.applicationsCount})
                  </option>
                ))}
              </select>
            </div>

            {/* Matching Filter */}
            <div className="space-y-1">
              <div className="flex gap-5">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'matching', label: 'Matching' },
                  { value: 'not_matching', label: 'Not Matching' },
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="matchFilter"
                      value={opt.value}
                      checked={matchFilter === opt.value}
                      onChange={e => setMatchFilter(e.target.value)}
                      className="accent-[#C6007E]"
                    />
                    <span className="text-xs font-bold text-[#3835A4]">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-1">
              <div className="flex gap-5">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'SHORTLISTED', label: 'Shortlisted', color: statusColors.SHORTLISTED },
                  { value: 'SELECTED', label: 'Selected', color: statusColors.SELECTED },
                  { value: 'REJECTED', label: 'Rejected', color: statusColors.REJECTED },
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="statusFilter"
                      value={opt.value}
                      checked={statusFilter === opt.value}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="accent-[#C6007E]"
                    />
                    <span className="text-xs font-bold" style={{ color: opt.color || '#3835A4' }}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Talent Cards Grid */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-16 text-sm font-bold text-[#3835A4]/40">
            No applications found for this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredApplications.map((app: any) => {
              const t = app.talent;
              const isHovered = hoveredCardId === app.id;
              const isChecked = selectedIds.has(app.id);

              return (
                <div
                  key={app.id}
                  onMouseEnter={() => setHoveredCardId(app.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  className="snap-start group relative h-[520px] w-full shrink-0 rounded-[2.25rem] overflow-hidden cursor-pointer bg-neutral-950 border border-neutral-200/90 shadow-lg hover:shadow-2xl transition-all duration-500"
                >
                  <div className="absolute inset-3 border border-white/10 rounded-[1.75rem] pointer-events-none z-20 transition-all duration-500 group-hover:inset-2.5 group-hover:border-[#C6007E]/35" />

                  <div className="absolute inset-0 h-full w-full">
                    <img
                      src={t.image || 'https://via.placeholder.com/400x600?text=No+Photo'}
                      alt={t.firstName}
                      className="h-full w-full object-cover transition-transform duration-1000 ease-out scale-100 group-hover:scale-105 filter brightness-95 group-hover:brightness-[0.82]"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent to-20% z-10" />

                    {/* Hover actions — Add to Cast Bag + Invite to Apply */}
                    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center gap-3 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setCastBagTalent(t);
                          setSelectedBagIds([]);
                          setCastBagMsg('');
                          setNewBagName('');
                          refreshCastBags();
                        }}
                        className="pointer-events-auto px-8 py-4 rounded-2xl bg-[#C6007E] text-white font-mono text-sm font-black tracking-widest uppercase shadow-xl hover:bg-[#a10065] transition-colors cursor-pointer"
                      >
                        Add to Cast Bag
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setInviteTalent(t);
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
                        className="pointer-events-auto px-8 py-4 rounded-2xl bg-[#3835A4] text-white font-mono text-sm font-black tracking-widest uppercase shadow-xl hover:bg-[#C6007E] transition-colors cursor-pointer"
                      >
                        Invite to Apply
                      </div>
                      <Link
                        to={`/dashboard/recruiter/applications/${app.id}`}
                        className="pointer-events-auto px-8 py-4 rounded-2xl bg-white/10 border border-white/30 text-white font-mono text-sm font-black tracking-widest uppercase shadow-xl hover:bg-[#C6007E] transition-colors cursor-pointer"
                      >
                        Application Details
                      </Link>
                    </div>
                  </div>

                  <div className="absolute top-6 left-6 right-6 flex items-start z-30">
                    <div className="flex items-center gap-2">
                      <div
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleSelect(app.id); }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer border-2 ${
                          isChecked
                            ? 'bg-[#C6007E] border-[#C6007E] text-white opacity-100'
                            : 'bg-white/20 border-white/40 text-white opacity-0 group-hover:opacity-100 hover:bg-white/30'
                        }`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          {isChecked
                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            : <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          }
                        </svg>
                      </div>
                      {t.plan === 'premium' || t.plan === 'PREMIUM' ? (
                        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#C6007E] to-[#3835A4] text-white text-[9px] uppercase font-mono font-black tracking-[0.2em] px-3.5 py-1.5 rounded-xl shadow-lg">
                          <svg className="h-3 w-3 fill-current text-white" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                          <span>PREMIUM</span>
                        </div>
                      ) : <div />}
                    </div>
                    <div className="ml-auto flex items-center">
                      <div className="relative flex items-center">
                        {/* Status pill — visible by default, hidden on hover */}
                        <div
                          className="flex items-center gap-1 text-white px-2 py-0.5 rounded-lg opacity-100 group-hover:opacity-0 transition-opacity duration-300"
                          style={{ background: statusColors[app.status] || '#666' }}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-[10px] font-mono font-bold">{app.status.replace(/_/g, ' ')}</span>
                        </div>

                        {/* Hover actions — Z Card + Heart */}
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
                                  body: JSON.stringify({ talentIds: [t.id] }),
                                });
                                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                                const blob = await res.blob();
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `zcard-${t.firstName || t.id}.pdf`;
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
                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleFavourite(t.id); }}
                            className={`p-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                              favouriteIds.includes(t.id) ? 'text-red-500' : 'text-white hover:text-red-400'
                            }`}
                            title={favouriteIds.includes(t.id) ? 'Remove from favourites' : 'Add to favourites'}
                          >
                            <Heart className={`h-7 w-7 ${favouriteIds.includes(t.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-7 z-30 flex flex-col justify-end">
                    <div className="flex items-end justify-between gap-4">
                      <div className="space-y-2">
                        <Link to={`/talent/${t.username}`} className="block no-underline">
                          <h3 className="font-display text-2xl sm:text-3xl font-black text-white hover:text-[#C6007E] transition-colors leading-none">
                            {t.firstName}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-bold">
                          <MapPin className="h-3.5 w-3.5 text-[#FFF]" />
                          <span>{t.city}{t.nationality ? `, ${t.nationality}` : ''}</span>
                          {t.age && <span>• {t.age} yrs</span>}
                        </div>
                        <div className="text-[10px] text-[#C6007E] font-bold">
                          Applied for: {app.role.title}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Z Card Loading Overlay */}
        {zCardLoading && (
          <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-12 h-12 border-4 border-[#C6007E] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white font-mono text-sm font-bold tracking-widest uppercase">Generating Z Card...</p>
          </div>
        )}

        {/* Bottom Action Tray */}
        {selectedIds.size > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-[#C6007E]/15 backdrop-blur-md border-t border-[#C6007E]/20">
            <div className="flex items-center gap-3 py-8 px-4 w-full justify-center flex-wrap">
              <span className="text-white text-sm font-bold font-mono">
                {selectedIds.size} talent{selectedIds.size > 1 ? 's' : ''} selected
              </span>
              <div className="h-6 w-px bg-white/10" />
              <button
                onClick={() => {
                  const ids = getSelectedTalentIds();
                  setCastBagTalent({ ids, name: `${ids.length} talents` });
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
                  const ids = getSelectedTalentIds();
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
                  const ids = getSelectedTalentIds();
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
                  const ids = getSelectedTalentIds();
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
              <button
                onClick={() => openModal('UNDER_REVIEW')}
                className="px-5 py-2.5 rounded-xl bg-[#E8B923] text-white font-mono text-xs font-black tracking-widest uppercase hover:opacity-80 transition-opacity"
              >
                Application Status Update
              </button>
              <div className="h-6 w-px bg-white/10" />
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-white/70 font-mono text-xs font-black tracking-widest uppercase hover:bg-white/20 hover:text-white transition-colors"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}

        {/* Status Change Modal */}
        {modalStatus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={e => { if (e.target === e.currentTarget) setModalStatus(null); }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-5" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black tracking-tight text-[#3835A4] uppercase">
                  {STATUS_ACTIONS.find(a => a.key === modalStatus)?.label || modalStatus.replace(/_/g, ' ')}
                </h2>
                <button onClick={() => setModalStatus(null)} className="text-stone-400 hover:text-stone-600 text-xl leading-none">&times;</button>
              </div>

              {/* Status selection */}
              <div className="flex flex-wrap gap-2">
                {STATUS_ACTIONS.map(action => (
                  <button
                    key={action.key}
                    onClick={() => openModal(action.key)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${
                      modalStatus === action.key ? 'text-white shadow-lg' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                    }`}
                    style={modalStatus === action.key ? { background: action.color } : {}}
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold tracking-widest uppercase text-[#3835A4]/50">Subject</label>
                <input
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-sm font-medium text-[#3835A4] outline-none focus:border-[#C6007E]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold tracking-widest uppercase text-[#3835A4]/50">Email Body</label>
                <textarea
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  rows={8}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-sm text-[#3835A4] outline-none focus:border-[#C6007E] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setModalStatus(null)}
                  className="flex-1 border-2 border-stone-200 text-stone-500 text-xs font-black tracking-widest uppercase py-3 rounded-xl hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || !emailSubject || !emailBody}
                  className="flex-1 bg-[#C6007E] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black tracking-widest uppercase py-3 rounded-xl hover:bg-[#a10065] transition-colors flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}

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
    </div>
  );
};

export default JobApplications;
