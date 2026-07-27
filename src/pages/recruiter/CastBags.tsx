import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RecruiterGuard from '../../auth/RecruiterGuard';
import { getCastBags, createCastBag, deleteCastBag, shareCastBag } from '../../api/castBag.api';

export default function CastBags() {
 const [bags, setBags] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [showCreate, setShowCreate] = useState(false);
 const [newName, setNewName] = useState('');
 const [showShare, setShowShare] = useState<any>(null);
 const [shareEmails, setShareEmails] = useState('');
 const [shareValidity, setShareValidity] = useState(7);
 const [sharing, setSharing] = useState(false);
 const [msg, setMsg] = useState('');

 const fetchBags = () => {
  setLoading(true);
  getCastBags()
   .then(res => setBags(res.data.data || []))
   .catch(() => {})
   .finally(() => setLoading(false));
 };

 useEffect(() => { fetchBags(); }, []);

 const handleCreate = async () => {
  if (!newName.trim()) return;
  try {
   await createCastBag(newName.trim());
   setShowCreate(false);
   setNewName('');
   setMsg('Cast bag created');
   fetchBags();
  } catch { setMsg('Failed to create'); }
 };

 const handleDelete = async (id: string) => {
  if (!confirm('Delete this cast bag?')) return;
  try {
   await deleteCastBag(id);
   setMsg('Cast bag deleted');
   fetchBags();
  } catch { setMsg('Failed to delete'); }
 };

 const handleShare = async () => {
  const emails = shareEmails.split(',').map(e => e.trim()).filter(Boolean);
  if (!emails.length) return;
  setSharing(true);
  try {
   await shareCastBag(showShare.id, emails, shareValidity);
   setShowShare(null);
   setShareEmails('');
   setMsg('Cast bag shared successfully');
  } catch { setMsg('Failed to share'); }
  finally { setSharing(false); }
 };

 return (
  <RecruiterGuard>
  <div className="bg-[#fdfbf7]">
  <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 min-h-screen ">
   <div className="space-y-8">
    {/* Header */}
    <div className="flex items-center justify-between">
     <div>
      <h1 className="text-3xl font-black text-[#3835A4] ">Cast Bags</h1>
      <p className="text-sm text-stone-500 font-medium mt-1">Manage your talent collections</p>
     </div>
     <button
      onClick={() => setShowCreate(true)}
      className="bg-[#C6007E] text-white px-6 py-3 rounded-xl font-black  text-xs hover:bg-[#a10065] transition-all"
     >
      + Create Cast Bag
     </button>
    </div>

    {msg && <p className="text-xs font-semibold text-green-700 bg-green-50 px-4 py-2 rounded-lg">{msg}</p>}

    {/* Table */}
    {loading ? (
     <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-[#3835A4] border-t-[#C6007E] rounded-full animate-spin" />
     </div>
    ) : bags.length === 0 ? (
     <div className="text-center py-20 space-y-4">
      <span className="text-5xl block">📁</span>
      <p className="text-sm font-medium text-stone-500">No cast bags yet</p>
      <button onClick={() => setShowCreate(true)} className="text-[10px] font-black  bg-[#3835A4] text-white px-6 py-3 rounded-xl hover:bg-[#2a2899] transition-all">
       Create Your First Cast Bag
      </button>
     </div>
    ) : (
     <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
      <table className="w-full text-left">
       <thead>
        <tr className="bg-stone-50 text-[9px] font-black  text-stone-500">
         <th className="px-5 py-4">Name</th>
         <th className="px-5 py-4">Talents</th>
         <th className="px-5 py-4">Created</th>
         <th className="px-5 py-4 text-right">Actions</th>
        </tr>
       </thead>
       <tbody className="divide-y divide-stone-50">
        {bags.map(bag => (
         <tr key={bag.id} className="text-sm hover:bg-stone-50/50 transition-colors">
          <td className="px-5 py-4 font-bold text-[#3835A4]">{bag.name}</td>
          <td className="px-5 py-4 text-stone-500">{bag.talentCount} talent{bag.talentCount !== 1 ? 's' : ''}</td>
          <td className="px-5 py-4 text-stone-500">
           {new Date(bag.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </td>
          <td className="px-5 py-4 text-right">
           <div className="flex items-center justify-end gap-2">
            <button
             onClick={() => setShowShare(bag)}
             className="text-[9px] font-black  bg-[#3835A4] text-white px-3 py-2 rounded-lg hover:bg-[#2a2899] transition-all"
            >
             📧 Email Link
            </button>
            <button
             onClick={() => handleDelete(bag.id)}
             className="text-[9px] font-black  bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-all"
            >
             Delete
            </button>
           </div>
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    )}
   </div>

   {/* Create Popup */}
   {showCreate && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}>
     <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5" onClick={e => e.stopPropagation()}>
      <h2 className="text-lg font-black text-[#3835A4]">Create Cast Bag</h2>
      <div className="space-y-1.5">
       <label className="text-[10px] font-extrabold text-stone-400 ">Name *</label>
       <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Lead Actors" autoFocus className="w-full bg-transparent border-b-2 border-stone-200 py-2.5 text-sm outline-none focus:border-[#3835A4]" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
       <button onClick={() => setShowCreate(false)} className="text-xs font-bold text-stone-500 hover:text-stone-800 ">Cancel</button>
       <button onClick={handleCreate} disabled={!newName.trim()} className="bg-[#C6007E] disabled:opacity-40 text-white px-6 py-2.5 rounded-xl font-black  text-xs hover:bg-[#a10065] transition-all">Save</button>
      </div>
     </div>
    </div>
   )}

   {/* Share Popup */}
   {showShare && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={e => { if (e.target === e.currentTarget) setShowShare(null); }}>
     <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5" onClick={e => e.stopPropagation()}>
      <h2 className="text-lg font-black text-[#3835A4]">Share: {showShare.name}</h2>
      <div className="space-y-1.5">
       <label className="text-[10px] font-extrabold text-stone-400 ">Email ID(s) *</label>
       <textarea value={shareEmails} onChange={e => setShareEmails(e.target.value)} placeholder="email1@example.com, email2@example.com" rows={3} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm outline-none focus:border-[#3835A4] resize-none" />
       <p className="text-[9px] text-stone-400">Separate multiple emails with commas</p>
      </div>
      <div className="space-y-1.5">
       <label className="text-[10px] font-extrabold text-stone-400 ">Link Expires In (days)</label>
       <input type="number" value={shareValidity} onChange={e => setShareValidity(Math.max(1, parseInt(e.target.value) || 7))} min={1} className="w-full bg-transparent border-b-2 border-stone-200 py-2.5 text-sm outline-none focus:border-[#3835A4]" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
       <button onClick={() => setShowShare(null)} className="text-xs font-bold text-stone-500 hover:text-stone-800 ">Cancel</button>
       <button onClick={handleShare} disabled={!shareEmails.trim() || sharing} className="bg-[#C6007E] disabled:opacity-40 text-white px-6 py-2.5 rounded-xl font-black  text-xs hover:bg-[#a10065] transition-all flex items-center gap-2">
        {sharing ? <>
         <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
         Sending...
        </> : 'Send'}
       </button>
      </div>
     </div>
    </div>
   )}
  </div>
  </div>
  </RecruiterGuard>
 );
}
