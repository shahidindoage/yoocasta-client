import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart } from 'lucide-react';
import RecruiterGuard from '../../auth/RecruiterGuard';
import { getFavourites, removeFavourite, addFavourite } from '../../api/favourites.api';
import { getCastBags, addTalentsToBag, createCastBag } from '../../api/castBag.api';
import { getMyJobs } from '../../api/job.api';
import { sendInvitation } from '../../api/invitations.api';

const TalentCardSkeleton = () => (
  <div className="snap-start group relative h-[520px] w-full shrink-0 rounded-[2.25rem] overflow-hidden bg-neutral-800 animate-pulse" />
);

export default function Favourites() {
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);
  const [castBagTalent, setCastBagTalent] = useState<any>(null);
  const [castBags, setCastBags] = useState<any[]>([]);
  const [selectedBagIds, setSelectedBagIds] = useState<string[]>([]);
  const [castBagsLoading, setCastBagsLoading] = useState(false);
  const [castBagLoading, setCastBagLoading] = useState(false);
  const [castBagMsg, setCastBagMsg] = useState('');
  const [newBagName, setNewBagName] = useState('');
  const [creatingBag, setCreatingBag] = useState(false);

  const [inviteTalent, setInviteTalent] = useState<any>(null);
  const [inviteJobs, setInviteJobs] = useState<any[]>([]);
  const [inviteJobsLoading, setInviteJobsLoading] = useState(false);
  const [inviteSendingJobs, setInviteSendingJobs] = useState<Set<string>>(new Set());
  const [inviteMsg, setInviteMsg] = useState('');

  const [zCardLoading, setZCardLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const refreshCastBags = () => {
    setCastBagsLoading(true);
    getCastBags().then(res => setCastBags(res.data.data || [])).catch(() => {}).finally(() => setCastBagsLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    getFavourites()
      .then(res => {
        const list = res.data.data?.data || res.data.data || [];
        setTalents(list);
        setFavouriteIds(list.map((t: any) => t.id));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleFavourite = async (talentUserId: string) => {
    try {
      if (favouriteIds.includes(talentUserId)) {
        await removeFavourite(talentUserId);
        setFavouriteIds(prev => prev.filter(id => id !== talentUserId));
        setTalents(prev => prev.filter(t => t.id !== talentUserId));
      } else {
        await addFavourite(talentUserId);
        setFavouriteIds(prev => [...prev, talentUserId]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openInvitePopup = (t: any) => {
    setInviteTalent(t);
    setInviteMsg('');
    setInviteJobs([]);
    setInviteJobsLoading(true);
    getMyJobs().then(res => {
      const allJobs = res.data.data || [];
      const now = new Date();
      setInviteJobs(allJobs.filter((j: any) =>
        j.status === 'APPROVED' &&
        (!j.lastDateToApply || new Date(j.lastDateToApply) >= now)
      ));
    }).catch(() => {}).finally(() => setInviteJobsLoading(false));
  };

  return (
    <RecruiterGuard>
    <div className="min-h-screen bg-neutral-50 text-[#3835A4] font-sans p-4 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-8 pb-24">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight  text-[#3835A4]">
            Favourite List
          </h1>
          <p className="text-xs font-bold text-[#3835A4]/50">
            {talents.length} talent{talents.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {/* Talent Cards Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '30px' }}>
            {Array.from({ length: 4 }).map((_, i) => <TalentCardSkeleton key={i} />)}
          </div>
        ) : talents.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '60px 0' }}>
            No favourites yet. Browse talents and click the heart icon to add them here.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '30px' }}>
            {talents.map((talent: any) => {
              const isChecked = selectedIds.has(talent.id);

              return (
                <div
                  key={talent.id}
                  onMouseEnter={() => setHoveredCardId(talent.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
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

                    {/* Hover actions — Add to Cast Bag + Invite to Apply */}
                    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center gap-3 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setCastBagTalent(talent);
                          setSelectedBagIds([]);
                          setCastBagMsg('');
                          setNewBagName('');
                          refreshCastBags();
                        }}
                        className="pointer-events-auto px-8 py-4 rounded-2xl bg-[#C6007E] text-white font-mono text-sm font-black tracking-widest uppercase shadow-xl hover:bg-[#a10065] transition-colors cursor-pointer"
                      >
                        Add to Cast Bag
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          openInvitePopup(talent);
                        }}
                        className="pointer-events-auto px-8 py-4 rounded-2xl bg-[#3835A4] text-white font-mono text-sm font-black tracking-widest uppercase shadow-xl hover:bg-[#C6007E] transition-colors cursor-pointer"
                      >
                        Invite to Apply
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-6 left-6 right-6 flex items-start z-30">
                    <div className="flex items-center gap-2">
                      <div
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleSelect(talent.id); }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer border-2 ${
                          isChecked
                            ? 'bg-[#C6007E] border-[#C6007E] text-white opacity-100'
                            : 'bg-white/20 border-white/40 text-white opacity-0 group-hover:opacity-100 hover:bg-white/30'
                        }`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          {isChecked
                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            : <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          }
                        </svg>
                      </div>
                      {talent.plan === 'premium' || talent.plan === 'PREMIUM' ? (
                        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#C6007E] to-[#3835A4] text-white text-[9px] uppercase font-mono font-black tracking-[0.2em] px-3.5 py-1.5 rounded-xl shadow-lg">
                          <svg className="h-3 w-3 fill-current text-white" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                          <span>PREMIUM</span>
                        </div>
                      ) : <div />}
                    </div>
                    <div className="ml-auto flex items-center">
                      <div className="relative flex items-center">
                        {/* Favourite pill — visible by default, hidden on hover */}
                        <div className="flex items-center gap-1 text-white px-2 py-0.5 rounded-lg opacity-100 group-hover:opacity-0 transition-opacity duration-300" style={{ background: '#C6007E' }}>
                          <Heart className="h-4 w-4 fill-current" />
                          <span className="text-[10px] font-mono font-bold">FAVOURITE</span>
                        </div>

                        {/* Hover actions — Z Card + Heart */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setZCardLoading(true);
                              try {
                                const token = localStorage.getItem('accessToken');
                                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                                if (token) headers['Authorization'] = `Bearer ${token}`;
                                const res = await fetch(`${import.meta.env.VITE_API_URL}/recruiter/z-card`, {
                                  method: 'POST',
                                  headers,
                                  body: JSON.stringify({ talentIds: [talent.id] }),
                                });
                                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                                const blob = await res.blob();
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `zcard-${talent.firstName || talent.id}.pdf`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                setTimeout(() => URL.revokeObjectURL(url), 10000);
                              } catch (err: any) {
                                alert('Z Card failed: ' + (err?.message || 'Unknown error'));
                              } finally {
                                setZCardLoading(false);
                              }
                            }}
                            className="p-1.5 rounded-full transition-all duration-300 cursor-pointer text-white hover:text-[#C6007E]"
                            title="Download Z Card"
                          >
                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4a1 1 0 001 1h4" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14h6" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v6" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleFavourite(talent.id); }}
                            className={`p-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                              favouriteIds.includes(talent.id) ? 'text-red-500' : 'text-white hover:text-red-400'
                            }`}
                            title={favouriteIds.includes(talent.id) ? 'Remove from favourites' : 'Add to favourites'}
                          >
                            <Heart className={`h-7 w-7 ${favouriteIds.includes(talent.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-7 z-30 flex flex-col justify-end">
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

                    <div className="h-0 opacity-0 overflow-hidden group-hover:h-16 group-hover:opacity-100 group-hover:mt-6 transition-all duration-500 ease-out border-t border-white/10 pt-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-[8px] text-[#fff] uppercase font-mono">Shoe Size</p>
                          <p className="text-xs font-black text-white font-mono">{talent.physical?.shoeSize || 'N/A'} EU</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-[#fff] uppercase font-mono">Hair Color</p>
                          <p className="text-xs font-black text-white font-mono">{talent.physical?.hairColor || '—'}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-[#fff] uppercase font-mono">Waistline</p>
                          <p className="text-xs font-black text-white font-mono">{talent.physical?.waist ? `${talent.physical.waist} CM` : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Z Card Loading Overlay */}
      {zCardLoading && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-[#C6007E] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white font-mono text-sm font-bold tracking-widest uppercase">Generating Z Card...</p>
        </div>
      )}

      {/* Bottom Action Tray */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-[#C6007E]/15 backdrop-blur-md border-t border-[#C6007E]/20">
          <div className="flex items-center gap-3 py-8 px-4 w-full justify-center flex-wrap">
            <span className="text-white text-sm font-bold font-mono">
              {selectedIds.size} talent{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <div className="h-6 w-px bg-white/10" />
            <button
              onClick={() => {
                const ids = Array.from(selectedIds);
                setCastBagTalent({ ids, name: `${ids.length} talents` });
                setSelectedBagIds([]);
                setCastBagMsg('');
                setNewBagName('');
                refreshCastBags();
              }}
              className="px-5 py-2.5 rounded-xl bg-[#C6007E] text-white font-mono text-xs font-black tracking-widest uppercase hover:bg-[#a10065] transition-colors"
            >
              Add to Cast Bags
            </button>
            <button
              onClick={() => {
                const ids = Array.from(selectedIds);
                setInviteTalent({ id: 'bulk', ids, firstName: `${ids.length} talents`, lastName: '' });
                setInviteMsg('');
                setInviteJobs([]);
                setInviteJobsLoading(true);
                getMyJobs().then(res => {
                  const allJobs = res.data.data || [];
                  const now = new Date();
                  setInviteJobs(allJobs.filter((j: any) =>
                    j.status === 'APPROVED' &&
                    (!j.lastDateToApply || new Date(j.lastDateToApply) >= now)
                  ));
                }).catch(() => {}).finally(() => setInviteJobsLoading(false));
              }}
              className="px-5 py-2.5 rounded-xl bg-[#3835A4] text-white font-mono text-xs font-black tracking-widest uppercase hover:bg-[#C6007E] transition-colors"
            >
              Invite to Apply
            </button>
            <button
              onClick={async () => {
                const ids = Array.from(selectedIds);
                for (const id of ids) {
                  try { await addFavourite(id); } catch {}
                }
                setFavouriteIds(prev => [...new Set([...prev, ...ids])]);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#C6007E] text-white font-mono text-xs font-black tracking-widest uppercase hover:bg-[#a10065] transition-colors"
            >
              Add to Favorites
            </button>
            <button
              onClick={async () => {
                const ids = Array.from(selectedIds);
                if (ids.length === 0) return;
                setZCardLoading(true);
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
                  setZCardLoading(false);
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C6007E] to-[#3835A4] text-white font-mono text-xs font-black tracking-widest uppercase hover:opacity-90 transition-opacity"
            >
              {zCardLoading ? 'Generating...' : 'Create Z Card'}
            </button>
            <div className="h-6 w-px bg-white/10" />
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-5 py-2.5 rounded-xl bg-white/10 text-white/70 font-mono text-xs font-black tracking-widest uppercase hover:bg-white/20 hover:text-white transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Add to Cast Bag Popup */}
      {castBagTalent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={e => { if (e.target === e.currentTarget) setCastBagTalent(null); }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-[#3835A4]">Add to Cast Bag</h2>
              <button onClick={() => setCastBagTalent(null)} className="text-stone-400 hover:text-stone-600 text-xl leading-none">&times;</button>
            </div>
            <p className="text-xs text-stone-500 font-medium">Adding <span className="font-bold text-[#3835A4]">{castBagTalent.ids ? castBagTalent.name : `${castBagTalent.firstName} ${castBagTalent.lastName}`}</span></p>

            {castBagMsg && <p className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-2 rounded-lg">{castBagMsg}</p>}

            {castBagsLoading ? (
              <p className="text-xs text-stone-400 italic py-4 text-center">Loading cast bags...</p>
            ) : castBags.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-4 text-center">No cast bags yet. Create one below.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {castBags.map(bag => (
                  <label key={bag.id} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-stone-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedBagIds.includes(bag.id)}
                      onChange={() => setSelectedBagIds(prev => prev.includes(bag.id) ? prev.filter(x => x !== bag.id) : [...prev, bag.id])}
                      className="accent-[#C6007E]"
                    />
                    <div>
                      <p className="text-sm font-bold text-[#3835A4]">{bag.name}</p>
                      <p className="text-[10px] text-stone-400">{bag.talentCount || 0} talent(s)</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className="border-t border-stone-100 pt-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Create New Cast Bag</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBagName}
                  onChange={(e) => setNewBagName(e.target.value)}
                  placeholder="Enter cast bag name"
                  className="flex-1 bg-transparent border-b-2 border-stone-200 py-2 text-sm outline-none focus:border-[#C6007E]"
                />
                <button
                  onClick={async () => {
                    if (!newBagName.trim()) return;
                    setCreatingBag(true);
                    try {
                      const res = await createCastBag(newBagName.trim());
                      setNewBagName('');
                      setCastBagMsg(`Cast bag "${res.data.data.name}" created`);
                      refreshCastBags();
                    } catch {
                      setCastBagMsg('Failed to create cast bag');
                    } finally {
                      setCreatingBag(false);
                    }
                  }}
                  disabled={creatingBag || !newBagName.trim()}
                  className="bg-[#3835A4] disabled:opacity-40 text-white px-5 py-2 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#2a2899] transition-all"
                >
                  {creatingBag ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setCastBagTalent(null)} className="text-xs font-bold text-stone-500 hover:text-stone-800 uppercase tracking-wider">Cancel</button>
              <button
                onClick={async () => {
                  if (!selectedBagIds.length) return;
                  setCastBagLoading(true);
                  try {
                    const talentIds = castBagTalent.ids || [castBagTalent.id];
                    await Promise.all(selectedBagIds.map(bagId => addTalentsToBag(bagId, talentIds)));
                    const count = talentIds.length;
                    setCastBagTalent(null);
                    showToast(`Added ${count} talent${count > 1 ? 's' : ''} to ${selectedBagIds.length} bag(s)`);
                  } catch {
                    setCastBagMsg('Failed to add');
                    showToast('Failed to add talents to cast bag');
                  }
                  finally { setCastBagLoading(false); }
                }}
                disabled={!selectedBagIds.length || castBagLoading}
                className="bg-[#C6007E] disabled:opacity-40 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#a10065] transition-all"
              >
                {castBagLoading ? 'Adding...' : 'Add Talents'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite to Apply Popup */}
      {inviteTalent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={e => { if (e.target === e.currentTarget) setInviteTalent(null); }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-[#3835A4]">Invite to Apply</h2>
              <button onClick={() => setInviteTalent(null)} className="text-stone-400 hover:text-stone-600 text-xl leading-none">&times;</button>
            </div>
            <p className="text-xs text-stone-500 font-medium">Inviting <span className="font-bold text-[#3835A4]">{inviteTalent.ids ? inviteTalent.name : `${inviteTalent.firstName} ${inviteTalent.lastName}`}</span></p>

            {inviteMsg && <p className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-2 rounded-lg">{inviteMsg}</p>}

            {inviteJobsLoading ? (
              <p className="text-xs text-stone-400 italic py-4 text-center">Loading jobs...</p>
            ) : inviteJobs.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-4 text-center">No active jobs available. Create a job first.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {inviteJobs.map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between p-3 rounded-xl border border-stone-100 hover:bg-stone-50 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-[#3835A4]">{job.title || 'Untitled'}</p>
                      <p className="text-[10px] text-stone-400">{job.roles?.length || 0} role(s)</p>
                    </div>
                    <button
                      onClick={async () => {
                        setInviteSendingJobs(prev => new Set(prev).add(job.id));
                        setInviteMsg('');
                        try {
                          const talentIds = inviteTalent.ids || [inviteTalent.id];
                          await Promise.all(talentIds.map((tid: string) => sendInvitation(job.id, tid)));
                          setInviteMsg(`Invitation sent for "${job.title}"`);
                        } catch (err: any) {
                          setInviteMsg(err?.response?.data?.message || 'Failed to send invitation');
                        } finally {
                          setInviteSendingJobs(prev => { const next = new Set(prev); next.delete(job.id); return next; });
                        }
                      }}
                      disabled={inviteSendingJobs.has(job.id)}
                      className="bg-[#C6007E] disabled:opacity-40 text-white px-4 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#a10065] transition-all"
                    >
                      {inviteSendingJobs.has(job.id) ? 'Sending...' : 'Invite'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-[#3835A4] text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-bold flex items-center gap-2 animate-fadeIn">
          <span className="h-2 w-2 rounded-full bg-green-400 shrink-0" />
          {toast}
        </div>
      )}
    </div>
    </RecruiterGuard>
  );
}
