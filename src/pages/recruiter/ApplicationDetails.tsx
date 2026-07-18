import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getApplicationById } from '../../api/application.api';

const findMedia = (mediaList: any[] | undefined, id: string) =>
  mediaList?.find((m: any) => m.id === id);

const MediaField = ({ label, mediaId, mediaList }: { label: string; mediaId: string; mediaList: any[] | undefined }) => {
  const m = findMedia(mediaList, mediaId);
  return (
    <div className="space-y-1.5">
      <span className="text-[9px] font-black tracking-widest uppercase text-[#3835A4]/40 block">{label}</span>
      {m?.url?.match(/\.(mp4|webm|ogg|mov)$/i) ? (
        <video src={m.url} controls className="w-full rounded-xl border border-[#3835A4]/10 max-h-48" />
      ) : m?.url ? (
        <div className="flex items-center gap-2 text-xs bg-stone-50 rounded-lg px-3 py-2 border border-[#3835A4]/10">
          <span>🎥</span>
          <span className="font-medium">{m.title || 'Media'}</span>
          <a href={m.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-[#C6007E] hover:underline text-[10px] font-bold">View →</a>
        </div>
      ) : m?.videoLink ? (
        <div className="flex items-center gap-2 text-xs bg-stone-50 rounded-lg px-3 py-2 border border-[#3835A4]/10">
          <span>🔗</span>
          <span className="font-medium">{m.title || 'Video Link'}</span>
          <a href={m.videoLink} target="_blank" rel="noopener noreferrer" className="ml-auto text-[#C6007E] hover:underline text-[10px] font-bold">Open →</a>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs bg-stone-50 rounded-lg px-3 py-2 border border-[#3835A4]/10">
          <span className="text-stone-400 italic">Media ID: {mediaId.slice(0, 8)}...</span>
        </div>
      )}
    </div>
  );
};

const statusColors: Record<string, string> = {
  APPLIED: '#3835A4',
  UNDER_REVIEW: '#E8B923',
  SHORTLISTED: '#C6007E',
  SELECTED: '#16a34a',
  REJECTED: '#dc2626',
};

const ApplicationDetails = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!applicationId) return;
    setLoading(true);
    getApplicationById(applicationId)
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [applicationId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-[#3835A4]">
        <div className="animate-pulse text-xs font-black tracking-widest uppercase">Loading Application Matrix...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-[#3835A4]">
        <p className="text-sm font-bold">Application not found.</p>
      </div>
    );
  }

  const { role, user, status, formData, createdAt } = data;
  const talent = user?.talentProfile;
  const job = role?.job;

  return (
    <div className="min-h-screen bg-neutral-50 text-[#3835A4] font-sans p-4 md:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Back + Status */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-[10px] font-black tracking-widest uppercase text-[#3835A4]/40 hover:text-[#C6007E] transition-colors">
            ← Back to Applications
          </button>
          <span
            className="text-white text-[10px] font-black px-4 py-2 rounded-full tracking-wider uppercase shadow-lg"
            style={{ background: statusColors[status] || '#666' }}
          >
            {status?.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Talent Profile Card */}
          <div className="lg:col-span-1 space-y-6">

            {/* Talent Card */}
            <div className="bg-white border-2 border-[#3835A4]/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="relative h-56 bg-[#111]">
                <img
                  src={user.image || 'https://via.placeholder.com/400x500?text=No+Photo'}
                  alt={user.firstName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h2 className="text-white font-black text-xl tracking-tight">
                    {user.firstName} {user.lastName}
                    {user.isVerified && <span className="text-xs ml-1">✅</span>}
                  </h2>
                  {user.username && (
                    <Link to={`/talent/${user.username}`} className="text-[10px] text-[#C6007E] font-bold hover:underline">
                      @{user.username}
                    </Link>
                  )}
                </div>
              </div>
              <div className="p-4 space-y-3">
                {/* Plan */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black tracking-widest uppercase text-[#3835A4]/40">Subscription</span>
                  {user.subscription?.plan?.slug === 'premium' ? (
                    <span className="bg-gradient-to-r from-[#C6007E] to-[#3835A4] text-white text-[8px] font-black px-3 py-1.5 rounded-full tracking-wider uppercase">
                      ★ Premium
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Basic</span>
                  )}
                </div>

                {/* Contact */}
                <div className="border-t border-[#3835A4]/5 pt-3 space-y-2 text-xs">
                  {user.email && <div className="flex justify-between"><span className="text-[#3835A4]/50">Email</span><span>{user.email}</span></div>}
                  {user.phone && <div className="flex justify-between"><span className="text-[#3835A4]/50">Phone</span><span>{user.phone}</span></div>}
                  {user.whatsappNo && <div className="flex justify-between"><span className="text-[#3835A4]/50">WhatsApp</span><span>{user.whatsappNo}</span></div>}
                </div>

                {/* Categories */}
                {talent?.categories?.length > 0 && (
                  <div className="border-t border-[#3835A4]/5 pt-3">
                    <span className="text-[9px] font-black tracking-widest uppercase text-[#3835A4]/40 block mb-2">Categories</span>
                    <div className="flex flex-wrap gap-1.5">
                      {talent.categories.map((tc: any) => (
                        <span key={tc.id} className="bg-[#3835A4]/10 text-[#3835A4] text-[8px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
                          {tc.category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {talent?.languages?.length > 0 && (
                  <div className="border-t border-[#3835A4]/5 pt-3">
                    <span className="text-[9px] font-black tracking-widest uppercase text-[#3835A4]/40 block mb-2">Languages</span>
                    <div className="flex flex-wrap gap-1.5">
                      {talent.languages.map((l: any) => (
                        <span key={l.id} className="bg-[#C6007E]/10 text-[#C6007E] text-[8px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
                          {l.language.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Physical Specs */}
            {talent && (
              <div className="bg-white border-2 border-[#3835A4]/10 rounded-2xl p-4 shadow-sm space-y-3">
                <span className="text-[9px] font-black tracking-widest uppercase text-[#3835A4]/40 block">Physical Specifications</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {talent.age && <div><span className="text-[#3835A4]/50 block text-[9px]">Age</span><span className="font-bold">{talent.age}</span></div>}
                  {talent.gender && <div><span className="text-[#3835A4]/50 block text-[9px]">Gender</span><span className="font-bold capitalize">{talent.gender}</span></div>}
                  {talent.height && <div><span className="text-[#3835A4]/50 block text-[9px]">Height</span><span className="font-bold">{talent.height}</span></div>}
                  {talent.weight && <div><span className="text-[#3835A4]/50 block text-[9px]">Weight</span><span className="font-bold">{talent.weight}</span></div>}
                  {talent.chest && <div><span className="text-[#3835A4]/50 block text-[9px]">Chest</span><span className="font-bold">{talent.chest}</span></div>}
                  {talent.waist && <div><span className="text-[#3835A4]/50 block text-[9px]">Waist</span><span className="font-bold">{talent.waist}</span></div>}
                  {talent.shoeSize && <div><span className="text-[#3835A4]/50 block text-[9px]">Shoe Size</span><span className="font-bold">{talent.shoeSize}</span></div>}
                  {talent.hairColor && <div><span className="text-[#3835A4]/50 block text-[9px]">Hair</span><span className="font-bold capitalize">{talent.hairColor}</span></div>}
                  {talent.eyeColor && <div><span className="text-[#3835A4]/50 block text-[9px]">Eyes</span><span className="font-bold capitalize">{talent.eyeColor}</span></div>}
                  {talent.bodyStructure && <div><span className="text-[#3835A4]/50 block text-[9px]">Build</span><span className="font-bold capitalize">{talent.bodyStructure}</span></div>}
                </div>
              </div>
            )}
          </div>

          {/* Right: Application Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Job & Role Info */}
            <div className="bg-white border-2 border-[#3835A4]/10 rounded-2xl p-6 shadow-sm space-y-4">
              <span className="text-[9px] font-black tracking-widest uppercase text-[#C6007E] block">Applied For</span>
              <div>
                <h3 className="text-xl font-black">{job?.title || 'Untitled Job'}</h3>
                {job?.company?.companyName && (
                  <p className="text-xs font-bold text-[#3835A4]/60">{job.company.companyName}</p>
                )}
              </div>

              <div className="border-t border-[#3835A4]/5 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#3835A4]/50 block text-[9px] font-bold uppercase tracking-wider">Role</span>
                  <span className="font-bold">{role?.title || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#3835A4]/50 block text-[9px] font-bold uppercase tracking-wider">Applied On</span>
                  <span className="font-bold">{new Date(createdAt).toLocaleDateString()}</span>
                </div>
                {job?.category && (
                  <div>
                    <span className="text-[#3835A4]/50 block text-[9px] font-bold uppercase tracking-wider">Category</span>
                    <span className="font-bold">{job.category.name}</span>
                  </div>
                )}
                {job?.castingCity && (
                  <div>
                    <span className="text-[#3835A4]/50 block text-[9px] font-bold uppercase tracking-wider">Casting Location</span>
                    <span className="font-bold">
                      {job.castingCity.name}{job.castingCity.country ? `, ${job.castingCity.country.name}` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Career History */}
            {talent?.careerHistory?.length > 0 && (
              <div className="bg-white border-2 border-[#3835A4]/10 rounded-2xl p-6 shadow-sm space-y-3">
                <span className="text-[9px] font-black tracking-widest uppercase text-[#3835A4]/40 block">Career History</span>
                <div className="space-y-3">
                  {talent.careerHistory.map((ch: any) => (
                    <div key={ch.id} className="border-l-2 border-[#3835A4]/20 pl-3">
                      <p className="font-bold text-sm">{ch.title}</p>
                      {ch.description && <p className="text-[11px] text-[#3835A4]/60">{ch.description}</p>}
                      {ch.startDate && (
                        <p className="text-[10px] text-[#3835A4]/40">
                          {new Date(ch.startDate).getFullYear()}{ch.endDate ? ` - ${new Date(ch.endDate).getFullYear()}` : ' - Present'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Courses */}
            {talent?.courses?.length > 0 && (
              <div className="bg-white border-2 border-[#3835A4]/10 rounded-2xl p-6 shadow-sm space-y-3">
                <span className="text-[9px] font-black tracking-widest uppercase text-[#3835A4]/40 block">Courses & Training</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {talent.courses.map((c: any) => (
                    <div key={c.id} className="border border-[#3835A4]/10 rounded-xl p-3">
                      <p className="font-bold text-xs">{c.title}</p>
                      {c.institution && <p className="text-[10px] text-[#3835A4]/50">{c.institution}</p>}
                      {c.year && <p className="text-[10px] text-[#3835A4]/40">{c.year}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media / Portfolio */}
            {talent?.media?.length > 0 && (
              <div className="bg-white border-2 border-[#3835A4]/10 rounded-2xl p-6 shadow-sm space-y-4">
                <span className="text-[9px] font-black tracking-widest uppercase text-[#3835A4]/40 block">Portfolio Media</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {talent.media.filter((m: any) => m.type === 'IMAGE').slice(0, 6).map((m: any) => (
                    <div key={m.id} className="aspect-square rounded-xl overflow-hidden border border-[#3835A4]/10">
                      <img src={m.url} alt={m.caption || ''} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {talent.media.filter((m: any) => m.type === 'VIDEO_LINK').slice(0, 3).map((m: any) => (
                    <div key={m.id} className="aspect-video rounded-xl overflow-hidden border border-[#3835A4]/10 bg-[#3835A4]/5 flex items-center justify-center text-[10px] font-bold text-[#3835A4]/40">
                      🎬 {m.title || 'Video Link'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Data / Application Answers */}
            {formData && Object.keys(formData).length > 0 && (
              <div className="bg-white border-2 border-[#3835A4]/10 rounded-2xl p-6 shadow-sm space-y-4">
                <span className="text-[9px] font-black tracking-widest uppercase text-[#3835A4]/40 block">Application Form Data</span>

                {/* Contact Info */}
                {formData.phoneNumber && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#3835A4]/50 font-bold uppercase tracking-wider text-[9px]">Phone</span>
                    <span className="font-medium">{formData.phoneNumber}</span>
                  </div>
                )}
                {formData.whatsappNumber && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#3835A4]/50 font-bold uppercase tracking-wider text-[9px]">WhatsApp</span>
                    <span className="font-medium">{formData.whatsappNumber}</span>
                  </div>
                )}

                {/* Selected Images */}
                {formData.selectedImageIds?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-black tracking-widest uppercase text-[#3835A4]/40 block">Selected Images</span>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {formData.selectedImageIds.map((id: string) => {
                        const m = talent?.media?.find((x: any) => x.id === id);
                        return (
                          <div key={id} className="aspect-square rounded-lg overflow-hidden border border-[#3835A4]/10 bg-stone-100">
                            {m?.url ? (
                              <img src={m.url} alt={m.title || ''} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] text-stone-400 font-bold uppercase">No img</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Selected Video Links */}
                {formData.selectedVideoLinkIds?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-black tracking-widest uppercase text-[#3835A4]/40 block">Selected Video Links</span>
                    <div className="space-y-1.5">
                      {formData.selectedVideoLinkIds.map((id: string) => {
                        const m = talent?.media?.find((x: any) => x.id === id);
                        return (
                          <div key={id} className="flex items-center gap-2 text-xs bg-[#3835A4]/5 rounded-lg px-3 py-2">
                            <span>🎬</span>
                            <span className="font-medium">{m?.title || 'Untitled Video Link'}</span>
                            {m?.videoLink && (
                              <a href={m.videoLink} target="_blank" rel="noopener noreferrer" className="ml-auto text-[#C6007E] hover:underline text-[10px] font-bold">Open →</a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Acting Video */}
                {formData.actingVideoMediaId && (
                  <MediaField
                    label="Acting Video"
                    mediaId={formData.actingVideoMediaId}
                    mediaList={talent?.media}
                  />
                )}

                {/* Casting Video */}
                {formData.castingVideoMediaId && (
                  <MediaField
                    label="Casting Video"
                    mediaId={formData.castingVideoMediaId}
                    mediaList={talent?.media}
                  />
                )}

                {/* Audio */}
                {formData.audioMediaId && (
                  <MediaField
                    label="Audio"
                    mediaId={formData.audioMediaId}
                    mediaList={talent?.media}
                  />
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="bg-[#3835A4] text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#2a2899] transition-colors">
                Update Status
              </button>
              <Link
                to={`/talent/${user.username}`}
                className="border-2 border-[#3835A4]/20 text-[#3835A4] px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#3835A4]/5 transition-colors"
              >
                View Full Profile
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;
