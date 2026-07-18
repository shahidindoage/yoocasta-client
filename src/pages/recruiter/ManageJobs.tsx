import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyJobs } from '../../api/job.api';

export default function ManageJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Sort States
  const [filter, setFilter] = useState('all'); // all, active, inactive, expired
  const [sort, setSort] = useState('latest'); // latest, oldest, expiring_soon, most_applied, least_applied

  useEffect(() => {
    getMyJobs()
      .then((res) => {
        setJobs(res.data.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Aggregated Stats
  const totalJobs = jobs.length;
  const totalApplications = jobs.reduce((sum, job) => sum + (job.totalApplications || 0), 0);

  // Derived Filter Logic
  const processedJobs = jobs
    .filter(job => {
      const isExpired = job.lastDateToApply && new Date(job.lastDateToApply) < new Date();
      if (filter === 'active') return job.status === 'APPROVED' && !isExpired;
      if (filter === 'inactive') return job.status === 'PENDING' && !isExpired;
      if (filter === 'expired') return isExpired;
      return true; // 'all'
    })
    .sort((a, b) => {
      if (sort === 'latest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === 'expiring_soon') {
        const dateA = a.lastDateToApply ? new Date(a.lastDateToApply).getTime() : Infinity;
        const dateB = b.lastDateToApply ? new Date(b.lastDateToApply).getTime() : Infinity;
        return dateA - dateB;
      }
      if (sort === 'most_applied') return (b.totalApplications || 0) - (a.totalApplications || 0);
      if (sort === 'least_applied') return (a.totalApplications || 0) - (b.totalApplications || 0);
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-[#3835A4]">
        <div className="animate-pulse text-xs font-black tracking-widest uppercase">Loading Ledger...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-[#3835A4] font-sans p-4 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#3835A4]/10">
          <div>
            <span className="text-[9px] font-black tracking-[0.25em] text-[#C6007E] uppercase block mb-1">Recruiter Console</span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Manage Jobs</h1>
          </div>
          <Link to="/dashboard/recruiter/post-job" className="bg-[#C6007E] text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#a10065] transition-colors whitespace-nowrap">
            + Post New Job
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border-2 border-[#3835A4]/10 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/50 uppercase">Total Jobs Posted</h3>
              <p className="text-3xl font-black text-[#3835A4]">{totalJobs}</p>
            </div>
            <div className="text-4xl opacity-20">🎬</div>
          </div>
          <div className="bg-white border-2 border-[#3835A4]/10 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/50 uppercase">Total Applications</h3>
              <p className="text-3xl font-black text-[#C6007E]">{totalApplications}</p>
            </div>
            <div className="text-4xl opacity-20">📥</div>
          </div>
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-[#3835A4]/10 shadow-sm">
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-bold tracking-widest uppercase text-[#3835A4]/50">Filter By Status</label>
            <select 
              value={filter} 
              onChange={e => setFilter(e.target.value)}
              className="w-full bg-[#3835A4]/5 border border-[#3835A4]/10 rounded-lg p-2 text-sm font-bold text-[#3835A4] outline-none cursor-pointer"
            >
              <option value="all">All Jobs</option>
              <option value="active">Active Jobs</option>
              <option value="inactive">Inactive / Pending Jobs</option>
              <option value="expired">Expired Jobs</option>
            </select>
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-bold tracking-widest uppercase text-[#3835A4]/50">Sort By</label>
            <select 
              value={sort} 
              onChange={e => setSort(e.target.value)}
              className="w-full bg-[#3835A4]/5 border border-[#3835A4]/10 rounded-lg p-2 text-sm font-bold text-[#3835A4] outline-none cursor-pointer"
            >
              <option value="latest">Latest Jobs</option>
              <option value="oldest">Oldest Jobs</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="most_applied">Most Applied Jobs</option>
              <option value="least_applied">Least Applied Jobs</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#3835A4]/10 rounded-2xl overflow-hidden shadow-xl shadow-[#3835A4]/5 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#3835A4]/5 border-b border-[#3835A4]/10">
                <th className="p-4 text-[10px] font-black tracking-widest uppercase text-[#3835A4]/60">Title</th>
                <th className="p-4 text-[10px] font-black tracking-widest uppercase text-[#3835A4]/60 text-center">Applications</th>
                <th className="p-4 text-[10px] font-black tracking-widest uppercase text-[#3835A4]/60 text-center">Shortlisted</th>
                <th className="p-4 text-[10px] font-black tracking-widest uppercase text-[#3835A4]/60 text-center">Selected</th>
                <th className="p-4 text-[10px] font-black tracking-widest uppercase text-[#3835A4]/60 text-center">Views</th>
                <th className="p-4 text-[10px] font-black tracking-widest uppercase text-[#3835A4]/60">Created</th>
                <th className="p-4 text-[10px] font-black tracking-widest uppercase text-[#3835A4]/60">Expired</th>
                <th className="p-4 text-[10px] font-black tracking-widest uppercase text-[#3835A4]/60">Status</th>
                <th className="p-4 text-[10px] font-black tracking-widest uppercase text-[#3835A4]/60 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3835A4]/5">
              {processedJobs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-sm font-bold text-[#3835A4]/40">No jobs found matching criteria.</td>
                </tr>
              ) : (
                processedJobs.map((job) => {
                  const isExpired = job.lastDateToApply && new Date(job.lastDateToApply) < new Date();
                  
                  return (
                    <tr key={job.id} className="hover:bg-[#3835A4]/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-[#3835A4] truncate max-w-[200px]">{job.title || 'Untitled'}</div>
                        <div className="text-xs text-[#3835A4]/50">{job._count?.roles || 0} Roles</div>
                      </td>
                      <td className="p-4 text-center">
                        <Link to={`/dashboard/recruiter/jobs/${job.id}/applications`} className="font-bold text-[#C6007E] hover:text-[#3835A4] transition-colors">
                          {job.totalApplications || 0}
                        </Link>
                      </td>
                      <td className="p-4 text-center font-bold text-orange-500">{job.shortlistedCount || 0}</td>
                      <td className="p-4 text-center font-bold text-green-600">{job.selectedCount || 0}</td>
                      <td className="p-4 text-center text-sm text-[#3835A4]/70">{job.views || 0}</td>
                      <td className="p-4 text-xs text-[#3835A4]/70 font-medium whitespace-nowrap">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-xs text-[#3835A4]/70 font-medium whitespace-nowrap">
                        {job.lastDateToApply ? new Date(job.lastDateToApply).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4">
                        {isExpired ? (
                          <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Expired</span>
                        ) : job.status === 'APPROVED' ? (
                          <span className="bg-green-50 text-green-600 border border-green-200 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Active</span>
                        ) : job.status === 'PENDING' ? (
                          <span className="bg-orange-50 text-orange-600 border border-orange-200 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Inactive</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">{job.status}</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-3 whitespace-nowrap">
                        <Link to={`/jobs/${job.id}`} className="text-xs font-bold text-[#3835A4] hover:text-[#C6007E] transition-colors">View</Link>
                        {/* Edit isn't fully implemented per instructions, so placeholder link */}
                        <button onClick={() => alert("Edit job not implemented yet")} className="text-xs font-bold text-[#3835A4]/50 hover:text-[#3835A4] transition-colors">Edit</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
