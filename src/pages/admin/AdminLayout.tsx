import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  Users, Building2, Briefcase, Globe, MapPin,
  Languages, IdCard, Dna, Settings, Folder, BarChart3,
  LogOut, UserCircle, Mail, UserCog,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Manage Talents', path: '/admin/talents', key: 'talents', icon: Users },
  { label: 'Manage Companies', path: '/admin/companies', key: 'companies', icon: Building2 },
  { label: 'Manage Jobs', path: '/admin/jobs', key: 'jobs', icon: Briefcase },
  { label: 'Manage Country', path: '/admin/country', key: 'country', icon: Globe },
  { label: 'Manage City', path: '/admin/city', key: 'city', icon: MapPin },
  { label: 'Manage Language', path: '/admin/language', key: 'language', icon: Languages },
  { label: 'Manage Nationality', path: '/admin/nationality', key: 'nationality', icon: IdCard },
  { label: 'Manage Ethnicity', path: '/admin/ethnicity', key: 'ethnicity', icon: Dna },
  { label: 'Manage Work', path: '/admin/work', key: 'work', icon: Settings },
  { label: 'Manage Category', path: '/admin/category', key: 'category', icon: Folder },
  { label: 'Manage Templates', path: '/admin/templates', key: 'templates', icon: Mail },
  { label: 'Report', path: '/admin/report', key: 'report', icon: BarChart3 },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, clearAuth } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isSuperAdmin = user?.adminRole === 'SUPER_ADMIN' || !user?.adminRole;
  const perms = user?.permissions || [];

  const visibleNav = isSuperAdmin
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) => perms.includes(item.key));

  const handleLogout = () => {
    clearAuth();
    navigate('/admin/login');
  };

  if (!isSuperAdmin && !visibleNav.some((i) => pathname === i.path || pathname.startsWith(i.path + '/'))) {
    return (
      <div className="min-h-screen bg-[#f4f4f6] flex items-center justify-center">
        <div className="bg-white border border-stone-200 p-8 text-center max-w-sm">
          <h2 className="text-lg font-black text-[#3835A4] mb-2">Access Denied</h2>
          <p className="text-xs text-stone-500">You don't have permission to access this section.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f6] flex">
      {/* Sidebar */}
      <aside
        className={`sticky top-0 h-screen bg-[#3835A4] flex flex-col transition-all duration-300 shrink-0 ${
          sidebarOpen ? 'w-56' : 'w-16'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-24 shrink-0 border-b border-white/10">
          <Link to="/admin/talents">
            <img
              src={sidebarOpen ? '/logo.png' : '/favicon.png'}
              alt="Yoocasta"
              className={sidebarOpen ? 'h-36 w-36 object-contain' : 'h-10 w-10 object-contain'}
            />
          </Link>
        </div>

        {/* Nav Items - full height, no scroll */}
        <nav className="flex-1 flex flex-col px-2 space-y-1 overflow-hidden pt-6">
           {isSuperAdmin && (
            <Link
              to="/admin/sub-admins"
              className={`flex items-center gap-3 px-3 py-[7px] rounded-xl text-sm font-bold transition-all ${
                pathname === '/admin/sub-admins'
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              title={!sidebarOpen ? 'Manage Sub Admins' : undefined}
            >
              <UserCog className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="truncate">Manage Sub Admins</span>}
            </Link>
          )}
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-[7px] rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
         
        </nav>

        {/* Bottom spacer */}
        <div className="h-6 shrink-0" />
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-sm font-bold text-stone-500 hidden sm:block">
              {NAV_ITEMS.find(i => i.path === pathname)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-sm font-bold text-stone-700">
              <UserCircle className="w-4 h-4 text-stone-400" />
              {user?.name || user?.firstName || 'Admin'}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-x-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="h-10 bg-white border-t border-stone-200 flex items-center justify-center shrink-0">
          <p className="text-[10px] font-bold text-stone-400 tracking-wider">
            COPYRIGHT YOOCASTA &copy; 2026
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;