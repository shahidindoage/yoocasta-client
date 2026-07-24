import React, { useState, useMemo } from 'react';
import HtmlEditor from '../../../components/HtmlEditor';

export default function JobInformationStep({ data, updateData, options, onNext }: any) {
  const [castingDateWarn, setCastingDateWarn] = useState('');
  const [shootingDateWarn, setShootingDateWarn] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const handleAddCastingDate = () => {
    const input = document.getElementById('newCastingDate') as HTMLInputElement;
    const val = input?.value;
    if (!val) return;

    // Casting date must be AFTER Last Date To Apply
    if (data.lastDateToApply && new Date(val) <= new Date(data.lastDateToApply)) {
      setCastingDateWarn('Casting Date must be after the Last Date To Apply.');
      return;
    }

    setCastingDateWarn('');
    if (!data.castingDates.includes(val)) {
      updateData({ castingDates: [...data.castingDates, val] });
    }
    input.value = '';
  };

  const handleAddShootingDate = () => {
    const input = document.getElementById('newShootingDate') as HTMLInputElement;
    const val = input?.value;
    if (!val) return;

    // Shoot date must also be after Last Date To Apply
    if (data.lastDateToApply && new Date(val) <= new Date(data.lastDateToApply)) {
      setShootingDateWarn('Shoot Date must be after the Last Date To Apply.');
      return;
    }

    setShootingDateWarn('');
    if (!data.shootingDates.includes(val)) {
      updateData({ shootingDates: [...data.shootingDates, val] });
    }
    input.value = '';
  };

  const handleRemoveDate = (field: 'castingDates' | 'shootingDates', index: number) => {
    const newDates = [...data[field]];
    newDates.splice(index, 1);
    updateData({ [field]: newDates });
  };

  // All required fields must be filled before Next is enabled
  const isFormValid = useMemo(() => {
    return (
      data.castingService === 'portal' &&
      data.title?.trim() &&
      data.subTitle?.trim() &&
      data.description?.trim() &&
      data.usage?.trim() &&
      data.categoryId &&
      data.projectTypeId &&
      data.paymentInfo &&
      data.lastDateToApply &&
      // Casting location
      data.castingCountryId &&
      data.castingCityId &&
      data.castingDates?.length > 0 &&
      // Shoot location
      data.shootingCountryId &&
      data.shootingCityId &&
      data.shootingDates?.length > 0
    );
  }, [data]);

  if (data.castingService === 'manual') {
    return (
      <div className="space-y-6 text-center py-10">
        <select
          name="castingService"
          value={data.castingService}
          onChange={handleChange}
          className="bg-transparent border-b-2 border-[#3835A4]/20 py-2 mx-auto block outline-none font-bold text-[#3835A4]"
        >
          <option value="portal">Portal Casting</option>
          <option value="manual">Manual Casting</option>
        </select>
        <div className="bg-[#3835A4]/5 p-6 rounded-xl border border-[#3835A4]/10 max-w-lg mx-auto">
          <h2 className="text-xl font-black mb-2 text-[#C6007E]">Manual Casting Selected</h2>
          <p className="font-medium text-[#3835A4]/80">
            Thank You for selecting Manual Casting. Please send an email to{' '}
            <a href="mailto:casting@yoocasta.com" className="underline font-bold">casting@yoocasta.com</a>{' '}
            with your requirements.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b border-[#3835A4]/10 pb-4 mb-6">
        <h2 className="text-xl font-black uppercase text-[#C6007E]">Step 1: Job Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Casting Service */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-[10px] font-extrabold tracking-widest text-[#3835A4]/50 uppercase">Casting Service *</label>
          <select name="castingService" value={data.castingService} onChange={handleChange} className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-3 text-sm font-bold outline-none cursor-pointer">
            <option value="portal">Portal</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        {/* Job Title */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-extrabold tracking-widest text-[#3835A4]/50 uppercase">Job Title *</label>
          <input name="title" value={data.title} onChange={handleChange} className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-3 text-sm outline-none focus:border-[#3835A4]" />
        </div>

        {/* Job Sub Title */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-extrabold tracking-widest text-[#3835A4]/50 uppercase">Job Sub Title *</label>
          <input name="subTitle" value={data.subTitle} onChange={handleChange} className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-3 text-sm outline-none focus:border-[#3835A4]" />
        </div>

        {/* Description */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-[10px] font-extrabold tracking-widest text-[#3835A4]/50 uppercase">Description *</label>
          <HtmlEditor value={data.description} onChange={(html) => updateData({ description: html })} />
        </div>

        {/* Usage */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-[10px] font-extrabold tracking-widest text-[#3835A4]/50 uppercase">Usage *</label>
          <input name="usage" value={data.usage} onChange={handleChange} className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-3 text-sm outline-none focus:border-[#3835A4]" />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-extrabold tracking-widest text-[#3835A4]/50 uppercase">Category *</label>
          <select name="categoryId" value={data.categoryId} onChange={handleChange} className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-3 text-sm outline-none cursor-pointer">
            <option value="">Select Category...</option>
            {options?.categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Project Type */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-extrabold tracking-widest text-[#3835A4]/50 uppercase">Project Type *</label>
          <select name="projectTypeId" value={data.projectTypeId} onChange={handleChange} className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-3 text-sm outline-none cursor-pointer">
            <option value="">Select Project Type...</option>
            {options?.projectTypes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Payment Info */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-extrabold tracking-widest text-[#3835A4]/50 uppercase">Payment Info *</label>
          <select name="paymentInfo" value={data.paymentInfo} onChange={handleChange} className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-3 text-sm outline-none cursor-pointer">
            <option value="">Select...</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>

        {/* Last Date To Apply */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-extrabold tracking-widest text-[#3835A4]/50 uppercase">
            Last Date To Apply *
          </label>
          <input
            type="date"
            name="lastDateToApply"
            value={data.lastDateToApply}
            onChange={(e) => {
              handleChange(e);
              setCastingDateWarn('');
            }}
            className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-3 text-sm outline-none focus:border-[#3835A4]"
          />
          <p className="text-[10px] text-[#3835A4]/40 mt-1">Must be less than Casting Date</p>
        </div>
      </div>

      {/* Casting & Shoot Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[#3835A4]/10 pt-8 mt-8">

        {/* Casting Location */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#3835A4]">Casting Location &amp; Dates</h3>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold tracking-widest text-[#3835A4]/50 uppercase">Country</label>
            <select name="castingCountryId" value={data.castingCountryId} onChange={handleChange} className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-3 text-sm outline-none cursor-pointer">
              <option value="">Select...</option>
              {options?.countries?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold tracking-widest text-[#3835A4]/50 uppercase">City</label>
            <select name="castingCityId" value={data.castingCityId} onChange={handleChange} className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-3 text-sm outline-none cursor-pointer">
              <option value="">Select...</option>
              {options?.cities?.filter((c: any) => !data.castingCountryId || c.countryId === data.castingCountryId).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-extrabold tracking-widest text-[#3835A4]/50 uppercase">Casting Dates *</label>
            <div className="flex gap-2">
              <input
                type="date"
                id="newCastingDate"
                min={data.lastDateToApply || undefined}
                className="flex-1 bg-transparent border-b-2 border-[#3835A4]/20 py-2 text-sm outline-none focus:border-[#3835A4]"
              />
              <button type="button" onClick={handleAddCastingDate} className="bg-[#3835A4] text-white px-4 text-xs font-bold rounded">Add</button>
            </div>
            {castingDateWarn && (
              <p className="text-[10px] text-amber-600 font-semibold">{castingDateWarn}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {data.castingDates.map((date: string, i: number) => (
                <span key={i} className="bg-[#3835A4]/10 text-[#3835A4] px-2 py-1 rounded text-xs flex items-center gap-2">
                  {date}
                  <button type="button" onClick={() => handleRemoveDate('castingDates', i)} className="text-red-500 font-bold">&times;</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Shoot Location */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#3835A4]">Shoot / Project Location</h3>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold tracking-widest text-[#3835A4]/50 uppercase">Country *</label>
            <select name="shootingCountryId" value={data.shootingCountryId} onChange={handleChange} className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-3 text-sm outline-none cursor-pointer">
              <option value="">Select...</option>
              {options?.countries?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold tracking-widest text-[#3835A4]/50 uppercase">City</label>
            <select name="shootingCityId" value={data.shootingCityId} onChange={handleChange} className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-3 text-sm outline-none cursor-pointer">
              <option value="">Select...</option>
              {options?.cities?.filter((c: any) => !data.shootingCountryId || c.countryId === data.shootingCountryId).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-extrabold tracking-widest text-[#3835A4]/50 uppercase">Shoot Dates *</label>
            <div className="flex gap-2">
              <input
                type="date"
                id="newShootingDate"
                min={data.lastDateToApply || undefined}
                className="flex-1 bg-transparent border-b-2 border-[#3835A4]/20 py-2 text-sm outline-none focus:border-[#3835A4]"
              />
              <button type="button" onClick={handleAddShootingDate} className="bg-[#3835A4] text-white px-4 text-xs font-bold rounded">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {data.shootingDates.map((date: string, i: number) => (
                <span key={i} className="bg-[#3835A4]/10 text-[#3835A4] px-2 py-1 rounded text-xs flex items-center gap-2">
                  {date}
                  <button type="button" onClick={() => handleRemoveDate('shootingDates', i)} className="text-red-500 font-bold">&times;</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end items-center gap-3 pt-6">
        {!isFormValid && (
          <span className="text-[10px] text-[#3835A4]/40 italic">Fill all required fields (*) to continue</span>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={!isFormValid}
          className="bg-[#C6007E] disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-[#a10065] transition-all"
        >
          Next Step &rarr;
        </button>
      </div>
    </div>
  );
}
