import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { registerTalent } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import { countryCodes } from '../../constants/countryCodes';

const schema = z.object({
 firstName: z.string().min(1, 'First name is required'),
 lastName: z.string().min(1, 'Last name is required'),
 email: z.string().email('Valid email required'),
 password: z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain a capital letter, lowercase and number'),
 confirmPassword: z.string(),
 phone: z.string().min(7, 'Phone number is too short').max(15, 'Phone number is too long').regex(/^[\d\s\-().+]+$/, 'Phone number contains invalid characters'),
}).refine(data => data.password === data.confirmPassword, {
 message: 'Passwords do not match',
 path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const SignupTalent = () => {
 const navigate = useNavigate();
 const { setAuth } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneCode, setPhoneCode] = useState('+1');
  const [selectedCountry, setSelectedCountry] = useState(countryCodes.find((c) => c.code === '+1') || countryCodes[0]);
  const [open, setOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

 const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
 });

  const onSubmit = async (data: FormData) => {
   try {
    setLoading(true);
    setError('');
    const { confirmPassword, ...payload } = data;
    if (payload.phone) payload.phone = `${phoneCode} ${payload.phone}`;
    const res = await registerTalent(payload);
   const { user, accessToken, refreshToken } = res.data.data;
   setAuth(user, accessToken, refreshToken);
   navigate('/verify-email-otp');
  } catch (err: any) {
   const data = err.response?.data;
   if (data?.errors && Array.isArray(data.errors)) {
    const specificErrors = data.errors.map((e: any) => e.msg).join(' | ');
    setError(`${data.message}: ${specificErrors}`);
   } else {
    setError(data?.message || 'Registration failed');
   }
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="w-full min-h-screen bg-white text-neutral-900 grid lg:grid-cols-12 font-sans selection:bg-fuchsia-600 selection:text-white relative">
   
   {/* LEFT ASPECT: Editorial Cinematic Pillar */}
   {/* Changed justify-center to justify-start and unified top padding across viewports */}
   <div className="lg:col-span-5 bg-neutral-50 p-8 md:p-16 lg:p-24 flex flex-col justify-start relative border-b lg:border-b-0 lg:border-r border-neutral-200/70 overflow-hidden min-h-[auto] lg:min-h-screen">
    {/* Abstract fine-line background aesthetics */}
    <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-[0.02]">
     <div className="absolute left-10 top-0 w-px h-full bg-black" />
     <div className="absolute left-1/2 top-0 w-px h-full bg-black" />
    </div>

    <div className="max-w-sm">
     {/* Creative Badge Integration */}
     <div className="inline-flex items-center gap-2 mb-6 bg-white border border-neutral-200 px-3 py-1 rounded-full shadow-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-600 animate-pulse" />
      <span className="text-[9px] font-black tracking-[0.2em] text-neutral-800">
       Talent Portal
      </span>
     </div>
     
     <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.85] text-neutral-950">
      Join as <br />
      <span className="bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
       A Talent
      </span>
     </h1>
     
     <p className="text-xs text-neutral-400 font-light mt-4 leading-relaxed">
      Create your profile and connect with top recruiters worldwide.
     </p>
    </div>
   </div>

   {/* RIGHT ASPECT: Full Screen Clean Form Matrix */}
   {/* Changed justify-center to justify-start and unified top padding with the left aspect */}
   <div className="lg:col-span-7 p-8 md:p-16 lg:p-24 flex flex-col justify-start bg-white relative">
    <div className="w-full max-w-2xl mx-auto space-y-8">
     
     {/* Section Title */}
     <div>
      <h2 className="text-sm font-black tracking-[0.25em] text-neutral-950">
       Create Account
      </h2>
      <p className="text-xs text-neutral-400 font-light mt-1">
       Fill in your details to get started
      </p>
     </div>

     {/* Error Callout */}
     {error && (
      <div className="p-3 rounded-xl bg-red-50/60 border border-red-100 text-red-600 text-xs font-semibold flex items-center gap-2">
       <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
       {error}
      </div>
     )}

     <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* Identity Grid Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {/* First Name Input */}
       <div className="space-y-1.5 relative group">
        <label className="text-[10px] font-extrabold text-neutral-400 group-focus-within:text-neutral-950 tracking-widest transition-colors duration-200">
         First Name
        </label>
        <input
         type="text"
         {...register('firstName')}
         placeholder="e.g. Alexander"
         className={`w-full bg-transparent border-b-2 ${errors.firstName ? 'border-red-400 focus:border-red-500' : 'border-neutral-100 focus:border-neutral-950'} py-2.5 text-sm text-neutral-900 placeholder-neutral-200 outline-none transition-all duration-200 font-medium`}
        />
        {errors.firstName && (
         <p className="text-xs text-red-500 font-medium pt-1">{errors.firstName.message}</p>
        )}
       </div>

       {/* Last Name Input */}
       <div className="space-y-1.5 relative group">
        <label className="text-[10px] font-extrabold text-neutral-400 group-focus-within:text-neutral-950 tracking-widest transition-colors duration-200">
         Last Name
        </label>
        <input
         type="text"
         {...register('lastName')}
         placeholder="e.g. McQueen"
         className={`w-full bg-transparent border-b-2 ${errors.lastName ? 'border-red-400 focus:border-red-500' : 'border-neutral-100 focus:border-neutral-950'} py-2.5 text-sm text-neutral-900 placeholder-neutral-200 outline-none transition-all duration-200 font-medium`}
        />
        {errors.lastName && (
         <p className="text-xs text-red-500 font-medium pt-1">{errors.lastName.message}</p>
        )}
       </div>
      </div>

      {/* Email Input Column */}
      <div className="space-y-1.5 relative group">
       <label className="text-[10px] font-extrabold text-neutral-400 group-focus-within:text-neutral-950 tracking-widest transition-colors duration-200">
        Email
       </label>
       <input
        type="email"
        {...register('email')}
        placeholder="name@agency.com"
        className={`w-full bg-transparent border-b-2 ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-neutral-100 focus:border-neutral-950'} py-2.5 text-sm text-neutral-900 placeholder-neutral-200 outline-none transition-all duration-200 font-medium`}
       />
       {errors.email && (
        <p className="text-xs text-red-500 font-medium pt-1">{errors.email.message}</p>
       )}
      </div>

      {/* Security Passkeys Grid Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {/* Password Input */}
       <div className="space-y-1.5 relative group">
        <label className="text-[10px] font-extrabold text-neutral-400 group-focus-within:text-neutral-950 tracking-widest transition-colors duration-200">
         Password
        </label>
        <div className="relative">
         <input
          type={showPassword ? 'text' : 'password'}
          {...register('password')}
          placeholder="••••••••"
          className={`w-full bg-transparent border-b-2 ${errors.password ? 'border-red-400 focus:border-red-500' : 'border-neutral-100 focus:border-neutral-950'} py-2.5 pr-10 text-sm text-neutral-900 placeholder-neutral-200 outline-none transition-all duration-200 font-medium`}
         />
         <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-950 transition-colors cursor-pointer"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
         >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
         </button>
        </div>
        {errors.password && (
         <p className="text-xs text-red-500 font-medium pt-1">{errors.password.message}</p>
        )}
       </div>

       {/* Confirm Password Input */}
       <div className="space-y-1.5 relative group">
        <label className="text-[10px] font-extrabold text-neutral-400 group-focus-within:text-neutral-950 tracking-widest transition-colors duration-200">
         Confirm Password
        </label>
        <div className="relative">
         <input
          type={showConfirmPassword ? 'text' : 'password'}
          {...register('confirmPassword')}
          placeholder="••••••••"
          className={`w-full bg-transparent border-b-2 ${errors.confirmPassword ? 'border-red-400 focus:border-red-500' : 'border-neutral-100 focus:border-neutral-950'} py-2.5 pr-10 text-sm text-neutral-900 placeholder-neutral-200 outline-none transition-all duration-200 font-medium`}
         />
         <button
          type="button"
          onClick={() => setShowConfirmPassword((v) => !v)}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-950 transition-colors cursor-pointer"
          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
         >
          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
         </button>
        </div>
        {errors.confirmPassword && (
         <p className="text-xs text-red-500 font-medium pt-1">{errors.confirmPassword.message}</p>
        )}
       </div>
      </div>

      {/* Phone with Country Code */}
      <div className="space-y-1.5 relative group">
       <label className="text-[10px] font-extrabold text-neutral-400 group-focus-within:text-neutral-950 tracking-widest transition-colors duration-200">
        Phone Number
       </label>
       <div className="flex gap-2">
        <div className="relative w-36">
         <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 w-full bg-transparent border-b-2 border-neutral-100 focus:border-neutral-950 py-2.5 text-sm text-neutral-900 outline-none transition-all duration-200 font-medium"
         >
          {selectedCountry && (
           <span>{selectedCountry.flag} {selectedCountry.code}</span>
          )}
          <span className="ml-auto text-neutral-300 text-xs">▾</span>
         </button>
         {open && (
          <div ref={dropdownRef} className="absolute top-full left-0 mt-1 z-50 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-64 overflow-hidden w-72">
           <div className="p-2 border-b border-neutral-100">
            <input
             type="text"
             autoFocus
             value={countrySearch}
             onChange={(e) => setCountrySearch(e.target.value)}
             placeholder="Search country or code..."
             className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-900 placeholder-neutral-300 outline-none focus:border-neutral-950 transition-colors"
            />
           </div>
           <div className="max-h-48 overflow-y-auto">
            {countryCodes
             .filter((c) =>
              !countrySearch.trim() ||
              `${c.code} ${c.name}`.toLowerCase().includes(countrySearch.toLowerCase())
             )
             .map((c) => (
              <button
               key={c.code + c.name}
               type="button"
               onClick={() => { setPhoneCode(c.code); setSelectedCountry(c); setOpen(false); setCountrySearch(''); }}
               className={`flex items-center gap-2 w-full px-3 py-2 text-xs text-left hover:bg-neutral-50 transition-colors ${c.code === phoneCode ? 'bg-neutral-50 font-bold' : ''}`}
              >
               <span>{c.flag}</span>
               <span>{c.code}</span>
               <span className="text-neutral-500 truncate">{c.name}</span>
              </button>
             ))}
            {countryCodes.filter((c) =>
              !countrySearch.trim() ||
              `${c.code} ${c.name}`.toLowerCase().includes(countrySearch.toLowerCase())
             ).length === 0 && (
              <p className="px-3 py-4 text-xs text-neutral-400 text-center">No matching country</p>
             )}
           </div>
          </div>
         )}
        </div>
        <input
         type="text"
         {...register('phone')}
         placeholder="555-000-0000"
         className={`flex-1 bg-transparent border-b-2 ${errors.phone ? 'border-red-400 focus:border-red-500' : 'border-neutral-100 focus:border-neutral-950'} py-2.5 text-sm text-neutral-900 placeholder-neutral-200 outline-none transition-all duration-200 font-medium`}
        />
       </div>
       {errors.phone && (
        <p className="text-xs text-red-500 font-medium pt-1">{errors.phone.message}</p>
       )}
      </div>

      {/* Action Row Submit Structure */}
      <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
       
       <button
        type="submit"
        disabled={loading}
        className="bg-neutral-950 hover:bg-neutral-900 disabled:bg-neutral-100 text-white disabled:text-neutral-400 font-bold text-xs tracking-widest px-8 py-4 rounded-xl transition-all duration-200 active:scale-[0.99] disabled:pointer-events-none group inline-flex items-center gap-3"
       >
        {loading ? (
         <>
          <svg className="animate-spin h-3 w-3 text-neutral-400" fill="none" viewBox="0 0 24 24">
           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Creating account...
         </>
        ) : (
         <>
          Create Account
          <span className="text-fuchsia-500 transition-transform group-hover:translate-x-1 duration-150">→</span>
         </>
        )}
       </button>

       <div className="flex items-center gap-2 text-xs">
        <span className="text-neutral-400 font-light">Already registered?</span>
        <Link 
         to="/login" 
         className="font-bold text-neutral-950 border-b border-neutral-950 pb-0.5 hover:text-fuchsia-600 hover:border-fuchsia-600 transition-all duration-150"
        >
         Sign In
        </Link>
       </div>

      </div>

     </form>

    </div>
   </div>

  </div>
 );
};

export default SignupTalent;