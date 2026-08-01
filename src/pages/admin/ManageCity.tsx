import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAdminCities, createCity, deleteCity, updateCity, getAllCountries } from '../../api/admin.api';
import { Trash2, Pencil, Plus, X, ArrowLeft } from 'lucide-react';

const ManageCity = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterCountryId = searchParams.get('countryId');
  const countryName = searchParams.get('countryName') || '';

  const [items, setItems] = useState<{ id: string; name: string; countryId: string | null; country: string }[]>([]);
  const [countries, setCountries] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [countryId, setCountryId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetch = async (p: number) => {
    setLoading(true);
    try {
      const [cityRes, countryRes] = await Promise.all([getAdminCities(p, 20, filterCountryId || undefined), getAllCountries()]);
      const d = cityRes.data.data;
      setItems(d.cities || []);
      setTotalPages(d.pagination.totalPages);
      setTotal(d.pagination.total);
      setCountries(countryRes.data.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(page); }, [page, filterCountryId]);

  const openAdd = () => {
    setEditId(null); setName(''); setCountryId(filterCountryId || ''); setError(''); setSuccess(''); setModalOpen(true);
  };

  const openEdit = (item: { id: string; name: string; countryId: string | null }) => {
    setEditId(item.id); setName(item.name); setCountryId(item.countryId || ''); setError(''); setSuccess(''); setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false); setEditId(null); setName(''); setCountryId(''); setError(''); setSuccess('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this city?')) return;
    try { await deleteCity(id); setItems((prev) => prev.filter((i) => i.id !== id)); setTotal((prev) => prev - 1); }
    catch { alert('Failed to delete'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('City name is required'); return; }
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      const payload = { name: name.trim(), countryId: countryId || null };
      if (editId) {
        const res = await updateCity(editId, payload);
        setItems((prev) => prev.map((i) => i.id === editId ? { ...res.data.data, country: countries.find((c) => c.id === countryId)?.name || '' } : i));
        setSuccess('City updated successfully');
      } else {
        const res = await createCity(payload);
        setItems((prev) => [...prev, { ...res.data.data, country: countries.find((c) => c.id === countryId)?.name || '' }]);
        setTotal((prev) => prev + 1);
        setSuccess('City added successfully');
      }
      setName(''); setCountryId(''); setEditId(null);
      setTimeout(() => closeModal(), 800);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to save'); }
    finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {filterCountryId && (
            <button onClick={() => navigate('/admin/country')}
              className="p-2 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-stone-500" />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-black text-[#3835A4]">{filterCountryId ? `Cities of ${countryName}` : 'City List'}</h2>
            <p className="text-xs text-stone-400">{total} total cities</p>
          </div>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 bg-[#C6007E] text-white px-5 py-2.5  font-black uppercase tracking-widest text-xs hover:bg-[#a10065] transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> Add City
        </button>
      </div>

      {success && !modalOpen && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-xs font-bold">{success}</div>}

      <div className="bg-white border border-stone-200"><div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-stone-50 border-b border-stone-200">
            {['Sl No', 'City', 'Country', 'Action'].map((h) => (
              <th key={h} className={`px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap border-r border-stone-100 last:border-r-0 ${h === 'Action' ? 'text-center' : 'text-left'}`}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={4} className="text-center py-12 text-stone-400 text-sm font-bold border-t border-stone-100">Loading...</td></tr>
            : items.length === 0 ? <tr><td colSpan={4} className="text-center py-12 text-stone-400 text-sm font-bold border-t border-stone-100">No cities found</td></tr>
            : items.map((item, idx) => (
                <tr key={item.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-3 text-stone-400 border-r border-stone-100">{(page - 1) * 20 + idx + 1}</td>
                  <td className="px-4 py-3 font-medium border-r border-stone-100">{item.name}</td>
                  <td className="px-4 py-3 text-stone-500 border-r border-stone-100">{item.country || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => openEdit(item)}
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

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#3835A4]">{editId ? 'Edit City' : 'Add New City'}</h3>
              <button onClick={closeModal} className="text-stone-400 hover:text-stone-600 text-xl leading-none cursor-pointer"><X /></button>
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold">{error}</div>}
            {success && <div className="p-3 bg-green-50 border border-green-200 text-green-600 text-xs font-bold">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Country</label>
                <select value={countryId} onChange={(e) => setCountryId(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none cursor-pointer">
                  <option value="">Select country...</option>
                  {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">City Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]" placeholder="Enter city name" autoFocus />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeModal}
                  className="text-stone-500 font-bold hover:text-stone-700 transition-colors text-xs uppercase tracking-widest cursor-pointer">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="bg-[#C6007E] text-white px-8 py-3 font-black uppercase tracking-widest hover:bg-[#a10065] transition-colors text-xs disabled:opacity-50 cursor-pointer">
                  {submitting ? 'Saving...' : (editId ? 'Update City' : 'Add City')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCity;
