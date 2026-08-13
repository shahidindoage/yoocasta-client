import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAdminJobById, adminUpdateJob, adminAddRole, adminUpdateRole, getActiveCompanies, uploadAdminJobImage } from '../../api/admin.api';
import { getJobOptions } from '../../api/job.api';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import HtmlEditor from '../../components/HtmlEditor';
import RolesStep from '../recruiter/post-job/RolesStep';

const AdminJobEdit = () => {
  const parseJsonArray = (val: string | null | undefined | any[]): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState<any>({ categories: [], projectTypes: [], cities: [] });
  const [companies, setCompanies] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState('');

  const [form, setForm] = useState<any>({ castingDates: [], shootingDates: [] });
  const [roles, setRoles] = useState<any[]>([]);
  const [imageUploading, setImageUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setCastingDateWarn('Please select an image file'); return; }
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('jobImage', file);
      const res = await uploadAdminJobImage(formData);
      setForm((prev: any) => ({ ...prev, image: res.data.data.url }));
    } catch {
      setCastingDateWarn('Image upload failed');
    } finally {
      setImageUploading(false);
    }
  };

  const [castingDateWarn, setCastingDateWarn] = useState('');
  const [shootingDateWarn, setShootingDateWarn] = useState('');

  useEffect(() => {
    getJobOptions().then((res) => setOptions(res.data.data || res.data)).catch(() => {});
    getActiveCompanies().then((res) => setCompanies(res.data.data || [])).catch(() => {});
    if (!id) return;
    setLoading(true);
    getAdminJobById(id)
      .then((res) => {
        const job = res.data.data;
        setForm({
          title: job.title || '',
          subTitle: job.subTitle || '',
          description: job.description || '',
          usage: job.usage || '',
          categoryId: job.categoryId || '',
          projectTypeId: job.projectTypeId || '',
          paymentInfo: job.paymentInfo || '',
          castingCountryId: job.castingCity?.countryId || job.castingCity?.country?.id || '',
          castingCityId: job.castingCityId || '',
          shootingCountryId: job.shootingCity?.countryId || job.shootingCity?.country?.id || '',
          shootingCityId: job.shootingCityId || '',
          lastDateToApply: job.lastDateToApply || '',
          castingDates: job.castingDates ? (typeof job.castingDates === 'string' ? JSON.parse(job.castingDates) : job.castingDates) : [],
          shootingDates: job.shootingDates ? (typeof job.shootingDates === 'string' ? JSON.parse(job.shootingDates) : job.shootingDates) : [],
          image: job.image || '',
        });
        setCompanyId(job.company?.userId || '');
        setRoles(job.roles || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleAddCastingDate = () => {
    const input = document.getElementById('editCastingDate') as HTMLInputElement;
    const val = input?.value;
    if (!val) return;
    if (form.lastDateToApply && new Date(val) <= new Date(form.lastDateToApply)) {
      setCastingDateWarn('Casting Date must be after the Last Date To Apply.');
      return;
    }
    setCastingDateWarn('');
    if (!form.castingDates.includes(val)) {
      setForm((prev: any) => ({ ...prev, castingDates: [...prev.castingDates, val] }));
    }
    input.value = '';
  };

  const handleAddShootingDate = () => {
    const input = document.getElementById('editShootingDate') as HTMLInputElement;
    const val = input?.value;
    if (!val) return;
    if (form.lastDateToApply && new Date(val) <= new Date(form.lastDateToApply)) {
      setShootingDateWarn('Shoot Date must be after the Last Date To Apply.');
      return;
    }
    setShootingDateWarn('');
    if (!form.shootingDates.includes(val)) {
      setForm((prev: any) => ({ ...prev, shootingDates: [...prev.shootingDates, val] }));
    }
    input.value = '';
  };

  const handleRemoveDate = (field: 'castingDates' | 'shootingDates', index: number) => {
    const newDates = [...form[field]];
    newDates.splice(index, 1);
    setForm((prev: any) => ({ ...prev, [field]: newDates }));
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const payload: any = { ...form };
      await adminUpdateJob(id, payload);
      navigate('/admin/jobs');
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const [rolesData, setRolesData] = useState<any[]>([]);
  const [submittingRoles, setSubmittingRoles] = useState(false);
  const [showRolesStep, setShowRolesStep] = useState(false);

  useEffect(() => {
    if (roles.length > 0) {
      setRolesData(roles.map((r: any) => normalizeRoleForForm(r)));
    }
  }, [roles]);

  const normalizeRoleForForm = (r: any) => ({
    ...r,
    noOfCast: r.noOfCast?.toString() || '',
    ageMin: r.ageMin?.toString() || '1',
    ageMax: r.ageMax?.toString() || '100',
    ethnicityIds: parseJsonArray(r.ethnicity),
    nationalityIds: parseJsonArray(r.nationality),
    languageIds: parseJsonArray(r.languageSpoken),
    dialectIds: parseJsonArray(r.dialectsSpoken),
    locationCountryIds: parseJsonArray(r.locationCountry),
    locationCityIds: r.locationCityId ? [r.locationCityId] : [],
    experience: r.experience ? (typeof r.experience === 'string' ? JSON.parse(r.experience) : r.experience) : [],
    paymentDetails: r.payment ? mapDbPaymentToForm(r.paymentType, r.payment) : {},
  });

  const mapDbPaymentToForm = (type: string, p: any) => {
    if (!p) return {};
    switch (type) {
      case 'per_hour':
        return { hoursPerDay: p.hourPerDay, budgetPerHour: p.hourBudgetPerHour, noOfDays: p.hourNoOfDays };
      case 'per_day':
        return { fullDay: p.dayFullDay, halfDay: p.dayHalfDay, budgetFullDay: p.dayBudgetFullDay, budgetHalfDay: p.dayBudgetHalfDay, totalBudget: p.dayTotalBudget };
      case 'per_week':
        return { noOfWeek: p.weekNoOfWeek, daysPerWeek: p.weekDaysPerWeek, budgetPerWeek: p.weekBudgetPerWeek };
      case 'per_month':
        return { noOfMonth: p.monthNoOfMonth, daysPerMonth: p.monthDayPerMonth, budgetPerMonth: p.monthBudgetPerMonth };
      case 'package':
        return { fullDay: p.packageBudgetFullDay, halfDay: p.packageBudgetHalfDay, totalBudget: p.packageTotalBudget };
      default:
        return {};
    }
  };

  const handleRolesSubmit = async () => {
    if (!id) return;
    setSubmittingRoles(true);
    try {
      for (const role of rolesData) {
        if (role.id) {
          const { id: _, jobId: __, createdAt: ___, updatedAt: ____, payment: _____, ...updateData } = role;
          await adminUpdateRole(id, role.id, updateData);
        } else {
          const { id: _, ...rest } = role;
          await adminAddRole(id, rest);
        }
      }
      const res = await getAdminJobById(id);
      setRoles(res.data.data.roles || []);
      setShowRolesStep(false);
    } catch {
    } finally {
      setSubmittingRoles(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm font-bold text-stone-400">Loading...</div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/jobs" className="flex items-center gap-1 text-xs font-bold text-stone-400 hover:text-[#3835A4] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </Link>
      </div>

      <div className="bg-white border border-stone-200">
        <div className="px-4 py-3 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <h2 className="text-sm font-black text-[#3835A4]">Edit Job</h2>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-[#3835A4] hover:bg-[#2a2899] transition-colors disabled:opacity-50">
            <Save className="w-3 h-3" /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Job Title</label>
              <input type="text" value={form.title || ''} onChange={(e) => handleChange('title', e.target.value)} className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#3835A4]" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Sub Title</label>
              <input type="text" value={form.subTitle || ''} onChange={(e) => handleChange('subTitle', e.target.value)} className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#3835A4]" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Description</label>
            <HtmlEditor value={form.description || ''} onChange={(v: string) => handleChange('description', v)} />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Job Image</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#3835A4] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#3835A4]/10 file:text-[#3835A4]"
              />
              {imageUploading && <span className="text-xs text-[#C6007E] font-bold whitespace-nowrap animate-pulse">Uploading...</span>}
            </div>
            {form.image && (
              <div className="mt-2">
                <img src={form.image} alt="Job" className="h-28 w-auto object-contain border border-stone-200 rounded-lg" />
                <button type="button" onClick={() => setForm((prev: any) => ({ ...prev, image: '' }))} className="mt-1 text-[10px] font-bold text-red-500 hover:underline">Remove</button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Usage</label>
              <input type="text" value={form.usage || ''} onChange={(e) => handleChange('usage', e.target.value)} className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#3835A4]" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Category</label>
              <select value={form.categoryId || ''} onChange={(e) => handleChange('categoryId', e.target.value)} className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#3835A4]">
                <option value="">Select</option>
                {(options.categories || []).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Project Type</label>
              <select value={form.projectTypeId || ''} onChange={(e) => handleChange('projectTypeId', e.target.value)} className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#3835A4]">
                <option value="">Select</option>
                {(options.projectTypes || []).map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Payment Info</label>
            <select value={form.paymentInfo || ''} onChange={(e) => handleChange('paymentInfo', e.target.value)} className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#3835A4]">
              <option value="">Select</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Casting Country</label>
              <select value={form.castingCountryId || ''} onChange={(e) => handleChange('castingCountryId', e.target.value)} className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#3835A4]">
                <option value="">Select</option>
                {(options.countries || []).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Casting City</label>
              <select value={form.castingCityId || ''} onChange={(e) => handleChange('castingCityId', e.target.value)} className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#3835A4]">
                <option value="">Select</option>
                {(options.cities || []).filter((c: any) => !form.castingCountryId || c.countryId === form.castingCountryId).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Shooting Country</label>
              <select value={form.shootingCountryId || ''} onChange={(e) => handleChange('shootingCountryId', e.target.value)} className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#3835A4]">
                <option value="">Select</option>
                {(options.countries || []).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Shooting City</label>
              <select value={form.shootingCityId || ''} onChange={(e) => handleChange('shootingCityId', e.target.value)} className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#3835A4]">
                <option value="">Select</option>
                {(options.cities || []).filter((c: any) => !form.shootingCountryId || c.countryId === form.shootingCountryId).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Casting Dates</label>
              <div className="flex gap-2 items-center mb-2">
                <input id="editCastingDate" type="date" className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#3835A4]" />
                <button type="button" onClick={handleAddCastingDate} className="bg-[#3835A4] text-white px-4 text-xs font-bold whitespace-nowrap">Add</button>
              </div>
              {castingDateWarn && <p className="text-red-500 text-[10px] mb-1">{castingDateWarn}</p>}
              <div className="flex flex-wrap gap-1">
                {form.castingDates.map((date: string, i: number) => (
                  <span key={i} className="bg-stone-100 border border-stone-200 px-2 py-0.5 text-xs flex items-center gap-1">
                    {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    <button type="button" onClick={() => handleRemoveDate('castingDates', i)} className="text-red-500 font-bold leading-none">&times;</button>
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-stone-400 mt-1 leading-relaxed">
                Note: Please add all casting dates for this job. Click &ldquo;Add&rdquo; after selecting a date. You can remove any date by clicking the &times; button.
              </p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Shooting Dates</label>
              <div className="flex gap-2 items-center mb-2">
                <input id="editShootingDate" type="date" className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#3835A4]" />
                <button type="button" onClick={handleAddShootingDate} className="bg-[#3835A4] text-white px-4 text-xs font-bold whitespace-nowrap">Add</button>
              </div>
              {shootingDateWarn && <p className="text-red-500 text-[10px] mb-1">{shootingDateWarn}</p>}
              <div className="flex flex-wrap gap-1">
                {form.shootingDates.map((date: string, i: number) => (
                  <span key={i} className="bg-stone-100 border border-stone-200 px-2 py-0.5 text-xs flex items-center gap-1">
                    {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    <button type="button" onClick={() => handleRemoveDate('shootingDates', i)} className="text-red-500 font-bold leading-none">&times;</button>
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-stone-400 mt-1 leading-relaxed">
                Note: Please add all shoot / project dates for this job. Click &ldquo;Add&rdquo; after selecting a date. You can remove any date by clicking the &times; button.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Last Date to Apply</label>
              <input type="date" value={form.lastDateToApply ? form.lastDateToApply.split('T')[0] : ''} onChange={(e) => handleChange('lastDateToApply', e.target.value)} className="w-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-[#3835A4]" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white border border-stone-200">
        <div className="px-4 py-3 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <h3 className="text-sm font-black text-stone-700">Roles ({roles.length})</h3>
          <button onClick={() => setShowRolesStep(!showRolesStep)} className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-[#3835A4] hover:bg-[#2a2899] transition-colors">
            <Plus className="w-3 h-3" /> {showRolesStep ? 'Close' : 'Manage Roles'}
          </button>
        </div>

        {showRolesStep && (
          <div className="p-4">
            <RolesStep
              roles={rolesData}
              setRoles={setRolesData}
              jobPaymentInfo={form.paymentInfo}
              options={options}
              onBack={() => setShowRolesStep(false)}
              onSubmit={handleRolesSubmit}
              submitting={submittingRoles}
              submitLabel="Save Roles"
            />
          </div>
        )}

        {!showRolesStep && (
          <div className="p-4 space-y-3">
            {roles.length === 0 ? (
              <p className="text-xs font-bold text-stone-400 text-center py-4">No roles added yet.</p>
            ) : (
              roles.map((role: any) => (
                <div key={role.id} className="border border-stone-200 p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-stone-700">{role.title || 'Untitled'}</p>
                    {role.paymentType && (
                      <p className="text-[10px] font-bold text-stone-400 uppercase mt-1">{role.paymentType.replace(/_/g, ' ')}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobEdit;
