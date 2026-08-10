import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createContract } from '../../api/contracts.api';
import { getAdminJobs } from '../../api/admin.api';
import { getAdminJobApplications } from '../../api/admin.api';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const CreateContract = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({
    projectName: '',
    contractStart: '',
    contractExpiry: '',
    usageDurationDays: '',
    usageDurationLabel: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAdminJobs(1, 50, undefined, 'active')
      .then(res => setJobs(res.data.data.jobs))
      .catch(() => setError('Failed to load jobs'))
      .finally(() => setLoadingJobs(false));
  }, []);

  const loadApplications = async (jobId: string) => {
    setSelectedJobId(jobId);
    setSelected({});
    if (!jobId) { setApplications([]); return; }
    setLoadingApps(true);
    setError('');
    try {
      const res = await getAdminJobApplications(jobId);
      const all = res.data.data.applications || [];
      setApplications(all.filter((a: any) => a.status === 'SELECTED'));
    } catch {
      setApplications([]);
      setError('Failed to load applications for this job');
    } finally {
      setLoadingApps(false);
    }
  };

  const toggle = (applicationId: string) => {
    setSelected(prev => ({ ...prev, [applicationId]: !prev[applicationId] }));
  };

  const updateForm = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const formatDurationLabel = (days: number) => {
    if (days < 1) return '';
    if (days < 30) return days === 1 ? '1 day' : `${days} days`;
    const months = days / 30;
    if (months < 12) {
      const wholeMonths = Math.floor(months);
      const remDays = days - wholeMonths * 30;
      const monthPart = `${wholeMonths} month${wholeMonths > 1 ? 's' : ''}`;
      return remDays > 0 ? `${monthPart} ${remDays} day${remDays > 1 ? 's' : ''}` : monthPart;
    }
    const years = days / 365;
    const wholeYears = Math.floor(years);
    const remMonths = Math.round((years - wholeYears) * 12);
    const yearPart = `${wholeYears} year${wholeYears > 1 ? 's' : ''}`;
    return remMonths > 0 ? `${yearPart} ${remMonths} month${remMonths > 1 ? 's' : ''}` : yearPart;
  };

  const handleDateChange = (key: 'contractStart' | 'contractExpiry', value: string) => {
    const next = { ...form, [key]: value };
    if (next.contractStart && next.contractExpiry) {
      const start = new Date(next.contractStart);
      const expiry = new Date(next.contractExpiry);
      if (!isNaN(start.getTime()) && !isNaN(expiry.getTime()) && expiry > start) {
        const diffMs = expiry.getTime() - start.getTime();
        const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
        next.usageDurationDays = String(days);
        next.usageDurationLabel = formatDurationLabel(days);
      } else {
        next.usageDurationDays = '';
        next.usageDurationLabel = '';
      }
    } else {
      next.usageDurationDays = '';
      next.usageDurationLabel = '';
    }
    setForm(next);
  };

  const handleSubmit = async () => {
    setError('');
    const mappings = applications
      .filter(a => selected[a.id])
      .map(a => ({ talentUserId: a.talent.id, applicationId: a.id }));

    if (!selectedJobId) { setError('Please select a job'); return; }
    if (mappings.length === 0) { setError('Please select at least one talent'); return; }
    if (!form.contractStart || !form.contractExpiry) { setError('Contract start and expiry dates are required'); return; }

    setSubmitting(true);
    try {
      await createContract({
        jobId: selectedJobId,
        talentApplicationMappings: mappings,
        projectName: form.projectName || null,
        contractStart: form.contractStart,
        contractExpiry: form.contractExpiry,
        usageDurationDays: form.usageDurationDays ? Number(form.usageDurationDays) : undefined,
        usageDurationLabel: form.usageDurationLabel || undefined,
        notes: form.notes || undefined,
      });
      navigate('/admin/contracts');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create contract');
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]";

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/admin/contracts"
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-[#3835A4] bg-[#3835A4]/10 hover:bg-[#3835A4]/20 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
        <div>
          <h2 className="text-2xl font-black text-[#3835A4]">Create Contract</h2>
          <p className="text-xs text-stone-400">Map selected talents to a job and set contract details</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: job + details */}
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#3835A4] mb-4">Job & Contract</h3>

            <div className="space-y-1.5 mb-4">
              <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Select Job *</label>
              <select
                value={selectedJobId}
                onChange={e => loadApplications(e.target.value)}
                className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none cursor-pointer"
              >
                <option value="">{loadingJobs ? 'Loading jobs...' : 'Select a job...'}</option>
                {jobs.map((j: any) => (
                  <option key={j.id} value={j.id}>{j.title} — {j.companyName}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 mb-4">
              <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Project Name</label>
              <input
                type="text"
                value={form.projectName}
                onChange={e => updateForm('projectName', e.target.value)}
                placeholder="e.g. Season 2 Casting"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Contract Start *</label>
                <input
                  type="date"
                  value={form.contractStart}
                  onChange={e => handleDateChange('contractStart', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Contract Expiry *</label>
                <input
                  type="date"
                  value={form.contractExpiry}
                  onChange={e => handleDateChange('contractExpiry', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Usage Duration (days)</label>
                <input
                  type="number"
                  min={1}
                  value={form.usageDurationDays}
                  readOnly
                  title="Auto-calculated from start and expiry dates"
                  className={`${inputClass} cursor-not-allowed bg-stone-50`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Usage Duration Label</label>
                <input
                  type="text"
                  value={form.usageDurationLabel}
                  readOnly
                  title="Auto-calculated from start and expiry dates"
                  className={`${inputClass} cursor-not-allowed bg-stone-50`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Notes</label>
              <textarea
                value={form.notes}
                onChange={e => updateForm('notes', e.target.value)}
                rows={3}
                className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]"
              />
            </div>
          </div>
        </div>

        {/* Right: talents */}
        <div className="bg-white border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#3835A4]">Select Talents *</h3>
            {selectedJobId && (
              <span className="text-[10px] font-bold text-stone-400">
                {Object.values(selected).filter(Boolean).length} selected
              </span>
            )}
          </div>

          {!selectedJobId ? (
            <p className="text-center py-12 text-stone-400 text-sm font-bold">Select a job to load its applicants</p>
          ) : loadingApps ? (
            <p className="text-center py-12 text-stone-400 text-sm font-bold">Loading applicants...</p>
          ) : applications.length === 0 ? (
            <p className="text-center py-12 text-stone-400 text-sm font-bold">No selected talents for this job</p>
          ) : (
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {applications.map((a: any) => (
                <label
                  key={a.id}
                  className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                    selected[a.id] ? 'border-[#3835A4] bg-[#3835A4]/5' : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!selected[a.id]}
                    onChange={() => toggle(a.id)}
                    className="accent-[#3835A4] w-4 h-4"
                  />
                  <img
                    src={a.talent?.image || 'https://via.placeholder.com/80x80?text=No+Photo'}
                    alt={a.talent?.firstName}
                    className="w-10 h-10 rounded-xl object-cover bg-stone-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#3835A4] truncate">
                      {a.talent?.firstName} {a.talent?.lastName || ''}
                    </p>
                    <p className="text-[10px] text-stone-400 truncate">
                      @{a.talent?.username} · {a.roleTitle} · {a.status?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  {selected[a.id] && <CheckCircle2 className="w-5 h-5 text-[#3835A4] shrink-0" />}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-[#C6007E] text-white px-8 py-3 font-black uppercase tracking-widest hover:bg-[#a10065] transition-colors text-xs disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Creating...' : 'Create Contract'}
        </button>
      </div>
    </div>
  );
};

export default CreateContract;
