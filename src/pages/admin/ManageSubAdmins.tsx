import { useState, useEffect } from 'react';
import { getSubAdmins, createSubAdmin, updateSubAdminPassword, updateSubAdminPermissions, deleteSubAdmin } from '../../api/admin.api';
import { Plus, X, KeyRound, ShieldCheck, Trash2, Eye } from 'lucide-react';

const MAIN_PERMISSION_OPTIONS = [
  { key: 'talents', label: 'Manage Talents' },
  { key: 'companies', label: 'Manage Companies' },
  { key: 'jobs', label: 'Manage Jobs' },
  { key: 'contracts', label: 'Manage Contracts' },
  { key: 'country', label: 'Manage Country' },
  { key: 'city', label: 'Manage City' },
  { key: 'language', label: 'Manage Language' },
  { key: 'nationality', label: 'Manage Nationality' },
  { key: 'ethnicity', label: 'Manage Ethnicity' },
  { key: 'work', label: 'Manage Work' },
  { key: 'category', label: 'Manage Category' },
];

const TOOL_PERMISSION_OPTIONS = [
  { key: 'templates', label: 'Manage Templates' },
  { key: 'cms', label: 'CMS' },
  { key: 'report', label: 'Report' },
];

interface SubAdmin {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  createdAt: string;
}

