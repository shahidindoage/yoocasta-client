import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  const [limitChecked, setLimitChecked] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!jobId) return;
    if (hasFetched.current) return;
    hasFetched.current = true;

    getPublicJobById(jobId)
      .then(res => setJob(res.data.data))
      .catch(() => setError('Job not found or has been removed'))
      .finally(() => setLoading(false));
  }, [jobId]);

  useEffect(() => {
    if (!user || user.role !== 'TALENT') return;
    Promise.all([getMyApplications(), getMyProfile()]).then(([appsRes, profileRes]) => {
      const apps = appsRes.data.data || [];
      const roleIds = apps.map((a: any) => a.roleId);
      setAppliedRoleIds(roleIds);
      const plan = profileRes.data.data?.subscription?.plan;
      const maxJobsPerMonth = plan?.maxJobsPerMonth ?? 1;
      if (maxJobsPerMonth < 999) {
        const now = new Date();
        const thisMonthCount = apps.filter((a: any) => {
          const d = new Date(a.createdAt);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
        if (thisMonthCount >= maxJobsPerMonth) setLimitReached(true);
      }
    }).catch(console.error).finally(() => setLimitChecked(true));
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfbf7]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#3835A4] border-t-[#C6007E] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black font-mono text-[#3835A4]">JOB</div>
        </div>
        <span className="mt-4 text-[9px] font-black tracking-[0.3em] text-[#3835A4]/60 uppercase font-mono animate-pulse">
          Loading Casting Ledger...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4">
        <div className="bg-white border-4 border-[#3835A4] p-8 rotate-1 max-w-md text-center space-y-4 shadow-[8px_8px_0px_0px_#C6007E]">
          <span className="text-4xl block animate-bump">⚡</span>
          <p className="text-sm font-black text-[#3835A4] tracking-wider uppercase font-mono bg-red-100 px-2 py-1 inline-block">
            {error}
          </p>
          <Link to="/" className="block text-[10px] font-black tracking-widest uppercase bg-[#3835A4] text-white px-6 py-3 transition-transform active:scale-95 hover:-translate-y-0.5">
            ← Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (!job) return null;

  // Recruitor status checks
  if (user?.role === 'RECRUITER') {
    if (job.status === 'PENDING') {
      return <StatusMessage icon="⏳" title="Awaiting Approval" message="This job posting is currently under review by the system administration team and is pending approval. It will be visible to talents once approved." />;
    }
    if (job.status === 'REJECTED') {
      return <StatusMessage icon="🚫" title="Job Not Approved" message="This job posting has not been approved by the administration. Please contact support for further details." />;
    }
  }

  const isExpired = job.lastDateToApply && new Date(job.lastDateToApply) < new Date();
  const castingDates = parseJsonArray(job.castingDates);
  const shootingDates = parseJsonArray(job.shootingDates);

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-stone-900 selection:bg-[#C6007E]/30 selection:text-stone-900 pb-32 relative overflow-hidden font-sans">

      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-[#3835A4]/10 to-[#C6007E]/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-[#C6007E]/10 to-cyan-200/40 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3835a405_1px,transparent_1px),linear-gradient(to_bottom,#3835a405_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-16 space-y-12 relative z-10">

        {/* Hero: Title + Description */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-[0.95] font-display text-stone-900">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3835A4] via-[#C6007E] to-amber-500">
                {job.title || 'Untitled Casting'}
              </span>
            </h1>
            {job.subTitle && (
              <p className="text-lg font-display text-stone-500 max-w-3xl">{job.subTitle}</p>
            )}
          </div>
          {job.description && (
            <div className="bg-white border-2 border-[#3835A4] rounded-[24px] p-6 sm:p-8 shadow-[6px_6px_0px_0px_#3835A4]">
              <div className="text-sm text-stone-700 font-display leading-relaxed [&_h1]:text-xl [&_h1]:font-black [&_h2]:text-lg [&_h2]:font-black [&_h3]:text-base [&_h3]:font-bold [&_strong]:font-black [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-[#3835A4] [&_a]:underline [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: job.description }} />
            </div>
          )}
        </div>

        {/* Key Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Category', val: job.category?.name },
            { label: 'Project Type', val: job.projectType?.name },
            { label: 'Payment', val: job.paymentInfo ? (job.paymentInfo.charAt(0).toUpperCase() + job.paymentInfo.slice(1)) : '—' },
            { label: 'Usage', val: job.usage || '—' },
            { label: 'Casting City', val: job.castingCity ? `${job.castingCity.name}${job.castingCity.country ? `, ${job.castingCity.country.name}` : ''}` : '—' },
            { label: 'Shooting City', val: job.shootingCity ? `${job.shootingCity.name}${job.shootingCity.country ? `, ${job.shootingCity.country.name}` : ''}` : '—' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white border-2 border-[#3835A4]/10 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-[9px] font-black tracking-widest text-[#3835A4]/50 uppercase">{item.label}</span>
              <p className="text-sm font-bold text-[#3835A4]">{item.val || '—'}</p>
            </div>
          ))}
          <div className="bg-white border-2 border-[#3835A4]/10 rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-[9px] font-black tracking-widest text-[#3835A4]/50 uppercase">Last Date to Apply</span>
            <p className={`text-sm font-bold ${isExpired ? 'text-red-600' : 'text-[#C6007E]'}`}>
              {job.lastDateToApply ? formatDate(job.lastDateToApply) : '—'}
              {isExpired && ' (Expired)'}
            </p>
          </div>
        </div>

        {/* About Company */}
        {job.company && (
          <div className="bg-white border-2 border-[#3835A4] rounded-[24px] p-6 sm:p-8 shadow-[6px_6px_0px_0px_#3835A4] space-y-5">
            <div className="flex items-center gap-3 border-b-2 border-[#3835A4] pb-4">
              <span className="text-xl">🏢</span>
              <h2 className="text-sm font-black tracking-[0.25em] text-[#3835A4] uppercase">About Company</h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex items-center gap-4">
                {job.company?.user?.image ? (
                  <img src={job.company.user.image} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-[#3835A4]/20" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#3835A4] text-white flex items-center justify-center font-black text-2xl">
                    {job.company?.companyName?.[0] || 'C'}
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black tracking-tight text-[#3835A4] uppercase">{job.company.companyName}</h3>
                    {job.company.user?.isVerified && (
                      <span className="bg-[#C6007E] text-white text-[8px] font-black tracking-widest px-2.5 py-1 rounded-full border border-[#3835A4] shadow-sm">
                        VERIFIED ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#3835A4]/50 font-medium">{job.company.user?.email || ''}</p>
                </div>
              </div>
              <div className="sm:ml-auto flex gap-6">
                {job.company.user?.createdAt && (
                  <div className="text-center">
                    <span className="block text-[9px] font-black tracking-widest text-[#3835A4]/40 uppercase">Member Since</span>
                    <span className="text-xs font-bold text-[#3835A4]">{formatDate(job.company.user.createdAt)}</span>
                  </div>
                )}
                {job.company._count?.jobs != null && (
                  <div className="text-center">
                    <span className="block text-[9px] font-black tracking-widest text-[#3835A4]/40 uppercase">Total Jobs</span>
                    <span className="text-xs font-bold text-[#C6007E]">{job.company._count.jobs}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Casting & Shooting Dates */}
        {!job.isLegacy && (castingDates.length > 0 || shootingDates.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {castingDates.length > 0 && (
              <div className="bg-white border-2 border-[#3835A4] rounded-[24px] p-6 shadow-[6px_6px_0px_0px_#3835A4] space-y-3">
                <h3 className="text-[10px] font-black tracking-[0.25em] text-[#3835A4] uppercase">Casting Dates</h3>
                <div className="flex flex-wrap gap-2">
                  {castingDates.map((d, i) => (
                    <span key={i} className="bg-[#3835A4]/5 border border-[#3835A4]/10 rounded-lg px-3 py-1.5 text-xs font-bold text-[#3835A4]">
                      {formatDate(d)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {shootingDates.length > 0 && (
              <div className="bg-white border-2 border-[#3835A4] rounded-[24px] p-6 shadow-[6px_6px_0px_0px_#3835A4] space-y-3">
                <h3 className="text-[10px] font-black tracking-[0.25em] text-[#3835A4] uppercase">Shooting Dates</h3>
                <div className="flex flex-wrap gap-2">
                  {shootingDates.map((d, i) => (
                    <span key={i} className="bg-[#C6007E]/5 border border-[#C6007E]/10 rounded-lg px-3 py-1.5 text-xs font-bold text-[#C6007E]">
                      {formatDate(d)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Roles Section */}
        {job.roles && job.roles.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b-2 border-[#3835A4] pb-4">
              <span className="text-xl">🎭</span>
              <h2 className="text-lg font-black tracking-tight uppercase font-display text-stone-900">Casting Roles ({job.roles.length})</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {job.roles.map((role: any) => {
                const experience = parseJsonArray(role.experience);

                return (
                  <div key={role.id} className="bg-white border-2 border-[#3835A4] rounded-[24px] p-6 sm:p-8 shadow-[6px_6px_0px_0px_#3835A4] space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-black tracking-tight text-[#3835A4] uppercase">{role.title || 'Untitled Role'}</h3>
                        {role.noOfCast && (
                          <span className="text-xs font-bold text-[#3835A4]/50">Casting {role.noOfCast} talent{role.noOfCast > 1 ? 's' : ''}</span>
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
                        className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs whitespace-nowrap transition-all ${
                          isExpired
                            ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                            : appliedRoleIds.includes(role.id)
                            ? 'bg-green-100 text-green-700'
                            : user?.role === 'RECRUITER'
                            ? 'bg-amber-100 text-amber-700 cursor-not-allowed'
                            : limitReached
                            ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                            : 'bg-[#C6007E] text-white hover:bg-[#a10065] active:scale-95'
                        }`}
                      >
                        {isExpired
                          ? 'Applications Closed'
                          : appliedRoleIds.includes(role.id)
                          ? '✓ Applied'
                          : user?.role === 'RECRUITER'
                          ? 'Register as Talent'
                          : limitReached
                          ? 'Monthly Limit Reached'
                          : 'Apply Now'}
                      </button>
                    </div>

                    {role.description && (
                      <div className="text-sm text-stone-600 font-display leading-relaxed [&_h1]:text-xl [&_h1]:font-black [&_h2]:text-lg [&_h2]:font-black [&_h3]:text-base [&_h3]:font-bold [&_strong]:font-black [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-[#3835A4] [&_a]:underline [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: role.description }} />
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {role.gender && (
                        <DetailChip label="Gender" value={role.gender} />
                      )}
                      {role.ageMin && (
                        <DetailChip label="Age Range" value={`${role.ageMin}${role.ageMax ? ` - ${role.ageMax}` : '+'} yrs`} />
                      )}
                      {role.paymentInfo && (
                        <DetailChip label="Payment" value={role.paymentInfo.charAt(0).toUpperCase() + role.paymentInfo.slice(1)} />
                      )}
                      {role.paymentType && (
                        <DetailChip label="Pay Type" value={role.paymentType.replace(/_/g, ' ')} />
                      )}
                      {role.usage && (
                        <DetailChip label="Usage" value={role.usage} />
                      )}
                      {role.ethnicityAll ? (
                        <DetailChip label="Ethnicity" value="All Ethnicities" />
                      ) : role.ethnicityNames && (
                        <DetailChip label="Ethnicity" value={role.ethnicityNames} />
                      )}
                      {role.nationalityAll ? (
                        <DetailChip label="Nationality" value="All Nationalities" />
                      ) : role.nationalityNames && (
                        <DetailChip label="Nationality" value={role.nationalityNames} />
                      )}
                      {role.experienceAll ? (
                        <DetailChip label="Experience" value="All Levels" />
                      ) : experience.length > 0 && (
                        <DetailChip label="Experience" value={experience.join(', ')} />
                      )}
                      {role.languageNames && (
                        <DetailChip label="Languages" value={role.languageNames} />
                      )}
                      {role.dialectNames && (
                        <DetailChip label="Dialects" value={role.dialectNames} />
                      )}
                      {role.requiredProfileVideo && (
                        <DetailChip label="Profile Video" value="Required" accent />
                      )}
                      {role.requiredCastingVideo && (
                        <DetailChip label="Casting Video" value="Required" accent />
                      )}
                    </div>

                    {role.payment && (
                      <div className="bg-amber-50 border-2 border-dashed border-amber-400/80 rounded-2xl p-5 space-y-2">
                        <span className="text-[9px] font-black tracking-widest text-amber-700 uppercase">Compensation Details</span>
                        <PaymentDetails payment={role.payment} type={role.paymentType} />
                      </div>
                    )}

                    {(role.question1 || role.question2 || role.question3) && (
                      <div className="bg-stone-50 border-2 border-dashed border-stone-300 rounded-2xl p-5 space-y-3">
                        <span className="text-[9px] font-black tracking-widest text-stone-500 uppercase">Application Questions</span>
                        <div className="space-y-2">
                          {role.question1 && <p className="text-xs font-medium text-stone-700"><span className="font-black text-[#3835A4]">Q1:</span> {role.question1}</p>}
                          {role.question2 && <p className="text-xs font-medium text-stone-700"><span className="font-black text-[#3835A4]">Q2:</span> {role.question2}</p>}
                          {role.question3 && <p className="text-xs font-medium text-stone-700"><span className="font-black text-[#3835A4]">Q3:</span> {role.question3}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

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

const DetailChip = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className="bg-[#3835A4]/5 border border-[#3835A4]/10 rounded-xl px-4 py-2.5 space-y-0.5">
    <span className="block text-[8px] font-black tracking-widest text-[#3835A4]/40 uppercase">{label}</span>
    <span className={`text-xs font-bold ${accent ? 'text-[#C6007E]' : 'text-[#3835A4]'}`}>{value}</span>
  </div>
);

const PaymentDetails = ({ payment, type }: { payment: any; type: string }) => {
  const rows: { label: string; value: number | null | undefined }[] = [];

  switch (type) {
    case 'per_hour':
      rows.push(
        { label: 'Hours / Day', value: payment.hourPerDay },
        { label: 'Budget / Hour', value: payment.hourBudgetPerHour },
        { label: 'No. of Days', value: payment.hourNoOfDays },
        { label: 'Commission', value: payment.hourCommission },
        { label: 'Talent Budget', value: payment.hourTalentBudget },
        { label: 'Profit', value: payment.hourProfit },
      );
      break;
    case 'per_day':
      rows.push(
        { label: 'Full Day', value: payment.dayFullDay },
        { label: 'Half Day', value: payment.dayHalfDay },
        { label: 'Budget Full Day', value: payment.dayBudgetFullDay },
        { label: 'Budget Half Day', value: payment.dayBudgetHalfDay },
        { label: 'Total Budget', value: payment.dayTotalBudget },
        { label: 'Commission', value: payment.dayCommission },
        { label: 'Talent Full Day', value: payment.dayTalentFullDay },
        { label: 'Talent Half Day', value: payment.dayTalentHalfDay },
        { label: 'Talent Total', value: payment.dayTalentTotal },
        { label: 'Profit', value: payment.dayTotalProfit },
      );
      break;
    case 'per_week':
      rows.push(
        { label: 'No. of Weeks', value: payment.weekNoOfWeek },
        { label: 'Days / Week', value: payment.weekDaysPerWeek },
        { label: 'Budget / Week', value: payment.weekBudgetPerWeek },
        { label: 'Commission', value: payment.weekCommission },
        { label: 'Talent Budget', value: payment.weekTalentBudget },
        { label: 'Profit', value: payment.weekProfit },
      );
      break;
    case 'per_month':
      rows.push(
        { label: 'No. of Months', value: payment.monthNoOfMonth },
        { label: 'Days / Month', value: payment.monthDayPerMonth },
        { label: 'Budget / Month', value: payment.monthBudgetPerMonth },
        { label: 'Commission', value: payment.monthCommission },
        { label: 'Talent Budget', value: payment.monthTalentBudget },
        { label: 'Profit', value: payment.monthProfit },
      );
      break;
    case 'package':
      rows.push(
        { label: 'Budget Full Day', value: payment.packageBudgetFullDay },
        { label: 'Budget Half Day', value: payment.packageBudgetHalfDay },
        { label: 'Total Budget', value: payment.packageTotalBudget },
        { label: 'Commission', value: payment.packageCommission },
        { label: 'Talent Total', value: payment.packageTotalTalent },
        { label: 'Profit', value: payment.packageProfit },
      );
      break;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {rows.filter(r => r.value != null).map((r, i) => (
        <div key={i} className="bg-white border border-amber-200 rounded-lg px-3 py-2">
          <span className="block text-[8px] font-black uppercase text-amber-600 tracking-wider">{r.label}</span>
          <span className="text-xs font-bold text-amber-900">{r.value}</span>
        </div>
      ))}
    </div>
  );
};

const StatusMessage = ({ icon, title, message }: { icon: string; title: string; message: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4">
    <div className="bg-white border-4 border-[#3835A4] p-8 sm:p-12 max-w-xl text-center space-y-6 shadow-[12px_12px_0px_0px_#C6007E]">
      <span className="text-6xl block animate-bounce">{icon}</span>
      <div className="space-y-2">
        <h2 className="text-2xl font-black tracking-tight uppercase text-[#3835A4]">{title}</h2>
        <p className="text-sm font-medium text-[#3835A4]/70 max-w-md mx-auto leading-relaxed">{message}</p>
      </div>
      <Link
        to="/dashboard/recruiter/jobs"
        className="inline-block text-[10px] font-black tracking-widest uppercase bg-[#3835A4] text-white px-8 py-4 rounded-xl transition-transform active:scale-95 hover:-translate-y-0.5"
      >
        ← Back to Manage Jobs
      </Link>
    </div>
  </div>
);

export default PublicJobPage;
