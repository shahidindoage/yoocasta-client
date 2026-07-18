import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJobApplications, bulkUpdateStatus } from '../../api/application.api';

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
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [matchFilter, setMatchFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modalStatus, setModalStatus] = useState<string | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);

  const [filteredApplications, setFilteredApplications] = useState<any[]>([]);

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    getJobApplications(jobId)
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [jobId]);

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

  const selectAll = () => {
    if (selectedIds.size === filteredApplications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredApplications.map((a: any) => a.id)));
    }
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
            const img = getCategoryImage(job.category?.name);
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
              {/* <label className="text-[9px] font-bold tracking-widest uppercase text-[#3835A4]/50">Filter by Role</label> */}
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
              {/* <span className="text-[9px] font-bold tracking-widest uppercase text-[#3835A4]/50 block">Matching Filter</span> */}
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
              {/* <span className="text-[9px] font-bold tracking-widest uppercase text-[#3835A4]/50 block">Status Filter</span> */}
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

            {/* Talent count */}
            {/* <div className="text-xs text-[#3835A4]/40 font-medium ml-auto whitespace-nowrap">
              {filteredApplications.length} talent{filteredApplications.length !== 1 ? 's' : ''} found
            </div> */}
          </div>
        </div>

        {/* Select All + Count */}
        {filteredApplications.length > 0 && (
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.size === filteredApplications.length && filteredApplications.length > 0}
                onChange={selectAll}
                className="w-4 h-4 accent-[#C6007E]"
              />
              <span className="text-xs font-bold text-[#3835A4]">Select All ({filteredApplications.length})</span>
            </label>
            {selectedIds.size > 0 && (
              <span className="text-[10px] font-bold text-[#C6007E]">{selectedIds.size} selected</span>
            )}
          </div>
        )}

        {/* Talent Cards Grid */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-16 text-sm font-bold text-[#3835A4]/40">
            No applications found for this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.map((app: any) => {
              const t = app.talent;
              const isHovered = hoveredCardId === app.id;
              const themeColor = t.gender === 'female' ? '#C6007E' : '#3835A4';
              const isChecked = selectedIds.has(app.id);
              return (
                <div
                  key={app.id}
                  className={`relative rounded-2xl overflow-hidden bg-white border-2 shadow-sm hover:shadow-xl transition-all duration-300 ${
                    isChecked ? 'border-[#C6007E] ring-2 ring-[#C6007E]/30' : 'border-[#3835A4]/10'
                  }`}
                  onMouseEnter={() => setHoveredCardId(app.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  style={{ transform: isHovered ? 'translateY(-4px)' : 'none' }}
                >
                  {/* Photo */}
                  <div className="relative h-64 overflow-hidden bg-[#111]">
                    {/* Checkbox */}
                    <div className="absolute top-3 left-3 z-20">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(app.id)}
                        className="w-4 h-4 accent-[#C6007E] cursor-pointer"
                      />
                    </div>

                    <img
                      src={t.image || 'https://via.placeholder.com/400x500?text=No+Photo'}
                      alt={t.firstName}
                      className="w-full h-full object-cover"
                      style={{ opacity: isHovered ? 0.65 : 0.85, transition: 'opacity 0.3s' }}
                    />

                    {/* Plan Badge */}
                    <div className="absolute top-3 left-9 z-10">
                      {t.plan === 'premium' ? (
                        <span className="bg-gradient-to-r from-[#C6007E] to-[#3835A4] text-white text-[8px] font-black px-3 py-1.5 rounded-full tracking-wider uppercase shadow-lg">
                          ★ Premium
                        </span>
                      ) : (
                        <span className="bg-neutral-900/70 text-neutral-300 text-[8px] font-black px-3 py-1.5 rounded-full tracking-wider uppercase border border-white/10">
                          Basic
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <span
                        className="text-white text-[8px] font-black px-2.5 py-1.5 rounded-full tracking-wider uppercase shadow-lg"
                        style={{ background: statusColors[app.status] || '#666' }}
                      >
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Bottom gradient */}
                    <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-[#0b0b0d] via-[#0b0b0d]/60 to-transparent z-[1]" />

                    {/* Bottom content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-[2] space-y-2">
                      {/* <div className="flex flex-wrap gap-1.5">
                        {t.categories?.slice(0, 2).map((cat: string) => (
                          <span
                            key={cat}
                            className="text-[7px] font-black text-white px-2 py-1 rounded uppercase tracking-wider"
                            style={{ background: themeColor }}
                          >
                            {cat}
                          </span>
                        ))}
                      </div> */}

                      <h3 className="text-white font-black text-lg tracking-tight flex items-center gap-1.5">
                        {t.firstName} {t.lastName}
                        {t.isVerified && <span className="text-xs">✅</span>}
                      </h3>

                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-neutral-400 font-medium">
                        {t.city && <span>📍 {t.city}{t.nationality ? `, ${t.nationality}` : ''}</span>}
                        {t.age && <span>• {t.age} yrs</span>}
                      </div>

                      <div className="text-[10px] text-[#C6007E] font-bold">
                        Applied for: {app.role.title}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="p-3 flex gap-2">
                    <Link
                      to={`/dashboard/recruiter/applications/${app.id}`}
                      className="flex-1 text-center bg-[#3835A4] text-white text-[9px] font-black tracking-widest uppercase py-2.5 rounded-xl hover:bg-[#2a2899] transition-colors"
                    >
                      Application Details
                    </Link>
                    <Link
                      to={`/talent/${t.username}`}
                      className="px-4 bg-[#3835A4]/5 text-[#3835A4] text-[9px] font-black tracking-widest uppercase py-2.5 rounded-xl hover:bg-[#3835A4]/10 transition-colors border border-[#3835A4]/10"
                    >
                      Profile
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Action Tray */}
        {selectedIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white border-2 border-[#3835A4]/20 rounded-2xl shadow-2xl p-4 flex flex-wrap items-center justify-between gap-4 min-w-[320px] max-w-[90vw]">
            <span className="text-xs font-bold text-[#3835A4]">{selectedIds.size} talent{selectedIds.size > 1 ? 's' : ''} selected</span>
            <div className="flex flex-wrap gap-2">
              {STATUS_ACTIONS.map(action => (
                <button
                  key={action.key}
                  onClick={() => openModal(action.key)}
                  className="text-white text-[9px] font-black tracking-widest uppercase px-5 py-2.5 rounded-xl hover:opacity-80 transition-all"
                  style={{ background: action.color }}
                >
                  {action.label}
                </button>
              ))}
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
      </div>
    </div>
  );
};

export default JobApplications;
