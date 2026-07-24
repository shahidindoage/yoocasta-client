import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Manage Talents', path: '/admin/talents' },
  ];

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex">
      <aside className="w-64 bg-white border-r-2 border-[#3835A4]/10 p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-lg font-black text-[#3835A4]">Admin</h1>
          <p className="text-xs text-stone-400">Yoocasta</p>
        </div>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                pathname === item.path
                  ? 'bg-[#3835A4] text-white'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="w-full py-2.5 px-4 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left"
        >
          Logout
        </button>
      </aside>
      <main className="flex-1 min-w-0 overflow-x-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
