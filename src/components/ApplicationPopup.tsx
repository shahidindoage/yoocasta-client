import { useState, useEffect, useRef } from 'react';
import { getMyProfile, uploadPortfolioMedia } from '../api/profile.api';
import { submitApplication } from '../api/application.api';

interface Props {
  jobId: string;
  role: any;
  isExpired: boolean;
  onClose: () => void;
  onApplied: () => void;
}

const STEPS = ['Contact', 'Images', 'Video Links', 'Acting Video', 'Casting Video', 'Audio'];

export default function ApplicationPopup({ jobId, role, isExpired, onClose, onApplied }: Props) {
  const [profile, setProfile] = useState<any>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');

  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideoLinks, setSelectedVideoLinks] = useState<string[]>([]);
  const [actingVideoId, setActingVideoId] = useState<string | null>(null);
  const [castingVideoId, setCastingVideoId] = useState<string | null>(null);
  const [audioId, setAudioId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMyProfile()
      .then(res => {
        const u = res.data.data;
        setProfile(u);
        if (u.talentProfile) {
          setPhone(u.talentProfile.contactNumber || '');
          setWhatsapp(u.whatsappNo || u.talentProfile.whatsappNo || '');
        }
        const allMedia: any[] = u.talentProfile?.media || [];
        setMedia(allMedia);
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleFileUpload = async (accept: string, type: string, callback: (id: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('type', type);
        const res = await uploadPortfolioMedia(fd);
        const newMedia = res.data.data;
        setMedia(prev => [newMedia, ...prev]);
        callback(newMedia.id);
      } catch { setError('Upload failed'); }
      finally { setUploading(false); }
    };
    input.click();
  };

  const handleFinish = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError('');

    const formData = {
      phoneNumber: phone,
      whatsappNumber: whatsapp,
      selectedImageIds: selectedImages,
      selectedVideoLinkIds: selectedVideoLinks,
      actingVideoMediaId: actingVideoId,
      castingVideoMediaId: castingVideoId,
      audioMediaId: audioId,
    };

    try {
      await submitApplication(role.id, formData);
      onApplied();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const isRequired = (field: string) => field === 'actingVideoId' ? !!role.requiredProfileVideo : field === 'castingVideoId' ? !!role.requiredCastingVideo : false;

  const canProceed = () => {
    if (step === 0) return phone.trim().length > 0 && whatsapp.trim().length > 0;
    if (step === 4 && isRequired('actingVideoId')) return !!actingVideoId;
    if (step === 5 && isRequired('castingVideoId')) return !!castingVideoId;
    return true;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="w-10 h-10 border-4 border-[#3835A4] border-t-[#C6007E] rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-stone-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-lg font-black tracking-tight text-[#3835A4]">Apply for Role</h2>
            <p className="text-xs text-stone-500 font-medium mt-0.5">{role.title}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl leading-none">&times;</button>
        </div>

        {/* Step Dots */}
        <div className="flex items-center gap-1.5 px-6 py-3 bg-stone-50/50">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
                i === step ? 'bg-[#C6007E] text-white' : i < step ? 'bg-green-500 text-white' : 'bg-stone-200 text-stone-400'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              {i === step && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#3835A4]">
                  {s}
                </span>
              )}
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-stone-200" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="px-6 py-6 space-y-5">
          {error && <p className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          {/* Step 1: Contact */}
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-xs text-stone-500 font-medium">Set your contact numbers for this application</p>
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold tracking-widest text-stone-400 uppercase">Phone Number *</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1234567890" className="w-full bg-transparent border-b-2 border-stone-200 py-2.5 text-sm outline-none focus:border-[#3835A4]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold tracking-widest text-stone-400 uppercase">WhatsApp Number *</label>
                <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+1234567890" className="w-full bg-transparent border-b-2 border-stone-200 py-2.5 text-sm outline-none focus:border-[#3835A4]" />
              </div>
            </div>
          )}

          {/* Step 2: Images */}
          {step === 1 && (
            <MediaSelector
              title="Select Images"
              items={media.filter(m => m.type === 'IMAGE')}
              selected={selectedImages}
              onToggle={(id) => setSelectedImages(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
              multiple
              onUpload={() => handleFileUpload('image/*', 'IMAGE', (id) => setSelectedImages(prev => [...prev, id]))}
              uploading={uploading}
            />
          )}

          {/* Step 3: Video Links */}
          {step === 2 && (
            <MediaSelector
              title="Select Video Links"
              items={media.filter(m => m.type === 'VIDEO_LINK')}
              selected={selectedVideoLinks}
              onToggle={(id) => setSelectedVideoLinks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
              multiple
              uploading={false}
            />
          )}

          {/* Step 4: Acting Video */}
          {step === 3 && (
            <MediaSelector
              title="Select Acting Video"
              subtitle={isRequired('actingVideoId') ? '* Required for this role' : 'Optional'}
              items={media.filter(m => m.type === 'ACTING_VIDEO' || m.type === 'VIDEO')}
              selected={actingVideoId ? [actingVideoId] : []}
              onToggle={(id) => setActingVideoId(prev => prev === id ? null : id)}
              multiple={false}
              onUpload={() => handleFileUpload('video/*,image/*', 'ACTING_VIDEO', (id) => setActingVideoId(id))}
              uploading={uploading}
              required={isRequired('actingVideoId')}
            />
          )}

          {/* Step 5: Casting Video */}
          {step === 4 && (
            <MediaSelector
              title="Select Casting Video"
              subtitle={isRequired('castingVideoId') ? '* Required for this role' : 'Optional'}
              items={media.filter(m => m.type === 'CASTING_VIDEO' || m.type === 'VIDEO')}
              selected={castingVideoId ? [castingVideoId] : []}
              onToggle={(id) => setCastingVideoId(prev => prev === id ? null : id)}
              multiple={false}
              onUpload={() => handleFileUpload('video/*,image/*', 'CASTING_VIDEO', (id) => setCastingVideoId(id))}
              uploading={uploading}
              required={isRequired('castingVideoId')}
            />
          )}

          {/* Step 6: Audio */}
          {step === 5 && (
            <MediaSelector
              title="Select Audio"
              subtitle="Optional"
              items={media.filter(m => m.type === 'AUDIO')}
              selected={audioId ? [audioId] : []}
              onToggle={(id) => setAudioId(prev => prev === id ? null : id)}
              multiple={false}
              onUpload={() => handleFileUpload('audio/*', 'AUDIO', (id) => setAudioId(id))}
              uploading={uploading}
              required={false}
            />
          )}
        </div>

        {/* Footer Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-stone-100 px-6 py-4 flex items-center justify-between rounded-b-3xl">
          <button
            onClick={() => step === 0 ? onClose() : setStep(s => s - 1)}
            className="text-xs font-bold text-stone-500 hover:text-stone-800 uppercase tracking-wider transition-colors"
          >
            {step === 0 ? 'Cancel' : '← Back'}
          </button>

          <div className="flex items-center gap-3">
            {!canProceed() && (
              <span className="text-[9px] text-amber-600 font-semibold italic">Please complete this step</span>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="bg-[#C6007E] disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#a10065] transition-all"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={!canProceed() || submitting}
                className="bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-green-700 transition-all flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : 'Finish & Apply'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Media Selector Sub-Component ─────────────────────────────────
function MediaSelector({
  title, subtitle, items, selected, onToggle, multiple, onUpload, uploading, required,
}: {
  title: string; subtitle?: string; items: any[]; selected: string[]; onToggle: (id: string) => void;
  multiple: boolean; onUpload?: () => void; uploading?: boolean; required?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-[#3835A4]">{title}</p>
          {subtitle && <p className="text-[10px] text-stone-400 font-medium">{subtitle}</p>}
        </div>
        {onUpload && (
          <button
            onClick={onUpload}
            disabled={uploading}
            className="text-[10px] font-black uppercase tracking-wider bg-[#3835A4] text-white px-4 py-2 rounded-lg hover:bg-[#2a2899] transition-all disabled:opacity-40"
          >
            {uploading ? 'Uploading...' : '+ Upload'}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-stone-400 italic py-4 text-center">No items available{onUpload ? ' — upload one above' : ''}</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
          {items.map((item) => {
            const isSelected = selected.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => onToggle(item.id)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-square ${
                  isSelected ? 'border-[#C6007E] ring-2 ring-[#C6007E]/30' : 'border-stone-100 hover:border-stone-200'
                }`}
              >
                {item.videoLink ? (
                  <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400 text-2xl">▶</div>
                ) : item.url ? (
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400 text-xs">No preview</div>
                )}
                {isSelected && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-[#C6007E] rounded-full flex items-center justify-center text-white text-[10px] font-black">✓</div>
                )}
                {item.title && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                    <span className="text-[8px] text-white font-bold truncate block">{item.title}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium text-stone-400">{selected.length} selected</span>
        {required && !selected.length && <span className="text-[10px] font-bold text-red-500">* Required</span>}
      </div>
    </div>
  );
}
