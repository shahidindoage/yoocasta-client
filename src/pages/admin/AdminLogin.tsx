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
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4">
      <div className="bg-white border-2 border-[#3835A4] rounded-[32px] p-8 sm:p-12 shadow-[8px_8px_0px_0px_#C6007E] max-w-md w-full">
        <div className="space-y-2 mb-8 text-center">
          <h1 className="text-2xl font-black text-[#3835A4]">Admin Panel</h1>
          <p className="text-xs text-stone-400">Sign in to manage the platform</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-stone-400">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-3 text-sm outline-none focus:border-[#3835A4]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-stone-400">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-transparent border-b-2 border-[#3835A4]/20 py-3 text-sm outline-none focus:border-[#3835A4]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#3835A4] text-white text-xs font-black rounded-xl border-2 border-[#3835A4] shadow-[4px_4px_0px_0px_#C6007E] transition-transform active:scale-95 hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