const ManageSubAdmins = () => {
  const [admins, setAdmins] = useState<SubAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [pwdAdmin, setPwdAdmin] = useState<SubAdmin | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  const [permAdmin, setPermAdmin] = useState<SubAdmin | null>(null);
  const [permValues, setPermValues] = useState<string[]>([]);
  const [permSubmitting, setPermSubmitting] = useState(false);

  const [viewAdmin, setViewAdmin] = useState<SubAdmin | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await getSubAdmins();
      setAdmins(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sub admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const togglePerm = (list: string[], setList: (v: string[]) => void, key: string) => {
    if (list.includes(key)) setList(list.filter((k) => k !== key));
    else setList([...list, key]);
  };

  const permissionGrid = (checked: string[], toggle: (key: string) => void) => (
    <>
      <div className="grid grid-cols-2 gap-2">
        {MAIN_PERMISSION_OPTIONS.map((opt) => (
          <label key={opt.key} className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
            <input type="checkbox" checked={checked.includes(opt.key)}
              onChange={() => toggle(opt.key)}
              className="accent-[#C6007E] cursor-pointer" />
            {opt.label}
          </label>
        ))}
      </div>
      <div className="pt-2 border-t border-stone-100">
        <span className="block text-[10px] font-bold text-stone-500 uppercase mb-2 mt-3">Tools</span>
        <div className="grid grid-cols-2 gap-2">
          {TOOL_PERMISSION_OPTIONS.map((opt) => (
            <label key={opt.key} className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
              <input type="checkbox" checked={checked.includes(opt.key)}
                onChange={() => toggle(opt.key)}
                className="accent-[#C6007E] cursor-pointer" />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </>
  );

  const openCreate = () => {
    setName(''); setEmail(''); setPassword(''); setSelectedPerms([]);
    setError(''); setSuccess(''); setCreateOpen(true);
  };

  const closeCreate = () => {
    setCreateOpen(false); setName(''); setEmail(''); setPassword(''); setSelectedPerms([]);
    setError(''); setSuccess('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    if (!email.trim()) { setError('Email is required'); return; }
    if (!password) { setError('Password is required'); return; }
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      const res = await createSubAdmin({
        email: email.trim(),
        name: name.trim(),
        password,
        permissions: selectedPerms,
      });
      setAdmins((prev) => [...prev, res.data.data]);
      setSuccess('Sub admin created successfully');
      setTimeout(() => closeCreate(), 800);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create sub admin');
    } finally { setSubmitting(false); }
  };

  const openPassword = (a: SubAdmin) => {
    setPwdAdmin(a); setNewPassword(''); setError(''); setSuccess(''); setPwdSubmitting(false);
  };

  const closePassword = () => {
    setPwdAdmin(null); setNewPassword(''); setError(''); setSuccess('');
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) { setError('New password is required'); return; }
    setError(''); setSuccess(''); setPwdSubmitting(true);
    try {
      await updateSubAdminPassword(pwdAdmin!.id, newPassword);
      setSuccess('Password updated successfully');
      setTimeout(() => closePassword(), 800);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally { setPwdSubmitting(false); }
  };

  const openPermissions = (a: SubAdmin) => {
    setPermAdmin(a); setPermValues(a.permissions || []); setError(''); setSuccess('');
  };

  const closePermissions = () => {
    setPermAdmin(null); setPermValues([]); setError(''); setSuccess('');
  };

  const handlePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setPermSubmitting(true);
    try {
      const res = await updateSubAdminPermissions(permAdmin!.id, permValues);
      setAdmins((prev) => prev.map((a) => (a.id === permAdmin!.id ? { ...a, permissions: res.data.data.permissions } : a)));
      setSuccess('Permissions updated successfully');
      setTimeout(() => closePermissions(), 800);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update permissions');
    } finally { setPermSubmitting(false); }
  };

  const handleDelete = async (a: SubAdmin) => {
    if (!window.confirm(`Delete sub admin "${a.name}" (${a.email})? This cannot be undone.`)) return;
    setError(''); setSuccess('');
    try {
      await deleteSubAdmin(a.id);
      setAdmins((prev) => prev.filter((x) => x.id !== a.id));
      setSuccess('Sub admin deleted successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete sub admin');
    }
  };

  const openView = (a: SubAdmin) => {
    setViewAdmin(a);
  };

  const closeView = () => {
    setViewAdmin(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-[#3835A4]">Manage Sub Admins</h2>
          <p className="text-xs text-stone-400">{admins.length} total sub admins</p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 bg-[#C6007E] text-white px-5 py-2.5 font-black uppercase tracking-widest text-xs hover:bg-[#a10065] transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> Add Sub Admin
        </button>
      </div>

      {error && !createOpen && !pwdAdmin && !permAdmin && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold">{error}</div>}
      {success && !createOpen && !pwdAdmin && !permAdmin && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-xs font-bold">{success}</div>}

      <div className="bg-white border border-stone-200"><div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-stone-50 border-b border-stone-200">
            {['Sl No', 'Name', 'Email', 'Permissions', 'Created', 'Action'].map((h) => (
              <th key={h} className={`px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap border-r border-stone-100 last:border-r-0 ${h === 'Action' ? 'text-center' : 'text-left'}`}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center py-12 text-stone-400 text-sm font-bold border-t border-stone-100">Loading...</td></tr>
            : admins.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-stone-400 text-sm font-bold border-t border-stone-100">No sub admins found</td></tr>
            : admins.map((a, idx) => (
                <tr key={a.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-3 text-stone-400 border-r border-stone-100">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium border-r border-stone-100">{a.name}</td>
                  <td className="px-4 py-3 text-stone-500 border-r border-stone-100">{a.email}</td>
                  <td className="px-4 py-3 text-stone-500 border-r border-stone-100">
                    <button onClick={() => openView(a)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3835A4] hover:text-[#C6007E] transition-colors cursor-pointer">
                      <Eye className="w-3.5 h-3.5" />
                      {a.permissions.length === 0 ? 'View (No access)' : `View (${a.permissions.length})`}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-stone-400 border-r border-stone-100 whitespace-nowrap">
                    {new Date(a.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <button onClick={() => openPermissions(a)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer mr-2">
                      <ShieldCheck className="w-3.5 h-3.5" /> Permissions</button>
                    <button onClick={() => openPassword(a)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer mr-2">
                      <KeyRound className="w-3.5 h-3.5" /> Change Password</button>
                    <button onClick={() => handleDelete(a)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" /> Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div></div>

      {/* Create Sub Admin Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) closeCreate(); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#3835A4]">Add New Sub Admin</h3>
              <button onClick={closeCreate} className="text-stone-400 hover:text-stone-600 text-xl leading-none cursor-pointer"><X /></button>
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold">{error}</div>}
            {success && <div className="p-3 bg-green-50 border border-green-200 text-green-600 text-xs font-bold">{success}</div>}

            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]" placeholder="Enter sub admin name" autoFocus />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]" placeholder="subadmin@yoocasta.com" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Password *</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Permissions</label>
                {permissionGrid(selectedPerms, (key) => togglePerm(selectedPerms, setSelectedPerms, key))}
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeCreate}
                  className="text-stone-500 font-bold hover:text-stone-700 transition-colors text-xs uppercase tracking-widest cursor-pointer">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="bg-[#C6007E] text-white px-8 py-3 font-black uppercase tracking-widest hover:bg-[#a10065] transition-colors text-xs disabled:opacity-50 cursor-pointer">
                  {submitting ? 'Saving...' : 'Create Sub Admin'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {pwdAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) closePassword(); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#3835A4]">Change Password</h3>
              <button onClick={closePassword} className="text-stone-400 hover:text-stone-600 text-xl leading-none cursor-pointer"><X /></button>
            </div>
            <p className="text-xs text-stone-500 font-bold">Sub Admin: <span className="text-stone-800">{pwdAdmin.name}</span> ({pwdAdmin.email})</p>

            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold">{error}</div>}
            {success && <div className="p-3 bg-green-50 border border-green-200 text-green-600 text-xs font-bold">{success}</div>}

            <form onSubmit={handlePassword} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">New Password *</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]" placeholder="••••••••" autoFocus />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={closePassword}
                  className="text-stone-500 font-bold hover:text-stone-700 transition-colors text-xs uppercase tracking-widest cursor-pointer">Cancel</button>
                <button type="submit" disabled={pwdSubmitting}
                  className="bg-[#C6007E] text-white px-8 py-3 font-black uppercase tracking-widest hover:bg-[#a10065] transition-colors text-xs disabled:opacity-50 cursor-pointer">
                  {pwdSubmitting ? 'Saving...' : 'Update Password'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {permAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) closePermissions(); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#3835A4]">Edit Permissions</h3>
              <button onClick={closePermissions} className="text-stone-400 hover:text-stone-600 text-xl leading-none cursor-pointer"><X /></button>
            </div>
            <p className="text-xs text-stone-500 font-bold">Sub Admin: <span className="text-stone-800">{permAdmin.name}</span> ({permAdmin.email})</p>

            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold">{error}</div>}
            {success && <div className="p-3 bg-green-50 border border-green-200 text-green-600 text-xs font-bold">{success}</div>}

            <form onSubmit={handlePermissions} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Allowed Tabs</label>
                {permissionGrid(permValues, (key) => togglePerm(permValues, setPermValues, key))}
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={closePermissions}
                  className="text-stone-500 font-bold hover:text-stone-700 transition-colors text-xs uppercase tracking-widest cursor-pointer">Cancel</button>
                <button type="submit" disabled={permSubmitting}
                  className="bg-[#C6007E] text-white px-8 py-3 font-black uppercase tracking-widest hover:bg-[#a10065] transition-colors text-xs disabled:opacity-50 cursor-pointer">
                  {permSubmitting ? 'Saving...' : 'Update Permissions'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Permissions Modal */}
      {viewAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) closeView(); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#3835A4]">Sub Admin Permissions</h3>
              <button onClick={closeView} className="text-stone-400 hover:text-stone-600 text-xl leading-none cursor-pointer"><X /></button>
            </div>
            <p className="text-xs text-stone-500 font-bold">Sub Admin: <span className="text-stone-800">{viewAdmin.name}</span> ({viewAdmin.email})</p>

            {viewAdmin.permissions.length === 0 ? (
              <div className="p-4 text-center text-xs font-bold text-stone-400 bg-stone-50 border border-stone-100">
                No access granted
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {viewAdmin.permissions.map((p) => {
                  const opt = [...MAIN_PERMISSION_OPTIONS, ...TOOL_PERMISSION_OPTIONS].find((o) => o.key === p);
                  return (
                    <div key={p} className="flex items-center gap-2 px-3 py-2 bg-stone-50 border border-stone-100 text-xs text-stone-700 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C6007E] shrink-0" />
                      {opt?.label || p}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end">
              <button type="button" onClick={closeView}
                className="bg-[#C6007E] text-white px-8 py-3 font-black uppercase tracking-widest hover:bg-[#a10065] transition-colors text-xs cursor-pointer">
                Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSubAdmins;
