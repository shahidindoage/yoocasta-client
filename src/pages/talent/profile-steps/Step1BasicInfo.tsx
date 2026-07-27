import { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuthStore } from '../../../store/authStore';
import { FormOptions } from '../ProfileSetup';

interface Props {
  options: FormOptions;
  onSubmit: (data: any) => void;
  loading: boolean;
  existingProfile: any;
  isFirstTime: boolean;
}

const MultiSelect = ({ label, options, selected, onToggle }: { label: string; options: { id: string; name: string }[]; selected: string[]; onToggle: (id: string) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full bg-transparent border-b-2 border-[#3835A4]/10 focus:border-[#3835A4] py-2.5 text-sm text-[#3835A4] outline-none transition-all duration-200"
      >
        <span className="flex-1 text-left truncate">
          {selected.length === 0 ? label : `${selected.length} selected`}
        </span>
        <span className="text-[#3835A4]/30 text-xs">▾</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-[#3835A4]/10 rounded-xl shadow-lg max-h-48 overflow-y-auto w-full">
          {options.map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 px-3 py-2 text-xs text-[#3835A4] hover:bg-[#3835A4]/5 cursor-pointer transition-colors">
              <input type="checkbox" checked={selected.includes(opt.id)} onChange={() => onToggle(opt.id)} className="accent-[#3835A4]" />
              {opt.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const Step1BasicInfo = ({ options, onSubmit, loading, existingProfile, isFirstTime }: Props) => {
  const { user } = useAuthStore();
  const tp = existingProfile?.talentProfile;

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm({
    defaultValues: {
      middleName: existingProfile?.middleName || '',
      whatsappNo: existingProfile?.whatsappNo || '',
      dob: tp?.dob ? new Date(tp.dob).toISOString().split('T')[0] : '',
      age: tp?.age?.toString() || '',
      gender: tp?.gender || '',
      nationalityId: existingProfile?.nationalityId || '',
      ethnicityId: tp?.ethnicityId || '',
      languageIds: tp?.languages?.map((l: any) => l.languageId) || [],
      dialectIds: tp?.dialects?.map((d: any) => d.dialectId) || [],
      cityId: tp?.cityId || '',
      countryId: tp?.city?.country?.id || '',
      address: tp?.address || '',
    }
  });

  const dob = watch('dob');
  const countryId = watch('countryId');

  const calculateAge = (dobValue: string) => {
    if (!dobValue) return '';
    const birthDate = new Date(dobValue);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age.toString();
  };

  const filteredCities = countryId
    ? options.cities.filter((c: any) => c.country?.id === countryId)
    : options.cities;

  const handleToggle = (id: string, current: string[], fieldName: 'languageIds' | 'dialectIds') => {
    const updated = current.includes(id) ? current.filter(item => item !== id) : [...current, id];
    setValue(fieldName, updated);
  };

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ '01': true });

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const AccordionSection = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      
      <AccordionSection id="01" label="01 / Basic Info">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5 opacity-60">
            <label className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/40">First Name</label>
            <input value={user?.firstName || ''} disabled className="w-full bg-[#3835A4]/5 border-b-2 border-[#3835A4]/10 py-2.5 text-sm font-medium text-[#3835A4]/50 cursor-not-allowed outline-none" />
          </div>

          <div className="space-y-1.5 group">
            <label className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/40 group-focus-within:text-[#3835A4] transition-colors duration-200">Middle Name</label>
            <input type="text" {...register('middleName')} placeholder="Optional" className="w-full bg-transparent border-b-2 border-[#3835A4]/10 focus:border-[#3835A4] py-2.5 text-sm font-medium text-[#3835A4] placeholder-[#3835A4]/20 outline-none transition-all duration-200" />
          </div>

          <div className="space-y-1.5 opacity-60">
            <label className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/40">Last Name</label>
            <input value={user?.lastName || ''} disabled className="w-full bg-[#3835A4]/5 border-b-2 border-[#3835A4]/10 py-2.5 text-sm font-medium text-[#3835A4]/50 cursor-not-allowed outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5 opacity-60">
            <label className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/40">Email</label>
            <input value={user?.email || ''} disabled className="w-full bg-[#3835A4]/5 border-b-2 border-[#3835A4]/10 py-2.5 text-sm font-medium text-[#3835A4]/50 cursor-not-allowed outline-none" />
          </div>

          <div className="space-y-1.5 opacity-60">
            <label className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/40">Phone</label>
            <input value={user?.phone || 'Not Configured'} disabled className="w-full bg-[#3835A4]/5 border-b-2 border-[#3835A4]/10 py-2.5 text-sm font-medium text-[#3835A4]/50 cursor-not-allowed outline-none" />
          </div>

          <div className="space-y-1.5 group">
            <label className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/40 group-focus-within:text-[#3835A4] transition-colors duration-200">WhatsApp</label>
            <input type="text" {...register('whatsappNo')} placeholder="+971 00 000 0000" className="w-full bg-transparent border-b-2 border-[#3835A4]/10 focus:border-[#3835A4] py-2.5 text-sm font-medium text-[#3835A4] placeholder-[#3835A4]/20 outline-none transition-all duration-200" />
          </div>
        </div>
      </AccordionSection>

      <AccordionSection id="02" label="02 / Physical">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1.5 group">
            <label className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/40 group-focus-within:text-[#3835A4] transition-colors duration-200">Date of Birth</label>
            <input
              type="date"
              {...register('dob')}
              onChange={(e) => {
                setValue('dob', e.target.value);
                setValue('age', calculateAge(e.target.value));
              }}
              className="w-full bg-transparent border-b-2 border-[#3835A4]/10 focus:border-[#3835A4] py-2 text-sm font-medium text-[#3835A4] outline-none transition-all duration-200"
            />
          </div>

          <div className="space-y-1.5 opacity-60">
            <label className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/40">Age</label>
            <input value={dob ? calculateAge(dob) : '—'} disabled className="w-full bg-[#3835A4]/5 border-b-2 border-[#3835A4]/10 py-2.5 text-sm font-bold text-[#3835A4] cursor-not-allowed outline-none" />
          </div>

          <div className="space-y-1.5 group">
            <label className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/40 group-focus-within:text-[#3835A4] transition-colors duration-200">Gender</label>
            <select {...register('gender', { required: 'Gender is required' })} className="w-full bg-transparent border-b-2 border-[#3835A4]/10 focus:border-[#3835A4] py-2.5 text-sm font-medium text-[#3835A4] outline-none transition-all duration-200 cursor-pointer appearance-none">
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <p className="text-xs text-[#C6007E] font-semibold">{errors.gender.message as string}</p>}
          </div>

          <div className="space-y-1.5 group">
            <label className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/40 group-focus-within:text-[#3835A4] transition-colors duration-200">Ethnicity</label>
            <select {...register('ethnicityId')} className="w-full bg-transparent border-b-2 border-[#3835A4]/10 focus:border-[#3835A4] py-2.5 text-sm font-medium text-[#3835A4] outline-none transition-all duration-200 cursor-pointer appearance-none">
              <option value="">Select...</option>
              {options.ethnicities.map((e: any) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
        </div>
      </AccordionSection>

      <AccordionSection id="03" label="03 / Languages">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/40 block">Languages</label>
            <Controller
              name="languageIds"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  label="Select languages..."
                  options={options.languages}
                  selected={field.value || []}
                  onToggle={(id) => handleToggle(id, field.value || [], 'languageIds')}
                />
              )}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/40 block">Dialects</label>
            <Controller
              name="dialectIds"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  label="Select dialects..."
                  options={options.dialects}
                  selected={field.value || []}
                  onToggle={(id) => handleToggle(id, field.value || [], 'dialectIds')}
                />
              )}
            />
          </div>
        </div>
      </AccordionSection>

      <AccordionSection id="04" label="04 / Location">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5 group">
            <label className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/40 group-focus-within:text-[#3835A4] transition-colors duration-200">Nationality</label>
            <select {...register('nationalityId')} className="w-full bg-transparent border-b-2 border-[#3835A4]/10 focus:border-[#3835A4] py-2.5 text-sm font-medium text-[#3835A4] outline-none transition-all duration-200 cursor-pointer appearance-none">
              <option value="">Select...</option>
              {options.nationalities.map((n: any) => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 group">
            <label className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/40 group-focus-within:text-[#3835A4] transition-colors duration-200">Country</label>
            <select 
              {...register('countryId')} 
              onChange={(e) => {
                setValue('countryId', e.target.value);
                setValue('cityId', '');
              }}
              className="w-full bg-transparent border-b-2 border-[#3835A4]/10 focus:border-[#3835A4] py-2.5 text-sm font-medium text-[#3835A4] outline-none transition-all duration-200 cursor-pointer appearance-none"
            >
              <option value="">Select Country</option>
              {options.countries.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 group">
            <label className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/40 group-focus-within:text-[#3835A4] transition-colors duration-200">City</label>
            <select {...register('cityId')} className="w-full bg-transparent border-b-2 border-[#3835A4]/10 focus:border-[#3835A4] py-2.5 text-sm font-medium text-[#3835A4] outline-none transition-all duration-200 cursor-pointer appearance-none">
              <option value="">Select City</option>
              {filteredCities.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5 group">
          <label className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/40 group-focus-within:text-[#3835A4] transition-colors duration-200">Address</label>
          <textarea {...register('address')} rows={2} placeholder="Street, building, suite..." className="w-full bg-transparent border-b-2 border-[#3835A4]/10 focus:border-[#3835A4] py-2.5 text-sm font-medium text-[#3835A4] placeholder-[#3835A4]/20 outline-none transition-all duration-200 resize-none" />
        </div>
      </AccordionSection>

      <div className="pt-4 flex items-center justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#3835A4] hover:bg-[#2a2780] disabled:bg-[#3835A4]/20 text-white disabled:text-white/40 font-black text-[10px] tracking-widest px-10 py-4 rounded-xl transition-all duration-200 active:scale-[0.99] disabled:pointer-events-none inline-flex items-center gap-3 shadow-lg shadow-[#3835A4]/20"
        >
          {loading ? 'Saving...' : isFirstTime ? 'Save & Next →' : 'Save'}
        </button>
      </div>

    </form>
  );
};

export default Step1BasicInfo;