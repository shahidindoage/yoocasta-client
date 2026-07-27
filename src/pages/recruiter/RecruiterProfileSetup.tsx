import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecruiterProfile, updateRecruiterLocation, updateRecruiterProfile, uploadCompanyLogo, uploadTradeLicense } from "../../api/recruiter.api";
import { useAuthStore } from '../../store/authStore';
import { getProfileOptions } from "../../api/profile.api";


const RecruiterProfileSetup = () => {
 const navigate = useNavigate();
 const { user, updateUser } = useAuthStore();


 

 const [options, setOptions] = useState<any>(null);
const [countryId, setCountryId] = useState<string>('');
const [cityId, setCityId] = useState<string>('');

 
 const [loading, setLoading] = useState(false);
 const [uploading, setLoadingUpload] = useState(false);
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
  companyName: '',
  contactPerson: '',
  phone: '',     // ADD THIS
  whatsappNo: '',   // ADD THIS
  description: '',
  website: '',
  companyType: '',
  tradeLicense: '',
 });

 const [logo, setLogo] = useState<string | null>(null);
const DEFAULT_COMPANY_TYPES = [
 'Production/Media House',
 'Advertising Agency',
 'Freelance Casting Director',
 'Corporate',
 'Filmmaker',
 'Other'
];

