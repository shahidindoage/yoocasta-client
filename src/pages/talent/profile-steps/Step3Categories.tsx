import { useState } from 'react';
import { FormOptions } from '../ProfileSetup';

interface Props {
  options: FormOptions;
  onSubmit: (data: any) => void;
  onBack: () => void;
  loading: boolean;
  existingProfile: any;
  isFirstTime: boolean;
}

const CATEGORY_ATTRIBUTES: Record<string, { key: string; label: string; type: 'text' | 'select'; options?: string[] }[]> = {
  'Singers': [
    { key: 'singing_language', label: 'Singing Language', type: 'text' },
    { key: 'style_of_songs', label: 'Style of Songs', type: 'text' },
    { key: 'singer_individual_or_band', label: 'Individual or Band', type: 'select', options: ['Individual', 'Band'] },
  ],
  'Dancers': [
    { key: 'style_of_dance', label: 'Style of Dance', type: 'text' },
    { key: 'dancer_individual_or_band', label: 'Individual or Band', type: 'select', options: ['Individual', 'Band'] },
  ],
  'Photographers': [
    { key: 'camera_worked_on', label: 'Cameras Worked On', type: 'text' },
    { key: 'photography_types', label: 'Photography Types', type: 'text' },
  ],
  'Directors': [
    { key: 'director_types_of_project', label: 'Types of Projects', type: 'text' },
    { key: 'director_assistant_level', label: 'Role Level', type: 'select', options: ['Lead', '1st Assistant', '2nd Assistant'] },
  ],
  'Cinematographers': [
    { key: 'cinematographer_cameras', label: 'Cameras Worked On', type: 'text' },
    { key: 'cinematographer_project_types', label: 'Types of Projects', type: 'text' },
  ],
  'Makeup Artists': [
    { key: 'makeup_project_types', label: 'Types of Projects', type: 'text' },
    { key: 'makeup_or_hairstylist', label: 'Specialization', type: 'select', options: ['Makeup', 'Hairstylist', 'Both'] },
  ],
  'Voice Over Artists': [
    { key: 'voiceover_project_types', label: 'Types of Projects', type: 'text' },
    { key: 'voiceover_role_type', label: 'Role Type', type: 'select', options: ['MC', 'MV', 'Voiceover', 'VJ'] },
  ],
};

const Step3Categories = ({ options, onSubmit, onBack, loading, existingProfile, isFirstTime }: Props) => {
  const tp = existingProfile?.talentProfile;

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    tp?.categories?.map((c: any) => c.categoryId) || []
  );

  const [attributes, setAttributes] = useState<Record<string, Record<string, string>>>(() => {
    const existing: Record<string, Record<string, string>> = {};
    tp?.attributes?.forEach((attr: any) => {
      if (!existing[attr.categoryId]) existing[attr.categoryId] = {};
      existing[attr.categoryId][attr.key] = attr.value;
    });
    return existing;
  });

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAttributeChange = (categoryId: string, key: string, value: string) => {
    setAttributes(prev => ({
      ...prev,
      [categoryId]: { ...(prev[categoryId] || {}), [key]: value }
    }));
  };

  const handleFormSubmit = () => {
    const attributesArray: any[] = [];
    Object.entries(attributes).forEach(([categoryId, attrs]) => {
      Object.entries(attrs).forEach(([key, value]) => {
        if (value) attributesArray.push({ categoryId, key, value });
      });
    });

    onSubmit({ categoryIds: selectedCategories, attributes: attributesArray });
  };

  return (
    <div className="space-y-12">

      <div className="space-y-6">
        <h3 className="text-xs font-black tracking-widest text-[#3835A4]/40 border-b border-[#3835A4]/10 pb-2">
          01 / Categories
        </h3>

        <div className="space-y-2">
          <label className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/40 block">Select Categories</label>
          <div className="flex flex-wrap gap-2.5">
            {options.categories.map((cat: any) => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`
                    px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 tracking-wider border
                    ${isSelected 
                      ? 'bg-[#3835A4] border-[#3835A4] text-white shadow-md shadow-[#3835A4]/20' 
                      : 'bg-white border-[#3835A4]/10 text-[#3835A4]/50 hover:border-[#3835A4] hover:text-[#3835A4]'
                    }
                  `}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedCategories.some(id => CATEGORY_ATTRIBUTES[options.categories.find((c: any) => c.id === id)?.name]?.length > 0) && (
        <div className="space-y-6">
          <h3 className="text-xs font-black tracking-widest text-[#3835A4]/40 border-b border-[#3835A4]/10 pb-2">
            02 / Details
          </h3>

          <div className="space-y-8">
            {selectedCategories.map(categoryId => {
              const category = options.categories.find((c: any) => c.id === categoryId);
              const fields = CATEGORY_ATTRIBUTES[category?.name] || [];
              if (fields.length === 0) return null;

              return (
                <div key={categoryId} className="bg-[#3835A4]/5 border border-[#3835A4]/10 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="w-1 h-3 bg-[#C6007E] rounded-full" />
                    <h4 className="text-xs font-black tracking-wider text-[#3835A4]">
                      {category?.name}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {fields.map(field => (
                      <div key={field.key} className="space-y-1.5 group">
                        <label className="text-[10px] font-extrabold tracking-widest text-[#3835A4]/40 group-focus-within:text-[#3835A4] transition-colors duration-200">
                          {field.label}
                        </label>

                        {field.type === 'select' ? (
                          <select
                            value={attributes[categoryId]?.[field.key] || ''}
                            onChange={(e) => handleAttributeChange(categoryId, field.key, e.target.value)}
                            className="w-full bg-transparent border-b-2 border-[#3835A4]/10 focus:border-[#3835A4] py-2 text-sm font-medium text-[#3835A4] outline-none transition-all duration-200 cursor-pointer appearance-none"
                          >
                            <option value="">Select...</option>
                            {field.options?.map(opt => (
                              <option key={opt} value={opt.toLowerCase()}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={attributes[categoryId]?.[field.key] || ''}
                            onChange={(e) => handleAttributeChange(categoryId, field.key, e.target.value)}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            className="w-full bg-transparent border-b-2 border-[#3835A4]/10 focus:border-[#3835A4] py-2.5 text-sm font-medium text-[#3835A4] placeholder-[#3835A4]/20 outline-none transition-all duration-200"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-[#3835A4]/10 flex items-center justify-between gap-4">
        <button type="button" onClick={onBack}
          className="group inline-flex items-center gap-2 text-[10px] font-black tracking-widest text-[#3835A4]/40 hover:text-[#3835A4] transition-colors duration-200 py-3"
        >
          <span className="transition-transform group-hover:-translate-x-1 duration-150">←</span>
          Back
        </button>

        <button
          type="button"
          onClick={handleFormSubmit}
          disabled={loading || selectedCategories.length === 0}
          className="bg-[#3835A4] hover:bg-[#2a2780] disabled:bg-[#3835A4]/20 text-white disabled:text-white/40 font-black text-[10px] tracking-widest px-10 py-4 rounded-xl transition-all duration-200 active:scale-[0.99] disabled:pointer-events-none inline-flex items-center gap-3 shadow-lg shadow-[#3835A4]/20"
        >
          {loading ? 'Saving...' : isFirstTime ? 'Save & Next →' : 'Save'}
        </button>
      </div>

    </div>
  );
};

export default Step3Categories;