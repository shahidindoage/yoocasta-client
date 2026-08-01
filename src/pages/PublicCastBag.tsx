import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicCastBag } from '../api/castBag.api';
import { MapPin } from 'lucide-react';

export default function PublicCastBag() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [zcardLoading, setZcardLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    getPublicCastBag(token)
      .then(res => setData(res.data.data))
      .catch(err => setError(err?.response?.data?.message || 'Cast bag not found'))
      .finally(() => setLoading(false));
  }, [token]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const generateZCard = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0 && data?.talents) {
      // if nothing selected, default to all
      ids.push(...data.talents.map((t: any) => t.id));
    }
    if (ids.length === 0) return;
    setZcardLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/recruiter/z-card`, {
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
      alert('Z Card failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setZcardLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <div className="w-10 h-10 border-4 border-[#3835A4] border-t-[#C6007E] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4">
        <div className="bg-white border-4 border-[#3835A4] p-8 max-w-md text-center rounded-3xl shadow-[8px_8px_0px_0px_#C6007E]">
          <span className="text-5xl block mb-4">🔗</span>
          <p className="text-sm font-bold text-[#3835A4]">{error}</p>
          <Link to="/" className="inline-block mt-4 text-[10px] font-black uppercase tracking-widest bg-[#3835A4] text-white px-6 py-3 rounded-xl">Go Home</Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#fdfbf7] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Header */}
        <div className="bg-white border-2 border-stone-100 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl">📁</span>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#3835A4] uppercase">{data.name}</h1>
                <p className="text-sm font-bold text-stone-500 mt-1">{data.talentCount} Talent{data.talentCount !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="px-4 py-2 rounded-xl bg-white border-2 border-stone-200 text-stone-600 font-mono text-[10px] font-black tracking-widest uppercase hover:bg-stone-50 hover:border-stone-300 transition-all"
                >
                  Deselect ({selectedIds.size})
                </button>
              )}
              {data.talents.length > 0 && (
                <button
                  onClick={generateZCard}
                  disabled={zcardLoading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C6007E] to-[#3835A4] text-white font-mono text-[10px] font-black tracking-widest uppercase hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {zcardLoading ? 'Generating...' : 'Zcard Export'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Talent Grid */}
        {data.talents.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">📭</span>
            <p className="text-sm font-medium text-stone-500">No talents in this cast bag</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '30px',
          }}>
            {data.talents.map((talent: any) => (
              <div
                key={talent.id}
                className="snap-start group relative h-[520px] w-full shrink-0 rounded-[2.25rem] overflow-hidden cursor-pointer bg-neutral-950 border border-neutral-200/90 shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="absolute inset-3 border border-white/10 rounded-[1.75rem] pointer-events-none z-20 transition-all duration-500 group-hover:inset-2.5 group-hover:border-[#C6007E]/35" />

                <div className="absolute inset-0 h-full w-full">
                  <img
                    src={talent.image || 'https://via.placeholder.com/400x600?text=No+Photo'}
                    alt={talent.firstName}
                    className="h-full w-full object-cover transition-transform duration-1000 ease-out scale-100 group-hover:scale-105 filter brightness-95 group-hover:brightness-[0.82]"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent to-20% z-10" />
                </div>

                <div className="absolute top-6 left-6 right-6 flex items-start z-30">
                  <div className="flex items-center gap-2">
                    <div
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSelect(talent.id); }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer border-2 ${
                        selectedIds.has(talent.id)
                          ? 'bg-[#C6007E] border-[#C6007E] text-white opacity-100'
                          : 'bg-white/20 border-white/40 text-white opacity-0 group-hover:opacity-100 hover:bg-white/30'
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        {selectedIds.has(talent.id)
                          ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          : <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        }
                      </svg>
                    </div>
                    {talent.plan === 'premium' || talent.plan === 'PREMIUM' ? (
                      <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#C6007E] to-[#3835A4] text-white text-[9px] uppercase font-mono font-black tracking-[0.2em] px-3.5 py-1.5 rounded-xl shadow-lg">
                        <svg className="h-3 w-3 fill-current text-white" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span>PREMIUM</span>
                      </div>
                    ) : <div />}
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-7 z-30 flex flex-col justify-end">
                  <div className="flex items-end justify-between gap-4">
                    <div className="space-y-2">
                      <Link to={`/talent/${talent.username}`} className="block no-underline">
                        <h3 className="font-display text-2xl sm:text-3xl font-black text-white hover:text-[#C6007E] transition-colors leading-none">
                          {talent.firstName}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-bold">
                        <MapPin className="h-3.5 w-3.5 text-[#FFF]" />
                        <span>{talent.city}{talent.country ? `, ${talent.country}` : ''}</span>
                        {talent.age && <span>• {talent.age} yrs</span>}
                      </div>
                    </div>
                  </div>

                  <div className="h-0 opacity-0 overflow-hidden group-hover:h-16 group-hover:opacity-100 group-hover:mt-6 transition-all duration-500 ease-out border-t border-white/10 pt-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-[8px] text-white uppercase font-mono">Shoe Size</p>
                        <p className="text-xs font-black text-white font-mono">{talent.physical?.shoeSize || 'N/A'} EU</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-white uppercase font-mono">Hair Color</p>
                        <p className="text-xs font-black text-white font-mono">{talent.physical?.hairColor || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-white uppercase font-mono">Waistline</p>
                        <p className="text-xs font-black text-white font-mono">{talent.physical?.waist ? `${talent.physical.waist} CM` : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
