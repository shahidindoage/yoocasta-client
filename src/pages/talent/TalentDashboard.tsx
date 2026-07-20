import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
          Initializing Hub Control Matrix...
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
                <span>⚠️</span> Profile Architecture Incomplete
              </div>
              <p className="text-xs font-medium text-[#3835A4]/70 max-w-2xl">
                Complete your system profile specifications to align within global search rosters and remain accessible to external evaluations.
              </p>
            </div>
            <button 
              onClick={() => navigate('/dashboard/talent/profile-setup')}
              className="md:self-center border border-[#3835A4] bg-[#3835A4] hover:bg-[#2a2780] text-white font-black text-[10px] tracking-widest uppercase px-5 py-3 rounded-xl transition-colors duration-150 whitespace-nowrap"
            >
              Complete Structural Matrix
            </button>
          </div>
        )}

        {/* Email not verified banner */}
        {!user?.isEmailVerified && (
          <div className="bg-[#C6007E]/5 border border-[#C6007E]/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
            <div className="space-y-1">
              <div className="text-[10px] font-black tracking-widest text-[#C6007E] uppercase flex items-center gap-2">
                <span>📧</span> Communication Vector Unverified
              </div>
              <p className="text-xs font-medium text-[#C6007E]/70 max-w-2xl">
                Your email identity node remains detached from primary notifications. Authorize your communication endpoint immediately.
              </p>
            </div>
            <button 
              onClick={() => navigate('/verify-email-otp')}
              className="md:self-center border border-[#C6007E] bg-[#C6007E] hover:bg-[#a30068] text-white font-black text-[10px] tracking-widest uppercase px-5 py-3 rounded-xl transition-colors duration-150 whitespace-nowrap"
            >
              Verify Endpoint Securely
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
            Subscription Allotment
          </div>
          <strong className={`text-lg font-black tracking-tight block ${currentPlan === 'Premium' ? 'text-white' : 'text-[#3835A4]'}`}>
             Essence: {currentPlan} Level
          </strong>
          <p className={`text-xs font-medium leading-relaxed max-w-2xl ${currentPlan === 'Premium' ? 'text-white/70' : 'text-[#3835A4]/60'}`}>
            {currentPlan === 'Premium' 
              ? 'Uncapped assignment application submittals and synchronized priority search placement.' 
              : 'Restricted blueprint tier: bound to 1 application cycle monthly with standard visibility parameters.'}
          </p>
        </div>
        
        {currentPlan === 'Basic' && (
          <button 
            onClick={() => alert('Payment matrix integration online soon.')} 
            className="border border-[#3835A4] bg-[#3835A4] hover:bg-[#2a2780] text-white font-black text-[10px] tracking-widest uppercase px-5 py-3.5 rounded-xl transition-all duration-150"
          >
            Escalate Caliber Tier
          </button>
        )}
      </div>

      {/* Main Grid: Control Core Dashboard Framework */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {[
          { to: "/dashboard/talent/profile", icon: "👤", title: "Identity Profile", desc: "Verify or restructure systemic identity attributes.", action: "Inspect Blueprint →" },
          { to: "/dashboard/talent/jobs", icon: "🎬", title: "Explore Openings", desc: "Browse dynamic audition indices and project placements.", action: "Search Ledger →" },
          { to: "/dashboard/talent/applications", icon: "📋", title: "Applications Pipeline", desc: "Track real-time responses and submission status codes.", action: "Track Vectors →" },
          { to: "/dashboard/talent/portfolio", icon: "🖼️", title: "Media Vault", desc: "Incorporate and edit creative high-end asset fragments.", action: "Manage Portfolio →" },
          { to: "/dashboard/talent/my-invitations", icon: "📩", title: "My Invitations", desc: "View jobs you've been personally invited to apply for.", action: "Check Invitations →" },
          { to: "/dashboard/talent/matching-jobs", icon: "🎯", title: "Matching Jobs", desc: "Jobs matched to your profile specs and preferences.", action: "View Matches →" },
        ].map((item, idx) => (
          <Link 
            key={idx}
            to={item.to} 
            className="group border border-[#3835A4]/10 bg-white hover:border-[#3835A4] p-6 rounded-2xl flex flex-col justify-between aspect-[4/3] transition-all duration-300 hover:shadow-sm"
          >
            <div className="space-y-1.5">
              <span className="text-xl group-hover:scale-110 transition-transform duration-300 block origin-left">{item.icon}</span>
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
            <span className="text-xl group-hover:scale-110 transition-transform duration-300 block origin-left">🔑</span>
            <h3 className="text-sm font-black tracking-tight text-[#3835A4]">Reset Password</h3>
            <p className="text-xs text-[#3835A4]/50 font-medium">Change your account password and security credentials.</p>
          </div>
          <span className="text-[10px] font-black tracking-widest uppercase text-[#3835A4]/40 group-hover:text-[#3835A4] group-hover:translate-x-1 transition-all duration-150 block mt-4">
            Update Credentials →
          </span>
        </div>
        <div
          onClick={() => { useAuthStore.getState().clearAuth(); navigate('/login'); }}
          className="group border border-[#C6007E]/10 bg-white hover:border-[#C6007E] p-6 rounded-2xl flex flex-col justify-between aspect-[4/3] transition-all duration-300 hover:shadow-sm cursor-pointer"
        >
          <div className="space-y-1.5">
            <span className="text-xl group-hover:scale-110 transition-transform duration-300 block origin-left">🚪</span>
            <h3 className="text-sm font-black tracking-tight text-[#C6007E]">Logout</h3>
            <p className="text-xs text-[#C6007E]/50 font-medium">End your current session and sign out securely.</p>
          </div>
          <span className="text-[10px] font-black tracking-widest uppercase text-[#C6007E]/40 group-hover:text-[#C6007E] group-hover:translate-x-1 transition-all duration-150 block mt-4">
            Sign Out →
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