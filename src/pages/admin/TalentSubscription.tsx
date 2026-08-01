import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTalentSubscriptionDetails, updateTalentSubscription } from '../../api/admin.api';
import { getPlans } from '../../api/plans.api';
import { ArrowLeft, User, Pencil, X } from 'lucide-react';

const R2_PROFILE_URL = 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/profile/';

interface Profile {
  name: string;
  email: string;
  username: string;
  image: string | null;
  location: string;
}

interface Subscription {
  id: string | null;
  planId: string | null;
  planName: string;
  activatedDate: string;
  expiresAt: string | null;
  duration: string;
  status: string;
}

interface Plan {
  id: string;
  name: string;
}

interface PaymentRecord {
  no: number;
  orderId: string;
  date: string;
  packageName: string;
  duration: string;
  cost: number;
  refId: string;
}

const TalentSubscription = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editPlanId, setEditPlanId] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('ACTIVE');
  const [editActivatedAt, setEditActivatedAt] = useState<string>('');
  const [editExpiresAt, setEditExpiresAt] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await getTalentSubscriptionDetails(id!);
      const data = res.data.data;
      setProfile(data.profile);
      setSubscription(data.subscription);
      setPaymentHistory(data.paymentHistory);
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    getPlans()
      .then((res) => setPlans(res.data.data || []))
      .catch(() => {});
  }, [id]);

  const openEdit = () => {
    if (!subscription) return;
    setEditPlanId(subscription.planId || '');
    setEditStatus(subscription.status);
    setEditActivatedAt(subscription.activatedDate ? subscription.activatedDate.slice(0, 10) : '');
    setEditExpiresAt(subscription.expiresAt ? subscription.expiresAt.slice(0, 10) : '');
    setSaveError('');
    setSaveSuccess('');
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setSaveError('');
    setSaveSuccess('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPlanId) { setSaveError('Please select a plan'); return; }
    setSaveError('');
    setSaveSuccess('');
    setSaving(true);
    try {
      await updateTalentSubscription(id!, {
        planId: editPlanId,
        status: editStatus,
        activatedAt: editActivatedAt ? editActivatedAt : null,
        expiresAt: editExpiresAt ? editExpiresAt : null,
      });
      setSaveSuccess('Subscription updated successfully');
      fetch();
      setTimeout(() => closeEdit(), 800);
    } catch (err: any) {
      setSaveError(err.response?.data?.message || 'Failed to update subscription');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm font-bold text-stone-400">
        Loading...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/admin/talents"
          className="flex items-center gap-1 text-xs font-bold text-stone-400 hover:text-[#3835A4] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Talents
        </Link>
      </div>

      <div className="flex gap-6">
        {/* Left - Profile Details */}
        <div className="w-72 shrink-0">
          <div className="bg-white border border-stone-200 p-6 text-center">
            {profile?.image ? (
              <img
                src={R2_PROFILE_URL + profile.image}
                alt={profile?.name}
                className="w-24 h-24 object-cover mx-auto mb-4"
              />
            ) : (
              <div className="w-24 h-24 bg-stone-100 flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-stone-400" />
              </div>
            )}
            <h3 className="text-base font-bold text-stone-800">{profile?.name}</h3>
            <p className="text-xs text-stone-400 mt-0.5">{profile?.location}</p>
          </div>
        </div>

        {/* Right - Details */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Active Subscriptions */}
          <div className="bg-white border border-stone-200">
            <div className="px-4 py-3 border-b border-stone-200 bg-stone-50">
              <h3 className="text-sm font-bold text-stone-700">Active Subscription</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50">
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold text-stone-500 uppercase border-r border-stone-100">Sl No</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold text-stone-500 uppercase border-r border-stone-100">Plan</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold text-stone-500 uppercase border-r border-stone-100">Activated Date</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold text-stone-500 uppercase border-r border-stone-100">Expire On</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold text-stone-500 uppercase border-r border-stone-100">Duration</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold text-stone-500 uppercase border-r border-stone-100">Status</th>
                  <th className="text-center px-4 py-2.5 text-[10px] font-bold text-stone-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {subscription ? (
                  <tr className="border-b border-stone-100">
                    <td className="px-4 py-3 text-stone-400 border-r border-stone-100">1</td>
                    <td className="px-4 py-3 font-medium text-stone-800 border-r border-stone-100">{subscription.planName}</td>
                    <td className="px-4 py-3 text-stone-500 border-r border-stone-100">
                      {new Date(subscription.activatedDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-stone-500 border-r border-stone-100">
                      {subscription.expiresAt
                        ? new Date(subscription.expiresAt).toLocaleDateString('en-IN')
                        : 'Lifetime'}
                    </td>
                    <td className="px-4 py-3 text-stone-500 border-r border-stone-100">{subscription.duration}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold ${
                        subscription.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {subscription.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={openEdit}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-xs text-stone-400">
                      No active subscription
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Payment Transaction History */}
          <div className="bg-white border border-stone-200">
            <div className="px-4 py-3 border-b border-stone-200 bg-stone-50">
              <h3 className="text-sm font-bold text-stone-700">Payment Transaction History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50">
                    {['No.', 'Order Id', 'Date', 'Package', 'Duration', 'Cost', 'Ref Id'].map((h) => (
                      <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold text-stone-500 uppercase border-r border-stone-100 last:border-r-0 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.length > 0 ? (
                    paymentHistory.map((p) => (
                      <tr key={p.orderId} className="border-b border-stone-100 hover:bg-stone-50">
                        <td className="px-4 py-3 text-stone-400 border-r border-stone-100">{p.no}</td>
                        <td className="px-4 py-3 text-stone-600 font-medium border-r border-stone-100">{p.orderId}</td>
                        <td className="px-4 py-3 text-stone-500 border-r border-stone-100 whitespace-nowrap">
                          {new Date(p.date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-stone-500 border-r border-stone-100">{p.packageName}</td>
                        <td className="px-4 py-3 text-stone-500 border-r border-stone-100">{p.duration}</td>
                        <td className="px-4 py-3 text-stone-500 border-r border-stone-100">{p.cost} AED</td>
                        <td className="px-4 py-3 text-stone-400 text-[11px]">{p.refId}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-xs text-stone-400">
                        No payment history
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Subscription Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) closeEdit(); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#3835A4]">Edit Subscription</h3>
              <button onClick={closeEdit} className="text-stone-400 hover:text-stone-600 text-xl leading-none cursor-pointer"><X /></button>
            </div>

            {saveError && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold">{saveError}</div>}
            {saveSuccess && <div className="p-3 bg-green-50 border border-green-200 text-green-600 text-xs font-bold">{saveSuccess}</div>}

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Plan *</label>
                <select value={editPlanId} onChange={(e) => setEditPlanId(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]">
                  <option value="">Select a plan</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Status</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Activated On</label>
                <input type="date" value={editActivatedAt} onChange={(e) => setEditActivatedAt(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Expire On</label>
                <input type="date" value={editExpiresAt} onChange={(e) => setEditExpiresAt(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]" />
                <p className="text-[10px] text-stone-400 mt-1">Leave empty for Lifetime / no expiry</p>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeEdit}
                  className="text-stone-500 font-bold hover:text-stone-700 transition-colors text-xs uppercase tracking-widest cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving}
                  className="bg-[#C6007E] text-white px-8 py-3 font-black uppercase tracking-widest hover:bg-[#a10065] transition-colors text-xs disabled:opacity-50 cursor-pointer">
                  {saving ? 'Saving...' : 'Update Subscription'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TalentSubscription;
