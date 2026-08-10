import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAdminJobs, updateAdminJobStatus, getActiveCompanies, adminCreateJob, adminAddRole, uploadAdminJobImage } from '../../api/admin.api';
import { getJobOptions } from '../../api/job.api';
import { Search, Plus, ArrowLeft } from 'lucide-react';
import RolesStep from '../recruiter/post-job/RolesStep';
import HtmlEditor from '../../components/HtmlEditor';

interface Job {
  slNo: number;
  id: string;
  title: string;
  companyName: string;
  datePosted: string;
  expireDate: string | null;
  status: string;
}

const ManageJobs = () => {
  const [view, setView] = useState<'list' | 'post'>('list');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      const fetchJobs = async () => {
        setLoading(true);
        try {
          const res = await getAdminJobs(page, 20, search || undefined, filter || undefined);
          setJobs(res.data.data.jobs);
          setTotalPages(res.data.data.pagination.totalPages);
          setTotal(res.data.data.pagination.total);
        } catch {
          // handle
        } finally {
          setLoading(false);
        }
      };
      fetchJobs();
    }, 400);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [page, search, filter, refreshKey]);

  const handleStatusClick = (j: Job, e: React.MouseEvent<HTMLButtonElement>) => {
    if (openDropdownId === j.id) { setOpenDropdownId(null); setDropdownPos(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownWidth = 160;
    let left = rect.left;
    if (left + dropdownWidth > window.innerWidth) left = window.innerWidth - dropdownWidth - 8;
    setDropdownPos({ top: rect.bottom + 4, left });
    setOpenDropdownId(j.id);
  };

  const handleConfirmStatus = async (jobId: string, newStatus: 'APPROVED' | 'PENDING' | 'REJECTED') => {
    try {
      const res = await updateAdminJobStatus(jobId, newStatus);
      const { id, status: newStatusStr } = res.data.data;
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, status: newStatusStr } : j)),
      );
      setOpenDropdownId(null);
      setDropdownPos(null);
    } catch {
      // handle
    }
  };

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setOpenDropdownId(null);
      setDropdownPos(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // ─── Post Job State ──────────────────────────────────────────────
  const [companies, setCompanies] = useState<any[]>([]);
  const [postStep, setPostStep] = useState(1);
  const [options, setOptions] = useState<any>(null);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [postError, setPostError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  const handleJobImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setPostError('Please select an image file'); return; }
    setImageUploading(true);
    setPostError('');
    try {
      const formData = new FormData();
      formData.append('jobImage', file);
      const res = await uploadAdminJobImage(formData);
      updateJobData({ image: res.data.data.url });
    } catch {
      setPostError('Image upload failed');
    } finally {
      setImageUploading(false);
    }
  };
  const [jobData, setJobData] = useState({
    companyId: '',
    castingService: 'portal',
    title: '',
    subTitle: '',
    description: '',
    usage: '',
    categoryId: '',
    projectTypeId: '',
    paymentInfo: '',
    castingCityId: '',
    castingCountryId: '',
    castingDates: [] as string[],
    lastDateToApply: '',
    shootingCityId: '',
    shootingCountryId: '',
    shootingDates: [] as string[],
    image: '',
  });

  const [rolesData, setRolesData] = useState<any[]>([]);

  useEffect(() => {
    if (view !== 'post') return;
    setOptionsLoading(true);
    Promise.all([
      getActiveCompanies(),
      getJobOptions(),
    ])
      .then(([compRes, optRes]) => {
        setCompanies(compRes.data.data);
        setOptions(optRes.data.data);
        setOptionsLoading(false);
      })
      .catch(() => {
        setPostError('Failed to load data');
        setOptionsLoading(false);
      });
  }, [view]);

  const handlePostNext = () => {
    if (!jobData.title || !jobData.categoryId || !jobData.paymentInfo) {
      setPostError('Please fill in all required job fields.');
      return;
    }
    setPostError('');
    setPostStep(2);
  };

  const handlePostBack = () => setPostStep(1);

  const handlePostSubmit = async () => {
    if (!jobData.companyId) {
      setPostError('Please select a company.');
      return;
    }
    try {
      setSubmitting(true);
      setPostError('');

      const res = await adminCreateJob({
        companyId: jobData.companyId,
        ...jobData,
        castingService: 'manual',
        castingDates: jobData.castingDates.length > 0 ? jobData.castingDates : null,
        shootingDates: jobData.shootingDates.length > 0 ? jobData.shootingDates : null,
      });
      const newJobId = res.data.data.id;

      for (const role of rolesData) {
        await adminAddRole(newJobId, {
          ...role,
          languageIds: role.languageIds.length > 0 ? role.languageIds : null,
          dialectIds: role.dialectIds.length > 0 ? role.dialectIds : null,
          experience: role.experience.length > 0 ? role.experience : null,
        });
      }

      setPostStep(1);
      setJobData({
        companyId: '',
        castingService: 'portal',
        title: '',
        subTitle: '',
        description: '',
        usage: '',
        categoryId: '',
        projectTypeId: '',
        paymentInfo: '',
        castingCityId: '',
        castingCountryId: '',
        castingDates: [],
        lastDateToApply: '',
        shootingCityId: '',
        shootingCountryId: '',
        shootingDates: [],
        image: '',
      });
      setRolesData([]);
      setView('list');
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      setPostError(err.response?.data?.message || 'Failed to post job');
      setSubmitting(false);
    }
  };

  const [castingDateWarn, setCastingDateWarn] = useState('');
  const [shootingDateWarn, setShootingDateWarn] = useState('');

  const handleAddCastingDate = () => {
    const input = document.getElementById('adminNewCastingDate') as HTMLInputElement;
    const val = input?.value;
    if (!val) return;
    if (jobData.lastDateToApply && new Date(val) <= new Date(jobData.lastDateToApply)) {
      setCastingDateWarn('Casting Date must be after the Last Date To Apply.');
      return;
    }
    setCastingDateWarn('');
    if (!jobData.castingDates.includes(val)) {
      updateJobData({ castingDates: [...jobData.castingDates, val] });
    }
    input.value = '';
  };

  const handleAddShootingDate = () => {
    const input = document.getElementById('adminNewShootingDate') as HTMLInputElement;
    const val = input?.value;
    if (!val) return;
    if (jobData.lastDateToApply && new Date(val) <= new Date(jobData.lastDateToApply)) {
      setShootingDateWarn('Shoot Date must be after the Last Date To Apply.');
      return;
    }
    setShootingDateWarn('');
    if (!jobData.shootingDates.includes(val)) {
      updateJobData({ shootingDates: [...jobData.shootingDates, val] });
    }
    input.value = '';
  };

  const handleRemoveDate = (field: 'castingDates' | 'shootingDates', index: number) => {
    const newDates = [...jobData[field]];
    newDates.splice(index, 1);
    updateJobData({ [field]: newDates });
  };

  const updateJobData = (updates: any) => setJobData((prev) => ({ ...prev, ...updates }));

  return (
    <div>
      {view === 'list' ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-[#3835A4]">Job List</h2>
              <p className="text-xs text-stone-400">{total} total jobs</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="bg-white border border-stone-200 pl-9 pr-4 py-2 text-sm outline-none w-56"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                className="bg-white border border-stone-200 px-4 py-2 text-sm font-bold outline-none"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                onClick={() => setView('post')}
                className="inline-flex items-center gap-2 bg-[#C6007E] text-white px-5 py-2.5  font-black uppercase tracking-widest text-xs hover:bg-[#a10065] transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Post Job
              </button>
            </div>
          </div>

          <div className="bg-white border border-stone-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    {['No', 'Job Title', 'Company Name', 'Date Posted', 'Expire Date', 'Action', 'Status'].map((h) => (
                      <th key={h} className={`px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap border-r border-stone-100 last:border-r-0 ${h === 'Action' || h === 'Status' ? 'text-center' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-400 text-sm font-bold border-t border-stone-100">
                    Loading...
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-400 text-sm font-bold border-t border-stone-100">
                        No jobs found
                      </td>
                    </tr>
                  ) : (
                    jobs.map((j) => (
                      <tr key={j.id} className="border-b border-stone-100 hover:bg-stone-50">
                        <td className="px-4 py-3 text-stone-400 border-r border-stone-100">{j.slNo}</td>
                        <td className="px-4 py-3 font-medium border-r border-stone-100">
                          <Link to={`/jobs/${j.id}`} target="_blank" className="text-[#3835A4] hover:text-[#3835A4] transition-colors">{j.title}</Link>
                        </td>
                        <td className="px-4 py-3 text-stone-500 border-r border-stone-100">{j.companyName}</td>
                        <td className="px-4 py-3 text-stone-500 whitespace-nowrap border-r border-stone-100">
                          {new Date(j.datePosted).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-stone-500 whitespace-nowrap border-r border-stone-100">
                          {j.expireDate
                            ? new Date(j.expireDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              to={`/admin/jobs/${j.id}/applications`}
                              className="px-3 py-1 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 cursor-pointer transition-colors inline-block"
                            >
                              Applications
                            </Link>
                            <Link
                              to={`/admin/jobs/${j.id}/payment`}
                              className="px-3 py-1 text-xs font-bold text-white bg-[#3835A4] cursor-pointer hover:bg-[#2a2899] transition-colors inline-block"
                            >
                              Payment
                            </Link>
                            <Link
                              to={`/admin/jobs/${j.id}/edit`}
                              className="px-3 py-1 text-xs font-bold text-blue-500 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors inline-block"
                            >
                              Edit
                            </Link>
                          </div> 
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={(e) => handleStatusClick(j, e)}
                            className={`px-3 py-1 text-xs font-bold cursor-pointer transition-colors ${
                              j.status === 'active'
                                ? 'text-white bg-green-600 hover:bg-green-700'
                                : j.status === 'rejected'
                                  ? 'text-white bg-red-500 hover:bg-red-600'
                                  : 'text-white bg-orange-400 hover:bg-orange-500'
                            }`}
                          >
                            {j.status}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {dropdownPos && (
            <div
              ref={dropdownRef}
              style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, zIndex: 9999 }}
              className="bg-white border-2 border-[#3835A4]/10 rounded-xl shadow-lg p-2 min-w-[160px]"
            >
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleConfirmStatus(openDropdownId!, 'APPROVED')}
                  className="text-xs font-bold text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg text-left cursor-pointer transition-colors"
                >
                  Active
                </button>
                <button
                  onClick={() => handleConfirmStatus(openDropdownId!, 'PENDING')}
                  className="text-xs font-bold text-orange-500 hover:bg-orange-50 px-3 py-1.5 rounded-lg text-left cursor-pointer transition-colors"
                >
                  Inactive
                </button>
                <button
                  onClick={() => handleConfirmStatus(openDropdownId!, 'REJECTED')}
                  className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-left cursor-pointer transition-colors"
                >
                  Rejected
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-1 mt-6">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-2 text-xs font-bold text-[#3835A4] disabled:text-stone-300 border border-[#3835A4]/20 rounded disabled:border-stone-100 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>

            {(() => {
              const pages: (number | string)[] = [];
              const total = totalPages;
              const current = page;
              if (total <= 7) {
                for (let i = 1; i <= total; i++) pages.push(i);
              } else {
                let start = current - 2;
                let end = current + 2;
                if (start < 1) { end += (1 - start); start = 1; }
                if (end > total) { start -= (end - total); end = total; }
                start = Math.max(1, start);
                end = Math.min(total, end);
                if (start > 1) { pages.push(1); if (start > 2) pages.push('...'); }
                for (let i = start; i <= end; i++) pages.push(i);
                if (end < total) { if (end < total - 1) pages.push('...'); pages.push(total); }
              }
              return pages.map((p, idx) =>
                p === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-xs font-bold text-stone-400">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-8 h-8 text-xs font-bold cursor-pointer border border-stone-200 ${
                      page === p
                        ? 'bg-[#3835A4] text-white border-[#3835A4]'
                        : 'text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                    {p}
                  </button>
                ),
              );
            })()}

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-2 py-2 text-xs font-bold text-[#3835A4] disabled:text-stone-300 border border-[#3835A4]/20 rounded disabled:border-stone-100 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </>
      ) : optionsLoading ? (
        <div className="text-center py-12 text-sm font-bold text-stone-400">Loading...</div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('list')}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-[#3835A4] bg-[#3835A4]/10 hover:bg-[#3835A4]/20 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> 
              </button>
              <div>
                <h2 className="text-2xl font-black text-[#3835A4]">Post a New Job</h2>
                {/* <p className="text-xs text-stone-400">Admin creates job under a company</p> */}
              </div>
            </div>
            <div className="text-xs font-bold text-stone-500 px-3 py-1.5 border border-stone-200">
              Step {postStep} of {jobData.castingService === 'manual' ? 1 : 2}
            </div>
          </div>

          {postError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
              {postError}
            </div>
          )}

          {/* Company Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white border border-stone-200 p-4">
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Select Company *</label>
              <select
                value={jobData.companyId}
                onChange={(e) => updateJobData({ companyId: e.target.value })}
                className="w-full bg-white border border-stone-200 px-3 py-2 text-sm outline-none"
              >
                <option value="">Select a company...</option>
                {companies.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName} ({c.name})
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-white border border-stone-200 p-4">
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Casting Service</label>
              <div className="px-3 py-2 text-sm font-bold text-stone-600 bg-stone-50 border border-stone-200">
                Manual
              </div>
            </div>
          </div>

          <div className="bg-white border border-stone-200">
            {postStep === 1 && (
              <div className="p-4 md:p-6 space-y-8 animate-fadeIn">
                <div className="border-b border-stone-200 pb-4 mb-6">
                  <h2 className="text-xl font-black text-[#C6007E]">Step 1: Job Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Casting Service</label>
                    <div className="px-3 py-3 text-sm font-bold text-stone-600 bg-stone-50 border border-stone-200">
                      Manual
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Job Title *</label>
                    <input
                      name="title" value={jobData.title}
                      onChange={(e) => updateJobData({ title: e.target.value })}
                      className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Job Sub Title *</label>
                    <input
                      name="subTitle" value={jobData.subTitle}
                      onChange={(e) => updateJobData({ subTitle: e.target.value })}
                      className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Description *</label>
                    <HtmlEditor
                      value={jobData.description}
                      onChange={(html) => updateJobData({ description: html })}
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Job Image</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleJobImageUpload}
                        className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#3835A4]/10 file:text-[#3835A4]"
                      />
                      {imageUploading && <span className="text-xs text-[#C6007E] font-bold whitespace-nowrap animate-pulse">Uploading...</span>}
                    </div>
                    {jobData.image && (
                      <div className="mt-2">
                        <img src={jobData.image} alt="Job" className="h-28 w-auto object-contain border border-stone-200 rounded-lg" />
                        <button type="button" onClick={() => updateJobData({ image: '' })} className="mt-1 text-[10px] font-bold text-red-500 hover:underline">Remove</button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Usage *</label>
                    <input
                      name="usage" value={jobData.usage}
                      onChange={(e) => updateJobData({ usage: e.target.value })}
                      className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Category *</label>
                    <select
                      name="categoryId" value={jobData.categoryId}
                      onChange={(e) => updateJobData({ categoryId: e.target.value })}
                      className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none cursor-pointer"
                    >
                      <option value="">Select Category...</option>
                      {options?.categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Project Type *</label>
                    <select
                      name="projectTypeId" value={jobData.projectTypeId}
                      onChange={(e) => updateJobData({ projectTypeId: e.target.value })}
                      className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none cursor-pointer"
                    >
                      <option value="">Select Project Type...</option>
                      {options?.projectTypes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Payment Info *</label>
                    <select
                      name="paymentInfo" value={jobData.paymentInfo}
                      onChange={(e) => updateJobData({ paymentInfo: e.target.value })}
                      className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none cursor-pointer"
                    >
                      <option value="">Select...</option>
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Last Date To Apply *</label>
                    <input
                      type="date"
                      name="lastDateToApply" value={jobData.lastDateToApply}
                      onChange={(e) => updateJobData({ lastDateToApply: e.target.value })}
                      className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-stone-200 pt-8 mt-8">
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#3835A4]">Casting Location & Dates</h3>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Country</label>
                      <select
                        name="castingCountryId" value={jobData.castingCountryId}
                        onChange={(e) => updateJobData({ castingCountryId: e.target.value })}
                        className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none cursor-pointer"
                      >
                        <option value="">Select...</option>
                        {options?.countries?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">City</label>
                      <select
                        name="castingCityId" value={jobData.castingCityId}
                        onChange={(e) => updateJobData({ castingCityId: e.target.value })}
                        className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none cursor-pointer"
                      >
                        <option value="">Select...</option>
                        {options?.cities?.filter((c: any) => !jobData.castingCountryId || c.countryId === jobData.castingCountryId)
                          .map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Casting Dates *</label>
                      <div className="flex gap-2">
                        <input type="date" id="adminNewCastingDate" min={jobData.lastDateToApply || undefined}
                          className="flex-1 bg-transparent border-b-2 border-stone-200 py-2 text-sm outline-none focus:border-[#3835A4]" />
                        <button type="button" onClick={handleAddCastingDate}
                          className="bg-[#3835A4] text-white px-4 text-xs font-bold cursor-pointer">Add</button>
                      </div>
                      {castingDateWarn && <p className="text-[10px] text-amber-600 font-semibold">{castingDateWarn}</p>}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {jobData.castingDates.map((date: string, i: number) => (
                          <span key={i} className="bg-[#3835A4]/10 text-[#3835A4] px-2 py-1 rounded text-xs flex items-center gap-2">
                            {date}
                            <button type="button" onClick={() => handleRemoveDate('castingDates', i)}
                              className="text-red-500 font-bold cursor-pointer">&times;</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#3835A4]">Shoot / Project Location</h3>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Country *</label>
                      <select
                        name="shootingCountryId" value={jobData.shootingCountryId}
                        onChange={(e) => updateJobData({ shootingCountryId: e.target.value })}
                        className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none cursor-pointer"
                      >
                        <option value="">Select...</option>
                        {options?.countries?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">City</label>
                      <select
                        name="shootingCityId" value={jobData.shootingCityId}
                        onChange={(e) => updateJobData({ shootingCityId: e.target.value })}
                        className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none cursor-pointer"
                      >
                        <option value="">Select...</option>
                        {options?.cities?.filter((c: any) => !jobData.shootingCountryId || c.countryId === jobData.shootingCountryId)
                          .map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Shoot Dates *</label>
                      <div className="flex gap-2">
                        <input type="date" id="adminNewShootingDate" min={jobData.lastDateToApply || undefined}
                          className="flex-1 bg-transparent border-b-2 border-stone-200 py-2 text-sm outline-none focus:border-[#3835A4]" />
                        <button type="button" onClick={handleAddShootingDate}
                          className="bg-[#3835A4] text-white px-4 text-xs font-bold cursor-pointer">Add</button>
                      </div>
                      {shootingDateWarn && <p className="text-[10px] text-amber-600 font-semibold">{shootingDateWarn}</p>}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {jobData.shootingDates.map((date: string, i: number) => (
                          <span key={i} className="bg-[#3835A4]/10 text-[#3835A4] px-2 py-1 rounded text-xs flex items-center gap-2">
                            {date}
                            <button type="button" onClick={() => handleRemoveDate('shootingDates', i)}
                              className="text-red-500 font-bold cursor-pointer">&times;</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <button
                    type="button"
                    onClick={handlePostNext}
                    className="bg-[#C6007E] text-white px-8 py-3 font-black uppercase tracking-widest hover:bg-[#a10065] transition-colors text-xs"
                  >
                    Next Step &rarr;
                  </button>
                </div>
              </div>
            )}
            {postStep === 2 && (
              <div className="p-4 md:p-6">
                <RolesStep
                  roles={rolesData}
                  setRoles={setRolesData}
                  jobPaymentInfo={jobData.paymentInfo}
                  options={options}
                  onBack={handlePostBack}
                  onSubmit={handlePostSubmit}
                  submitting={submitting}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;
