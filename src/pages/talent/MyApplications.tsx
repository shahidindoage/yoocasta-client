import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications } from '../../api/application.api';

const CATEGORY_IMAGES: Record<string, string> = {
 'Actors & Extras': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/actors_image.jpg',
 'Dancers': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/category.jpg',
 'Models': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/WhatsApp_Image_2024-10-11_at_3_22_56_PM.jpeg',
 'Photographers': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/2892613_8705625.jpg',
 'Makeup & Hairstylists': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/makeup.jpg',
 'Singers': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/singers.jpg',
 'Directors': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/Directors.jpg',
 'Cinematographers / Videographers': 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/Videographers.jpg',
};

const DEFAULT_CATEGORY_IMAGE = 'https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/category/pexels-bertellifotografia-2608515.jpg';
const getCategoryImage = (name: string | undefined) => CATEGORY_IMAGES[name || ''] || DEFAULT_CATEGORY_IMAGE;

const STATUS_COLORS: Record<string, string> = {
 APPLIED: '#3835A4',
 UNDER_REVIEW: '#f59e0b',
 SHORTLISTED: '#16a34a',
 SELECTED: '#16a34a',
 REJECTED: '#ef4444',
};

const STATUS_BG: Record<string, string> = {
 APPLIED: '#eef0ff',
 UNDER_REVIEW: '#fef3c7',
 SHORTLISTED: '#f0fdf4',
 SELECTED: '#f0fdf4',
 REJECTED: '#fef2f2',
};

const SORT_OPTIONS = [
 { value: 'newest', label: 'Newest' },
 { value: 'oldest', label: 'Oldest' },
 { value: 'APPLIED', label: 'Applied' },
 { value: 'SHORTLISTED', label: 'Shortlisted' },
 { value: 'SELECTED', label: 'Selected' },
 { value: 'REJECTED', label: 'Rejected' },
 { value: 'expired', label: 'Expired' },
];

export default function MyApplications() {
 const [applications, setApplications] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [sort, setSort] = useState('newest');

 useEffect(() => {
  getMyApplications()
   .then(res => setApplications(res.data.data || []))
   .catch(() => {})
   .finally(() => setLoading(false));
 }, []);

 const filtered = applications.filter(app => {
  if (sort === 'expired') {
   const lastDate = app.role?.job?.lastDateToApply;
   return lastDate && new Date(lastDate) < new Date();
  }
  if (sort === 'newest' || sort === 'oldest') return true;
  return app.status === sort;
 });

 const sorted = [...filtered].sort((a, b) => {
  if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
 });

 return (
  <div className="bg-[#fdfbf7]">
  <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 min-h-screen ">
   <div className="space-y-8 ">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
     <div>
      <h1 className="text-3xl sm:text-4xl font-black text-[#3835A4]">My Applications</h1>
      <p className="text-sm text-stone-500 font-medium mt-1">
       You have applied for <span className="font-black text-[#C6007E]">{applications.length}</span> role{applications.length !== 1 ? 's' : ''}
      </p>
     </div>
     <div className="flex items-center gap-2">
      <span className="text-[10px] font-extrabold text-stone-400">Sort</span>
      <select
       value={sort}
       onChange={e => setSort(e.target.value)}
       className="bg-white border-2 border-stone-200 rounded-xl px-4 py-2.5 text-xs font-bold text-stone-700 outline-none focus:border-[#3835A4] cursor-pointer"
      >
       {SORT_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
       ))}
      </select>
     </div>
    </div>

    {/* Applications List */}
    {loading ? (
     <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-[#3835A4] border-t-[#C6007E] rounded-full animate-spin" />
     </div>
    ) : sorted.length === 0 ? (
     <div className="text-center py-20 space-y-4">
      <span className="text-5xl block">📋</span>
      <p className="text-sm font-medium text-stone-500">No applications found</p>
      <Link to="/browse-jobs" className="inline-block text-[10px] font-black  bg-[#C6007E] text-white px-6 py-3 rounded-xl hover:bg-[#a10065] transition-all">
       Browse Jobs
      </Link>
     </div>
    ) : (
     <div className="space-y-4">
      {sorted.map(app => {
       const job = app.role?.job;
       const role = app.role;
       const company = job?.company;
       const isExpired = job?.lastDateToApply && new Date(job.lastDateToApply) < new Date();

       return (
        <div key={app.id} className="bg-white border-2 border-stone-100 rounded-2xl p-5 sm:p-6 hover:border-[#3835A4]/20 transition-all shadow-sm hover:shadow-md">
         {/* Top Row: Image + Info + Status */}
         <div className="flex items-start gap-4">
          {/* Category Image */}
          <div className="w-14 h-14 rounded-xl shrink-0 overflow-hidden border border-stone-100" style={{
           backgroundImage: `url(${getCategoryImage(job?.category?.name)})`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
          }} />

          {/* Job Info (takes remaining space) */}
          <div className="flex-1 min-w-0">
           <Link to={`/jobs/${job?.id}`} className="text-sm font-black text-[#3835A4] hover:text-[#C6007E] transition-colors block truncate">
            {job?.title || 'Untitled Job'}
           </Link>
           <p className="text-[11px] font-bold text-stone-500 mt-0.5">{role?.title || 'Untitled Role'}</p>
           <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className="text-[9px] text-stone-400 font-medium">{company?.companyName || 'Company'}</span>
            {job?.category?.name && <span className="text-[9px] text-stone-400">· {job.category.name}</span>}
            {isExpired && <span className="text-[9px] font-bold text-red-500">· Expired</span>}
           </div>
          </div>

          {/* Status Chip */}
          <span
           className="shrink-0 text-[9px] font-black  px-2.5 py-1 rounded-lg"
           style={{ color: STATUS_COLORS[app.status] || '#666', background: STATUS_BG[app.status] || '#f5f5f5' }}
          >
           {app.status.replace(/_/g, ' ')}
          </span>
         </div>

         {/* Bottom Row: Date + View Shortlisted */}
         <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-50">
          <p className="text-[10px] text-stone-400 font-medium">
           Applied {new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <Link
           to={`/dashboard/talent/applications/shortlisted/${role?.id}`}
           className="text-[9px] font-black  bg-[#3835A4] text-white px-3.5 py-2 rounded-lg hover:bg-[#2a2899] transition-all"
          >
           View Shortlisted
          </Link>
         </div>
        </div>
       );
      })}
     </div>
    )}
   </div>
  </div>
  </div>
 );
}
