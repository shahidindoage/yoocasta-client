import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError('');
      const res = await login(data);
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);

      // Redirect based on role
      if (user.role === 'TALENT') navigate('/dashboard/talent');
      else if (user.role === 'RECRUITER') navigate('/dashboard/recruiter');
      else navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-neutral-50 text-neutral-900 flex flex-col justify-center items-center p-4 md:p-8 font-sans selection:bg-fuchsia-600 selection:text-white relative overflow-hidden">
      
      {/* Absolute fine-line abstract background aesthetics */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
        <div className="absolute left-1/4 top-0 w-px h-full bg-black" />
        <div className="absolute left-3/4 top-0 w-px h-full bg-black" />
      </div>

      {/* Structured Center Box Frame */}
      <div className="w-full max-w-xl bg-white border border-neutral-200/80 rounded-2xl p-8 md:p-12 shadow-xl shadow-neutral-100/40 relative z-10 space-y-8">
        
        {/* Section Title */}
        <div>
          <h2 className="text-xl font-black tracking-[0.25em] uppercase text-neutral-950 text-center">
            Sign In
          </h2>
          <p className="text-xs text-neutral-400 font-light mt-1 text-center">
            Sign in to your account
          </p>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50/60 border border-red-100 text-red-600 text-xs font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Email Input Column */}
          <div className="space-y-1.5 relative group">
            <label className="text-[10px] font-extrabold text-neutral-400 group-focus-within:text-neutral-950 tracking-widest uppercase transition-colors duration-200">
              Email
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="name@agency.com"
              className={`w-full bg-transparent border-b-2 ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-neutral-100 focus:border-neutral-950'} py-2.5 text-sm text-neutral-900 placeholder-neutral-200 outline-none transition-all duration-200 font-medium`}
            />
            {errors.email && (
              <p className="text-xs text-red-500 font-medium pt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Input Column */}
          <div className="space-y-1.5 relative group">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-extrabold text-neutral-400 group-focus-within:text-neutral-950 tracking-widest uppercase transition-colors duration-200">
                Password
              </label>
              <Link 
                to="/forgot-password" 
                className="text-xs text-neutral-400 hover:text-fuchsia-600 transition-colors duration-150 font-medium pb-0.5 border-b border-transparent hover:border-fuchsia-600"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className={`w-full bg-transparent border-b-2 ${errors.password ? 'border-red-400 focus:border-red-500' : 'border-neutral-100 focus:border-neutral-950'} py-2.5 text-sm text-neutral-900 placeholder-neutral-200 outline-none transition-all duration-200 font-medium`}
            />
            {errors.password && (
              <p className="text-xs text-red-500 font-medium pt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Action Row Submit Structure */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            
            <button
              type="submit"
              disabled={loading}
              className="bg-neutral-950 hover:bg-neutral-900 disabled:bg-neutral-100 text-white disabled:text-neutral-400 font-bold text-xs tracking-widest uppercase px-8 py-4 rounded-xl transition-all duration-200 active:scale-[0.99] disabled:pointer-events-none group inline-flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-3 w-3 text-neutral-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <span className="text-fuchsia-500 transition-transform group-hover:translate-x-1 duration-150">→</span>
                </>
              )}
            </button>

            {/* Account Switcher Footer pills */}
            <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
              <span className="text-neutral-400 text-xs font-light">No account yet?</span>
              <div className="flex items-center gap-2 mt-1">
                <Link 
                  to="/signup/talent" 
                  className="text-xs font-bold text-neutral-950 border-b border-neutral-950 pb-0.5 hover:text-fuchsia-600 hover:border-fuchsia-600 transition-all duration-150"
                >
                  Join as Talent
                </Link>
                <span className="text-neutral-300 font-light">/</span>
                <Link 
                  to="/signup/recruiter" 
                  className="text-xs font-bold text-neutral-950 border-b border-neutral-950 pb-0.5 hover:text-purple-600 hover:border-purple-600 transition-all duration-150"
                >
                  Recruiter
                </Link>
              </div>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
};

export default Login;