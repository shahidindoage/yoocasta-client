import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Briefcase, FileText, Mail, Target, CreditCard, Lock, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getMyProfile } from '../../api/profile.api';

const TalentDashboard = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProfile()
      .then(res => {
        const data = res.data.data;
        setProfile(data);
        if (data.profileCompleted !== user?.profileCompleted) {
          updateUser({ profileCompleted: data.profileCompleted });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
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

  const currentPlan = profile?.subscription?.plan?.name || 'Basic';

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
      
      {/* Editorial Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-[#3835A4]/10 pb-8">
        <div className="flex items-center gap-5">
          {profile?.image ? (
            <img 
              src={profile.image} 
              alt="Profile Token" 
              className="w-16 h-16 rounded-2xl object-cover border border-[#3835A4]/20" 
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-[#3835A4] text-white flex items-center justify-center font-black text-xl select-none">
              {user?.firstName?.[0]}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-black tracking-tight">
  <span className="text-[#3835A4]">Welcome back, </span>
  <span className="text-[#C6007E]">{user?.firstName}</span>
</h2>
            <p className="text-xs font-mono tracking-wider text-[#3835A4]/50 mt-0.5">@{user?.username}</p>
          </div>
        </div>
        
        {/* <div className="flex items-center gap-3 bg-[#3835A4]/5 border border-[#3835A4]/10 rounded-xl px-4 py-2 text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C6007E] animate-pulse" />
          <span className="text-[#3835A4]/60">STATUS:</span>
          <span className="font-bold text-[#3835A4]">ACTIVE</span>
        </div> */}
      </div>

      {/* Critical Core Status Warning Messages */}
      <div className="space-y-4">
        {/* Profile incomplete banner */}
        {!user?.profileCompleted && (
          <div className="bg-[#3835A4]/5 border border-[#3835A4]/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
            <div className="space-y-1">
              <div className="text-[10px] font-black tracking-widest text-[#3835A4] uppercase flex items-center gap-2">
                Profile Incomplete
              </div>
              <p className="text-xs font-medium text-[#3835A4]/70 max-w-2xl">
                Complete your profile to appear in search results and be visible to recruiters.
              </p>
            </div>
            <button 
              onClick={() => navigate('/dashboard/talent/profile-setup')}
              className="md:self-center border border-[#3835A4] bg-[#3835A4] hover:bg-[#2a2780] text-white font-black text-[10px] tracking-widest uppercase px-5 py-3 rounded-xl transition-colors duration-150 whitespace-nowrap"
            >
              Complete Profile
            </button>
          </div>
        )}

        {/* Email not verified banner */}
        {!user?.isEmailVerified && (
          <div className="bg-[#C6007E]/5 border border-[#C6007E]/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
            <div className="space-y-1">
              <div className="text-[10px] font-black tracking-widest text-[#C6007E] uppercase flex items-center gap-2">
                Email Not Verified
              </div>
              <p className="text-xs font-medium text-[#C6007E]/70 max-w-2xl">
                Verify your email to receive notifications and updates.
              </p>
            </div>
            <button 
              onClick={() => navigate('/verify-email-otp')}
              className="md:self-center border border-[#C6007E] bg-[#C6007E] hover:bg-[#a30068] text-white font-black text-[10px] tracking-widest uppercase px-5 py-3 rounded-xl transition-colors duration-150 whitespace-nowrap"
            >
              Verify Email
            </button>
          </div>
        )}
      </div>

      {/* Subscription Caliber & Tier Tier Banner */}
      <div className={`border rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all duration-300 ${
        currentPlan === 'Premium' 
          ? 'bg-[#3835A4] text-white border-[#3835A4] shadow-md shadow-[#3835A4]/20' 
          : 'bg-white border-[#3835A4]/10'
      }`}>
        <div className="space-y-1">
          <div className={`text-[10px] font-black tracking-widest uppercase ${currentPlan === 'Premium' ? 'text-white/60' : 'text-[#3835A4]/50'}`}>
            Subscription
          </div>
          <strong className={`text-lg font-black tracking-tight block ${currentPlan === 'Premium' ? 'text-white' : 'text-[#3835A4]'}`}>
             Plan: {currentPlan}
          </strong>
          <p className={`text-xs font-medium leading-relaxed max-w-2xl ${currentPlan === 'Premium' ? 'text-white/70' : 'text-[#3835A4]/60'}`}>
            {currentPlan === 'Premium' 
              ? 'Unlimited job applications and priority search placement.' 
              : 'Limited to 1 application per month with standard visibility.'}
          </p>
        </div>
        
        {currentPlan === 'Basic' && (
          <button 
            onClick={() => navigate('/subscription-plans')} 
            className="border border-[#3835A4] bg-[#3835A4] hover:bg-[#2a2780] text-white font-black text-[10px] tracking-widest uppercase px-5 py-3.5 rounded-xl transition-all duration-150"
          >
            Upgrade Plan
          </button>
        )}
      </div>

      {/* Main Grid: Control Core Dashboard Framework */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {[
          { to: "/dashboard/talent/profile", icon: User, title: "My Profile", desc: "View and edit your personal information.", action: "Edit Profile →" },
          { to: "/browse-jobs", icon: Briefcase, title: "Browse Jobs", desc: "Find and apply to job postings.", action: "Browse Jobs →" },
          { to: "/dashboard/talent/applications", icon: FileText, title: "Applications", desc: "Track your job applications and status.", action: "View Applications →" },
          { to: "/dashboard/talent/my-invitations", icon: Mail, title: "My Invitations", desc: "View jobs you've been invited to.", action: "View Invitations →" },
          { to: "/dashboard/talent/matching-jobs", icon: Target, title: "Matching Jobs", desc: "Jobs matched to your profile.", action: "View Matches →" },
          { to: "/dashboard/talent/subscription", icon: CreditCard, title: "My Subscription", desc: "View your plan details and usage limits.", action: "View Plan →" },
        ].map((item, idx) => (
          <Link 
            key={idx}
            to={item.to} 
            className="group border border-[#3835A4]/10 bg-white hover:border-[#3835A4] p-6 rounded-2xl flex flex-col justify-between aspect-[4/3] transition-all duration-300 hover:shadow-sm"
          >
            <div className="space-y-1.5">
              <item.icon className="w-5 h-5 text-[#3835A4] group-hover:scale-110 transition-transform duration-300 origin-left" />
              <h3 className="text-sm font-black tracking-tight text-[#3835A4]">{item.title}</h3>
              <p className="text-xs text-[#3835A4]/50 font-medium">{item.desc}</p>
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase text-[#3835A4]/40 group-hover:text-[#3835A4] group-hover:translate-x-1 transition-all duration-150 block mt-4">
              {item.action}
            </span>
          </Link>
        ))}

        <div
          onClick={() => navigate('/forgot-password')}
          className="group border border-[#3835A4]/10 bg-white hover:border-[#3835A4] p-6 rounded-2xl flex flex-col justify-between aspect-[4/3] transition-all duration-300 hover:shadow-sm cursor-pointer"
        >
          <div className="space-y-1.5">
            <Lock className="w-5 h-5 text-[#3835A4] group-hover:scale-110 transition-transform duration-300 origin-left" />
            <h3 className="text-sm font-black tracking-tight text-[#3835A4]">Reset Password</h3>
            <p className="text-xs text-[#3835A4]/50 font-medium">Change your account password.</p>
          </div>
          <span className="text-[10px] font-black tracking-widest uppercase text-[#3835A4]/40 group-hover:text-[#3835A4] group-hover:translate-x-1 transition-all duration-150 block mt-4">
            Reset →
          </span>
        </div>
        <div
          onClick={() => { useAuthStore.getState().clearAuth(); navigate('/login'); }}
          className="group border border-[#C6007E]/10 bg-white hover:border-[#C6007E] p-6 rounded-2xl flex flex-col justify-between aspect-[4/3] transition-all duration-300 hover:shadow-sm cursor-pointer"
        >
          <div className="space-y-1.5">
            <LogOut className="w-5 h-5 text-[#C6007E] group-hover:scale-110 transition-transform duration-300 origin-left" />
            <h3 className="text-sm font-black tracking-tight text-[#C6007E]">Logout</h3>
            <p className="text-xs text-[#C6007E]/50 font-medium">Sign out of your account.</p>
          </div>
          <span className="text-[10px] font-black tracking-widest uppercase text-[#C6007E]/40 group-hover:text-[#C6007E] group-hover:translate-x-1 transition-all duration-150 block mt-4">
            Logout →
          </span>
        </div>
      </div>

      {/* Real-time Metric Manifest / Profile Summary */}
      {/* {user?.profileCompleted && profile?.talentProfile && (
        <div className="space-y-4 pt-4">
          <h3 className="text-xs font-black tracking-widest text-[#3835A4]/40 uppercase border-b border-[#3835A4]/10 pb-2">
            Identity Spec Manifest
          </h3>
          <div className="bg-[#3835A4]/5 border border-[#3835A4]/10 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 text-xs">
            
            <div className="space-y-1">
              <span className="block text-[9px] font-extrabold tracking-widest text-[#3835A4]/40 uppercase">Allocated Categories</span>
              <p className="font-bold text-[#3835A4] line-clamp-2">
                {profile.talentProfile.categories?.map((c: any) => c.category.name).join(', ') || 'Uncategorized'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="block text-[9px] font-extrabold tracking-widest text-[#3835A4]/40 uppercase">Gender Spec</span>
              <p className="font-bold text-[#3835A4]">{profile.talentProfile.gender || '—'}</p>
            </div>

            <div className="space-y-1">
              <span className="block text-[9px] font-extrabold tracking-widest text-[#3835A4]/40 uppercase">Stature Metric</span>
              <p className="font-bold text-[#3835A4]">{profile.talentProfile.height ? `${profile.talentProfile.height} cm` : '—'}</p>
            </div>

            <div className="space-y-1">
              <span className="block text-[9px] font-extrabold tracking-widest text-[#3835A4]/40 uppercase">Linguistic Nodes</span>
              <p className="font-bold text-[#3835A4] line-clamp-2">
                {profile.talentProfile.languages?.map((l: any) => l.language.name).join(', ') || '—'}
              </p>
            </div>

            <div className="space-y-1 lg:text-right">
              <span className="block text-[9px] font-extrabold tracking-widest text-[#3835A4]/40 uppercase">Identity Telemetry</span>
              <div className="inline-flex items-baseline gap-1.5 pt-0.5">
                <span className="text-lg font-black text-[#C6007E] font-mono tracking-tight">
                  {profile.talentProfile.views || 0}
                </span>
                <span className="text-[10px] font-black text-[#3835A4]/40 uppercase tracking-wider">Views</span>
              </div>
            </div>

          </div>
        </div>
      )} */}

    </div>
  );
};

export default TalentDashboard;