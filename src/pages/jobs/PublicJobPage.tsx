import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Eye, Users, Briefcase, Clock } from 'lucide-react';
import { getPublicJobById } from '../../api/job.api';
import { getMyApplications } from '../../api/application.api';
import { getMyProfile } from '../../api/profile.api';
import { useAuthStore } from '../../store/authStore';
import ApplicationPopup from '../../components/ApplicationPopup';

const formatDate = (d: string | Date) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const parseJsonArray = (val: string | null | undefined | any[]): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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

const getCategoryImage = (categoryName: string) => {
  return CATEGORY_IMAGES[categoryName] || DEFAULT_CATEGORY_IMAGE;
};

const PublicJobPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyRole, setApplyRole] = useState<any>(null);
  const [appliedRoleIds, setAppliedRoleIds] = useState<string[]>([]);
  const [limitReached, setLimitReached] = useState(false);
  const [userPlan, setUserPlan] = useState<string | null>(user?.role === 'TALENT' ? 'basic' : null);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!jobId) return;
    if (hasFetched.current) return;
    hasFetched.current = true;

    getPublicJobById(jobId)
      .then(res => setJob(res.data.data))
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Job not found or has been removed';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [jobId]);

  useEffect(() => {
    if (!user || user.role !== 'TALENT') return;
    Promise.all([getMyApplications(), getMyProfile()]).then(([appsRes, profileRes]) => {
      const apps = appsRes.data.data || [];
      const roleIds = apps.map((a: any) => a.roleId);
      setAppliedRoleIds(roleIds);
      const plan = profileRes.data.data?.subscription?.plan;
      setUserPlan(plan?.name || 'Basic');
      const maxJobsPerMonth = plan?.maxJobsPerMonth ?? 1;
      if (maxJobsPerMonth < 999) {
        const now = new Date();
        const thisMonthCount = apps.filter((a: any) => {
          const d = new Date(a.createdAt);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
        if (thisMonthCount >= maxJobsPerMonth) setLimitReached(true);
      }
    }).catch(console.error);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfbf7]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#008dc9] border-t-[#ff24b0] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black font-mono text-[#008dc9]">GO</div>
        </div>
        <span className="mt-4 text-[9px] font-black tracking-[0.3em] text-[#008dc9]/60 capitalize font-mono animate-pulse">
          Loading Creative Brief...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4">
        <div className="bg-white border-4 border-[#008dc9] p-8 rotate-1 max-w-md text-center space-y-4 shadow-[8px_8px_0px_0px_#ff24b0]">
          <span className="text-4xl block animate-bounce">⚡</span>
          <p className="text-sm font-black text-[#008dc9] tracking-wider capitalize font-mono bg-red-100 px-2 py-1 inline-block">
            {error}
          </p>
          <Link to="/" className="block text-[10px] font-black tracking-widest capitalize bg-[#008dc9] text-white px-6 py-3 transition-transform active:scale-95 hover:-translate-y-0.5">
            ← Return to Hub
          </Link>
        </div>
      </div>
    );
  }

  if (!job) return null;

  if (user?.role !== 'ADMIN') {
    if (job.status === 'PENDING') {
      return <StatusMessage icon="⏳" title="Awaiting Approval" message="This job posting is currently under review." />;
    }
    if (job.status === 'REJECTED') {
      return <StatusMessage icon="🚫" title="Job Not Approved" message="This job posting has not been approved." />;
    }
  }

  const isExpired = job.lastDateToApply && new Date(job.lastDateToApply) < new Date();
  const castingDates = parseJsonArray(job.castingDates).filter(Boolean);
  const shootingDates = parseJsonArray(job.shootingDates).filter(Boolean);
  const totalOpenings = job.roles?.reduce((sum: number, r: any) => sum + (r.noOfCast || 0), 0) || 0;
  const totalApplications = job.roles?.reduce((sum: number, r: any) => sum + (r._count?.applications || 0), 0) || 0;
  const catName = job.category?.name || '';
  const createdAt = job.createdAt || job.postedDate;

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-stone-900 selection:bg-[#ff24b0]/30 selection:text-stone-900 pb-32 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-[#008dc9]/10 to-[#ff24b0]/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-[#ff24b0]/10 to-cyan-200/40 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#008dc905_1px,transparent_1px),linear-gradient(to_bottom,#008dc905_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-16 space-y-16 relative z-10">

        {(userPlan || '').toLowerCase() === 'basic' && (
          <div className="bg-gradient-to-br from-[#ff24b0]/10 via-[#ff24b0]/5 to-[#008dc9]/10 border-2 border-dashed border-[#ff24b0]/40 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-black text-[#ff24b0]">Unlock More with Premium</h3>
              <p className="text-xs text-stone-600 font-medium">Upgrade your plan for unlimited job applications and advanced features.</p>
            </div>
            <Link to="/subscription-plans" className="bg-[#ff24b0] text-white text-xs font-black px-6 py-3 rounded-xl hover:bg-[#a10065] transition-colors whitespace-nowrap">
              Upgrade Plan
            </Link>
          </div>
        )}

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ─── LEFT COLUMN ─── */}
          <div className="lg:col-span-7 space-y-8">

            {/* Hero Image */}
            <div className="relative group w-full">
              <div className="absolute inset-0 bg-[#008dc9] rounded-[32px] translate-x-3 translate-y-3 transition-transform group-hover:translate-x-4 group-hover:translate-y-4 duration-300" />
              <div className="relative bg-white border-2 border-[#008dc9] rounded-[32px] overflow-hidden shadow-sm z-10">
                <img src={job.image || getCategoryImage(catName)} alt={catName} onError={(e) => { const fallback = getCategoryImage(catName); if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback; }} className="w-full h-56 sm:h-72 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute bottom-4 left-4 bg-white/95 text-stone-900 text-[10px] font-black tracking-widest capitalize px-4 py-2 rounded-xl border border-[#008dc9] shadow-[2px_2px_0px_0px_#008dc9]">
                  {catName || 'General'}
                </span>
              </div>
            </div>

            {/* Title + Meta */}
            <div className="space-y-4 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                {/* <span className="font-sans text-[10px] font-black tracking-[0.25em] text-[#ff24b0] capitalize bg-[#ff24b0]/5 px-3 py-1 rounded-md border border-[#ff24b0]/20">
                  {job.projectType?.name || 'Casting Call'}
                </span> */}
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight capitalize leading-[0.95] font-display text-stone-900">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008dc9] via-[#ff24b0] to-amber-500">
                  {job.title || 'Untitled Casting'}
                </span>
              </h1>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-1.5 text-xs font-bold text-stone-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#ff24b0]" />
                  {job.castingCity ? `${job.castingCity.name}${job.castingCity.country ? `, ${job.castingCity.country.name}` : ''}` : '—'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#008dc9]" />
                  {catName || '—'}
                </span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={<Users className="w-4 h-4" />} label="Openings" value={String(totalOpenings || '—')} />
              <StatCard icon={<Users className="w-4 h-4" />} label="Applications" value={String(totalApplications)} />
              <StatCard icon={<Clock className="w-4 h-4" />} label="Posted" value={createdAt ? formatDate(createdAt) : '—'} />
              <StatCard icon={<Eye className="w-4 h-4" />} label="Views" value={String(job.views || job._count?.views || 0)} />
            </div>

            {/* Description Card */}
            <div className="bg-white border-2 border-[#008dc9] rounded-[32px] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#008dc9] space-y-5">
              <div className="flex items-center justify-between border-b-2 border-[#008dc9] pb-4">
                <h3 className="text-xs font-black tracking-[0.25em] text-[#008dc9] capitalize font-sans">Brief Description</h3>
              </div>
              {job.subTitle && (
                <p className="text-sm font-bold text-stone-700">{job.subTitle}</p>
              )}
              {job.description && (
                <div className="text-sm text-stone-600 leading-relaxed font-medium [&_h1]:text-lg [&_h1]:font-black [&_h2]:text-base [&_h2]:font-black [&_h3]:text-sm [&_h3]:font-bold [&_strong]:font-black [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-[#008dc9] [&_a]:underline [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: job.description }} />
              )}
              {job.usage && (
                <div className="pt-3 border-t border-stone-200">
                  <span className="text-[9px] font-black tracking-widest text-stone-400 capitalize block">Usage</span>
                  <p className="text-sm font-bold text-stone-800 mt-0.5">{job.usage}</p>
                </div>
              )}
            </div>

            {/* Casting Roles */}
            {job.roles && job.roles.length > 0 && (
              <div className="bg-white border-2 border-[#008dc9] rounded-[32px] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#ff24b0] space-y-6">
                <div className="flex items-center justify-between border-b-2 border-[#008dc9] pb-4">
                  <h3 className="text-xs font-black tracking-[0.25em] text-[#008dc9] capitalize font-sans">
                    Casting Roles <span className="text-stone-400 font-medium">({job.roles.length})</span>
                  </h3>
                </div>

                {/* Role Tabs Segment Controller */}
                <div className="flex flex-wrap bg-stone-100 p-1.5 rounded-2xl border-2 border-[#008dc9]">
                  {job.roles.map((role: any, idx: number) => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRoleIndex(idx)}
                      className={`flex-1 md:flex-none px-5 py-2.5 text-[10px] font-bold tracking-widest capitalize rounded-xl transition-all font-display ${
                        idx === selectedRoleIndex
                          ? 'bg-[#008dc9] text-white shadow-md'
                          : 'text-stone-400 hover:text-[#008dc9]'
                      }`}
                    >
                      {role.title || `Role ${idx + 1}`}
                    </button>
                  ))}
                </div>

                {/* Selected Role Detail */}
                {(() => {
                  const role = job.roles[selectedRoleIndex];
                  if (!role) return null;
                  const experience = parseJsonArray(role.experience);
                  return (
                    <div key={role.id} className="space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-black text-stone-900">{role.title || 'Untitled Role'}</h3>
                          {role.noOfCast && (
                            <span className="text-xs font-medium text-stone-500">Casting {role.noOfCast} talent{role.noOfCast > 1 ? 's' : ''}</span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            if (isExpired) return;
                            if (appliedRoleIds.includes(role.id)) return;
                            if (!user) { alert('Please login to apply'); return; }
                            if (user.role === 'RECRUITER') return;
                            if (limitReached) return;
                            setApplyRole(role);
                          }}
                          disabled={isExpired || appliedRoleIds.includes(role.id) || user?.role === 'RECRUITER' || limitReached}
                          className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest capitalize whitespace-nowrap transition-all ${
                            isExpired
                              ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                              : appliedRoleIds.includes(role.id)
                              ? 'bg-green-100 text-green-700'
                              : user?.role === 'RECRUITER'
                              ? 'bg-amber-100 text-amber-700 cursor-not-allowed'
                              : limitReached
                              ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                              : 'bg-[#ff24b0] text-white hover:bg-[#a10065]'
                          }`}
                        >
                          {isExpired ? 'Closed'
                            : appliedRoleIds.includes(role.id) ? '✓ Applied'
                            : user?.role === 'RECRUITER' ? 'Talent Only'
                            : limitReached ? 'Limit Reached'
                            : 'Apply Now'}
                        </button>
                      </div>

                      {role.description && (
                        <div className="text-sm text-stone-600 leading-relaxed [&_h1]:text-lg [&_h1]:font-black [&_h2]:text-base [&_h2]:font-black [&_h3]:text-sm [&_h3]:font-bold [&_strong]:font-black [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-[#008dc9] [&_a]:underline [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: role.description }} />
                      )}

                      {(() => {
                        const ethnicity = role.ethnicityAll ? 'All' : role.ethnicityNames;
                        const nationality = role.nationalityAll ? 'All' : role.nationalityNames;
                        const languages = role.languageNames;
                        const dialects = role.dialectNames;
                        const hasAny = ethnicity || nationality || experience.length > 0 || languages || dialects;
                        if (!hasAny) return null;
                        return (
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-stone-600">
                            {ethnicity && <div><span className="font-bold text-stone-800">Ethnicity:</span> {ethnicity}</div>}
                            {nationality && <div><span className="font-bold text-stone-800">Nationality:</span> {nationality}</div>}
                            {experience.length > 0 && <div><span className="font-bold text-stone-800">Experience:</span> {experience.join(', ')}</div>}
                            {languages && <div><span className="font-bold text-stone-800">Languages:</span> {languages}</div>}
                            {dialects && <div className="col-span-2"><span className="font-bold text-stone-800">Dialects:</span> {dialects}</div>}
                          </div>
                        );
                      })()}

                      {role.usage && (
                        <div className="text-xs text-stone-600">
                          <span className="font-bold text-stone-800">Usage:</span> {role.usage}
                        </div>
                      )}

                      {(role.gender || role.ageMin || role.payment) && (
                      <div className="bg-amber-50 border-2 border-amber-200/80 rounded-2xl p-4 space-y-3">
                        {/* <span className="text-[9px] font-black tracking-widest text-amber-700 capitalize block">Compensation</span> */}
                        <div className="flex flex-wrap gap-2">
                          {role.gender && <RoleChip label="Gender" value={role.gender} />}
                          {role.ageMin && <RoleChip label="Age" value={`${role.ageMin}${role.ageMax ? `-${role.ageMax}` : '+'}`} />}
                          {role.payment && <PaymentChips payment={role.payment} type={role.paymentType} />}
                        </div>
                      </div>
                      )}

                      {(role.question1 || role.question2 || role.question3) && (
                        <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-4 space-y-2">
                          <span className="text-[9px] font-black tracking-widest text-stone-500 capitalize">Questions</span>
                          {role.question1 && <p className="text-xs text-stone-700"><span className="font-bold text-[#008dc9]">Q1:</span> {role.question1}</p>}
                          {role.question2 && <p className="text-xs text-stone-700"><span className="font-bold text-[#008dc9]">Q2:</span> {role.question2}</p>}
                          {role.question3 && <p className="text-xs text-stone-700"><span className="font-bold text-[#008dc9]">Q3:</span> {role.question3}</p>}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* ─── RIGHT COLUMN ─── */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-8">

            {/* Job Overview */}
            <div className="bg-[#008dc9] text-stone-100 rounded-[32px] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#ff24b0] space-y-6">
              <div className="flex items-center justify-between border-b border-[#008dc9]/30 pb-4">
                <h3 className="text-xs font-black tracking-[0.25em] text-white capitalize font-sans">Job Overview</h3>
              </div>
              <div className="space-y-4">
                {(() => {
                  const formatted = castingDates.map(d => formatDate(d)).filter(d => d !== '—');
                  if (formatted.length === 0) return null;
                  return <OverviewItem label="Casting Dates" value={formatted.join(', ')} />;
                })()}
                {(() => {
                  const formatted = shootingDates.map(d => formatDate(d)).filter(d => d !== '—');
                  if (formatted.length === 0) return null;
                  return <OverviewItem label="Shooting Dates" value={formatted.join(', ')} />;
                })()}
                {job.shootingCity?.name && (
                  <OverviewItem
                    label="Shooting City"
                    value={`${job.shootingCity.name}${job.shootingCity.country?.name ? `, ${job.shootingCity.country.name}` : ''}`}
                  />
                )}
                {job.lastDateToApply && (
                  <OverviewItem
                    label="Last Date to Apply"
                    value={formatDate(job.lastDateToApply)}
                    highlight={isExpired ? 'text-[#F6C9E6]' : 'text-white'}
                  />
                )}
                {/* {job.projectType?.name && (
                  <OverviewItem label="Project Type" value={job.projectType.name} />
                )} */}
                {job.paymentInfo && (
                  <OverviewItem label="Payment" value={job.paymentInfo} />
                )}
              </div>
            </div>

            {/* About Company */}
            {job.company && (
              <div className="bg-white border-2 border-[#008dc9] rounded-[32px] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#008dc9] space-y-5">
                <div className="flex items-center justify-between border-b-2 border-[#008dc9] pb-4">
                  <h3 className="text-xs font-black tracking-[0.25em] text-[#008dc9] capitalize font-sans">About Company</h3>
                </div>
                <div className="flex items-center gap-4">
                  {job.company?.user?.image ? (
                    <img src={job.company.user.image} alt="" className="w-14 h-14 rounded-xl object-cover border-2 border-[#008dc9]" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#008dc9] to-[#ff24b0] text-white flex items-center justify-center font-black text-lg border-2 border-[#008dc9]">
                      {job.company?.companyName?.[0] || 'C'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-black text-stone-900 truncate">{job.company.companyName}</p>
                    {job.company.user?.isVerified && (
                      <span className="text-[9px] font-black tracking-widest text-green-600 capitalize">✓ Verified</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 text-xs font-medium">
                  {job.company.user?.createdAt && (
                    <span className="text-stone-500">Member since {formatDate(job.company.user.createdAt)}</span>
                  )}
                  {job.company._count?.jobs != null && (
                    <span className="font-bold text-[#008dc9]">{job.company._count.jobs} jobs</span>
                  )}
                </div>
                {/* {job.company.user?.email && (
                  <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-2">
                    <span className="text-[8px] font-black tracking-widest text-stone-400 capitalize block">Contact</span>
                    <p className="text-xs font-bold text-stone-700">{job.company.user.email}</p>
                  </div>
                )} */}
              </div>
            )}

          </div>
        </div>
      </div>

      {applyRole && (
        <ApplicationPopup
          jobId={job.id}
          role={applyRole}
          isExpired={isExpired}
          onClose={() => setApplyRole(null)}
          onApplied={() => setAppliedRoleIds(prev => [...prev, applyRole.id])}
        />
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="bg-white border-2 border-[#008dc9] p-4 rounded-2xl shadow-[4px_4px_0px_0px_#008dc9] flex flex-col justify-between h-24 text-left transform -rotate-1">
    <div className="flex items-center gap-1.5 text-stone-400">
      {icon}
      <span className="text-[8px] font-black tracking-widest capitalize font-sans">{label}</span>
    </div>
    <p className="text-lg font-black font-display text-[#008dc9]">{value}</p>
  </div>
);

const RoleChip = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-white border border-amber-300 rounded-lg px-3 py-1.5">
    <span className="text-[8px] font-black tracking-widest text-amber-600 capitalize block">{label}</span>
    <span className="text-xs font-bold text-amber-900">{value}</span>
  </div>
);

const OverviewItem = ({ label, value, highlight }: { label: string; value: string; highlight?: string }) => (
  <div>
    <span className="text-[9px] font-black tracking-widest text-white/40 capitalize block">{label}</span>
    <p className={`text-sm font-bold mt-0.5 ${highlight || 'text-white'}`}>{value}</p>
  </div>
);

const PAYMENT_TYPE_ALIAS: Record<string, string> = {
  per_hour: 'per_hour',
  per_hour_pay: 'per_hour',
  per_day: 'per_day',
  per_day_pay: 'per_day',
  per_week: 'per_week',
  per_month: 'per_month',
  per_month_pay: 'per_month',
  package: 'package',
  package_pay: 'package',
};

const PaymentChips = ({ payment, type }: { payment: any; type: string }) => {
  const t = PAYMENT_TYPE_ALIAS[type] || type;
  let rows: { label: string; value: number | null | undefined }[] = [];
  switch (t) {
    case 'per_hour':
      rows = [
        { label: 'Hours / Day', value: payment.hourPerDay },
        { label: 'Budget / Hour', value: payment.hourBudgetPerHour },
        { label: 'No. of Days', value: payment.hourNoOfDays },
      ];
      break;
    case 'per_day':
      rows = [
        { label: 'Full Day', value: payment.dayFullDay },
        { label: 'Half Day', value: payment.dayHalfDay },
        { label: 'Budget Full Day', value: payment.dayBudgetFullDay },
        { label: 'Budget Half Day', value: payment.dayBudgetHalfDay },
        { label: 'Total Budget', value: payment.dayTotalBudget },
      ];
      break;
    case 'per_week':
      rows = [
        { label: 'No. of Weeks', value: payment.weekNoOfWeek },
        { label: 'Days / Week', value: payment.weekDaysPerWeek },
        { label: 'Budget / Week', value: payment.weekBudgetPerWeek },
      ];
      break;
    case 'per_month':
      rows = [
        { label: 'No. of Months', value: payment.monthNoOfMonth },
        { label: 'Days / Month', value: payment.monthDayPerMonth },
        { label: 'Budget / Month', value: payment.monthBudgetPerMonth },
      ];
      break;
    case 'package':
      rows = [
        { label: 'Budget Full Day', value: payment.packageBudgetFullDay },
        { label: 'Budget Half Day', value: payment.packageBudgetHalfDay },
        { label: 'Total Budget', value: payment.packageTotalBudget },
        { label: 'Talent Total', value: payment.packageTotalTalent },
      ];
      break;
  }
  return rows.filter(r => r.value != null && r.value !== 0).map((r, i) => (
    <RoleChip key={i} label={r.label} value={r.value != null ? String(r.value) : '—'} />
  ));
};

const StatusMessage = ({ icon, title, message }: { icon: string; title: string; message: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4">
    <div className="bg-white border-4 border-[#008dc9] p-8 rotate-1 max-w-md text-center space-y-4 shadow-[8px_8px_0px_0px_#ff24b0]">
      <span className="text-5xl block">{icon}</span>
      <h2 className="text-lg font-black text-stone-900">{title}</h2>
      <p className="text-sm text-stone-500 font-medium">{message}</p>
      <Link to="/dashboard/recruiter/jobs" className="inline-block text-[10px] font-black tracking-widest capitalize bg-[#008dc9] text-white px-6 py-3 transition-transform active:scale-95 hover:-translate-y-0.5">← Back to Manage Jobs</Link>
    </div>
  </div>
);

export default PublicJobPage;
