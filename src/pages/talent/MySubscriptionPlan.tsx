import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile } from '../../api/profile.api';
import { getMyApplications } from '../../api/application.api';
import { useAuthStore } from '../../store/authStore';

const MySubscriptionPlan = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [appsThisMonth, setAppsThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyProfile(), getMyApplications()]).then(([profileRes, appsRes]) => {
      const data = profileRes.data.data;
      setProfile(data);
      const apps = appsRes.data.data || [];
      const now = new Date();
      const monthCount = apps.filter((a: any) => {
        const d = new Date(a.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;
      setAppsThisMonth(monthCount);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[10px] font-black tracking-widest text-[#3835A4]/40 uppercase animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  const plan = profile?.subscription?.plan;
  const media = profile?.talentProfile?.media || [];
  const planName = plan?.name || 'Basic';
  const isPremium = plan?.slug === 'premium' || plan?.maxJobsPerMonth >= 999;
  const expiresAt = profile?.subscription?.expiresAt;

  const currentImages = media.filter((m: any) => m.type === 'IMAGE').length;
  const currentVideos = media.filter((m: any) => m.type === 'ACTING_VIDEO' || m.type === 'VIDEO').length;
  const currentAudios = media.filter((m: any) => m.type === 'AUDIO').length;

  const limits = {
    maxPhotos: plan?.maxPhotos ?? 8,
    maxVideos: plan?.maxVideos ?? 3,
    maxAudios: plan?.maxAudios ?? 1,
    maxJobsPerMonth: plan?.maxJobsPerMonth ?? 1,
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-[#3835A4]/10 pb-6">
        <h2 className="text-2xl font-black tracking-tight text-[#3835A4]">My Subscription Plan</h2>
        <p className="text-xs text-[#3835A4]/50 font-medium mt-1">View your current plan details and usage limits.</p>
      </div>

      {/* Plan Info Card */}
      <div className={`rounded-2xl p-6 sm:p-8 border-2 ${
        isPremium
          ? 'bg-gradient-to-br from-[#3835A4] to-[#C6007E] text-white border-transparent shadow-lg shadow-[#3835A4]/20'
          : 'bg-white border-[#3835A4]/10'
      }`}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className={`text-[10px] font-black tracking-widest uppercase ${isPremium ? 'text-white/60' : 'text-[#3835A4]/50'}`}>
              Current Plan
            </span>
            <h3 className={`text-2xl font-black tracking-tight ${isPremium ? 'text-white' : 'text-[#3835A4]'}`}>
              {planName}
            </h3>
            {expiresAt && (
              <p className={`text-xs font-medium ${isPremium ? 'text-white/70' : 'text-[#3835A4]/60'}`}>
                Expires on {formatDate(expiresAt)}
              </p>
            )}
          </div>
          {isPremium ? (
            <div className="bg-white/20 rounded-xl px-4 py-2 text-xs font-black tracking-widest uppercase text-white">
              Active
            </div>
          ) : (
            <button
              onClick={() => alert('Payment integration coming soon.')}
              className="bg-[#3835A4] text-white text-[10px] font-black tracking-widest uppercase px-5 py-3 rounded-xl hover:bg-[#2a2780] transition-colors whitespace-nowrap"
            >
              Upgrade Plan
            </button>
          )}
        </div>
      </div>

      {/* Usage Limits */}
      <div className="bg-white border border-[#3835A4]/10 rounded-2xl p-6 sm:p-8 space-y-6">
        <h4 className="text-xs font-black tracking-widest text-[#3835A4]/50 uppercase">Usage Limits</h4>
        <div className="space-y-5">
          <UsageBar label="Images" current={currentImages} max={limits.maxPhotos} unit="images" isPremium={isPremium} />
          <UsageBar label="Acting Videos" current={currentVideos} max={limits.maxVideos} unit="videos" isPremium={isPremium} />
          <UsageBar label="Audio Files" current={currentAudios} max={limits.maxAudios} unit="files" isPremium={isPremium} />
          <UsageBar label="Monthly Job Applications" current={appsThisMonth} max={limits.maxJobsPerMonth} unit="applications" isPremium={isPremium} />
        </div>
      </div>

      {/* Upgrade Card for Basic */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-[#C6007E]/5 to-[#3835A4]/5 border border-[#C6007E]/20 rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C6007E] to-[#3835A4] flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
          </div>
          <div>
            <h3 className="text-lg font-black text-[#3835A4]">Unlock Premium</h3>
            <p className="text-sm text-[#3835A4]/60 font-medium max-w-md mx-auto mt-1">
              Get unlimited job applications, more media storage, priority search placement, and more.
            </p>
          </div>
          <button
            onClick={() => alert('Payment integration coming soon.')}
            className="bg-gradient-to-r from-[#C6007E] to-[#3835A4] text-white text-xs font-black tracking-widest uppercase px-8 py-4 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[#C6007E]/20"
          >
            Upgrade to Premium
          </button>
        </div>
      )}
    </div>
  );
};

const UsageBar = ({ label, current, max, unit, isPremium }: { label: string; current: number; max: number; unit: string; isPremium: boolean }) => {
  const displayMax = isPremium ? '∞' : max;
  const pct = isPremium ? 100 : Math.min((current / max) * 100, 100);
  const isOver = !isPremium && current >= max;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-[#3835A4]">{label}</span>
        <span className={`text-xs font-mono font-black ${isOver ? 'text-[#C6007E]' : 'text-[#3835A4]/60'}`}>
          {current} / {displayMax} {unit}
        </span>
      </div>
      <div className="h-2.5 bg-[#3835A4]/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOver ? 'bg-[#C6007E]' : 'bg-gradient-to-r from-[#3835A4] to-[#C6007E]'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isOver && (
        <p className="text-[10px] text-[#C6007E] font-medium mt-1">Limit reached</p>
      )}
    </div>
  );
};

export default MySubscriptionPlan;
