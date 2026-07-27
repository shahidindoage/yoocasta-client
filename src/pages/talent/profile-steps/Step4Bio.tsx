import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  bioDescription: z.string().min(50, 'Bio must be at least 50 characters'),
  skillDescription: z.string().optional(),
  facebook: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  twitter: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

interface Props {
  onSubmit: (data: any) => void;
  onBack: () => void;
  loading: boolean;
  existingProfile: any;
  isFirstTime: boolean;
}

const AccordionSection = ({ id, label, children, openSections, toggleSection }: { id: string; label: string; children: React.ReactNode; openSections: Record<string, boolean>; toggleSection: (id: string) => void }) => {
  const isOpen = openSections[id];
  return (
    <div className="border border-[#3835A4]/10 rounded-xl">
      <button type="button" onClick={() => toggleSection(id)}
        className="flex items-center justify-between w-full px-4 py-3 bg-[#3835A4]/5 hover:bg-[#3835A4]/10 transition-colors text-left"
      >
        <span className="text-xs font-black tracking-widest text-[#3835A4]/40">{label}</span>
        <span className={`text-[#3835A4]/30 text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {isOpen && <div className="p-4 space-y-6">{children}</div>}
    </div>
  );
};

const Step4Bio = ({ onSubmit, onBack, loading, existingProfile, isFirstTime }: Props) => {
  const tp = existingProfile?.talentProfile;
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ '01': true });

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      bioDescription: tp?.bioDescription || '',
      skillDescription: tp?.skillDescription || '',
      facebook: tp?.facebook || '',
      twitter: tp?.twitter || '',
      linkedin: tp?.linkedin || '',
    }
  });

  const bioValue = watch('bioDescription', '');
  const isBioValid = bioValue.length >= 50;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      <AccordionSection id="01" label="01 / Bio" openSections={openSections} toggleSection={toggleSection}>
        <div className="space-y-1.5 group">
          <div className="flex justify-between items-baseline">
            <label className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/40 group-focus-within:text-[#3835A4] transition-colors duration-200">
              About You *
            </label>
            <span className={`text-[10px] font-mono tracking-wider ${isBioValid ? 'text-[#3835A4]/40' : 'text-[#3835A4]/20'}`}>
              {bioValue?.length || 0} / 50 min chars
            </span>
          </div>
          <textarea
            {...register('bioDescription')}
            rows={5}
            placeholder="Tell us about yourself, your experience, and what makes you unique..."
            className="w-full bg-transparent border-b-2 border-[#3835A4]/10 focus:border-[#3835A4] py-2.5 text-sm font-medium text-[#3835A4] placeholder-[#3835A4]/20 outline-none transition-all duration-200 resize-none leading-relaxed"
          />
          {errors.bioDescription && (
            <p className="text-xs text-[#C6007E] font-semibold">{errors.bioDescription.message as string}</p>
          )}
        </div>

        <div className="space-y-1.5 group">
          <label className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/40 group-focus-within:text-[#3835A4] transition-colors duration-200">
            Skills
          </label>
          <textarea
            {...register('skillDescription')}
            rows={3}
            placeholder="List your key skills..."
            className="w-full bg-transparent border-b-2 border-[#3835A4]/10 focus:border-[#3835A4] py-2.5 text-sm font-medium text-[#3835A4] placeholder-[#3835A4]/20 outline-none transition-all duration-200 resize-none leading-relaxed"
          />
        </div>
      </AccordionSection>

      <AccordionSection id="02" label="02 / Social Links" openSections={openSections} toggleSection={toggleSection}>
        <div className="space-y-6">
          <div className="space-y-1.5 group">
            <label className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/40 group-focus-within:text-[#3835A4] transition-colors duration-200">LinkedIn</label>
            <input type="text" {...register('linkedin')} placeholder="https://linkedin.com/in/yourprofile" className="w-full bg-transparent border-b-2 border-[#3835A4]/10 focus:border-[#3835A4] py-2.5 text-sm font-medium text-[#3835A4] placeholder-[#3835A4]/20 outline-none transition-all duration-200" />
            {errors.linkedin && <p className="text-xs text-[#C6007E] font-semibold">{errors.linkedin.message as string}</p>}
          </div>

          <div className="space-y-1.5 group">
            <label className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/40 group-focus-within:text-[#3835A4] transition-colors duration-200">Twitter / X</label>
            <input type="text" {...register('twitter')} placeholder="https://twitter.com/yourhandle" className="w-full bg-transparent border-b-2 border-[#3835A4]/10 focus:border-[#3835A4] py-2.5 text-sm font-medium text-[#3835A4] placeholder-[#3835A4]/20 outline-none transition-all duration-200" />
            {errors.twitter && <p className="text-xs text-[#C6007E] font-semibold">{errors.twitter.message as string}</p>}
          </div>

          <div className="space-y-1.5 group">
            <label className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/40 group-focus-within:text-[#3835A4] transition-colors duration-200">Facebook</label>
            <input type="text" {...register('facebook')} placeholder="https://facebook.com/yourprofile" className="w-full bg-transparent border-b-2 border-[#3835A4]/10 focus:border-[#3835A4] py-2.5 text-sm font-medium text-[#3835A4] placeholder-[#3835A4]/20 outline-none transition-all duration-200" />
            {errors.facebook && <p className="text-xs text-[#C6007E] font-semibold">{errors.facebook.message as string}</p>}
          </div>
        </div>
      </AccordionSection>

      <div className="pt-4 flex items-center justify-between gap-4">
        <button type="button" onClick={onBack}
          className="group inline-flex items-center gap-2 text-[10px] font-black tracking-widest text-[#3835A4]/40 hover:text-[#3835A4] transition-colors duration-200 py-3"
        >
          <span className="transition-transform group-hover:-translate-x-1 duration-150">←</span>
          Back
        </button>

        <button type="submit" disabled={loading}
          className="bg-[#3835A4] hover:bg-[#2a2780] disabled:bg-[#3835A4]/20 text-white disabled:text-white/40 font-black text-[10px] tracking-widest px-10 py-4 rounded-xl transition-all duration-200 active:scale-[0.99] disabled:pointer-events-none inline-flex items-center gap-3 shadow-lg shadow-[#3835A4]/20"
        >
          {loading ? 'Saving...' : isFirstTime ? 'Save & Next →' : 'Save'}
        </button>
      </div>

    </form>
  );
};

export default Step4Bio;