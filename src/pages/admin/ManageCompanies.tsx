import { useState, useEffect, useRef, useCallback } from 'react';
import { getCompanies, updateCompanyVerify, updateCompanyStatus, loginAsRecruiter, toggleInternalCompany } from '../../api/admin.api';
import { Search, LogIn } from 'lucide-react';

interface Company {
  slNo: number;
  id: string;
  name: string;
  companyName: string;
  profileCompleted: boolean;
  companyType: string | null;
  website: string | null;
  description: string | null;
  tradeLicense: string | null;
  tradeLicenseFile: string | null;
  isVerified: boolean;
  status: string;
  country: string;
  city: string;
  email: string;
  phone: string;
  registeredDate: string;
  isInternalCompany: boolean;
}

const ManageCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('');
  const [contactPopup, setContactPopup] = useState<Company | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  const [openVerifyId, setOpenVerifyId] = useState<string | null>(null);
  const [verifyDropdownPos, setVerifyDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const verifyDropdownRef = useRef<HTMLDivElement | null>(null);

  const [openStatusId, setOpenStatusId] = useState<string | null>(null);
  const [statusDropdownPos, setStatusDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const statusDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      const fetchCompanies = async () => {
        setLoading(true);
        try {
          const res = await getCompanies(page, 20, search || undefined, filter || undefined);
          setCompanies(res.data.data.companies);
          setTotalPages(res.data.data.pagination.totalPages);
          setTotal(res.data.data.pagination.total);
        } catch {
          // handle
        } finally {
          setLoading(false);
        }
      };
      fetchCompanies();
    }, 400);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [page, search, filter]);

  const handleVerifyClick = (c: Company, e: React.MouseEvent<HTMLButtonElement>) => {
    if (openVerifyId === c.id) { setOpenVerifyId(null); setVerifyDropdownPos(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    let left = rect.left;
    if (left + 160 > window.innerWidth) left = window.innerWidth - 168;
    setVerifyDropdownPos({ top: rect.bottom + 4, left });
    setOpenVerifyId(c.id);
  };

  const handleStatusClick = (c: Company, e: React.MouseEvent<HTMLButtonElement>) => {
    if (openStatusId === c.id) { setOpenStatusId(null); setStatusDropdownPos(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    let left = rect.left;
    if (left + 160 > window.innerWidth) left = window.innerWidth - 168;
    setStatusDropdownPos({ top: rect.bottom + 4, left });
    setOpenStatusId(c.id);
  };

  const handleConfirmVerify = async (companyId: string, value: boolean) => {
    try {
      await updateCompanyVerify(companyId, value);
      setCompanies((prev) => prev.map((c) => (c.id === companyId ? { ...c, isVerified: value } : c)));
      setOpenVerifyId(null);
      setVerifyDropdownPos(null);
    } catch {
      // handle
    }
  };

  const handleConfirmStatus = async (companyId: string, value: 'ACTIVE' | 'INACTIVE') => {
    try {
      const res = await updateCompanyStatus(companyId, value);
      const { id, status: newStatus } = res.data.data;
      setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
      setOpenStatusId(null);
      setStatusDropdownPos(null);
    } catch {
      // handle
    }
  };

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (verifyDropdownRef.current && !verifyDropdownRef.current.contains(e.target as Node)) {
      setOpenVerifyId(null);
      setVerifyDropdownPos(null);
    }
    if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
      setOpenStatusId(null);
      setStatusDropdownPos(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleLoginAsRecruiter = async (recruiterId: string) => {
    try {
      const win = window.open('', '_blank');
      const res = await loginAsRecruiter(recruiterId);
      const { user, accessToken, refreshToken } = res.data.data;
      const userStr = encodeURIComponent(JSON.stringify(user));
      const url = `/dashboard/recruiter#access_token=${accessToken}&refresh_token=${refreshToken}&user=${userStr}`;
      if (win) {
        win.location.href = url;
      } else {
        window.location.href = url;
      }
    } catch (err: any) {
      console.error('Login as recruiter failed:', err?.response?.data || err?.message || err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-[#3835A4]">Manage Companies</h2>
          <p className="text-xs text-stone-400">{total} total companies</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search companies..."
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
            <option value="verified">Verified</option>
            <option value="notverified">Not Verified</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-stone-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                {['No', 'Name', 'Company Name', 'Internal', 'Action', 'Status'].map((h) => (
                  <th key={h} className={`px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap border-r border-stone-100 last:border-r-0 ${h === 'Action' || h === 'Status' || h === 'Internal' ? 'text-center' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-stone-400 text-sm font-bold border-t border-stone-100">
                    Loading...
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-stone-400 text-sm font-bold border-t border-stone-100">
                    No companies found
                  </td>
                </tr>
              ) : (
                companies.map((c) => (
                  <tr key={c.id} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="px-4 py-3 text-stone-400 border-r border-stone-100">{c.slNo}</td>
                    <td className="px-4 py-3 font-medium text-stone-800 border-r border-stone-100">
                      <span className="flex items-center gap-2">
                        {c.name}
                        {c.profileCompleted ? (
                          <span className="text-green-500 text-xs" title="Profile complete">✓</span>
                        ) : (
                          <span className="text-red-400 text-xs" title="Profile incomplete">✕</span>
                        )}
                      </span>
                    </td>
                        <td className="px-4 py-3 text-stone-500 border-r border-stone-100">{c.companyName}</td>
                        <td className="px-4 py-3 text-center border-r border-stone-100">
                          <button
                            onClick={async () => {
                              try {
                                const res = await toggleInternalCompany(c.id);
                                setCompanies((prev) => prev.map((x) => x.id === c.id ? { ...x, isInternalCompany: res.data.data.isInternalCompany } : x));
                              } catch {}
                            }}
                            className={`px-3 py-1 text-xs font-bold cursor-pointer transition-colors ${
                              c.isInternalCompany ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-stone-200 text-stone-500 hover:bg-stone-300'
                            }`}
                          >
                            {c.isInternalCompany ? 'YES' : 'NO'}
                          </button>
                        </td>
                    <td className="px-4 py-3 border-r border-stone-100 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setContactPopup(c)}
                          className="px-3 py-1 text-xs font-bold text-white bg-[#3835A4] cursor-pointer hover:bg-[#2a2899] transition-colors"
                        >
                          Contact Details
                        </button>
                        <button
                          onClick={() => handleLoginAsRecruiter(c.id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-emerald-600 cursor-pointer hover:bg-emerald-700 transition-colors"
                          title={`Login as ${c.name}`}
                        >
                          <LogIn className="w-3 h-3" />
                          Login
                        </button>
                        <button
                          onClick={(e) => handleVerifyClick(c, e)}
                          className={`px-3 py-1 text-xs font-bold cursor-pointer transition-colors ${
                            c.isVerified
                              ? 'text-white bg-pink-500 hover:bg-pink-600'
                              : 'text-white bg-pink-300 hover:bg-pink-400'
                          }`}
                        >
                          {c.isVerified ? 'Verified' : 'Not Verified'}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-stone-100 text-center">
                      <button
                        onClick={(e) => handleStatusClick(c, e)}
                        className={`px-3 py-1 text-xs font-bold cursor-pointer transition-colors ${
                          c.status === 'active'
                            ? 'text-white bg-green-600 hover:bg-green-700'
                            : 'text-white bg-red-500 hover:bg-red-600'
                        }`}
                      >
                        {c.status}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
            <div className="p-4 space-y-3 text-sm max-h-[70vh] overflow-y-auto">
              {[
                { label: 'Country', value: contactPopup.country },
                { label: 'City', value: contactPopup.city },
                { label: 'Email', value: contactPopup.email },
                { label: 'Phone', value: contactPopup.phone },
                { label: 'Company Type', value: contactPopup.companyType },
                { label: 'Website', value: contactPopup.website },
                { label: 'Description', value: contactPopup.description },
                { label: 'License No', value: contactPopup.tradeLicense },
                { label: 'License File', value: contactPopup.tradeLicenseFile, isLink: true },
              ].map((item: any) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-stone-400 uppercase w-20 shrink-0">{item.label}</span>
                  {item.isLink && item.value ? (
                    <a href={item.value} target="_blank" rel="noreferrer" className="font-medium text-[#3835A4] underline break-all">View License ↗</a>
                  ) : (
                    <span className="font-medium text-stone-700 break-all">{item.value || '—'}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {verifyDropdownPos && (
        <div
          ref={verifyDropdownRef}
          style={{ position: 'fixed', top: verifyDropdownPos.top, left: verifyDropdownPos.left, zIndex: 9999 }}
          className="bg-white border-2 border-[#3835A4]/10 rounded-xl shadow-lg p-2 min-w-[160px]"
        >
          <div className="flex flex-col gap-1">
            <button
              onClick={() => handleConfirmVerify(openVerifyId!, true)}
              className="text-xs font-bold text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg text-left cursor-pointer transition-colors"
            >
              Verified
            </button>
            <button
              onClick={() => handleConfirmVerify(openVerifyId!, false)}
              className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-left cursor-pointer transition-colors"
            >
              Not Verified
            </button>
          </div>
        </div>
      )}

      {statusDropdownPos && (
        <div
          ref={statusDropdownRef}
          style={{ position: 'fixed', top: statusDropdownPos.top, left: statusDropdownPos.left, zIndex: 9999 }}
          className="bg-white border-2 border-[#3835A4]/10 rounded-xl shadow-lg p-2 min-w-[160px]"
        >
          <div className="flex flex-col gap-1">
            <button
              onClick={() => handleConfirmStatus(openStatusId!, 'ACTIVE')}
              className="text-xs font-bold text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg text-left cursor-pointer transition-colors"
            >
              Active
            </button>
            <button
              onClick={() => handleConfirmStatus(openStatusId!, 'INACTIVE')}
              className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-left cursor-pointer transition-colors"
            >
              Inactive
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

export default ManageCompanies;
