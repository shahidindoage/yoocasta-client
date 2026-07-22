import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlans } from '../api/plans.api';
import { getMyProfile } from '../api/profile.api';
import { useAuthStore } from '../store/authStore';

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  maxPhotos: number;
  maxVideos: number;
  maxAudios: number;
  maxJobsPerMonth: number;
}

export default function SubscriptionPlans() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [userPlanSlug, setUserPlanSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getPlans(),
      isAuthenticated ? getMyProfile().catch(() => null) : Promise.resolve(null),
    ]).then(([plansRes, profileRes]) => {
      setPlans(plansRes.data.data || []);
      const slug = profileRes?.data?.data?.subscription?.plan?.slug || null;
      setUserPlanSlug(slug);
    }).finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[10px] font-black tracking-widest text-[#3835A4]/40 uppercase animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  const basic = plans.find((p) => p.slug === 'basic');
  const premium = plans.find((p) => p.slug === 'premium');

  const features = (plan: Plan | undefined) => [
    { label: 'Photo Uploads', value: plan?.maxPhotos ?? 8, unlimited: false },
    { label: 'Acting Videos Upload', value: plan?.maxVideos ?? 3, unlimited: false },
    { label: 'Audio Files Upload', value: plan?.maxAudios ?? 1, unlimited: false },
    { label: 'Job Applications / Month', value: plan?.maxJobsPerMonth ?? 1, unlimited: (plan?.maxJobsPerMonth ?? 0) >= 999 },
    { label: 'Position in Talent Database', value: plan?.slug === 'premium' ? 'Middle' : 'Last', unlimited: false },
    {label:'Profile Views - Yes', value:"", unlimited:false},
    {label:'Job Notifications - Yes', value:"", unlimited:false},
    {label:'Payment - Payment Release from Production', value:"", unlimited:false},
    {label:'Casting Updates - Yes', value:"", unlimited:false}
  ];

  const formatFeature = (val: number, unlimited: boolean) => {
    if (unlimited) return 'Unlimited';
    return `${val}`;
  };

  const isTalent = isAuthenticated && user?.role === 'TALENT';
  const effectivePlanSlug = userPlanSlug || (isTalent ? 'basic' : null);

  return (
    <div className="w-full bg-white py-16 min-h-screen relative overflow-hidden">
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#3835A4]/[0.03] filter blur-[120px] pointer-events-none" />
      <div className="absolute left-0 bottom-0 h-96 w-96 rounded-full bg-[#C6007E]/[0.02] filter blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <h2 className="font-display text-3xl font-black text-neutral-900 sm:text-5xl tracking-tight leading-none mb-4">
            Choose Your Plan
          </h2>
          <p className="text-sm text-neutral-500 leading-relaxed font-medium">
            Pick the plan that fits your career goals. Upgrade anytime to unlock more features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Basic */}
          <div className="bg-white border-2 border-[#3835A4]/10 rounded-3xl p-8 flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-black text-neutral-900">Basic</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-black text-neutral-900">Free</span>
              </div>
              <p className="text-xs text-neutral-400 font-medium mt-1">Get started with essential features.</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {features(basic).map((f) => (
                <li key={f.label} className="flex items-center gap-3 text-sm text-neutral-700 font-medium">
                  <svg className="w-4 h-4 text-[#3835A4] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  {formatFeature(f.value, f.unlimited)} {f.label}
                </li>
              ))}
            </ul>

            {isTalent && effectivePlanSlug === 'basic' ? (
              <div className="w-full py-3.5 rounded-2xl text-center text-xs font-black tracking-widest uppercase bg-neutral-100 text-neutral-400 cursor-default">
                Activated
              </div>
            ) : isTalent && effectivePlanSlug === 'premium' ? null : (
              <button
                onClick={() => navigate('/signup/talent')}
                className="w-full py-3.5 rounded-2xl text-xs font-black tracking-widest uppercase transition-all bg-[#3835A4] text-white hover:bg-[#2a2780] shadow-md"
              >
                Register
              </button>
            )}
          </div>

          {/* Premium */}
          <div className="bg-gradient-to-br from-[#3835A4] to-[#C6007E] rounded-3xl p-8 flex flex-col text-white shadow-xl shadow-[#3835A4]/20 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-white/20 rounded-xl px-3 py-1 text-[9px] font-black tracking-widest uppercase">
              Popular
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-black text-white">Premium</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">AED 20</span>
                <span className="text-sm text-white/70 font-medium">/Month</span>
              </div>
              <p className="text-xs text-white/60 font-medium mt-1">Unlock the full experience with premium features.</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {features(premium).map((f) => (
                <li key={f.label} className="flex items-center gap-3 text-sm text-white/90 font-medium">
                  <svg className="w-4 h-4 text-[#FFED24] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  {formatFeature(f.value, f.unlimited)} {f.label}
                </li>
              ))}
            </ul>

            {isTalent && effectivePlanSlug === 'premium' ? (
              <div className="w-full py-3.5 rounded-2xl text-center text-xs font-black tracking-widest uppercase bg-white/20 text-white cursor-default border border-white/20">
                Activated
              </div>
            ) : (
              <button
                onClick={() => isAuthenticated ? alert('Payment integration coming soon.') : navigate('/login')}
                className="w-full py-3.5 rounded-2xl text-xs font-black tracking-widest uppercase transition-all bg-white text-[#3835A4] hover:bg-white/90 shadow-lg"
              >
                {isAuthenticated ? 'Upgrade' : 'Upgrade'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-6 mb-6 px-4 sm:px-6 lg:px-8">
        <div className="border-t border-neutral-200" />
        <div className="mt-6">
          <p className="text-[10px] font-bold text-neutral-500 mb-2">Note:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li className="text-[10px] text-neutral-400 leading-relaxed font-medium">
              Cardholder must retain a copy of transaction records and Merchant policies and rules.
            </li>
            <li className="text-[10px] text-neutral-400 leading-relaxed font-medium">
              User is responsible for maintaining the confidentiality of his account.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
