import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { getPublicJobInvitation } from '../../api/invitations.api';

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

const stripHtml = (html: string) => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

export default function PublicJobInvitation() {
  const { jobId } = useParams<{ jobId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;
    getPublicJobInvitation(jobId)
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>Loading...</div>;
  if (!data) return <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>Job not found</div>;

  const { job, talents } = data;
  const bgImage = CATEGORY_IMAGES[job.category || ''] || DEFAULT_CATEGORY_IMAGE;

  return (
    <div style={{ background: '#f4f4f6', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Hero Header */}
      <div style={{ position: 'relative', minHeight: '420px', display: 'flex', alignItems: 'flex-end' }}>
        <img
          src={bgImage}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, width: '100%', padding: '60px 40px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            {/* Left: Title, Company, Description */}
            <div style={{ flex: '1 1 400px' }}>
              <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#fff', margin: '0 0 8px', lineHeight: 1.1 }}>
                {job.title || 'Job Opportunity'}
              </h1>
              {job.companyName && (
                <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', margin: '0 0 16px', fontWeight: 600 }}>
                  {job.companyName}
                </p>
              )}
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, margin: 0, maxWidth: '600px' }}>
                {stripHtml(job.description || 'No description provided.')}
              </p>
            </div>

            {/* Right: Roles Count + Roles */}
            <div style={{ flexShrink: 0 }}>
              <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', borderRadius: '20px', padding: '24px 28px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ fontSize: '32px', fontWeight: 900, color: '#fff', margin: 0, textAlign: 'center' }}>{job.roleCount}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, textAlign: 'center' }}>Roles</p>
                {job.roles?.length > 0 && (
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '160px' }}>
                    {job.roles.map((role: any) => (
                      <div key={role.id} style={{ background: 'rgba(56,53,164,0.6)', borderRadius: '8px', padding: '8px 22px', display: 'flex', gap:'10px'}}>
                        <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{role.title}</span>
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 700, background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px' }}>{role.noOfCast || '?'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Talents Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#111', marginBottom: '24px' }}>
          Invited Talents ({talents.length})
        </h2>
        {talents.length === 0 ? (
          <p style={{ color: '#888' }}>No talents have been invited yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '30px' }}>
            {talents.map((talent: any) => (
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
                <div className="absolute top-6 left-6 right-6 flex items-start justify-between z-30">
                  {talent.plan === 'premium' || talent.plan === 'PREMIUM' ? (
                    <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#C6007E] to-[#3835A4] text-white text-[9px] uppercase font-mono font-black tracking-[0.2em] px-3.5 py-1.5 rounded-xl shadow-lg">
                      <svg className="h-3 w-3 fill-current text-white" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      <span>PREMIUM</span>
                    </div>
                  ) : <div />}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-7 z-30 flex flex-col justify-end">
                  <div className="flex items-end justify-between gap-4">
                    <div className="space-y-2">
                      <Link to={`/talent/${talent.username}`} className="block no-underline">
                        <h3 className="font-display text-2xl sm:text-3xl font-black text-white hover:text-[#C6007E] transition-colors leading-none">
                          {talent.firstName} {talent.lastName}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-bold">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{talent.city}{talent.country ? `, ${talent.country}` : ''}</span>
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
