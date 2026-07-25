import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getTalents, updateTalentStatus, loginAsTalent } from '../../api/admin.api';
import { Search, ExternalLink, LogIn, FileText } from 'lucide-react';

interface Talent {
  slNo: number;
  id: string;
  name: string;
  username: string;
  profileCompleted: boolean;
  userId: string;
  country: string;
  city: string;
  email: string;
  phone: string;
  whatsapp: string;
  subscriptionPlan: string;
  registeredDate: string;
  status: string;
}

const ManageTalents = () => {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const [contactPopup, setContactPopup] = useState<Talent | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [selectedTalentIds, setSelectedTalentIds] = useState<Set<string>>(new Set());
  const [zCardLoading, setZCardLoading] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      const fetchTalents = async () => {
        setLoading(true);
        try {
          const res = await getTalents(page, 20, filter || undefined, search || undefined);
          setTalents(res.data.data.talents);
          setTotalPages(res.data.data.pagination.totalPages);
          setTotal(res.data.data.pagination.total);
        } catch {
          // handle
        } finally {
          setLoading(false);
        }
      };
      fetchTalents();
    }, 400);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [page, filter, search]);

  const handleLoginAsTalent = async (talentId: string) => {
    try {
      const win = window.open('', '_blank');
      const res = await loginAsTalent(talentId);
      const { user, accessToken, refreshToken } = res.data.data;
      const userStr = encodeURIComponent(JSON.stringify(user));
      const url = `/dashboard/talent#access_token=${accessToken}&refresh_token=${refreshToken}&user=${userStr}`;
      if (win) {
        win.location.href = url;
      } else {
        window.location.href = url;
      }
    } catch (err: any) {
      console.error('Login as talent failed:', err?.response?.data || err?.message || err);
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

  const handleStatusClick = (t: Talent, e: React.MouseEvent<HTMLButtonElement>) => {
    if (openDropdownId === t.id) {
      setOpenDropdownId(null);
      setDropdownPos(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownWidth = 160;
    let left = rect.left;
    if (left + dropdownWidth > window.innerWidth) {
      left = window.innerWidth - dropdownWidth - 8;
    }
    setDropdownPos({ top: rect.bottom + 4, left });
    setOpenDropdownId(t.id);
    setPendingStatus(t.status === 'active' ? 'INACTIVE' : 'ACTIVE');
  };

  const handleBulkZedCard = async () => {
    const ids = Array.from(selectedTalentIds);
    if (ids.length === 0) return;
    setZCardLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const apiBase = import.meta.env.VITE_API_URL || '/api/v1';
      const res = await fetch(`${apiBase}/recruiter/z-card`, {
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
      alert('ZedCard failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setZCardLoading(false);
    }
  };

  const handleConfirmStatus = async (talentId: string) => {
    try {
      const res = await updateTalentStatus(talentId, pendingStatus);
      const { id, status: newStatus } = res.data.data;
      setTalents((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
      );
      setOpenDropdownId(null);
      setDropdownPos(null);
    } catch {
      // handle
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-4xl font-medium text-[#3835A4]">Talent List</h2>
          <p className="text-sm text-stone-400">{total} total talents</p>
        </div>
        <button
          onClick={() => {
            if (selectedTalentIds.size === 0) {
              alert('Please select at least one talent to create a ZedCard.');
              return;
            }
            handleBulkZedCard();
          }}
          disabled={zCardLoading}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#C6007E] to-[#3835A4] cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <FileText className="w-3.5 h-3.5" />
          {zCardLoading ? 'Generating...' : selectedTalentIds.size > 0 ? `Create ZedCard (${selectedTalentIds.size})` : 'Create ZedCard'}
        </button>
      </div>
      <div className="flex items-center gap-3 mb-6 justify-end">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search talents..."
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
        </select>
      </div>

      <div className="bg-white border border-stone-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="px-2 py-3 border-r border-stone-100 w-10 text-center">
                  <input
                    type="checkbox"
                    className="accent-[#3835A4] cursor-pointer"
                    checked={talents.length > 0 && selectedTalentIds.size === talents.length}
                    ref={(el) => {
                      if (el) el.indeterminate = selectedTalentIds.size > 0 && selectedTalentIds.size < talents.length;
                    }}
                    onChange={() => {
                      if (selectedTalentIds.size === talents.length) {
                        setSelectedTalentIds(new Set());
                      } else {
                        setSelectedTalentIds(new Set(talents.map((t) => t.id)));
                      }
                    }}
                  />
                </th>
                {['No', 'Name', 'User ID', 'Subscription', 'Registered Date', 'Action', 'Status'].map(
                  (h) => (
                    <th key={h} className={`px-4 py-3 text-[13px] font-bold text-stone-500 tracking-wider whitespace-nowrap border-r border-stone-100 last:border-r-0 ${h === 'Action' || h === 'Status' ? 'text-center' : 'text-left'}`}>
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-stone-400 text-sm font-bold border-t border-stone-100">
                    Loading...
                  </td>
                </tr>
              ) : talents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-stone-400 text-sm font-bold border-t border-stone-100">
                    No talents found
                  </td>
                </tr>
              ) : (
                talents.map((t) => (
                  <tr key={t.id} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="px-2 py-3 border-r border-stone-100 text-center">
                      <input
                        type="checkbox"
                        className="accent-[#3835A4] cursor-pointer"
                        checked={selectedTalentIds.has(t.id)}
                        onChange={() => {
                          setSelectedTalentIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(t.id)) next.delete(t.id);
                            else next.add(t.id);
                            return next;
                          });
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 text-stone-400 border-r border-stone-100">{t.slNo}</td>
                    <td className="px-4 py-3 font-medium border-r border-stone-100">
                      <Link
                        to={`/talent/${t.username}`}
                        target="_blank"
                        className="flex items-center gap-1.5 text-[#3835A4] hover:text-[#3835A4] transition-colors"
                      >
                        {t.name}
                        <span
                          title={t.profileCompleted ? 'Profile Completed' : 'Profile Incomplete'}
                          className={t.profileCompleted ? 'text-green-500' : 'text-red-400'}
                        >
                          {t.profileCompleted ? '✓' : '✕'}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-stone-500 border-r border-stone-100">{t.userId}</td>
                    <td className="px-4 py-3 border-r border-stone-100">
                      <Link
                        to={`/admin/talents/${t.id}/subscription`}
                        className="flex items-center gap-1 text-stone-500 hover:text-[#3835A4] transition-colors"
                      >
                        <span className="font-medium">{t.subscriptionPlan}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-stone-500 whitespace-nowrap border-r border-stone-100">
                      {(() => { const d = new Date(t.registeredDate); return `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })},${d.getFullYear()}`; })()}
                    </td>
                    <td className="px-4 py-3 border-r border-stone-100 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setContactPopup(t)}
                          className="px-3 py-1 text-xs font-bold text-white bg-[#3835A4] cursor-pointer hover:bg-[#2a2899] transition-colors"
                        >
                          Contact Details
                        </button>
                        <button
                          onClick={() => handleLoginAsTalent(t.id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-emerald-600 cursor-pointer hover:bg-emerald-700 transition-colors"
                          title={`Login as ${t.name}`}
                        >
                          <LogIn className="w-3 h-3" />
                          Login
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => handleStatusClick(t, e)}
                        className={`px-3 py-1 text-xs font-bold cursor-pointer transition-colors ${
                          t.status === 'active'
                            ? 'text-white bg-green-600 hover:bg-green-700'
                            : 'text-white bg-red-500 hover:bg-red-600'
                        }`}
                      >
                        {t.status}
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
          <div className="flex items-center gap-1">
            <select
              value={pendingStatus}
              onChange={(e) => setPendingStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
              className="flex-1 text-xs font-bold bg-transparent border border-stone-200 rounded-lg px-2 py-1.5 outline-none"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <button
              onClick={() => handleConfirmStatus(openDropdownId!)}
              className="bg-[#3835A4] text-white rounded-lg w-7 h-7 flex items-center justify-center text-sm hover:bg-[#2a2899] transition-colors"
            >
              →
            </button>
          </div>
        </div>
      )}

      {contactPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setContactPopup(null)}
        >
          <div
            className="bg-white border border-stone-200 w-80 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 bg-stone-50">
              <h3 className="text-sm font-bold text-stone-700">Contact Details</h3>
              <button
                onClick={() => setContactPopup(null)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              {[
                { label: 'Country', value: contactPopup.country },
                { label: 'City', value: contactPopup.city },
                { label: 'Email', value: contactPopup.email },
                { label: 'Phone', value: contactPopup.phone },
                { label: 'WhatsApp', value: contactPopup.whatsapp },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-stone-400 uppercase w-20 shrink-0">{item.label}</span>
                  <span className="font-medium text-stone-700 break-all">{item.value || '—'}</span>
                </div>
              ))}
            </div>
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
              <span key={`ellipsis-${idx}`} className="px-1 text-xs font-bold text-stone-400">
                ...
              </span>
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

export default ManageTalents;
