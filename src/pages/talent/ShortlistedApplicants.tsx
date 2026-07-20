import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getShortlistedForRole } from '../../api/application.api';
import { MapPin, Ruler } from 'lucide-react';

const CATEGORY_IMAGES: Record<string, string> = {
  'Actors & Extras': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/actors_image.jpg',
  'Dancers': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/category.jpg',
  'Models': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/WhatsApp_Image_2024-10-11_at_3_22_56_PM.jpeg',
  'Photographers': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/2892613_8705625.jpg',
  'Makeup & Hairstylists': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/makeup.jpg',
  'Singers': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/singers.jpg',
  'Directors': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/Directors.jpg',
  'Cinematographers / Videographers': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/Videographers.jpg',
};

const DEFAULT_CATEGORY_IMAGE = 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/pexels-bertellifotografia-2608515.jpg';
const getCategoryImage = (name: string | undefined) => CATEGORY_IMAGES[name || ''] || DEFAULT_CATEGORY_IMAGE;

export default function ShortlistedApplicants() {
  const { roleId } = useParams<{ roleId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!roleId) return;
    getShortlistedForRole(roleId)
      .then(res => setData(res.data.data))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [roleId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <div className="w-10 h-10 border-4 border-[#3835A4] border-t-[#C6007E] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <div className="bg-white border-4 border-[#3835A4] p-8 max-w-md text-center rounded-3xl shadow-[8px_8px_0px_0px_#C6007E]">
          <span className="text-4xl block mb-4">🔒</span>
          <p className="text-sm font-bold text-[#3835A4]">{error}</p>
          <Link to="/dashboard/talent/applications" className="inline-block mt-4 text-[10px] font-black uppercase tracking-widest bg-[#3835A4] text-white px-6 py-3 rounded-xl">
            ← Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { job, role, totalShortlisted, applicants } = data;

  return (
    <div className="min-h-screen bg-[#fdfbf7] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Back Link */}
        <Link to="/dashboard/talent/applications" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#3835A4] hover:text-[#C6007E] transition-colors">
          ← Back to Applications
        </Link>

        {/* Job Header */}
        <div className="bg-white border-2 border-stone-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl shrink-0 overflow-hidden border border-stone-100" style={{
              backgroundImage: `url(${getCategoryImage(job?.category?.name)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }} />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#3835A4] uppercase">{job?.title || 'Job'}</h1>
              <p className="text-sm font-bold text-stone-500 mt-1">{role?.title} · {job?.companyName}</p>
              <p className="text-xs text-stone-400 mt-0.5">{job?.category?.name}</p>
            </div>
          </div>
        </div>

        {/* Shortlisted Count */}
        <div className="bg-[#3835A4]/5 border border-[#3835A4]/10 rounded-2xl px-6 py-4 flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          <div>
            <p className="text-sm font-black text-[#3835A4]">{totalShortlisted} Talent{totalShortlisted !== 1 ? 's' : ''} Shortlisted</p>
            <p className="text-[10px] text-stone-500 font-medium">For the role of {role?.title}</p>
          </div>
        </div>

        {/* Talent Cards Grid */}
        {applicants.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">📭</span>
            <p className="text-sm font-medium text-stone-500">No talents have been shortlisted for this role yet</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '30px',
          }}>
            {applicants.map((talent: any) => (
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

                <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30">
                  {talent.plan === 'premium' ? (
                    <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#C6007E] to-[#3835A4] text-white text-[9px] uppercase font-mono font-black tracking-[0.2em] px-3.5 py-1.5 rounded-xl shadow-lg">
                      <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span>PREMIUM</span>
                    </div>
                  ) : <div />}

                  {talent.physical?.height && (
                    <div className="bg-neutral-950/80 backdrop-blur-md text-white/90 text-[10px] font-mono tracking-wider px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-1">
                      <Ruler className="h-3 w-3 text-neutral-400" />
                      <span>{talent.physical.height} CM</span>
                    </div>
                  )}
                </div>

                <div className="absolute inset-x-0 bottom-0 p-7 z-30 flex flex-col justify-end">
                  <div className="flex items-end justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {talent.categories?.slice(0, 2).map((cat: string, idx: number) => (
                          <span key={idx} className="text-[9px] uppercase font-mono tracking-widest font-black text-white px-2 py-0.5 bg-[#3835A4] rounded-md group-hover:bg-[#C6007E]">
                            {cat}
                          </span>
                        ))}
                      </div>
                      <Link to={`/talent/${talent.username}`} className="block no-underline">
                        <h3 className="font-display text-2xl sm:text-3xl font-black text-white hover:text-[#C6007E] transition-colors leading-none">
                          {talent.firstName} {talent.lastName}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-bold">
                        <MapPin className="h-3.5 w-3.5 text-white" />
                        <span>{talent.city}{talent.country ? `, ${talent.country}` : ''}</span>
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
