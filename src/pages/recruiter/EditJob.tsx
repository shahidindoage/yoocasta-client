import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RecruiterGuard from '../../auth/RecruiterGuard';
import { getJobOptions, getJobById, updateJob, addRole, updateRole, deleteRole } from '../../api/job.api';
import JobInformationStep from './post-job/JobInformationStep';
import RolesStep from './post-job/RolesStep';

const formatDate = (d: string) => d ? d.split('T')[0] : '';
const parseDates = (d: any) => {
  if (Array.isArray(d)) return d;
  if (typeof d === 'string') { try { return JSON.parse(d); } catch {} return []; }
  return [];
};
const PAYMENT_MAP: Record<string, string> = {
  hourPerDay: 'hoursPerDay', hourBudgetPerHour: 'budgetPerHour', hourNoOfDays: 'noOfDays',
  dayFullDay: 'fullDay', dayHalfDay: 'halfDay', dayBudgetFullDay: 'budgetFullDay', dayBudgetHalfDay: 'budgetHalfDay', dayTotalBudget: 'totalBudget',
  weekNoOfWeek: 'noOfWeek', weekDaysPerWeek: 'daysPerWeek', weekBudgetPerWeek: 'budgetPerWeek',
  monthNoOfMonth: 'noOfMonth', monthDayPerMonth: 'daysPerMonth', monthBudgetPerMonth: 'budgetPerMonth',
  packageBudgetFullDay: 'fullDay', packageBudgetHalfDay: 'halfDay', packageTotalBudget: 'totalBudget',
};

export default function EditJob() {
  const { jobId } = useParams<{ jobId: string }>();
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
    image: '',
  });

  const [rolesData, setRolesData] = useState<any[]>([]);

  useEffect(() => {
    if (!jobId) return;
    Promise.all([getJobOptions(), getJobById(jobId)])
      .then(([optRes, jobRes]) => {
        setOptions(optRes.data.data);
        const job = jobRes.data.data;
        setJobData({
          castingService: job.castingService || 'portal',
          title: job.title || '',
          subTitle: job.subTitle || '',
          description: job.description || '',
          usage: job.usage || '',
          categoryId: job.categoryId || '',
          projectTypeId: job.projectTypeId || '',
          paymentInfo: job.paymentInfo || '',
          castingCityId: job.castingCityId || '',
          castingCountryId: job.castingCity?.countryId || '',
          castingDates: parseDates(job.castingDates),
          lastDateToApply: formatDate(job.lastDateToApply),
          shootingCityId: job.shootingCityId || '',
          shootingCountryId: job.shootingCity?.countryId || '',
          shootingDates: parseDates(job.shootingDates),
          image: job.image || '',
        });
        setRolesData(job.roles?.map((r: any) => {
          const parseArr = (v: any) => {
            if (Array.isArray(v)) return v;
            if (typeof v === 'string') { try { return JSON.parse(v); } catch {} return []; }
            return [];
          };
          return {
            id: r.id,
            title: r.title || '',
            description: r.description || '',
            usage: r.usage || '',
            noOfCast: r.noOfCast?.toString() || '',
            gender: r.gender || '',
            ageMin: r.ageMin?.toString() || '1',
            ageMax: r.ageMax?.toString() || '100',
            experience: parseArr(r.experience),
            ethnicityIds: parseArr(r.ethnicity),
            nationalityIds: parseArr(r.nationality),
            languageIds: parseArr(r.languageSpoken),
            dialectIds: parseArr(r.dialectsSpoken),
            locationCountryIds: parseArr(r.locationCountry),
            locationCityIds: r.locationCityId ? [r.locationCityId] : [],
            question1: r.question1 || '',
            question2: r.question2 || '',
            question3: r.question3 || '',
            requiredProfileVideo: r.requiredProfileVideo || false,
            requiredCastingVideo: r.requiredCastingVideo || false,
            paymentType: r.paymentType || '',
            paymentDetails: r.payment ? Object.fromEntries(Object.entries(r.payment).map(([k, v]) => [PAYMENT_MAP[k] || k, v])) : {},
          };
        }) || []);

        const hasPaidRole = (job.roles || []).some((r: any) => r.paymentType);
        if (hasPaidRole) {
          setJobData((prev) => ({ ...prev, paymentInfo: 'paid' }));
        }

        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load job data');
        setLoading(false);
      });
  }, [jobId]);

  const handleNext = () => {
    if (!jobData.title || !jobData.categoryId || !jobData.paymentInfo) {
      setError('Please fill in all required job fields.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async () => {
    if (!jobId) return;
    try {
      setSubmitting(true);
      setError('');

      await updateJob(jobId, {
        ...jobData,
        castingDates: jobData.castingDates.length > 0 ? jobData.castingDates : null,
        shootingDates: jobData.shootingDates.length > 0 ? jobData.shootingDates : null,
        lastDateToApply: jobData.lastDateToApply || null,
      });

      const existingRoles = await getJobById(jobId).then(r => r.data.data.roles || []);
      const existingRoleIds = new Set(existingRoles.map((r: any) => r.id));

      for (const role of rolesData) {
        const payload = {
          ...role,
          languageIds: role.languageIds?.length > 0 ? role.languageIds : null,
          dialectIds: role.dialectIds?.length > 0 ? role.dialectIds : null,
          experience: role.experience?.length > 0 ? role.experience : null,
        };
        try {
          if (role.id && existingRoleIds.has(role.id)) {
            await updateRole(jobId, role.id, payload);
            existingRoleIds.delete(role.id);
          } else {
            await addRole(jobId, payload);
          }
        } catch (roleErr: any) {
          console.error('Role save error:', roleErr.response?.data || roleErr);
          setError(`Failed to save role "${role.title}": ${roleErr.response?.data?.message || roleErr.message}`);
          setSubmitting(false);
          return;
        }
      }

      for (const deleteId of existingRoleIds) {
        try {
          await deleteRole(jobId, deleteId);
        } catch (delErr: any) {
          console.error('Role delete error:', delErr.response?.data || delErr);
        }
      }

      navigate('/dashboard/recruiter/jobs');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update job');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-neutral-50">
        <div className="text-xs font-black text-[#3835A4]/60 animate-pulse">Loading job data...</div>
      </div>
    );
  }

  return (
    <RecruiterGuard>
    <div className="min-h-screen bg-neutral-50 text-[#3835A4] font-sans p-4 md:p-8 lg:p-12 relative overflow-hidden">
      <div className="w-full max-w-4xl mx-auto space-y-10 relative z-10">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#3835A4]/10 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#3835A4]">Edit Job</h1>
          </div>
          <div className="text-xs font-bold bg-white px-4 py-2 rounded-lg border border-[#3835A4]/10 shadow-sm">
            Step {step} of 2
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