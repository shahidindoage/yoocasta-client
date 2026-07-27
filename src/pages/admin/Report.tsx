import { useState, useEffect } from 'react';
import { getTalents, getCompanies, getAdminJobs } from '../../api/admin.api';
import { Download } from 'lucide-react';

const downloadCSV = (rows: string[][], filename: string) => {
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const wrap = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export default function Report() {
  const [talents, setTalents] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTalents(1, 99999),
      getCompanies(1, 99999),
      getAdminJobs(1, 99999),
    ])
      .then(([tRes, cRes, jRes]) => {
        setTalents(tRes.data.data.talents);
        setCompanies(cRes.data.data.companies);
        setJobs(jRes.data.data.jobs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const downloadTalents = () => {
    const headers = ['Sl No', 'User ID', 'Name', 'Username', 'Email', 'Phone', 'WhatsApp', 'Country', 'City', 'Subscription Plan', 'Profile Completed', 'Status', 'Registered Date'];
    const rows = talents.map(t => [
      t.slNo, t.userId, wrap(t.name), t.username, t.email, t.phone, t.whatsapp,
      t.country, t.city, t.subscriptionPlan, t.profileCompleted ? 'Yes' : 'No', t.status,
      new Date(t.registeredDate).toLocaleDateString('en-GB'),
    ]);
    downloadCSV([headers, ...rows], `talent-report-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const downloadCompanies = () => {
    const headers = ['Sl No', 'Company Name', 'Contact Person', 'Email', 'Phone', 'Company Type', 'Website', 'Country', 'City', 'Trade License', 'Verified', 'Profile Completed', 'Status', 'Registered Date'];
    const rows = companies.map(c => [
      c.slNo, wrap(c.companyName), wrap(c.name), c.email, c.phone,
      c.companyType || '', c.website || '', c.country, c.city,
      c.tradeLicense || '', c.isVerified ? 'Yes' : 'No',
      c.profileCompleted ? 'Yes' : 'No', c.status,
      new Date(c.registeredDate).toLocaleDateString('en-GB'),
    ]);
    downloadCSV([headers, ...rows], `company-report-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const downloadJobs = () => {
    const headers = ['Sl No', 'Job Title', 'Company Name', 'Status', 'Date Posted', 'Expire Date'];
    const rows = jobs.map(j => [
      j.slNo, wrap(j.title), wrap(j.companyName), j.status,
      new Date(j.datePosted).toLocaleDateString('en-GB'),
      j.expireDate ? new Date(j.expireDate).toLocaleDateString('en-GB') : '',
    ]);
    downloadCSV([headers, ...rows], `job-report-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#3835A4] border-t-[#C6007E] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#3835A4]">Report</h2>

      {/* Talent Report Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-800">Talent Report</h3>
              <p className="text-sm text-stone-500 mt-0.5">Total {talents.length} talents</p>
            </div>
          </div>
          <button
            onClick={downloadTalents}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        </div>
      </div>

      {/* Company Report Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <span className="text-2xl">🏢</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-800">Company Report</h3>
              <p className="text-sm text-stone-500 mt-0.5">Total {companies.length} companies</p>
            </div>
          </div>
          <button
            onClick={downloadCompanies}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        </div>
      </div>

      {/* Job Report Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <span className="text-2xl">💼</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-800">Job Report</h3>
              <p className="text-sm text-stone-500 mt-0.5">Total {jobs.length} jobs</p>
            </div>
          </div>
          <button
            onClick={downloadJobs}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}
