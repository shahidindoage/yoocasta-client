import { useState, useEffect } from 'react';
import { getAdminCountries, createCountry, deleteCountry, updateCountry } from '../../api/admin.api';
import { Trash2, Pencil, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ManageCountry = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [items, setItems] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetch = async (p: number) => {
    setLoading(true);
    try {
      const res = await getAdminCountries(p, 20);
      const d = res.data.data;
      setItems(d.countries || []);
      setTotalPages(d.pagination.totalPages);
      setTotal(d.pagination.total);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(page); }, [page]);

  const handleEdit = (item: { id: string; name: string }) => {
    setEditId(item.id); setName(item.name); setActiveTab('add'); setError(''); setSuccess('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this country?')) return;
    try { await deleteCountry(id); setItems((prev) => prev.filter((i) => i.id !== id)); setTotal((prev) => prev - 1); }
    catch { alert('Failed to delete'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      if (editId) {
        const res = await updateCountry(editId, name.trim());
        setItems((prev) => prev.map((i) => i.id === editId ? res.data.data : i));
        setSuccess('Country updated successfully');
      } else {
        const res = await createCountry(name.trim());
        setItems((prev) => [...prev, res.data.data]);
        setTotal((prev) => prev + 1);
        setSuccess('Country added successfully');
      }
      setName(''); setEditId(null);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to save'); }
    finally { setSubmitting(false); }
  };

  const handleTabChange = (tab: 'list' | 'add') => {
    if (tab === 'add' && activeTab !== 'add') { setName(''); setEditId(null); setError(''); setSuccess(''); }
    setActiveTab(tab);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 border-b border-stone-200">
        <button onClick={() => handleTabChange('list')}
          className={`pb-3 text-sm font-bold cursor-pointer transition-colors ${activeTab === 'list' ? 'text-[#3835A4] border-b-2 border-[#3835A4]' : 'text-stone-400 hover:text-stone-600'}`}>Country List</button>
        <button onClick={() => handleTabChange('add')}
          className={`pb-3 text-sm font-bold cursor-pointer transition-colors ${activeTab === 'add' ? 'text-[#3835A4] border-b-2 border-[#3835A4]' : 'text-stone-400 hover:text-stone-600'}`}>
          {editId ? 'Edit Country' : 'Add Country'}</button>
      </div>

      {activeTab === 'list' ? (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-[#3835A4]">Country List</h2>
            <p className="text-xs text-stone-400">{total} total countries</p>
          </div>
          <div className="bg-white border border-stone-200"><div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-stone-50 border-b border-stone-200">
                {['Sl No', 'Country Name', 'City', 'Action'].map((h) => (
                  <th key={h} className={`px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap border-r border-stone-100 last:border-r-0 ${h === 'Action' ? 'text-center' : 'text-left'}`}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={4} className="text-center py-12 text-stone-400 text-sm font-bold border-t border-stone-100">Loading...</td></tr>
                : items.length === 0 ? <tr><td colSpan={4} className="text-center py-12 text-stone-400 text-sm font-bold border-t border-stone-100">No countries found</td></tr>
                : items.map((item, idx) => (
                    <tr key={item.id} className="border-b border-stone-100 hover:bg-stone-50">
                      <td className="px-4 py-3 text-stone-400 border-r border-stone-100">{(page - 1) * 20 + idx + 1}</td>
                      <td className="px-4 py-3 font-medium border-r border-stone-100">{item.name}</td>
                      <td className="px-4 py-3 border-r border-stone-100">
                        <button onClick={() => navigate(`/admin/city?countryId=${item.id}&countryName=${encodeURIComponent(item.name)}`)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-[#3835A4] bg-[#3835A4]/10 hover:bg-[#3835A4]/20 transition-colors cursor-pointer">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleEdit(item)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer mr-2"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                        <button onClick={() => handleDelete(item.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div></div>

          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-1 mt-6">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                className="px-3 py-2 text-xs font-bold text-[#3835A4] disabled:text-stone-300 border border-[#3835A4]/20 rounded disabled:border-stone-100 disabled:cursor-not-allowed cursor-pointer">Previous</button>
              {(() => {
                const pages: (number | string)[] = []; const t = totalPages, c = page;
                if (t <= 7) { for (let i = 1; i <= t; i++) pages.push(i); }
                else { let s = c - 2, e = c + 2; if (s < 1) { e += 1 - s; s = 1; } if (e > t) { s -= e - t; e = t; } s = Math.max(1, s); e = Math.min(t, e); if (s > 1) { pages.push(1); if (s > 2) pages.push('...'); } for (let i = s; i <= e; i++) pages.push(i); if (e < t) { if (e < t - 1) pages.push('...'); pages.push(t); } }
                return pages.map((p, idx) => p === '...' ? <span key={`e-${idx}`} className="px-1 text-xs font-bold text-stone-400">...</span>
                  : <button key={p} onClick={() => setPage(p as number)}
                      className={`w-8 h-8 text-xs font-bold cursor-pointer border border-stone-200 ${page === p ? 'bg-[#3835A4] text-white border-[#3835A4]' : 'text-stone-500 hover:bg-stone-100'}`}>{p}</button>);
              })()}
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                className="px-2 py-2 text-xs font-bold text-[#3835A4] disabled:text-stone-300 border border-[#3835A4]/20 rounded disabled:border-stone-100 disabled:cursor-not-allowed cursor-pointer">Next</button>
            </div>
          )}
        </>
      ) : (
        <div>
          <h2 className="text-2xl font-black text-[#3835A4] mb-6">{editId ? 'Edit Country' : 'Add New Country'}</h2>
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-xs font-bold">{success}</div>}
          <form onSubmit={handleSubmit} className="bg-white border border-stone-200 p-6 max-w-xl space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Country Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]" placeholder="Enter country name" />
            </div>
            <div className="flex justify-end pt-4">
              {editId && <button type="button" onClick={() => handleTabChange('list')}
                className="mr-4 text-stone-500 font-bold hover:text-stone-700 transition-colors text-xs uppercase tracking-widest cursor-pointer">Cancel</button>}
              <button type="submit" disabled={submitting}
                className="bg-[#C6007E] text-white px-8 py-3 font-black uppercase tracking-widest hover:bg-[#a10065] transition-colors text-xs disabled:opacity-50 cursor-pointer">
                {submitting ? 'Saving...' : (editId ? 'Update Country' : 'Add Country')}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageCountry;
