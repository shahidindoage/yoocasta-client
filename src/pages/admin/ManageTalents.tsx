import { useState, useEffect, useRef, useCallback } from 'react';
import { getTalents, updateTalentStatus } from '../../api/admin.api';

interface Talent {
  slNo: number;
  id: string;
  name: string;
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

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchTalents = async () => {
      setLoading(true);
      try {
        const res = await getTalents(page, 20, filter || undefined);
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
  }, [page, filter]);

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-[#3835A4]">Manage Talents</h2>
          <p className="text-xs text-stone-400">{total} total talents</p>
        </div>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          className="bg-white border-2 border-[#3835A4]/20 rounded-xl px-4 py-2 text-sm font-bold outline-none"
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white border-2 border-[#3835A4]/10 rounded-[24px] shadow-[4px_4px_0px_0px_#C6007E]/10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#3835A4]/5 border-b-2 border-[#3835A4]/10">
                {['Sl No', 'Name', 'User ID', 'Country', 'City', 'Email', 'Phone', 'WhatsApp', 'Subscription', 'Date', 'Status'].map(
                  (h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-black text-stone-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-stone-400 text-sm font-bold">
                    Loading...
                  </td>
                </tr>
              ) : talents.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-stone-400 text-sm font-bold">
                    No talents found
                  </td>
                </tr>
              ) : (
                talents.map((t) => (
                  <tr key={t.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                    <td className="px-4 py-3 font-bold text-stone-400">{t.slNo}</td>
                    <td className="px-4 py-3 font-bold text-[#3835A4]">
                      <span className="flex items-center gap-1.5">
                        {t.name}
                        <span className={t.profileCompleted ? 'text-green-500' : 'text-red-400'}>
                          {t.profileCompleted ? '✓' : '✕'}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-500">{t.userId}</td>
                    <td className="px-4 py-3 text-stone-500">{t.country}</td>
                    <td className="px-4 py-3 text-stone-500">{t.city}</td>
                    <td className="px-4 py-3 text-stone-500">{t.email}</td>
                    <td className="px-4 py-3 text-stone-500">{t.phone}</td>
                    <td className="px-4 py-3 text-stone-500">{t.whatsapp}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold text-[#C6007E] bg-[#C6007E]/5 px-2.5 py-1 rounded-full">
                        {t.subscriptionPlan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-500 whitespace-nowrap">
                      {new Date(t.registeredDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => handleStatusClick(t, e)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer border-0 ${
                          t.status === 'active'
                            ? 'text-green-600 bg-green-50'
                            : 'text-red-500 bg-red-50'
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

      <div className="flex items-center justify-between mt-6">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 text-sm font-bold text-[#3835A4] disabled:text-stone-300 border-2 border-[#3835A4]/20 rounded-xl disabled:border-stone-100 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-xs font-bold text-stone-400">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 text-sm font-bold text-[#3835A4] disabled:text-stone-300 border-2 border-[#3835A4]/20 rounded-xl disabled:border-stone-100 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ManageTalents;