// We will generate the dynamic list inside the component below
 const [licenseFile, setLicenseFile] = useState<string | null>(null); // ADD THIS
 // Dynamically build company types to include old migrated custom text
 const companyTypes = [...DEFAULT_COMPANY_TYPES];
 if (form.companyType && !companyTypes.includes(form.companyType)) {
  companyTypes.push(form.companyType);
 }
  useEffect(() => {
  Promise.all([getRecruiterProfile(), getProfileOptions()])
   .then(([profileRes, optRes]) => {
    const p = profileRes.data.data;
        setForm({
     companyName: p.companyName || '',
     contactPerson: p.contactPerson || '',
     phone: p.user?.phone || '',     // ADD THIS
     whatsappNo: p.user?.whatsappNo || '',   // ADD THIS
     description: p.description || '',
     website: p.website || '',
     companyType: p.companyType || '',
     tradeLicense: p.tradeLicense || '',
    });
    setLogo(p.logo);
    setLicenseFile(p.tradeLicenseFile);
    
    // Set Location State
    setCountryId(p.userCountryId || '');
    setCityId(p.userCityId || '');
    
    setOptions(optRes.data.data);
   })
   .catch(() => setError('Failed to load company profile.'));
 }, []);
 const handleLocationChange = async (newCityId: string) => {
  setCityId(newCityId);
  try {
   await updateRecruiterLocation(newCityId);
  } catch (err) {
   console.error("Failed to save location immediately, it will save with the form.");
  }
 };
 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  setForm({ ...form, [e.target.name]: e.target.value });
 };

 const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
   setLoadingUpload(true);
   const res = await uploadCompanyLogo(file);
   setLogo(res.data.data.logo);
   setSuccess('Logo uploaded successfully!');
   setTimeout(() => setSuccess(''), 3000);
  } catch (err: any) {
   setError(err.response?.data?.message || 'Logo upload failed');
  } finally {
   setLoadingUpload(false);
   e.target.value = ''; // reset input
  }
 };
 
 const handleLicenseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
   setLoadingUpload(true);
   const res = await uploadTradeLicense(file);
   setLicenseFile(res.data.data.tradeLicenseFile);
   setSuccess('Trade license uploaded successfully!');
   setTimeout(() => setSuccess(''), 3000);
  } catch (err: any) {
   setError(err.response?.data?.message || 'License upload failed');
  } finally {
   setLoadingUpload(false);
   e.target.value = ''; // reset input
  }
 };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
   setLoading(true);
   setError('');
   await updateRecruiterProfile(form);
   
   // ADDED: Tell Zustand the profile is now complete
   updateUser({ profileCompleted: true });
   
   setSuccess('Company profile saved successfully!');
   setTimeout(() => navigate('/dashboard/recruiter'), 1000); // slight delay so they see the success message
  } catch (err: any) {
   setError(err.response?.data?.message || 'Failed to save profile');
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="min-h-screen bg-neutral-50 text-[#3835A4] font-sans p-4 md:p-8 lg:p-12 relative overflow-hidden">
   
   {/* Background aesthetic */}
   <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
    <div className="absolute left-1/6 top-0 w-px h-full bg-[#3835A4]" />
    <div className="absolute left-5/6 top-0 w-px h-full bg-[#3835A4]" />
   </div>

   <div className="w-full max-w-4xl mx-auto space-y-10 relative z-10">
    
    {/* Header Block Frame */}
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#3835A4]/10 pb-6">
     <div>
      <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#3835A4]">
       Company Profile
      </h1>
     </div>
    </div>

    {/* Notifications */}
    {(error || success) && (
     <div className="space-y-2 animate-fadeIn">
      {error && (
       <div className="p-3 rounded-xl bg-red-50/60 border border-red-100 text-red-600 text-xs font-semibold flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
        {error}
       </div>
      )}
      {success && (
       <div className="p-3 rounded-xl bg-[#3835A4]/5 border border-[#3835A4]/10 text-[#3835A4] text-xs font-semibold flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#C6007E] shrink-0 animate-pulse" />
        {success}
       </div>
      )}
     </div>
    )}

  {!options ? (
   <div className="w-full min-h-[400px] flex items-center justify-center">
    <div className="text-xs font-black tracking-widest text-[#3835A4]/60 animate-pulse">
     Loading...
    </div>
   </div>
  ) : (
    <form onSubmit={handleSubmit} className="bg-white border border-[#3835A4]/10 rounded-2xl p-6 md:p-10 shadow-xl shadow-[#3835A4]/5 space-y-8">
     
     {/* Logo Upload Section */}
     {/* <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-[#3835A4]/10">
      <div className="relative group w-32 h-32 rounded-2xl border-2 border-dashed border-[#3835A4]/30 flex items-center justify-center overflow-hidden bg-[#3835A4]/5 hover:border-[#3835A4] transition-all">
       {logo ? (
        <img src={logo} alt="Company Logo" className="w-full h-full object-cover" />
       ) : (
        <div className="text-center">
         <span className="text-2xl block mb-1 opacity-50">🏢</span>
         <span className="text-[9px] font-bold tracking-widest opacity-50">Logo</span>
        </div>
       )}
       <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
        <span className="text-white text-[10px] font-black tracking-widest bg-[#C6007E] px-3 py-1.5 rounded-lg">
         {uploading ? 'Uploading...' : 'Change'}
        </span>
        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploading} />
       </label>
      </div>
      <div className="text-center sm:text-left">
       <h3 className="text-sm font-black text-[#3835A4]">Corporate Branding Asset</h3>
       <p className="text-xs text-[#3835A4]/50 mt-1">Upload your company logo. Square formats (1:1) work best.</p>
      </div>
     </div> */}

     {/* Grid Layout for Inputs */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <div className="space-y-1.5">
       <label className="block text-[9px] font-extrabold tracking-widest text-[#3835A4]/40 ">Company Name *</label>
       <input 
        name="companyName"
        value={form.companyName}
        onChange={handleChange}
        required
        className="w-full bg-transparent border-b-2 border-[#3835A4]/20 focus:border-[#3835A4] py-3 text-sm font-medium outline-none transition-colors" 
       />
      </div>

      <div className="space-y-1.5">
       <label className="block text-[9px] font-extrabold tracking-widest text-[#3835A4]/40 ">Contact Person</label>
       <input 
        name="contactPerson"
        value={form.contactPerson}
        onChange={handleChange}
        className="w-full bg-transparent border-b-2 border-[#3835A4]/20 focus:border-[#3835A4] py-3 text-sm font-medium outline-none transition-colors" 
       />
      </div>

            <div className="space-y-1.5">
       <label className="block text-[9px] font-extrabold tracking-widest text-[#3835A4]/40 ">Phone Number</label>
       <input 
        name="phone"
        value={form.phone}
        onChange={handleChange}
        type="tel"
        className="w-full bg-transparent border-b-2 border-[#3835A4]/20 focus:border-[#3835A4] py-3 text-sm font-medium outline-none transition-colors" 
       />
      </div>

      <div className="space-y-1.5">
       <label className="block text-[9px] font-extrabold tracking-widest text-[#3835A4]/40 ">WhatsApp Number</label>
       <input 
        name="whatsappNo"
        value={form.whatsappNo}
        onChange={handleChange}
        className="w-full bg-transparent border-b-2 border-[#3835A4]/20 focus:border-[#3835A4] py-3 text-sm font-medium outline-none transition-colors placeholder:text-[#3835A4]/30" 
        placeholder="+971xxxxxxxxx"
       />
      </div>

            {/* Location Dropdowns */}
      <div className="space-y-1.5">
       <label className="block text-[9px] font-extrabold tracking-widest text-[#3835A4]/40 ">Country</label>
       <select 
        value={countryId}
        onChange={(e) => { setCountryId(e.target.value); setCityId(''); }} // Reset city when country changes
        className="w-full bg-transparent border-b-2 border-[#3835A4]/20 focus:border-[#3835A4] py-3 text-sm font-medium outline-none cursor-pointer transition-colors"
       >
        <option value="">Select Country...</option>
        {options?.countries?.map((c: any) => (
         <option key={c.id} value={c.id}>{c.name}</option>
        ))}
       </select>
      </div>

      <div className="space-y-1.5">
       <label className="block text-[9px] font-extrabold tracking-widest text-[#3835A4]/40 ">City *</label>
       <select 
        value={cityId}
        onChange={(e) => handleLocationChange(e.target.value)}
        className="w-full bg-transparent border-b-2 border-[#3835A4]/20 focus:border-[#3835A4] py-3 text-sm font-medium outline-none cursor-pointer transition-colors"
       >
        <option value="">Select City...</option>
        {options?.cities
         ?.filter((c: any) => !countryId || c.countryId === countryId)
         .map((c: any) => (
          <option key={c.id} value={c.id}>{c.name}</option>
         ))}
       </select>
      </div>

               <div className="space-y-1.5">
       <label className="block text-[9px] font-extrabold tracking-widest text-[#3835A4]/40 ">Company Type</label>
       <select 
        name="companyType"
        value={form.companyType}
        onChange={handleChange}
        className="w-full bg-transparent border-b-2 border-[#3835A4]/20 focus:border-[#3835A4] py-3 text-sm font-medium outline-none cursor-pointer transition-colors"
       >
        <option value="">Select Type...</option>
        {companyTypes.map((type) => (
         <option key={type} value={type}>{type}</option>
        ))}
       </select>
      </div>      

      

      <div className="space-y-1.5">
       <label className="block text-[9px] font-extrabold tracking-widest text-[#3835A4]/40 ">Website</label>
       <input 
        type="url"
        name="website"
        value={form.website}
        onChange={handleChange}
        placeholder="https://"
        className="w-full bg-transparent border-b-2 border-[#3835A4]/20 focus:border-[#3835A4] py-3 text-sm font-medium outline-none transition-colors placeholder:text-[#3835A4]/30" 
       />
      </div>
     </div>

     {/* Full Width Textarea */}
     <div className="space-y-1.5">
      <label className="block text-[9px] font-extrabold tracking-widest text-[#3835A4]/40 ">Description</label>
      <textarea 
       name="description"
       value={form.description}
       onChange={handleChange}
       rows={4}
       placeholder="Brief overview of your company..."
       className="w-full bg-[#3835A4]/5 border border-[#3835A4]/10 focus:border-[#3835A4] p-4 rounded-xl text-sm font-medium outline-none transition-colors resize-none placeholder:text-[#3835A4]/30" 
      />
     </div>

         {/* Trade License Section */}
     <div className="bg-[#fdfbf7] border-2 border-[#3835A4] p-6 rounded-2xl space-y-6 shadow-[4px_4px_0px_0px_#3835A4]">
      <h3 className="text-xs font-black tracking-widest text-[#C6007E] ">Trade License</h3>
      
      <div className="space-y-1.5">
       <label className="block text-[9px] font-extrabold tracking-widest text-[#3835A4]/40 ">License Number / ID</label>
       <input 
        name="tradeLicense"
        value={form.tradeLicense}
        onChange={handleChange}
        placeholder="e.g., CN-1234567"
        className="w-full bg-transparent border-b-2 border-[#3835A4]/20 focus:border-[#3835A4] py-3 text-sm font-medium outline-none transition-colors placeholder:text-[#3835A4]/30" 
       />
      </div>

      {/* NEW: File Upload Area */}
      <div className="border-2 border-dashed border-[#3835A4]/30 rounded-xl p-6 text-center hover:border-[#3835A4] transition-colors relative group">
              {licenseFile ? (
        <div className="space-y-3">
         <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-4 py-2 rounded-lg">
          <span>✅ Document Attached</span>
         </div>
         <div className="flex items-center gap-6 justify-center">
          <a 
           href={licenseFile} 
           target="_blank" 
           rel="noreferrer"
           className="text-[10px] font-black tracking-widest text-[#3835A4] hover:text-[#C6007E] transition-colors underline underline-offset-4"
          >
           Preview Document ↗
          </a>
          <label className="cursor-pointer text-[10px] font-black tracking-widest text-[#3835A4]/50 hover:text-[#C6007E] transition-colors">
           Replace Document
           <input type="file" accept=".pdf,image/*" onChange={handleLicenseUpload} className="hidden" disabled={uploading} />
          </label>
         </div>
        </div>
       ) : (
        <label className="cursor-pointer block">
         <span className="text-2xl block mb-2 opacity-50 group-hover:opacity-100 transition-opacity">📄</span>
         <span className="text-xs font-bold text-[#3835A4]/50 group-hover:text-[#3835A4] transition-colors">
          {uploading ? 'Uploading...' : 'Click to upload Trade License (PDF/Image)'}
         </span>
         <input type="file" accept=".pdf,image/*" onChange={handleLicenseUpload} className="hidden" disabled={uploading} />
        </label>
       )}
      </div>
     </div>  {/* Trade License Section */}
    

     {/* Submit Action */}
     <button 
      type="submit" 
      disabled={loading}
      className="w-full bg-[#3835A4] hover:bg-[#2a2780] disabled:bg-[#3835A4]/50 text-white font-black text-[12px] tracking-widest py-4 rounded-xl transition-all duration-150 shadow-md shadow-[#3835A4]/20"
     >
      {loading ? 'Saving...' : 'Save Profile'}
     </button>

    </form>
  )}
    

    {/* Form Container */}
   
   </div>
  </div>
 );
};

export default RecruiterProfileSetup;