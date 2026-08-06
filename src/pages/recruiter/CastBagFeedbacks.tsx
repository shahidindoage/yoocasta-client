import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import RecruiterGuard from '../../auth/RecruiterGuard';
import { getCastBagFeedbacks } from '../../api/castBag.api';
import { Star, ArrowLeft, MessageSquareText } from 'lucide-react';

const decisionStyles: Record<string, string> = {
  Preferred: 'bg-green-100 text-green-700 border-green-300',
  Reserve: 'bg-[#3835A4]/10 text-[#3835A4] border-[#3835A4]/30',
  Pass: 'bg-stone-200 text-stone-600 border-stone-300',
};

export default function CastBagFeedbacks() {
  const { bagId } = useParams<{ bagId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [guestFilter, setGuestFilter] = useState('');

  useEffect(() => {
    if (!bagId) return;
    getCastBagFeedbacks(bagId)
      .then(res => setData(res.data.data))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load feedbacks'))
      .finally(() => setLoading(false));
  }, [bagId]);

  const countBy = (decision: string) =>
    data?.feedbacks?.filter((f: any) => f.decision === decision).length || 0;

  const guests = Array.from(new Set((data?.feedbacks || []).map((f: any) => f.reviewerEmail).filter(Boolean))) as string[];

  const filteredFeedbacks = (data?.feedbacks || []).filter((f: any) =>
    (ratingFilter === 0 || f.rating === ratingFilter) &&
    (guestFilter === '' || f.reviewerEmail === guestFilter)
  );

  return (
    <RecruiterGuard>
      <div className="bg-[#fdfbf7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 min-h-screen">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <Link to="/dashboard/recruiter/cast-bags" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-[#C6007E] transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Cast Bags
                </Link>
                <h1 className="text-3xl font-black text-[#3835A4] mt-3">{data?.bagName || 'Feedbacks'}</h1>
                <p className="text-sm text-stone-500 font-medium mt-1">All feedback received for this cast bag</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-[#C6007E]">{data?.total ?? 0}</p>
                <p className="text-[10px] font-mono font-black uppercase tracking-widest text-stone-400">Feedbacks</p>
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
            ) : data?.feedbacks?.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <span className="text-5xl block">💬</span>
                <p className="text-sm font-medium text-stone-500">No feedbacks yet for this cast bag</p>
                <p className="text-xs text-stone-400">Feedback appears here once invited guests submit it via the shared cast bag link.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3 bg-white border border-stone-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-mono font-black uppercase tracking-widest text-[#3835A4]">Rating</label>
                    <select
                      value={ratingFilter}
                      onChange={e => setRatingFilter(parseInt(e.target.value))}
                      className="px-3 py-2 rounded-xl border-2 border-stone-200 text-sm font-bold text-stone-700 bg-white outline-none focus:border-[#3835A4] transition-colors cursor-pointer"
                    >
                      <option value={0}>All Ratings</option>
                      {[1, 2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-mono font-black uppercase tracking-widest text-[#3835A4]">Guest</label>
                    <select
                      value={guestFilter}
                      onChange={e => setGuestFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border-2 border-stone-200 text-sm font-bold text-stone-700 bg-white outline-none focus:border-[#3835A4] transition-colors cursor-pointer"
                    >
                      <option value="">All Guests</option>
                      {guests.map(email => (
                        <option key={email} value={email}>{email}</option>
                      ))}
                    </select>
                  </div>

                  <div className="ml-auto text-[10px] font-mono font-black uppercase tracking-widest text-stone-400">
                    Showing {filteredFeedbacks.length} of {data.feedbacks.length}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Preferred', value: countBy('Preferred'), bg: 'bg-green-50 border-green-200 text-green-700' },
                    { label: 'Reserve', value: countBy('Reserve'), bg: 'bg-[#3835A4]/5 border-[#3835A4]/20 text-[#3835A4]' },
                    { label: 'Pass', value: countBy('Pass'), bg: 'bg-stone-50 border-stone-200 text-stone-500' },
                  ].map(s => (
                    <div key={s.label} className={`${s.bg} border rounded-2xl p-5 text-center`}>
                      <p className="text-3xl font-black">{s.value}</p>
                      <p className="text-[10px] font-mono font-black uppercase tracking-widest mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                {filteredFeedbacks.length === 0 ? (
                  <div className="text-center py-16 space-y-2 bg-white border border-stone-100 rounded-2xl">
                    <span className="text-4xl block">🔍</span>
                    <p className="text-sm font-bold text-stone-500">No feedbacks match the selected filters</p>
                    <button
                      onClick={() => { setRatingFilter(0); setGuestFilter(''); }}
                      className="text-[10px] font-black uppercase tracking-widest bg-[#3835A4] text-white px-5 py-2.5 rounded-xl hover:bg-[#2a2899] transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                <div className="space-y-4">
                  {filteredFeedbacks.map((f: any) => (
                    <div key={f.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={f.talent.image || 'https://via.placeholder.com/100x100?text=No+Photo'}
                            alt={f.talent.firstName}
                            className="w-12 h-12 rounded-xl object-cover bg-stone-100"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <Link to={`/talent/${f.talent.username}`} className="font-black text-[#3835A4] hover:text-[#C6007E] transition-colors">
                              {f.talent.firstName} {f.talent.lastName || ''}
                            </Link>
                            <p className="text-xs text-stone-400 font-medium">
                              {new Date(f.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-[10px] text-stone-400 font-mono mt-0.5">from {f.reviewerEmail}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {f.rating ? (
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map(n => (
                                <Star key={n} className={`h-4 w-4 ${n <= f.rating ? 'fill-[#C6007E] text-[#C6007E]' : 'text-stone-200'}`} />
                              ))}
                            </div>
                          ) : null}
                          {f.decision ? (
                            <span className={`px-3 py-1.5 rounded-xl border text-[9px] font-mono font-black uppercase tracking-widest ${decisionStyles[f.decision] || decisionStyles.Pass}`}>
                              {f.decision}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {f.comment ? (
                        <p className="mt-4 text-sm text-stone-600 bg-stone-50 border border-stone-100 rounded-xl px-4 py-3">
                          "{f.comment}"
                        </p>
                      ) : null}

                      {f.link?.token ? (
                        <p className="mt-3 text-[10px] text-stone-400 font-mono">
                          Shared link: /cast-bag/{f.link.token}
                          {f.link?.expiresAt ? ` · expires ${new Date(f.link.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </RecruiterGuard>
  );
}
