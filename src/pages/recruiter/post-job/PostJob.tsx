import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RecruiterGuard from '../../../auth/RecruiterGuard';
import { getJobOptions, createJob, addRole } from '../../../api/job.api';
import JobInformationStep from './JobInformationStep';
import RolesStep from './RolesStep';

export default function PostJob() {
 const navigate = useNavigate();
 const [step, setStep] = useState(1);
 const [options, setOptions] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [error, setError] = useState('');

 const [jobData, setJobData] = useState({
  castingService: 'portal',
  title: '',
  subTitle: '',
  description: '',
  usage: '',
  categoryId: '',
  projectTypeId: '',
  paymentInfo: '',
  castingCityId: '',
  castingCountryId: '',
  castingDates: [] as string[],
  lastDateToApply: '',
  shootingCityId: '',
  shootingCountryId: '',
  shootingDates: [] as string[],
 });

 const [rolesData, setRolesData] = useState<any[]>([]);

 useEffect(() => {
  getJobOptions()
   .then((res) => {
    setOptions(res.data.data);
    setLoading(false);
   })
   .catch(() => {
    setError('Failed to load form options');
    setLoading(false);
   });
 }, []);

 const handleNext = () => {
  if (jobData.castingService === 'manual') return; // Cannot proceed if manual
  if (!jobData.title || !jobData.categoryId || !jobData.paymentInfo) {
   setError('Please fill in all required job fields.');
   return;
  }
  setError('');
  setStep(2);
 };

 const handleBack = () => setStep(1);

 const handleSubmit = async () => {
  try {
   setSubmitting(true);
   setError('');
   
   // 1. Create Job
   const res = await createJob({
    ...jobData,
    castingDates: jobData.castingDates.length > 0 ? jobData.castingDates : null,
    shootingDates: jobData.shootingDates.length > 0 ? jobData.shootingDates : null,
   });
   const newJobId = res.data.data.id;

   // 2. Add Roles sequentially
   for (const role of rolesData) {
    await addRole(newJobId, {
     ...role,
     languageIds: role.languageIds.length > 0 ? role.languageIds : null,
     dialectIds: role.dialectIds.length > 0 ? role.dialectIds : null,
     experience: role.experience.length > 0 ? role.experience : null,
    });
   }

   // Success
   navigate('/dashboard/recruiter');
  } catch (err: any) {
   setError(err.response?.data?.message || 'Failed to post job');
   setSubmitting(false);
  }
 };

 if (loading) {
  return (
   <div className="min-h-[400px] flex items-center justify-center bg-neutral-50">
    <div className="text-xs font-black text-[#3835A4]/60 animate-pulse">
     Loading Systems...
    </div>
   </div>
  );
 }

 return (
  <RecruiterGuard>
  <div className="min-h-screen bg-neutral-50 text-[#3835A4] font-sans p-4 md:p-8 lg:p-12 relative overflow-hidden">
   <div className="w-full max-w-4xl mx-auto space-y-10 relative z-10">
    
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#3835A4]/10 pb-6">
     <div>
      {/* <span className="text-[9px] font-black text-[#C6007E] block mb-1">Job Creator</span> */}
      <h1 className="text-3xl md:text-4xl font-black text-[#3835A4]">
       Post a New Job
      </h1>
     </div>
     <div className="text-xs font-bold bg-white px-4 py-2 rounded-lg border border-[#3835A4]/10 shadow-sm">
      Step {step} of {jobData.castingService === 'manual' ? 1 : 2}
     </div>
    </div>

    {error && (
     <div className="p-4 rounded-xl bg-red-50/60 border border-red-100 text-red-600 text-sm font-semibold animate-fadeIn">
      {error}
     </div>
    )}

    <div className="bg-white border border-[#3835A4]/10 rounded-2xl p-6 md:p-10 shadow-xl shadow-[#3835A4]/5">
     {step === 1 && (
      <JobInformationStep 
       data={jobData} 
       updateData={(updates: any) => setJobData({ ...jobData, ...updates })}
       options={options}
       onNext={handleNext}
      />
     )}
     {step === 2 && (
      <RolesStep 
       roles={rolesData}
       setRoles={setRolesData}
       jobPaymentInfo={jobData.paymentInfo}
       options={options}
       onBack={handleBack}
       onSubmit={handleSubmit}
       submitting={submitting}
      />
     )}
    </div>

   </div>
  </div>
  </RecruiterGuard>
 );
}
