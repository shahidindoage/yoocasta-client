import React, { useState, useRef, useEffect } from 'react';
import HtmlEditor from '../../../components/HtmlEditor';

const INITIAL_ROLE = {
 title: '',
 description: '',
 usage: '',
 experience: [] as string[],
 ethnicityIds: [] as string[],
 nationalityIds: [] as string[],
 noOfCast: '',
 gender: '',
 ageMin: '1',
 ageMax: '100',
 languageIds: [] as string[],
 dialectIds: [] as string[],
 locationCountryIds: [] as string[],
 locationCityIds: [] as string[],
 question1: '',
 question2: '',
 question3: '',
 requiredProfileVideo: false,
 requiredCastingVideo: false,
 paymentType: '',
 paymentDetails: {} as any
};

const EXP_OPTIONS = ['Any', 'Amature', 'Intermediate', 'Experienced', 'Professional'];

// ─── Dropdown Multi-Select Checkbox Component ──────────────────────────
function MultiSelectDropdown({
 label,
 field,
 items,
 values,
 onToggle,
 anyLabel = 'Any',
 placeholder = 'Select...',
}: {
 label: string;
 field: string;
 items: { id: string; name: string }[];
 values: string[];
 onToggle: (field: string, value: string) => void;
 anyLabel?: string;
 placeholder?: string;
}) {
 const [open, setOpen] = useState(false);
 const [query, setQuery] = useState('');
 const ref = useRef<HTMLDivElement>(null);

 // Close on outside click
 useEffect(() => {
  const handler = (e: MouseEvent) => {
   if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
  };
  document.addEventListener('mousedown', handler);
  return () => document.removeEventListener('mousedown', handler);
 }, []);

 const isAny = values.includes('any');
 const displayText = isAny
  ? anyLabel
  : values.length === 0
  ? placeholder
  : values.length === 1
  ? (items.find(i => i.id === values[0])?.name ?? values[0])
  : `${values.length} selected`;

 const filteredItems = (items || []).filter(item =>
  item.name.toLowerCase().includes(query.trim().toLowerCase())
 );

 return (
  <div className="space-y-1.5" ref={ref}>
   <label className="block text-[10px] font-extrabold text-[#3835A4]/50 ">
    {label}
   </label>
   <div className="relative">
    {/* Trigger */}
    <button
     type="button"
     onClick={() => setOpen(v => !v)}
     className="w-full flex items-center justify-between bg-transparent border-b-2 border-[#3835A4]/20 py-3 text-sm text-left outline-none cursor-pointer hover:border-[#3835A4] transition-colors"
    >
     <span className={values.length === 0 && !isAny ? 'text-[#3835A4]/40' : 'text-[#3835A4]'}>
      {displayText}
     </span>
     <svg
      className={`w-4 h-4 text-[#3835A4]/50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
     >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
     </svg>
    </button>

    {/* Dropdown Panel */}
    {open && (
     <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-[#3835A4]/20 rounded-xl shadow-xl overflow-hidden">
      {/* Search */}
      <div className="sticky top-0 z-10 bg-white px-3 py-2 border-b border-[#3835A4]/10">
       <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${label.toLowerCase()}...`}
        className="w-full bg-[#3835A4]/5 border border-[#3835A4]/10 rounded-lg px-3 py-1.5 text-sm text-[#3835A4] outline-none focus:border-[#3835A4]"
       />
      </div>
      <div className="max-h-52 overflow-y-auto divide-y divide-[#3835A4]/5">
       {/* Any option */}
       <label className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[#C6007E]/5 transition-colors">
        <input
         type="checkbox"
         checked={isAny}
         onChange={() => onToggle(field, 'any')}
         className="accent-[#C6007E] w-4 h-4 flex-shrink-0"
        />
        <span className="text-sm font-bold text-[#C6007E]">{anyLabel}</span>
       </label>
       {/* Individual items */}
       {filteredItems.length === 0 && !isAny && (
        <p className="px-4 py-3 text-xs text-[#3835A4]/40">No options found</p>
       )}
       {filteredItems.map(item => (
        <label
         key={item.id}
         className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
          isAny ? 'opacity-40 pointer-events-none' : 'hover:bg-[#3835A4]/5'
         }`}
        >
         <input
          type="checkbox"
          checked={values.includes(item.id)}
          onChange={() => onToggle(field, item.id)}
          disabled={isAny}
          className="accent-[#3835A4] w-4 h-4 flex-shrink-0"
         />
         <span className="text-sm text-[#3835A4]">{item.name}</span>
        </label>
       ))}
      </div>
      {/* Footer: summary + done */}
      <div className="border-t border-[#3835A4]/10 px-4 py-2 flex items-center justify-between bg-[#3835A4]/3">
       <span className="text-[10px] text-[#3835A4]/50">
        {isAny ? anyLabel : values.length > 0 ? `${values.length} selected` : 'None selected'}
       </span>
       <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-[10px] font-bold text-[#C6007E] hover:underline"
       >
        Done ✓
       </button>
      </div>
     </div>
    )}
   </div>
  </div>
 );
}

// ─── Main Component ────────────────────────────────────────────────────
export default function RolesStep({ roles, setRoles, jobPaymentInfo, options, onBack, onSubmit, submitting, submitLabel = 'Finish & Post Job' }: any) {
 const [form, setForm] = useState<typeof INITIAL_ROLE>({ ...INITIAL_ROLE });
 const [editingIndex, setEditingIndex] = useState<number | null>(null);
 const [showForm, setShowForm] = useState(roles.length === 0);

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { name, value, type } = e.target;
  if (type === 'checkbox') {
   const checked = (e.target as HTMLInputElement).checked;
   setForm(prev => ({ ...prev, [name]: checked }));
  } else {
   setForm(prev => ({ ...prev, [name]: value }));
  }
 };

 const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setForm(prev => ({
   ...prev,
   paymentDetails: { ...prev.paymentDetails, [e.target.name]: e.target.value }
  }));
 };

 const handleMultiSelect = (field: string, value: string) => {
  setForm(prev => {
   const current = [...(prev as any)[field]] as string[];
   if (value === 'any') {
    return { ...prev, [field]: current.includes('any') ? [] : ['any'] };
   }
   const withoutAny = current.filter(v => v !== 'any');
   if (withoutAny.includes(value)) {
    return { ...prev, [field]: withoutAny.filter(v => v !== value) };
   }
   return { ...prev, [field]: [...withoutAny, value] };
  });
 };

 const handleSaveRole = () => {
  if (!form.title) return alert('Role Title is required');
  if (editingIndex !== null) {
   const updated = [...roles];
   updated[editingIndex] = form;
   setRoles(updated);
   setEditingIndex(null);
  } else {
   setRoles([...roles, form]);
  }
  setForm({ ...INITIAL_ROLE });
  setShowForm(false);
 };

 const editRole = (index: number) => {
  setForm(roles[index]);
  setEditingIndex(index);
  setShowForm(true);
 };

 const removeRole = (index: number) => {
  const updated = [...roles];
  updated.splice(index, 1);
  setRoles(updated);
 };

 const ageOptions = Array.from({ length: 100 }, (_, i) => i + 1);

 return (
  <div className="space-y-8 animate-fadeIn">
   <div className="border-b border-[#3835A4]/10 pb-4 flex justify-between items-center">
    <h2 className="text-xl font-black text-[#C6007E]">Step 2: Roles Configuration</h2>
    <button type="button" onClick={onBack} className="text-[#3835A4] text-sm font-bold">&larr; Back to Job Info</button>
   </div>

   {/* Role List */}
   {roles.length > 0 && (
    <div className="space-y-4 mb-8">
     <h3 className="font-bold text-[#3835A4]">Added Roles</h3>
     {roles.map((r: any, i: number) => (
      <div key={i} className="bg-[#3835A4]/5 p-4 rounded-xl border border-[#3835A4]/20 flex justify-between items-center">
       <div>
        <h4 className="font-black text-[#C6007E] ">{r.title}</h4>
        <p className="text-xs text-[#3835A4]/70">{r.noOfCast} Casts • Gender: {r.gender} • Ages: {r.ageMin}–{r.ageMax}</p>
       </div>
       <div className="flex gap-4">
        <button type="button" onClick={() => editRole(i)} className="text-sm font-bold text-[#3835A4] hover:underline">Edit</button>
        <button type="button" onClick={() => removeRole(i)} className="text-sm font-bold text-red-500 hover:underline">Remove</button>
       </div>
      </div>
     ))}
    </div>
   )}

   {/* Add/Edit Role Form */}
   {showForm ? (
    <div className="bg-white border-2 border-[#3835A4]/10 p-6 rounded-2xl shadow-sm space-y-6">
     <h3 className="font-black text-[#3835A4]">{editingIndex !== null ? 'Edit Role' : 'Add New Role'}</h3>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Role Title */}
      <div className="space-y-1.5 md:col-span-2">
       <label className="block text-[10px] font-extrabold text-[#3835A4]/50 ">Role Title *</label>
       <input name="title" value={form.title} onChange={handleChange} className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-3 text-sm outline-none focus:border-[#3835A4]" />
      </div>

      {/* Description */}
      <div className="space-y-1.5 md:col-span-2">
       <label className="block text-[10px] font-extrabold text-[#3835A4]/50 ">Description *</label>
       <HtmlEditor value={form.description} onChange={(html) => handleChange({ target: { name: 'description', value: html } } as any)} />
      </div>

      {/* Role Usage */}
      <div className="space-y-1.5 md:col-span-2">
       <label className="block text-[10px] font-extrabold text-[#3835A4]/50 ">Role Usage *</label>
       <input name="usage" value={form.usage} onChange={handleChange} className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-3 text-sm outline-none focus:border-[#3835A4]" />
      </div>

      {/* Experience */}
      <div className="space-y-1.5 md:col-span-2">
       <label className="block text-[10px] font-extrabold text-[#3835A4]/50 ">Experience *</label>
       <div className="flex flex-wrap gap-4 mt-2">
        {EXP_OPTIONS.map(exp => (
         <label key={exp} className="flex items-center gap-2 text-sm text-[#3835A4] cursor-pointer">
          <input type="checkbox" checked={form.experience.includes(exp)} onChange={() => handleMultiSelect('experience', exp)} className="accent-[#C6007E]" />
          {exp}
         </label>
        ))}
       </div>
      </div>

      {/* Ethnicity */}
      <MultiSelectDropdown
       label="Ethnicity *"
       field="ethnicityIds"
       items={options?.ethnicities || []}
       values={form.ethnicityIds}
       onToggle={handleMultiSelect}
       anyLabel="Any Ethnicity"
       placeholder="Select ethnicity..."
      />

      {/* Nationality */}
      <MultiSelectDropdown
       label="Nationality *"
       field="nationalityIds"
       items={options?.nationalities || []}
       values={form.nationalityIds}
       onToggle={handleMultiSelect}
       anyLabel="Any Nationality"
       placeholder="Select nationality..."
      />

      {/* Language */}
      <MultiSelectDropdown
       label="Language *"
       field="languageIds"
       items={options?.languages || []}
       values={form.languageIds}
       onToggle={handleMultiSelect}
       anyLabel="Any Language"
       placeholder="Select language..."
      />

      {/* Dialects */}
      <MultiSelectDropdown
       label="Dialects"
       field="dialectIds"
       items={options?.dialects || []}
       values={form.dialectIds}
       onToggle={handleMultiSelect}
       anyLabel="Any Dialect"
       placeholder="Select dialect..."
      />

      {/* No of Casts */}
      <div className="space-y-1.5">
       <label className="block text-[10px] font-extrabold text-[#3835A4]/50 ">No of Casts *</label>
       <input type="number" name="noOfCast" value={form.noOfCast} onChange={handleChange} className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-3 text-sm outline-none focus:border-[#3835A4]" />
      </div>

      {/* Gender */}
      <div className="space-y-1.5">
       <label className="block text-[10px] font-extrabold text-[#3835A4]/50 ">Gender *</label>
       <select name="gender" value={form.gender} onChange={handleChange} className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-3 text-sm outline-none cursor-pointer">
        <option value="">Select...</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="male and female">Male and Female</option>
       </select>
      </div>

      {/* Age From */}
      <div className="space-y-1.5">
       <label className="block text-[10px] font-extrabold text-[#3835A4]/50 ">Age From *</label>
       <select name="ageMin" value={form.ageMin} onChange={handleChange} className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-3 text-sm outline-none cursor-pointer">
        {ageOptions.map(val => <option key={val} value={val.toString()}>{val}</option>)}
       </select>
      </div>

      {/* Age To */}
      <div className="space-y-1.5">
       <label className="block text-[10px] font-extrabold text-[#3835A4]/50 ">Age To *</label>
       <select name="ageMax" value={form.ageMax} onChange={handleChange} className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-3 text-sm outline-none cursor-pointer">
        {ageOptions.map(val => <option key={val} value={val.toString()}>{val}</option>)}
       </select>
      </div>

      {/* Location from where talent can apply */}
      <div className="space-y-2 md:col-span-2">
       <label className="block text-[10px] font-extrabold text-[#3835A4]/50 ">Location from where Talent can Apply *</label>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MultiSelectDropdown
         label="Country"
         field="locationCountryIds"
         items={options?.countries || []}
         values={form.locationCountryIds}
         onToggle={handleMultiSelect}
         anyLabel="Any Country"
         placeholder="Select country..."
        />
        <MultiSelectDropdown
         label="City"
         field="locationCityIds"
         items={(options?.cities || []).filter((c: any) =>
          form.locationCountryIds.includes('any') ||
          !form.locationCountryIds.length ||
          form.locationCountryIds.includes(c.countryId)
         )}
         values={form.locationCityIds}
         onToggle={handleMultiSelect}
         anyLabel="Any City"
         placeholder="Select city..."
        />
       </div>
      </div>

      {/* Post Questions */}
      <div className="space-y-4 md:col-span-2 border-t border-[#3835A4]/10 pt-6">
       <h4 className="font-bold text-[#3835A4]">Post Questions (Optional)</h4>
       <input name="question1" value={form.question1} onChange={handleChange} placeholder="Question 1" className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-2 text-sm outline-none focus:border-[#3835A4]" />
       <input name="question2" value={form.question2} onChange={handleChange} placeholder="Question 2" className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-2 text-sm outline-none focus:border-[#3835A4]" />
       <input name="question3" value={form.question3} onChange={handleChange} placeholder="Question 3" className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-2 text-sm outline-none focus:border-[#3835A4]" />
      </div>

      {/* Video Requirements */}
      <div className="space-y-2 md:col-span-2">
       <label className="flex items-center gap-2 text-sm text-[#3835A4] cursor-pointer">
        <input type="checkbox" name="requiredProfileVideo" checked={form.requiredProfileVideo} onChange={handleChange} className="accent-[#C6007E]" />
        Required to Upload Acting Video
       </label>
       <label className="flex items-center gap-2 text-sm text-[#3835A4] cursor-pointer">
        <input type="checkbox" name="requiredCastingVideo" checked={form.requiredCastingVideo} onChange={handleChange} className="accent-[#C6007E]" />
        Required to Upload Casting Video
       </label>
      </div>

      {/* Payment Section — Only if Paid */}
      {jobPaymentInfo === 'paid' && (
       <div className="space-y-4 md:col-span-2 border-t border-[#3835A4]/10 pt-6 bg-green-50/50 -mx-6 px-6 pb-6 rounded-b-2xl">
        <label className="block text-[10px] font-extrabold text-[#3835A4]/50 mt-6">Payment Type *</label>
        <select name="paymentType" value={form.paymentType} onChange={handleChange} className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-3 text-sm outline-none cursor-pointer">
         <option value="">Select Payment Type...</option>
         <option value="per_hour">Per Hour</option>
         <option value="per_day">Per Day</option>
         <option value="per_week">Per Week</option>
         <option value="per_month">Per Month</option>
         <option value="package">Package</option>
        </select>

        {form.paymentType === 'per_hour' && (
         <div className="grid grid-cols-3 gap-4">
          <input type="number" name="hoursPerDay" placeholder="No of Hours/Day" value={form.paymentDetails?.hoursPerDay ?? ''} onChange={handlePaymentChange} className="border-b-2 border-[#3835A4]/20 py-2 text-sm bg-transparent outline-none" />
          <input type="number" name="budgetPerHour" placeholder="Budget/Hour (AED)" value={form.paymentDetails?.budgetPerHour ?? ''} onChange={handlePaymentChange} className="border-b-2 border-[#3835A4]/20 py-2 text-sm bg-transparent outline-none" />
          <input type="number" name="noOfDays" placeholder="No of Days" value={form.paymentDetails?.noOfDays ?? ''} onChange={handlePaymentChange} className="border-b-2 border-[#3835A4]/20 py-2 text-sm bg-transparent outline-none" />
         </div>
        )}

        {form.paymentType === 'per_day' && (
         <div className="space-y-4">
          <p className="text-xs text-[#C6007E] font-bold">The talent budget will be the total of half day and full day budget. Enter accordingly!</p>
          <div className="grid grid-cols-2 gap-4 border-l-2 border-[#3835A4]/20 pl-4">
           <div className="space-y-2">
            <label className="text-xs font-bold text-[#3835A4]">No of Days</label>
            <input type="number" name="fullDay" placeholder="Full Day" value={form.paymentDetails?.fullDay ?? ''} onChange={handlePaymentChange} className="w-full border-b-2 border-[#3835A4]/20 py-2 text-sm bg-transparent outline-none" />
            <input type="number" name="halfDay" placeholder="Half Day" value={form.paymentDetails?.halfDay ?? ''} onChange={handlePaymentChange} className="w-full border-b-2 border-[#3835A4]/20 py-2 text-sm bg-transparent outline-none" />
           </div>
           <div className="space-y-2">
            <label className="text-xs font-bold text-[#3835A4]">Budget (AED)</label>
            <input type="number" name="budgetFullDay" placeholder="Full Day Budget" value={form.paymentDetails?.budgetFullDay ?? ''} onChange={handlePaymentChange} className="w-full border-b-2 border-[#3835A4]/20 py-2 text-sm bg-transparent outline-none" />
            <input type="number" name="budgetHalfDay" placeholder="Half Day Budget" value={form.paymentDetails?.budgetHalfDay ?? ''} onChange={handlePaymentChange} className="w-full border-b-2 border-[#3835A4]/20 py-2 text-sm bg-transparent outline-none" />
           </div>
          </div>
         </div>
        )}

        {form.paymentType === 'per_week' && (
         <div className="grid grid-cols-3 gap-4">
          <input type="number" name="noOfWeek" placeholder="No of Week" value={form.paymentDetails?.noOfWeek ?? ''} onChange={handlePaymentChange} className="border-b-2 border-[#3835A4]/20 py-2 text-sm bg-transparent outline-none" />
          <input type="number" name="daysPerWeek" placeholder="No of Day/Week" value={form.paymentDetails?.daysPerWeek ?? ''} onChange={handlePaymentChange} className="border-b-2 border-[#3835A4]/20 py-2 text-sm bg-transparent outline-none" />
          <input type="number" name="budgetPerWeek" placeholder="Budget/Week (AED)" value={form.paymentDetails?.budgetPerWeek ?? ''} onChange={handlePaymentChange} className="border-b-2 border-[#3835A4]/20 py-2 text-sm bg-transparent outline-none" />
         </div>
        )}

        {form.paymentType === 'per_month' && (
         <div className="grid grid-cols-3 gap-4">
          <input type="number" name="noOfMonth" placeholder="No of Months" value={form.paymentDetails?.noOfMonth ?? ''} onChange={handlePaymentChange} className="border-b-2 border-[#3835A4]/20 py-2 text-sm bg-transparent outline-none" />
          <input type="number" name="daysPerMonth" placeholder="No of Days/Month" value={form.paymentDetails?.daysPerMonth ?? ''} onChange={handlePaymentChange} className="border-b-2 border-[#3835A4]/20 py-2 text-sm bg-transparent outline-none" />
          <input type="number" name="budgetPerMonth" placeholder="Budget/Month (AED)" value={form.paymentDetails?.budgetPerMonth ?? ''} onChange={handlePaymentChange} className="border-b-2 border-[#3835A4]/20 py-2 text-sm bg-transparent outline-none" />
         </div>
        )}

        {form.paymentType === 'package' && (
         <div className="grid grid-cols-2 gap-4 border-l-2 border-[#3835A4]/20 pl-4">
          <div className="space-y-2">
           <label className="text-xs font-bold text-[#3835A4]">Total no of days</label>
           <input type="number" name="fullDay" placeholder="Full Day" value={form.paymentDetails?.fullDay ?? ''} onChange={handlePaymentChange} className="w-full border-b-2 border-[#3835A4]/20 py-2 text-sm bg-transparent outline-none" />
           <input type="number" name="halfDay" placeholder="Half Day" value={form.paymentDetails?.halfDay ?? ''} onChange={handlePaymentChange} className="w-full border-b-2 border-[#3835A4]/20 py-2 text-sm bg-transparent outline-none" />
          </div>
          <div className="space-y-2">
           <label className="text-xs font-bold text-[#3835A4]">Talent Total Budget (AED)</label>
           <input type="number" name="totalBudget" placeholder="Total Budget" value={form.paymentDetails?.totalBudget ?? ''} onChange={handlePaymentChange} className="w-full border-b-2 border-[#3835A4]/20 py-2 text-sm bg-transparent outline-none" />
          </div>
         </div>
        )}
       </div>
      )}
     </div>

     <div className="flex justify-end pt-4">
      <button type="button" onClick={handleSaveRole} className="bg-[#3835A4] text-white px-6 py-2 rounded-xl text-xs font-bold  hover:bg-[#2a2780]">
       Save Role
      </button>
     </div>
    </div>
   ) : (
    <button type="button" onClick={() => setShowForm(true)} className="w-full py-4 border-2 border-dashed border-[#3835A4]/30 rounded-xl text-[#3835A4] font-bold hover:bg-[#3835A4]/5 transition-colors">
     + Add Another Role
    </button>
   )}

   {/* Final Submit */}
   <div className="flex justify-between pt-8 border-t border-[#3835A4]/10">
    <div className="text-xs text-[#3835A4]/50 italic">Jobs require admin approval after posting.</div>
    <button
     type="button"
     onClick={onSubmit}
     disabled={submitting || roles.length === 0}
     className="bg-[#C6007E] disabled:bg-[#C6007E]/50 disabled:cursor-not-allowed text-white px-10 py-4 rounded-xl font-black  hover:bg-[#a10065] transition-colors"
    >
     {submitting ? 'Saving...' : submitLabel}
    </button>
   </div>
  </div>
 );
}
