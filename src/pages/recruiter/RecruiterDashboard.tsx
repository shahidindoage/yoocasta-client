import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Briefcase, Package, Heart, PlusCircle, Send, Lock, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getRecruiterProfile } from '../../api/recruiter.api';

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    getRecruiterProfile()
      .then(res => {
        const data = res.data.data;
        setProfile(data);
        
        // Sync Admin Verification status from DB to Zustand
        if (data.user?.isVerified !== user?.isVerified) {
          updateUser({ isVerified: data.user.isVerified });
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

  // Use Contact Person's first name if available, otherwise fallback to Company Name
  const displayName = profile?.contactPerson?.split(' ')[0] || profile?.companyName?.split(' ')[0] || 'User';

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
      
      {/* Editorial Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-[#3835A4]/10 pb-8">
        <div className="flex items-center gap-5">
          {profile?.logo ? (
            <img 
              src={profile.logo} 
              alt="Company Logo" 
              className="w-16 h-16 rounded-2xl object-cover border border-[#3835A4]/20" 
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-[#3835A4] text-white flex items-center justify-center font-black text-xl select-none">
              {profile?.companyName?.[0] || 'C'}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-black tracking-tight">
              <span className="text-[#3835A4]">Welcome back, </span>
              <span className="text-[#C6007E]">{displayName}</span>
            </h2>
            <p className="text-xs font-mono tracking-wider text-[#3835A4]/50 mt-0.5"> {profile?.companyType || 'Recruiter'}</p>
          </div>
        </div>
      </div>

      {/* Critical Core Status Warning Messages */}
      <div className="space-y-4">
        {/* Email NOT Verified Banner */}
        {!user?.isEmailVerified && (
          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
            <div className="space-y-1">
              <div className="text-[10px] font-black tracking-widest text-amber-700 flex items-center gap-2">
                <span>✉️</span> Email Not Verified
              </div>
              <p className="text-xs font-medium text-amber-700/80 max-w-2xl">
                Please verify your email address to access all features.
              </p>
            </div>
            <Link
              to="/verify-email-otp"
              className="md:self-center border border-amber-300 bg-amber-100 text-amber-800 font-black text-[10px] tracking-widest px-5 py-3 rounded-xl whitespace-nowrap hover:bg-amber-200 transition-colors"
            >
              Verify Email →
            </Link>
          </div>
        )}

        {/* Profile NOT Completed Banner */}
        {!user?.profileCompleted && (
          <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
            <div className="space-y-1">
              <div className="text-[10px] font-black tracking-widest text-blue-700 flex items-center gap-2">
                <span>📋</span> Profile Not Complete
              </div>
              <p className="text-xs font-medium text-blue-700/80 max-w-2xl">
                Complete your company profile to start posting jobs and connecting with talents.
              </p>
            </div>
            <Link
              to="/dashboard/recruiter/profile-setup"
              className="md:self-center border border-blue-300 bg-blue-100 text-blue-800 font-black text-[10px] tracking-widest px-5 py-3 rounded-xl whitespace-nowrap hover:bg-blue-200 transition-colors"
            >
              Complete Profile →
            </Link>
          </div>
        )}

        {/* Profile NOT Verified by Admin Banner */}
        {user?.isEmailVerified && user?.profileCompleted && !user?.isVerified && (
          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
            <div className="space-y-1">
              <div className="text-[10px] font-black tracking-widest text-amber-700 uppercase flex items-center gap-2">
                <span>⏳</span> Account Under Review
              </div>
              <p className="text-xs font-medium text-amber-700/80 max-w-2xl">
                Your account is being reviewed by the admin team. Some features, like posting jobs, will be available once approved.
              </p>
            </div>
            <div className="md:self-center border border-amber-300 bg-amber-100 text-amber-800 font-black text-[10px] tracking-widest uppercase px-5 py-3 rounded-xl whitespace-nowrap">
              Under Review
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Control Core Dashboard Framework */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {[
          { to: "/dashboard/recruiter/profile-setup", icon: Building2, title: "Company Profile", desc: "Manage your company information and branding.", action: "Edit Profile →" },
          { to: "/dashboard/recruiter/jobs", icon: Briefcase, title: "Manage Jobs", desc: "View and manage your job postings.", action: "View Jobs →" },
          { to: "/dashboard/recruiter/cast-bags", icon: Package, title: "Cast Bag", desc: "Create and share talent collections.", action: "Manage Bags →" },
          { to: "/dashboard/recruiter/favourites", icon: Heart, title: "Favourite List", desc: "Access your saved talent profiles.", action: "View Favourites →" },
          { to: "/dashboard/recruiter/post-job", icon: PlusCircle, title: "Post a New Job", desc: "Create a new casting call or job posting.", action: "Post Now →" },
          { to: "/dashboard/recruiter/sent-invitations", icon: Send, title: "Sent Invitations", desc: "Track invitations sent to talents.", action: "View Invitations →" },
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

    </div>
  );
};

export default RecruiterDashboard;