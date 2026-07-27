import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfileOptions, updateBasicInfo, updatePhysicalAttributes, updateCategoriesSkills, updateBioDescription, uploadProfilePhoto, getMyProfile } from '../../api/profile.api';
import { useAuthStore } from '../../store/authStore';
import Step1BasicInfo from './profile-steps/Step1BasicInfo';
import Step2Physical from './profile-steps/Step2Physical';
import Step3Categories from './profile-steps/Step3Categories';
import Step4Bio from './profile-steps/Step4Bio';
import Step5Photo from './profile-steps/Step5Photo';
import PortfolioTab from './profile-steps/PortfolioTab';
import CareerCourseTab from './profile-steps/CareerCourseTab';

export interface FormOptions {
  nationalities: any[];
  countries: any[];
  cities: any[];
  categories: any[];
  languages: any[];
  dialects: any[];
  ethnities: any[]; 
}

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState(1);
  const [options, setOptions] = useState<FormOptions | null>(null);
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isFirstTime = !user?.profileCompleted;

  useEffect(() => {
    Promise.all([getProfileOptions(), getMyProfile()])
      .then(([optRes, profileRes]) => {
        setOptions(optRes.data.data);
        setExistingProfile(profileRes.data.data);
      })
      .catch((err) => {
        setError('Failed to load profile data.');
      });
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleStep1 = async (data: any) => {
    try {
      setLoading(true); setError('');
      await updateBasicInfo(data);
      showSuccess('Saved successfully.');
      if (isFirstTime) setActiveTab(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  const handleStep2 = async (data: any) => {
    try {
      setLoading(true); setError('');
      await updatePhysicalAttributes(data);
      showSuccess('Saved successfully.');
      if (isFirstTime) setActiveTab(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  const handleStep3 = async (data: any) => {
    try {
      setLoading(true); setError('');
      await updateCategoriesSkills(data);
      showSuccess('Saved successfully.');
      if (isFirstTime) setActiveTab(4);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  const handleStep4 = async (data: any) => {
    try {
      setLoading(true); setError('');
      await updateBioDescription(data);
      showSuccess('Saved successfully.');
      if (isFirstTime) setActiveTab(5);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  const handleStep5 = async (file: File) => {
    try {
      setLoading(true); setError('');
      await uploadProfilePhoto(file);
      updateUser({ profileCompleted: true });
      showSuccess('Photo saved successfully.');
      const profileRes = await getMyProfile();
      setExistingProfile(profileRes.data.data);
      if (isFirstTime) navigate('/dashboard/talent');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload photo');
    } finally { setLoading(false); }
  };

  if (!options || !existingProfile) {
    return (
      <div className="w-full min-h-screen bg-[#3835A4]/5 flex items-center justify-center font-sans">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-4 w-4 text-[#3835A4]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-black tracking-[0.2em] text-[#3835A4]/50">Loading...</span>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 1, label: 'Basic Info' },
    { id: 2, label: 'Physical' },
    { id: 3, label: 'Skills' },
    { id: 4, label: 'Bio' },
    { id: 5, label: 'Photo' },
    ...(!isFirstTime ? [
      { id: 6, label: 'Media Portfolio' },
      { id: 7, label: 'Career & Courses' },
    ] : []),
  ];

  return (
    <div className="w-full min-h-screen bg-neutral-50 text-[#3835A4] font-sans p-4 md:p-8 lg:p-12 relative overflow-hidden">
      
      {/* Background aesthetic */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute left-1/6 top-0 w-px h-full bg-[#3835A4]" />
        <div className="absolute left-5/6 top-0 w-px h-full bg-[#3835A4]" />
      </div>

      <div className="w-full max-w-5xl mx-auto space-y-10 relative z-10">
        
        {/* Header Block Frame */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#3835A4]/10 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#3835A4]">
              {isFirstTime ? 'Complete Your Profile' : 'Edit Profile'}
            </h1>
          </div>

          {!isFirstTime && (
            <button 
              onClick={() => navigate('/dashboard/talent/profile')}
              className="group inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#3835A4]/50 hover:text-[#3835A4] transition-colors duration-200 self-start sm:self-auto"
            >
              <span className="transition-transform group-hover:-translate-x-1 duration-150">←</span> 
              Exit Setup
            </button>
          )}
        </div>

        {/* Global Notifications Section */}
        {(error || successMsg) && (
          <div className="space-y-2 animate-fade-in">
            {error && (
              <div className="p-3 rounded-xl bg-red-50/60 border border-red-100 text-red-600 text-xs font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-[#3835A4]/5 border border-[#3835A4]/10 text-[#3835A4] text-xs font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C6007E] shrink-0 animate-pulse" />
                {successMsg}
              </div>
            )}
          </div>
        )}

        {/* Dynamic Stepper Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none border-b border-[#3835A4]/10">
          {TABS.map(tab => {
            const isCompleted = isFirstTime && tab.id < activeTab;
            const isActive = activeTab === tab.id;
            const isDisabled = isFirstTime && tab.id > activeTab;

            return (
              <button
                key={tab.id}
                disabled={isFirstTime && tab.id !== activeTab}
                onClick={() => !isFirstTime && setActiveTab(tab.id)}
                className={`
                  px-4 py-2.5 rounded-xl text-[10px] font-black tracking-wider shrink-0 transition-all duration-200 border
                  ${isActive 
                    ? 'bg-[#3835A4] border-[#3835A4] text-white shadow-md shadow-[#3835A4]/20' 
                    : isCompleted
                      ? 'bg-[#3835A4]/5 border-[#3835A4]/10 text-[#3835A4]'
                      : isDisabled
                        ? 'bg-neutral-100 border-transparent text-[#3835A4]/20 opacity-40'
                        : 'bg-white border-[#3835A4]/10 text-[#3835A4]/50 hover:border-[#3835A4] hover:text-[#3835A4]'
                  }
                `}
              >
                <div className="flex items-center gap-1.5">
                  {isCompleted && <span className="text-[#C6007E]">✓</span>}
                  {tab.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Render Form Steps Wrapper */}
        <div className="bg-white border border-[#3835A4]/10 rounded-2xl p-6 md:p-10 shadow-xl shadow-[#3835A4]/5">
          {activeTab === 1 && (
            <Step1BasicInfo
              options={options}
              onSubmit={handleStep1}
              loading={loading}
              existingProfile={existingProfile}
              isFirstTime={isFirstTime}
            />
          )}
          {activeTab === 2 && (
            <Step2Physical
              onSubmit={handleStep2}
              onBack={() => setActiveTab(1)}
              loading={loading}
              existingProfile={existingProfile}
              isFirstTime={isFirstTime}
            />
          )}
          {activeTab === 3 && (
            <Step3Categories
              options={options}
              onSubmit={handleStep3}
              onBack={() => setActiveTab(2)}
              loading={loading}
              existingProfile={existingProfile}
              isFirstTime={isFirstTime}
            />
          )}
          {activeTab === 4 && (
            <Step4Bio
              onSubmit={handleStep4}
              onBack={() => setActiveTab(3)}
              loading={loading}
              existingProfile={existingProfile}
              isFirstTime={isFirstTime}
            />
          )}
          {activeTab === 5 && (
            <Step5Photo
              onSubmit={handleStep5}
              onBack={() => setActiveTab(4)}
              loading={loading}
              existingProfile={existingProfile}
              isFirstTime={isFirstTime}
            />
          )}
          {activeTab === 6 && !isFirstTime && (
            <PortfolioTab existingProfile={existingProfile} />
          )}
          {activeTab === 7 && !isFirstTime && (
            <CareerCourseTab existingProfile={existingProfile} />
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfileSetup;