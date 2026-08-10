import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getContracts, deleteContract } from '../../api/contracts.api';
import { Search, Plus, Eye, CalendarDays, Trash2 } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'text-white bg-green-600',
  EXPIRING_SOON: 'text-white bg-orange-500',
  EXPIRED: 'text-white bg-red-500',
  NOT_RENEWED: 'text-stone-600 bg-stone-200',
};

const getBadge = (status: string, isExpiringSoon?: boolean): { label: string; style: string } => {
  if (status === 'ACTIVE') {
    return isExpiringSoon
      ? { label: 'Expiring Soon', style: STATUS_STYLES.EXPIRING_SOON }
      : { label: 'Active', style: STATUS_STYLES.ACTIVE };
  }
  return {
    label: status?.replace(/_/g, ' ') || status,
    style: STATUS_STYLES[status] || STATUS_STYLES.ACTIVE,
  };
};

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'EXPIRING_SOON', label: 'Expiring Soon' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'NOT_RENEWED', label: 'Not Renewed' },
];

const SORT_OPTIONS = [
  { value: 'expiry_asc', label: 'Expiry: Soonest first' },
  { value: 'expiry_desc', label: 'Expiry: Latest first' },
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
];

const ManageContracts = () => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('expiry_asc');
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  const handleDelete = async (id: string, projectName?: string) => {
    if (!window.confirm(`Delete contract${projectName ? ` "${projectName}"` : ''}? This cannot be undone.`)) return;
    setDeletingId(id);
    setError('');
    try {
      await deleteContract(id);
      setContracts(prev => prev.filter(c => c.id !== id));
      setTotal(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete contract');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setLoading(true);
      setError('');
      getContracts({
        page,
        limit: 20,
        search: search || undefined,
        status: filter || undefined,
        sort: sort || undefined,
      })
        .then(res => {
          setContracts(res.data.data.contracts);
          setTotalPages(res.data.data.totalPages);
          setTotal(res.data.data.total);
        })
        .catch(err => setError(err?.response?.data?.message || 'Failed to load contracts'))
        .finally(() => setLoading(false));
    }, 400);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [page, search, filter, sort]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#3835A4]">Contract Tracking</h2>
          <p className="text-xs text-stone-400">{total} total contracts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search project or job..."
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
            {STATUS_FILTERS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          {/* <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="bg-white border border-stone-200 px-4 py-2 text-sm font-bold outline-none"
          >
            {SORT_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select> */}
          <Link
            to="/admin/contracts/create"
            className="inline-flex items-center gap-2 bg-[#C6007E] text-white px-5 py-2.5 font-black uppercase tracking-widest text-xs hover:bg-[#a10065] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Contract
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
          {error}
        </div>
      )}

      <div className="bg-white border border-stone-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                {['No', 'Project', 'Job', 'Company', 'Start', 'Expiry', 'Talents', 'Status', 'Action'].map(h => (
                  <th key={h} className={`px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap border-r border-stone-100 last:border-r-0 ${h === 'Status' || h === 'Action' ? 'text-center' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-stone-400 text-sm font-bold border-t border-stone-100">
                    Loading...
                  </td>
                </tr>
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-stone-400 text-sm font-bold border-t border-stone-100">
                    No contracts found
                  </td>
                </tr>
              ) : (
                contracts.map((c, idx) => {
                  const slNo = (page - 1) * 20 + idx + 1;
                  return (
                    <tr key={c.id} className="border-b border-stone-100 hover:bg-stone-50">
                      <td className="px-4 py-3 text-stone-400 border-r border-stone-100">{slNo}</td>
                      <td className="px-4 py-3 font-medium border-r border-stone-100">
                        <div className="flex items-center gap-2">
                          <span className="text-[#3835A4]">{c.projectName || '—'}</span>
                          {/* {c.isExpiringSoon && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 rounded-full">
                              <CalendarDays className="w-3 h-3" />
                              Expiring soon
                            </span>
                          )} */}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone-500 border-r border-stone-100">{c.jobTitle || '—'}</td>
                      <td className="px-4 py-3 text-stone-500 border-r border-stone-100">{c.company?.companyName || '—'}</td>
                      <td className="px-4 py-3 text-stone-500 whitespace-nowrap border-r border-stone-100">
                        {new Date(c.contractStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-stone-500 whitespace-nowrap border-r border-stone-100">
                        {new Date(c.contractExpiry).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-stone-500 border-r border-stone-100">{c.talents?.length || 0}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${getBadge(c.status, c.isExpiringSoon).style}`}>
                          {getBadge(c.status, c.isExpiringSoon).label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/admin/contracts/${c.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-white bg-[#3835A4] hover:bg-[#2a2899] transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </Link>
                          <button
                            onClick={() => handleDelete(c.id, c.projectName)}
                            disabled={deletingId === c.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {deletingId === c.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
          const totalP = totalPages;
          const current = page;
          if (totalP <= 7) {
            for (let i = 1; i <= totalP; i++) pages.push(i);
          } else {
            let start = current - 2;
            let end = current + 2;
            if (start < 1) { end += (1 - start); start = 1; }
            if (end > totalP) { start -= (end - totalP); end = totalP; }
            start = Math.max(1, start);
            end = Math.min(totalP, end);
            if (start > 1) { pages.push(1); if (start > 2) pages.push('...'); }
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalP) { if (end < totalP - 1) pages.push('...'); pages.push(totalP); }
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
    </div>
  );
};

export default ManageContracts;
