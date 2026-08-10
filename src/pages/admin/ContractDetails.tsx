import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getContractDetails, renewContract, closeContract } from '../../api/contracts.api';
import { ArrowLeft, RefreshCw, XCircle, AlertTriangle } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-50 text-green-700 border-green-200',
  EXPIRING_SOON: 'bg-orange-50 text-orange-700 border-orange-200',
  EXPIRED: 'bg-red-50 text-red-700 border-red-200',
  NOT_RENEWED: 'bg-stone-100 text-stone-600 border-stone-200',
};

const getBadge = (status: string, isExpiringSoon?: boolean): { label: string; style: string } => {
  if (status === 'ACTIVE') {
    return isExpiringSoon
      ? { label: 'Expiring Soon', style: STATUS_STYLES.EXPIRING_SOON }
      : { label: 'Active', style: STATUS_STYLES.ACTIVE };
  }
  return {
    label: status?.replace(/_/g, ' ') || status,
    style: STATUS_STYLES[status] || STATUS_STYLES.ACTIVE,
  };
};

const ACTION_STYLES: Record<string, string> = {
  RENEWED: 'bg-green-50 text-green-700 border-green-200',
  NOT_RENEWED: 'bg-stone-100 text-stone-600 border-stone-200',
};

const ContractDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<'renew' | 'close' | null>(null);
  const [renewForm, setRenewForm] = useState({ newExpiryDate: '', remarks: '', usageDurationDays: '', usageDurationLabel: '' });
  const [closeRemarks, setCloseRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchData = () => {
    if (!id) return;
    setLoading(true);
    setError('');
    getContractDetails(id)
      .then(res => setData(res.data.data))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load contract'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  const formatDurationLabel = (days: number) => {
    if (days < 1) return '';
    if (days < 30) return days === 1 ? '1 day' : `${days} days`;
    const months = days / 30;
    if (months < 12) {
      const wholeMonths = Math.floor(months);
      const remDays = days - wholeMonths * 30;
      const monthPart = `${wholeMonths} month${wholeMonths > 1 ? 's' : ''}`;
      return remDays > 0 ? `${monthPart} ${remDays} day${remDays > 1 ? 's' : ''}` : monthPart;
    }
    const years = days / 365;
    const wholeYears = Math.floor(years);
    const remMonths = Math.round((years - wholeYears) * 12);
    const yearPart = `${wholeYears} year${wholeYears > 1 ? 's' : ''}`;
    return remMonths > 0 ? `${yearPart} ${remMonths} month${remMonths > 1 ? 's' : ''}` : yearPart;
  };

  const handleRenewExpiryChange = (value: string) => {
    setRenewForm(prev => {
      const next = { ...prev, newExpiryDate: value };
      if (next.newExpiryDate && data?.contractStart) {
        const start = new Date(data.contractStart);
        const expiry = new Date(next.newExpiryDate);
        if (!isNaN(start.getTime()) && !isNaN(expiry.getTime()) && expiry > start) {
          const days = Math.round((expiry.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          next.usageDurationDays = String(days);
          next.usageDurationLabel = formatDurationLabel(days);
        } else {
          next.usageDurationDays = '';
          next.usageDurationLabel = '';
        }
      } else {
        next.usageDurationDays = '';
        next.usageDurationLabel = '';
      }
      return next;
    });
  };

  const handleRenew = async () => {
    if (!renewForm.newExpiryDate) { setError('New expiry date is required'); return; }
    setSubmitting(true);
    setError('');
    try {
      await renewContract(id!, {
        newExpiryDate: renewForm.newExpiryDate,
        remarks: renewForm.remarks || undefined,
        usageDurationDays: renewForm.usageDurationDays ? Number(renewForm.usageDurationDays) : undefined,
        usageDurationLabel: renewForm.usageDurationLabel || undefined,
      });
      setModal(null);
      setRenewForm({ newExpiryDate: '', remarks: '', usageDurationDays: '', usageDurationLabel: '' });
      setMsg('Contract renewed successfully');
      fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to renew contract');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async () => {
    setSubmitting(true);
    setError('');
    try {
      await closeContract(id!, closeRemarks || undefined);
      setModal(null);
      setCloseRemarks('');
      setMsg('Contract marked as not renewed');
      fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to close contract');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#3835A4] border-t-[#C6007E] rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="text-center py-20">
        <p className="text-sm font-bold text-red-500">{error}</p>
      </div>
    );
  }

  const fmt = (d: string | null | undefined) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="p-6">
      {msg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-xs font-bold">
          {msg}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
          {error}
        </div>
      )}

      <div className="mb-6">
        <Link to="/admin/contracts" className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-[#3835A4] transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Contracts
        </Link>
        <div className="flex items-center justify-between mt-3 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#3835A4]">{data?.projectName || 'Contract'}</h1>
            <p className="text-xs text-stone-500 mt-1">{data?.jobTitle || '—'} · {data?.company?.companyName || '—'}</p>
          </div>
          <div className="flex items-center gap-2">
            {(() => {
              const badge = getBadge(data?.status, data?.isExpiringSoon);
              return (
                <span className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider border rounded-lg ${badge.style}`}>
                  {badge.label}
                </span>
              );
            })()}
            {data?.status !== 'NOT_RENEWED' && (
              <>
                <button
                  onClick={() => { setModal('renew'); setError(''); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider text-white bg-green-600 hover:bg-green-700 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Renew
                </button>
                <button
                  onClick={() => { setModal('close'); setError(''); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" /> Not Renew
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contract details */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <h3 className="text-sm font-black text-[#3835A4]">Contract Details</h3>
          </div>
          <div className="p-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-stone-400">Start Date</span>
              <span className="font-bold text-stone-700">{fmt(data?.contractStart)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-stone-400">Expiry Date</span>
              <span className="font-bold text-stone-700">{fmt(data?.contractExpiry)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-stone-400">Usage Duration</span>
              <span className="font-bold text-stone-700">
                {data?.usageDurationDays ? `${data.usageDurationDays} days` : data?.usageDurationLabel || '—'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-stone-400">Company</span>
              <span className="font-bold text-stone-700 text-right">{data?.company?.companyName || '—'}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-stone-400">Job</span>
              <span className="font-bold text-stone-700 text-right">{data?.jobTitle || '—'}</span>
            </div>
            {data?.notes && (
              <div className="pt-3 border-t border-stone-100">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-stone-500 text-sm">{data.notes}</p>
              </div>
            )}
            <div className="pt-3 border-t border-stone-100 space-y-1.5">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Created {fmt(data?.createdAt)} by {data?.creator?.firstName || 'Admin'}
              </p>
              {data?.lastUpdater && (
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Updated {fmt(data?.updatedAt)} by {data?.lastUpdater?.firstName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Talents */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-[#3835A4]">Talents</h3>
            <span className="text-[10px] font-bold text-stone-400">{data?.talents?.length || 0} talent(s)</span>
          </div>
          <div className="divide-y divide-stone-50">
            {(data?.talents || []).map((t: any) => (
              <div key={t.id} className="p-4 flex items-center gap-3">
                <img
                  src={t.image || 'https://via.placeholder.com/80x80?text=No+Photo'}
                  alt={t.name}
                  className="w-10 h-10 rounded-xl object-cover bg-stone-100"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#3835A4] truncate">{t.name}</p>
                  <p className="text-[10px] text-stone-400 truncate">
                    @{t.username} · {t.email}
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                  {t.applicationStatus || '—'}
                </span>
              </div>
            ))}
            {(data?.talents || []).length === 0 && (
              <p className="text-center py-10 text-stone-400 text-sm font-bold">No talents assigned</p>
            )}
          </div>
        </div>

        {/* Audit trail */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <h3 className="text-sm font-black text-[#3835A4]">Audit Trail</h3>
          </div>
          <div className="divide-y divide-stone-50 max-h-[480px] overflow-y-auto">
            {(data?.renewalHistory || []).map((h: any) => (
              <div key={h.id} className="p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border rounded-lg ${ACTION_STYLES[h.action] || ''}`}>
                    {h.action?.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] font-bold text-stone-400">
                    {new Date(h.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  {h.action === 'RENEWED'
                    ? <>Expiry: <b>{fmt(h.oldExpiryDate)}</b> → <b className="text-green-600">{fmt(h.newExpiryDate)}</b></>
                    : <>Final expiry: <b>{fmt(h.oldExpiryDate)}</b></>}
                </p>
                {h.remarks && <p className="text-xs text-stone-400 mt-1 italic">"{h.remarks}"</p>}
                {h.updatedByName && (
                  <p className="text-[10px] text-stone-400 mt-1 font-bold uppercase tracking-wider">By {h.updatedByName}</p>
                )}
              </div>
            ))}
            {(data?.renewalHistory || []).length === 0 && (
              <p className="text-center py-10 text-stone-400 text-sm font-bold">No renewal activity yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Renew modal */}
      {modal === 'renew' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-black text-[#3835A4]">Renew Contract</h3>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Contract will return to <b>Active</b> with a new expiry date. The reminder cycle will restart.
            </p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">New Expiry Date *</label>
                <input
                  type="date"
                  value={renewForm.newExpiryDate}
                  min={data?.contractExpiry ? new Date(data.contractExpiry).toISOString().slice(0, 10) : undefined}
                  onChange={e => handleRenewExpiryChange(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Usage Duration (days)</label>
                  <input
                    type="number"
                    min={1}
                    value={renewForm.usageDurationDays}
                    readOnly
                    title="Auto-calculated from contract start and new expiry date"
                    className="w-full bg-stone-50 cursor-not-allowed border-b-2 border-stone-200 py-3 text-sm outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Duration Label</label>
                  <input
                    type="text"
                    value={renewForm.usageDurationLabel}
                    readOnly
                    title="Auto-calculated from contract start and new expiry date"
                    className="w-full bg-stone-50 cursor-not-allowed border-b-2 border-stone-200 py-3 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Remarks</label>
                <textarea
                  value={renewForm.remarks}
                  onChange={e => setRenewForm(prev => ({ ...prev, remarks: e.target.value }))}
                  rows={3}
                  className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setModal(null)}
                disabled={submitting}
                className="px-4 py-2 text-xs font-black uppercase tracking-wider text-stone-500 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRenew}
                disabled={submitting}
                className="px-5 py-2 text-xs font-black uppercase tracking-wider text-white bg-green-600 hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Renewing...' : 'Renew'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close modal */}
      {modal === 'close' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-black text-[#3835A4]">Mark as Not Renewed</h3>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              This will set the contract status to <b>Not Renewed</b>. This action is recorded in the audit trail.
            </p>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold tracking-widest text-stone-500 uppercase">Remarks</label>
              <textarea
                value={closeRemarks}
                onChange={e => setCloseRemarks(e.target.value)}
                rows={3}
                className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]"
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setModal(null)}
                disabled={submitting}
                className="px-4 py-2 text-xs font-black uppercase tracking-wider text-stone-500 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClose}
                disabled={submitting}
                className="px-5 py-2 text-xs font-black uppercase tracking-wider text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractDetails;
