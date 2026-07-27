import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile } from '../../api/profile.api';

const ViewProfile = () => {
 const navigate = useNavigate();
 const [profile, setProfile] = useState<any>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  getMyProfile()
   .then(res => setProfile(res.data.data))
   .catch(console.error)
   .finally(() => setLoading(false));
 }, []);

 if (loading) {
  return (
   <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-xs font-black text-[#3835A4]/60 animate-pulse">
     Loading...
    </div>
   </div>
  );
 }

 if (!profile) {
  return (
   <div className="min-h-[400px] flex items-center justify-center">
    <p className="text-xs font-bold text-[#C6007E] bg-[#C6007E]/5 border border-[#C6007E]/20 px-6 py-4 rounded-xl">
     ⚠️ Profile not found.
    </p>
   </div>
  );
 }

 const tp = profile.talentProfile;

 return (
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
   
   {/* Header */}
   <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#3835A4]/10 pb-6">
    <div>
     <h2 className="text-xl font-black text-[#3835A4]">My Profile</h2>
     <p className="text-xs text-[#3835A4]/60 mt-1">View your profile details.</p>
    </div>
    <div className="flex flex-col sm:flex-row gap-3 sm:self-center">
     <button 
      onClick={() => navigate(`/talent/${profile.username}`)}
      className="border border-[#3835A4]/20 hover:border-[#3835A4] text-[#3835A4] hover:text-[#3835A4] font-black text-[10px] px-5 py-3 rounded-xl transition-colors duration-150"
     >
      View Public Profile
     </button>
     <button 
      onClick={() => navigate('/dashboard/talent/profile-setup')}
      className="border border-[#3835A4] bg-[#3835A4] hover:bg-[#2a2780] text-white font-black text-[10px] px-5 py-3 rounded-xl transition-colors duration-150"
     >
      Edit Profile
     </button>
    </div>
   </div>

   {/* Missing fields warning */}
   {!profile.profileCompleted && (
    <div className="bg-[#C6007E]/5 border border-[#C6007E]/20 rounded-2xl p-5 space-y-3 animate-fadeIn">
     <div className="text-[10px] font-black text-[#C6007E] flex items-center gap-2">
      <span>⚠️</span> Profile Incomplete
     </div>
     <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 list-none pl-0 text-xs text-[#3835A4]/70 font-medium">
      {!tp?.gender && <li className="before:content-['•'] before:mr-2 before:text-[#C6007E]/40">Gender</li>}
      {!tp?.dob && <li className="before:content-['•'] before:mr-2 before:text-[#C6007E]/40">Date of Birth</li>}
      {!tp?.height && <li className="before:content-['•'] before:mr-2 before:text-[#C6007E]/40">Height</li>}
      {!tp?.bioDescription && <li className="before:content-['•'] before:mr-2 before:text-[#C6007E]/40">Bio</li>}
      {(!tp?.categories || tp.categories.length === 0) && <li className="before:content-['•'] before:mr-2 before:text-[#C6007E]/40">Categories</li>}
      {!profile.image && <li className="before:content-['•'] before:mr-2 before:text-[#C6007E]/40">Profile Photo</li>}
     </ul>
     <button 
      onClick={() => navigate('/dashboard/talent/profile-setup')}
      className="text-[10px] font-black text-[#3835A4] hover:text-[#C6007E] underline underline-offset-4 pt-1 block"
     >
      Complete Profile →
     </button>
    </div>
   )}

   {/* Profile Card */}
   <div className="bg-white border border-[#3835A4]/10 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 shadow-sm">
    {profile.image ? (
     <img 
      src={profile.image} 
      alt="Profile" 
      className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border border-[#3835A4]/10 transition-all duration-300 shadow-sm" 
     />
    ) : (
     <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-[#3835A4]/5 border border-[#3835A4]/10 text-[#3835A4] flex items-center justify-center font-black text-4xl select-none">
      {profile.firstName?.[0]}
     </div>
    )}
    
    <div className="flex-1 text-center sm:text-left space-y-4">
     <div className="space-y-1">
      <h3 className="text-lg font-black text-[#3835A4]">
       {profile.firstName} {profile.middleName} {profile.lastName}
      </h3>
      <p className="text-xs font-mono text-[#3835A4]/50">@{profile.username}</p>
     </div>
     
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs font-medium text-[#3835A4]/80 max-w-xl">
      <div className="flex justify-center sm:justify-start items-center gap-2">
       <span className="text-[#C6007E] font-mono select-none">Email:</span> {profile.email}
      </div>
      {profile.phone && (
       <div className="flex justify-center sm:justify-start items-center gap-2">
        <span className="text-[#C6007E] font-mono select-none">Phone:</span> {profile.phone}
       </div>
      )}
      {profile.whatsappNo && (
       <div className="flex justify-center sm:justify-start items-center gap-2">
        <span className="text-[#C6007E] font-mono select-none">WhatsApp:</span> {profile.whatsappNo}
       </div>
      )}
     </div>
    </div>
   </div>

   {/* Basic Info + Physical Details */}
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    
    {/* Basic Info */}
    <div className="space-y-4">
     <h3 className="text-xs font-black text-[#C6007E] border-b border-[#C6007E]/20 pb-2">
      Basic Info
     </h3>
     <div className="bg-white border border-[#3835A4]/10 rounded-2xl p-5 space-y-3.5">
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-xs">
       <div className="space-y-0.5">
        <span className="block text-[9px] font-extrabold text-[#3835A4]/40">Gender</span>
        <span className="font-bold text-[#3835A4]">{tp?.gender || '—'}</span>
       </div>
       <div className="space-y-0.5">
        <span className="block text-[9px] font-extrabold text-[#3835A4]/40">Date of Birth</span>
        <span className="font-mono text-[#3835A4]">{tp?.dob ? new Date(tp.dob).toLocaleDateString() : '—'}</span>
       </div>
       <div className="space-y-0.5">
        <span className="block text-[9px] font-extrabold text-[#3835A4]/40">Age</span>
        <span className="font-bold text-[#3835A4]">{tp?.age || '—'}</span>
       </div>
       <div className="space-y-0.5">
        <span className="block text-[9px] font-extrabold text-[#3835A4]/40">Nationality</span>
        <span className="font-bold text-[#3835A4]">{profile.nationality?.name || '—'}</span>
       </div>
       <div className="space-y-0.5">
        <span className="block text-[9px] font-extrabold text-[#3835A4]/40">Ethnicity</span>
        <span className="font-bold text-[#3835A4]">{tp?.ethnicity?.name || '—'}</span>
       </div>
       <div className="space-y-0.5">
        <span className="block text-[9px] font-extrabold text-[#3835A4]/40">City</span>
        <span className="font-bold text-[#3835A4]">{tp?.city?.name || '—'}</span>
       </div>
       <div className="space-y-0.5">
        <span className="block text-[9px] font-extrabold text-[#3835A4]/40">Languages</span>
        <span className="font-medium text-[#3835A4]">{tp?.languages?.map((l: any) => l.language.name).join(', ') || '—'}</span>
       </div>
       <div className="space-y-0.5">
        <span className="block text-[9px] font-extrabold text-[#3835A4]/40">Dialects</span>
        <span className="font-medium text-[#3835A4]">{tp?.dialects?.map((d: any) => d.dialect.name).join(', ') || '—'}</span>
       </div>
       <div className="space-y-0.5 col-span-2 pt-2 border-t border-[#3835A4]/10">
        <span className="block text-[9px] font-extrabold text-[#3835A4]/40">Location</span>
        <span className="font-medium text-[#3835A4]/70">{tp?.city?.country?.name || '—'} | {tp?.address || '—'}</span>
       </div>
      </div>
     </div>
    </div>

    {/* Physical Details */}
    <div className="space-y-4">
     <h3 className="text-xs font-black text-[#C6007E] border-b border-[#C6007E]/20 pb-2">
      Physical Details
     </h3>
     <div className="bg-white border border-[#3835A4]/10 rounded-2xl p-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
       {[
        { label: 'Height', val: tp?.height ? `${tp.height} cm` : '—' },
        { label: 'Weight', val: tp?.weight ? `${tp.weight} kg` : '—' },
        { label: 'Shoe Size', val: tp?.shoeSize || '—' },
        { label: 'Hair Color', val: tp?.hairColor || '—' },
        { label: 'Hair Type', val: tp?.hairType || '—' },
        { label: 'Hair Length', val: tp?.hairLength || '—' },
        { label: 'Eye Color', val: tp?.eyeColor || '—' },
        { label: 'Chest', val: tp?.chest ? `${tp.chest} cm` : '—' },
        { label: 'Waist', val: tp?.waist ? `${tp.waist} cm` : '—' },
        { label: 'Body Type', val: tp?.bodyStructure || '—' },
       ].map((spec, i) => (
        <div key={i} className="space-y-0.5">
         <span className="block text-[9px] font-extrabold text-[#3835A4]/40">{spec.label}</span>
         <span className="font-bold text-[#3835A4]">{spec.val}</span>
        </div>
       ))}
       <div className="space-y-0.5 sm:col-span-2">
        <span className="block text-[9px] font-extrabold text-[#3835A4]/40">Tattoos</span>
        <span className="font-bold text-[#3835A4]">{tp?.tattoo || '—'}</span>
       </div>
      </div>
     </div>
    </div>
   </div>

   {/* Categories & Skills */}
   <div className="space-y-4">
    <h3 className="text-xs font-black text-[#C6007E] border-b border-[#C6007E]/20 pb-2">
     Categories & Skills
    </h3>
    <div className="bg-white border border-[#3835A4]/10 rounded-2xl p-6 space-y-6">
     <div className="flex flex-wrap gap-2">
      {tp?.categories?.length > 0 ? (
       tp.categories.map((c: any) => (
        <span 
         key={c.category.id} 
         className="px-4 py-1.5 border border-[#3835A4] bg-[#3835A4] text-white rounded-full text-xs font-black"
        >
         {c.category.name}
        </span>
       ))
      ) : (
       <p className="text-xs text-[#3835A4]/40 italic">No categories yet.</p>
      )}
     </div>

     {/* Attributes */}
     {tp?.attributes?.length > 0 && (
      <div className="pt-4 border-t border-[#3835A4]/10 space-y-3">
       <h4 className="text-[10px] font-black text-[#3835A4]/40">Attributes</h4>
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#3835A4]/5 border border-[#3835A4]/10 rounded-xl p-4">
        {tp.attributes.map((attr: any) => (
         <div key={attr.id} className="text-xs flex items-center justify-between border-b border-[#3835A4]/10 pb-1.5 last:border-0 last:pb-0">
          <span className="font-extrabold text-[#3835A4]/40 text-[9px]">{attr.key.replace(/_/g, ' ')}</span>
          <span className="font-bold text-[#3835A4]">{attr.value}</span>
         </div>
        ))}
       </div>
      </div>
     )}
    </div>
   </div>

   {/* Bio */}
   <div className="space-y-4">
    <h3 className="text-xs font-black text-[#C6007E] border-b border-[#C6007E]/20 pb-2">
     Bio
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-[#3835A4]/10 rounded-2xl p-6">
     <div className="space-y-2">
      <h4 className="text-[9px] font-extrabold text-[#3835A4]/40">About Me</h4>
      <p className="text-xs text-[#3835A4]/70 leading-relaxed whitespace-pre-line font-medium bg-[#3835A4]/5 border border-[#3835A4]/10 p-4 rounded-xl min-h-[100px]">
       {tp?.bioDescription || '—'}
      </p>
     </div>
     <div className="space-y-2">
      <h4 className="text-[9px] font-extrabold text-[#3835A4]/40">Skills</h4>
      <p className="text-xs text-[#3835A4]/70 leading-relaxed whitespace-pre-line font-medium bg-[#3835A4]/5 border border-[#3835A4]/10 p-4 rounded-xl min-h-[100px]">
       {tp?.skillDescription || '—'}
      </p>
     </div>
    </div>
   </div>

   {/* Social Links */}
   {(tp?.facebook || tp?.twitter || tp?.linkedin) && (
    <div className="space-y-4">
     <h3 className="text-xs font-black text-[#C6007E] border-b border-[#C6007E]/20 pb-2">
      Social Links
     </h3>
     <div className="flex flex-wrap gap-6 bg-white border border-[#3835A4]/10 rounded-2xl p-5 text-xs">
      {tp?.facebook && (
       <a href={tp.facebook} target="_blank" rel="noreferrer" className="font-black text-[#3835A4]/40 hover:text-[#3835A4] transition-colors">
        ➔ Facebook
       </a>
      )}
      {tp?.twitter && (
       <a href={tp.twitter} target="_blank" rel="noreferrer" className="font-black text-[#3835A4]/40 hover:text-[#3835A4] transition-colors">
        ➔ Twitter
       </a>
      )}
      {tp?.linkedin && (
       <a href={tp.linkedin} target="_blank" rel="noreferrer" className="font-black text-[#3835A4]/40 hover:text-[#3835A4] transition-colors">
        ➔ LinkedIn
       </a>
      )}
     </div>
    </div>
   )}

   {/* Portfolio */}
   {tp?.media?.length > 0 && (
    <div className="space-y-4">
     <div className="flex justify-between items-end border-b border-[#3835A4]/10 pb-2">
      <h3 className="text-xs font-black text-[#C6007E]">
       Portfolio
      </h3>
     </div>
     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
      {tp.media.slice(0, 6).filter((m: any) => m.type === 'IMAGE').map((m: any) => (
       <div key={m.id} className="group relative aspect-square bg-[#3835A4]/5 border border-[#3835A4]/10 rounded-xl overflow-hidden shadow-sm">
        <img 
         src={m.url} 
         alt="" 
         className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" 
        />
       </div>
      ))}
     </div>
    </div>
   )}

  </div>
 );
};

export default ViewProfile;