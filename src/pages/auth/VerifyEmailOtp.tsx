import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { resendVerification } from '../../api/auth.api';
import api from '../../api/axios';

const VerifyEmailOtp = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    try {
      setLoading(true);
      setError('');
      await api.post('/auth/verify-email-otp', { email: user.email, otp });
      updateUser({ isEmailVerified: true });
      navigate(user.role === 'TALENT' ? '/dashboard/talent/profile-setup' : '/dashboard/recruiter');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!user?.email) return;
    try {
      await resendVerification(user.email);
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="w-full min-h-screen bg-neutral-50 text-neutral-900 flex flex-col justify-center items-center p-4 md:p-8 font-sans selection:bg-fuchsia-600 selection:text-white relative overflow-hidden">
      
      {/* Absolute fine-line abstract background aesthetics */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
        <div className="absolute left-1/4 top-0 w-px h-full bg-black" />
        <div className="absolute left-3/4 top-0 w-px h-full bg-black" />
      </div>

      {/* Structured Center Box Frame matching auth framework */}
      <div className="w-full max-w-xl bg-white border border-neutral-200/80 rounded-2xl p-8 md:p-12 shadow-xl shadow-neutral-100/40 relative z-10 space-y-8">
        
        {/* Section Title */}
        <div>
          <h2 className="text-xl font-black tracking-[0.25em] text-neutral-950 text-center">
            Verify Email
          </h2>
          <p className="text-xs text-neutral-400 font-light mt-1 text-center">
            Enter the 6-digit code sent to <strong className="text-neutral-900 font-semibold">{user?.email || 'your email'}</strong>
          </p>
        </div>

        {/* Dynamic Status Callouts */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50/60 border border-red-100 text-red-600 text-xs font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            {error}
          </div>
        )}

        {resent && (
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-600 text-xs font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            Code sent successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* OTP Input Module */}
          <div className="space-y-1.5 relative group">
            <label className="text-[10px] font-extrabold text-neutral-400 group-focus-within:text-neutral-950 tracking-widest transition-colors duration-200">
              Verification Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              className="w-full bg-transparent border-b-2 tracking-[0.5em] text-center border-neutral-100 focus:border-neutral-950 py-2.5 text-lg text-neutral-900 placeholder-neutral-200 outline-none transition-all duration-200 font-bold"
            />
          </div>

          {/* Action Row Submit Structure */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="bg-neutral-950 hover:bg-neutral-900 disabled:bg-neutral-100 text-white disabled:text-neutral-400 font-bold text-xs tracking-widest px-8 py-4 rounded-xl transition-all duration-200 active:scale-[0.99] disabled:pointer-events-none group inline-flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-3 w-3 text-neutral-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  Verify
                  <span className="text-fuchsia-500 transition-transform group-hover:translate-x-1 duration-150">→</span>
                </>
              )}
            </button>

            {/* Resend Logic Anchor */}
            <div className="flex flex-col items-start sm:items-end gap-0.5">
              <span className="text-neutral-400 text-xs font-light">Didn't receive the code?</span>
              <button
                type="button"
                onClick={handleResend}
                className="text-xs font-bold text-neutral-950 border-b border-neutral-950 pb-0.5 hover:text-fuchsia-600 hover:border-fuchsia-600 transition-all duration-150 mt-1"
              >
                Resend Code
              </button>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
};

export default VerifyEmailOtp;