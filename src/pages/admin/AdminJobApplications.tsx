import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAdminJobApplications, updateAdminApplicationStatus } from '../../api/admin.api';
import { ArrowLeft, Briefcase, Search } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  APPLIED: 'bg-stone-100 text-stone-600 border-stone-200',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
  SHORTLISTED: 'bg-blue-50 text-blue-700 border-blue-200',
  SELECTED: 'bg-green-50 text-green-700 border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

const STATUS_OPTIONS = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'SELECTED', 'REJECTED'];

const AdminJobApplications = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const fetchData = () => {
    if (!id) return;
    setLoading(true);
    getAdminJobApplications(id)
      .then(res => setData(res.data.data))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load applications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleStatusChange = async (applicationId: string, status: string) => {
    setUpdatingId(applicationId);
    setMsg('');
    try {
      const res = await updateAdminApplicationStatus(applicationId, status);
      setData((prev: any) => ({
        ...prev,
        applications: prev.applications.map((a: any) =>
          a.id === applicationId ? { ...a, status: res.data.data.status } : a
        ),
      }));
      setMsg('Status updated');
    } catch {
      setMsg('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = (data?.applications || []).filter((a: any) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (a.talent?.firstName || '').toLowerCase().includes(q) ||
      (a.talent?.lastName || '').toLowerCase().includes(q) ||
      (a.talent?.email || '').toLowerCase().includes(q) ||
      (a.roleTitle || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link to="/admin/jobs" className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-[#3835A4] transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Manage Jobs
        </Link>
        <div className="flex items-center justify-between mt-3 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#3835A4]">{data?.jobTitle || 'Job Applications'}</h1>
            <p className="text-xs text-stone-500 mt-1">{data?.total ?? 0} talent{data?.total !== 1 ? 's' : ''} applied</p>
          </div>
          {msg && <p className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">{msg}</p>}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#3835A4] border-t-[#C6007E] rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-sm font-bold text-red-500">{error}</p>
        </div>
      ) : data?.applications?.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <span className="text-5xl block">📭</span>
          <p className="text-sm font-medium text-stone-500">No applications yet for this job</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-stone-100">
            <Search className="h-4 w-4 text-stone-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by talent, email or role..."
              className="flex-1 text-sm outline-none placeholder:text-stone-300"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 text-[10px] font-black uppercase tracking-wider text-stone-500">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Talent</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role Applied</th>
                  <th className="px-4 py-3">Applied On</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map((a: any, idx: number) => (
                  <tr key={a.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-4 py-3 text-stone-400 text-sm">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={a.talent?.image || 'https://via.placeholder.com/80x80?text=No+Photo'}
                          alt={a.talent?.firstName}
                          className="w-9 h-9 rounded-xl object-cover bg-stone-100"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="text-sm font-bold text-[#3835A4]">
                            {a.talent?.firstName} {a.talent?.lastName || ''}
                          </p>
                          <p className="text-[10px] text-stone-400">@{a.talent?.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-500">{a.talent?.email}</td>
                    <td className="px-4 py-3 text-sm text-stone-600">{a.roleTitle}</td>
                    <td className="px-4 py-3 text-sm text-stone-500 whitespace-nowrap">
                      {new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={a.status}
                        disabled={updatingId === a.id}
                        onChange={(e) => handleStatusChange(a.id, e.target.value)}
                        className={`text-[10px] font-black uppercase tracking-wider border rounded-lg px-3 py-2 outline-none cursor-pointer disabled:opacity-50 ${STATUS_STYLES[a.status] || STATUS_STYLES.APPLIED}`}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-stone-400 text-sm font-bold">
                      No applications match your search
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobApplications;
