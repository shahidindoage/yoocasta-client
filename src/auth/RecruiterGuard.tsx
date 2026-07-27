import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

const RecruiterGuard = ({ children }: Props) => {
  const { user } = useAuthStore();

  if (!user?.isEmailVerified) {
    return (
      <div className="max-w-lg mx-auto mt-20 mb-20 text-center space-y-4">
        <div className="text-4xl">✉️</div>
        <h2 className="text-lg font-black text-[#3835A4]">Email Not Verified</h2>
        <p className="text-sm text-stone-500">Please verify your email address to access this page.</p>
        <Link
          to="/verify-email-otp"
          className="inline-block bg-[#3835A4] text-white font-bold text-xs px-6 py-3 rounded-xl"
        >
          Verify Email →
        </Link>
      </div>
    );
  }

  if (!user?.profileCompleted) {
    return (
      <div className="max-w-lg mx-auto mt-20 mb-20 text-center space-y-4">
        <div className="text-4xl">📋</div>
        <h2 className="text-lg font-black text-[#3835A4]">Profile Not Complete</h2>
        <p className="text-sm text-stone-500">Please complete your company profile to access this page.</p>
        <Link
          to="/dashboard/recruiter/profile-setup"
          className="inline-block bg-[#3835A4] text-white font-bold text-xs px-6 py-3 rounded-xl"
        >
          Complete Profile →
        </Link>
      </div>
    );
  }

  if (!user?.isVerified) {
    return (
      <div className="max-w-lg mx-auto mt-20 mb-20 text-center space-y-4">
        <div className="text-4xl">⏳</div>
        <h2 className="text-lg font-black text-[#3835A4]">Account Under Review</h2>
        <p className="text-sm text-stone-500">Your account is pending admin approval. You will get access once approved.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default RecruiterGuard;
