import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../api/admin.api';
import { useAuthStore } from '../../store/authStore';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await adminLogin(email, password);
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(
        {
          id: user.id,
          email: user.email,
          role: 'ADMIN',
          name: user.name,
          firstName: user.name,
        },
        accessToken,
        refreshToken,
      );
      navigate('/admin/talents');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-neutral-50 text-neutral-900 flex flex-col justify-center items-center p-4 md:p-8 font-sans selection:bg-fuchsia-600 selection:text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
        <div className="absolute left-1/4 top-0 w-px h-full bg-black" />
        <div className="absolute left-3/4 top-0 w-px h-full bg-black" />
      </div>

      <div className="w-full max-w-md bg-white border border-neutral-200/80 rounded-2xl p-8 md:p-10 shadow-xl shadow-neutral-100/40 relative z-10 space-y-8">
        <div>
          <h2 className="text-xl font-black tracking-[0.25em] uppercase text-neutral-950 text-center">
            Admin Login
          </h2>
          <p className="text-xs text-neutral-400 font-light mt-1 text-center">
            Sign in to manage the platform
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50/60 border border-red-100 text-red-600 text-xs font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5 relative group">
            <label className="text-[10px] font-extrabold text-neutral-400 group-focus-within:text-neutral-950 tracking-widest uppercase transition-colors duration-200">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@yoocasta.com"
              required
              className="w-full bg-transparent border-b-2 border-neutral-100 focus:border-neutral-950 py-2.5 text-sm text-neutral-900 placeholder-neutral-200 outline-none transition-all duration-200 font-medium"
            />
          </div>

          <div className="space-y-1.5 relative group">
            <label className="text-[10px] font-extrabold text-neutral-400 group-focus-within:text-neutral-950 tracking-widest uppercase transition-colors duration-200">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-transparent border-b-2 border-neutral-100 focus:border-neutral-950 py-2.5 text-sm text-neutral-900 placeholder-neutral-200 outline-none transition-all duration-200 font-medium"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-950 hover:bg-neutral-900 disabled:bg-neutral-100 text-white disabled:text-neutral-400 font-bold text-xs tracking-widest uppercase px-8 py-4 rounded-xl transition-all duration-200 active:scale-[0.99] disabled:pointer-events-none"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
