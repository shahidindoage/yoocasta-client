import { useState, useRef, useEffect } from 'react';
import { 
 uploadPortfolioMedia, 
 deletePortfolioMedia, 
 getPortfolioMedia, 
 addPortfolioLink, 
} from '../../../api/profile.api';

interface Props {
 existingProfile: any;
}

const MEDIA_TABS = ['All', 'Images', 'Videos', 'Audio'];
const MEDIA_TYPES = ['VIDEO', 'VIDEO_LINK', 'CASTING_VIDEO', 'ACTING_VIDEO'];

const PortfolioTab = ({ existingProfile }: Props) => {
 const [media, setMedia] = useState<any[]>(existingProfile?.talentProfile?.media || []);
 const [activeFilter, setActiveFilter] = useState('All');
 const [uploading, setUploading] = useState(false);
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');
 
 const imageRef = useRef<HTMLInputElement>(null);
 const actingVideoRef = useRef<HTMLInputElement>(null);
 const castingVideoRef = useRef<HTMLInputElement>(null);
 
 const [showLinkForm, setShowLinkForm] = useState(false);
 const [pendingLinks, setPendingLinks] = useState<{url: string, title: string, type: string}[]>([]);
 const [linkUrl, setLinkUrl] = useState('');
 const [linkTitle, setLinkTitle] = useState('');
 const [linkType, setLinkType] = useState('VIDEO_LINK');

 const [showAudioForm, setShowAudioForm] = useState(false);
 const [pendingAudios, setPendingAudios] = useState<{file: File, title: string}[]>([]);
 const [audioTitle, setAudioTitle] = useState('');

 useEffect(() => {
  getPortfolioMedia()
   .then(res => setMedia(res.data?.data || res.data || []))
   .catch(console.error);
 }, []);

 const plan = existingProfile?.subscription?.plan;
 
 const limits = {
  maxPhotos: plan?.maxPhotos ?? 8,
  maxVideos: plan?.maxVideos ?? 3, 
  maxAudios: plan?.maxAudios ?? 1,
  maxCasting: 1
 };

 const currentImages = media.filter(m => m.type === 'IMAGE').length;
 const currentVideos = media.filter(m => m.type === 'ACTING_VIDEO' || m.type === 'VIDEO').length;
 const currentAudios = media.filter(m => m.type === 'AUDIO').length;
 const currentCasting = media.filter(m => m.type === 'CASTING_VIDEO').length;

 const filteredMedia = media.filter(m => {
  if (activeFilter === 'All') return true;
  if (activeFilter === 'Images') return m.type === 'IMAGE';
  if (activeFilter === 'Videos') return MEDIA_TYPES.includes(m.type);
  if (activeFilter === 'Audio') return m.type === 'AUDIO';
  return true;
 });

 const getFilterCount = (tab: string) => {
  if (tab === 'All') return media.length;
  if (tab === 'Images') return currentImages;
  if (tab === 'Videos') return media.filter(m => MEDIA_TYPES.includes(m.type)).length;
  if (tab === 'Audio') return currentAudios;
  return 0;
 };

 const handleMultipleFileUpload = async (files: FileList | null, type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'ACTING_VIDEO' | 'CASTING_VIDEO') => {
  if (!files || files.length === 0) return;
  
  let currentCount = 0;
  let maxLimit = 0;
  let typeName = '';
  
  if (type === 'IMAGE') {
   currentCount = currentImages; maxLimit = limits.maxPhotos; typeName = 'images';
  } else if (type === 'ACTING_VIDEO' || type === 'VIDEO') {
   currentCount = currentVideos; maxLimit = limits.maxVideos; typeName = 'acting videos';
  } else if (type === 'AUDIO') {
   currentCount = currentAudios; maxLimit = limits.maxAudios; typeName = 'audios';
  } else if (type === 'CASTING_VIDEO') {
   currentCount = currentCasting; maxLimit = limits.maxCasting; typeName = 'casting videos';
  }

  const availableSlots = maxLimit - currentCount;
  
  if (availableSlots <= 0) {
   setError(`Max limit reached. You can upload up to ${maxLimit} ${typeName}.`);
   return;
  }

  if (files.length > availableSlots) {
   setError(`You can only add ${availableSlots} more ${typeName}. You selected ${files.length}.`);
   return;
  }

  try {
   setUploading(true); setError(''); setSuccess('');
   
   for (let i = 0; i < files.length; i++) {
    const formData = new FormData();
    formData.append('file', files[i]);
    formData.append('type', type);
    const res = await uploadPortfolioMedia(formData);
    setMedia(prev => [...prev, res.data?.data || res.data]);
   }
   
   setSuccess(`${files.length} file(s) uploaded.`);
   setTimeout(() => setSuccess(''), 3000);
  } catch (err: any) {
   setError(err.response?.data?.message || 'Upload failed.');
  } finally { 
   setUploading(false); 
  }
 };

 const handleDelete = async (mediaId: string) => {
  if (!confirm('Delete this file?')) return;
  try {
   await deletePortfolioMedia(mediaId);
   setMedia(prev => prev.filter(m => m.id !== mediaId));
   setSuccess('Deleted.');
   setTimeout(() => setSuccess(''), 3000);
  } catch (err: any) {
   setError('Error deleting file.');
  }
 };

 const addLinkToList = () => {
  setError('');
  if (!linkUrl.trim()) return setError('Link address is required.');
  setPendingLinks(prev => [...prev, { url: linkUrl, title: linkTitle, type: linkType }]);
  setLinkUrl(''); setLinkTitle('');
 };

 const removeLinkFromList = (index: number) => {
  setPendingLinks(prev => prev.filter((_, i) => i !== index));
 };

 const handleUploadAllLinks = async () => {
  if (pendingLinks.length === 0) return;
  try {
   setUploading(true); setError('');
   for (const link of pendingLinks) {
    const res = await addPortfolioLink({ 
     videoLink: link.url, 
     title: link.title, 
     type: link.type 
    });
    setMedia(prev => [...prev, res.data?.data || res.data]);
   }
   setSuccess(`${pendingLinks.length} link(s) added.`);
   setPendingLinks([]);
   setShowLinkForm(false);
   setTimeout(() => setSuccess(''), 3000);
  } catch (err: any) {
   const msg = err.response?.data?.message || err.message || '';
   if (msg.includes('Missing URL')) {
    setError('A valid URL is required.');
   } else {
    setError(msg || 'Failed to add link.');
   }
  } finally { setUploading(false); }
 };

 const handleAddAudioToList = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  const availableSlots = limits.maxAudios - currentAudios - pendingAudios.length;
  if (availableSlots <= 0) {
   setError(`Audio limit reached. Max ${limits.maxAudios} audio files allowed.`);
   return;
  }

  setPendingAudios(prev => [...prev, { file, title: audioTitle || file.name }]);
  setAudioTitle('');
  e.target.value = '';
 };

 const removeAudioFromList = (index: number) => {
  setPendingAudios(prev => prev.filter((_, i) => i !== index));
 };

 const handleUploadAllAudios = async () => {
  if (pendingAudios.length === 0) return;
  try {
   setUploading(true); setError('');
   for (const item of pendingAudios) {
    const formData = new FormData();
    formData.append('file', item.file);
    formData.append('type', 'AUDIO');
    const res = await uploadPortfolioMedia(formData);
    setMedia(prev => [...prev, res.data?.data || res.data]);
   }
   setSuccess(`${pendingAudios.length} audio file(s) uploaded.`);
   setPendingAudios([]);
   setShowAudioForm(false);
   setTimeout(() => setSuccess(''), 3000);
  } catch (err: any) {
   setError(err.response?.data?.message || 'Upload failed.');
  } finally { setUploading(false); }
 };

 return (
  <div className="space-y-10">
   
      {/* Title */}
   <div className="border-b border-[#3835A4]/10 pb-5">
    <h2 className="text-xl font-black text-[#3835A4]">Media Portfolio</h2>
    <p className="text-xs text-[#3835A4]/40 mt-1">Upload and manage your portfolio media.</p>
   </div>

      {/* Messages */}
   {(error || success || uploading) && (
    <div className="space-y-3">
     {error && (
      <p className="text-xs font-bold text-[#C6007E] bg-[#C6007E]/5 border border-[#C6007E]/20 px-4 py-3.5 rounded-xl">
       ⚠️ {error}
      </p>
     )}
     {success && (
      <p className="text-xs font-bold text-[#3835A4] bg-[#3835A4]/5 border border-[#3835A4]/20 px-4 py-3.5 rounded-xl">
       ✓ {success}
      </p>
     )}
     {uploading && (
      <p className="text-[10px] font-black text-[#3835A4]/40 animate-pulse">
       Uploading...
      </p>
     )}
    </div>
   )}

      {/* File inputs */}
   <input type="file" ref={imageRef} accept="image/*" multiple className="hidden" onChange={(e) => handleMultipleFileUpload(e.target.files, 'IMAGE')} />
   <input type="file" ref={actingVideoRef} accept="video/*" multiple className="hidden" onChange={(e) => handleMultipleFileUpload(e.target.files, 'ACTING_VIDEO')} />
   <input type="file" ref={castingVideoRef} accept="video/*" multiple className="hidden" onChange={(e) => handleMultipleFileUpload(e.target.files, 'CASTING_VIDEO')} />

      {/* Upload buttons */}
   <div className="flex flex-wrap gap-2.5">
    <button 
     onClick={() => imageRef.current?.click()} 
     disabled={uploading || currentImages >= limits.maxPhotos}
     className="border border-[#3835A4]/20 hover:border-[#3835A4] disabled:border-[#3835A4]/10 text-[#3835A4]/60 hover:text-[#3835A4] disabled:text-[#3835A4]/30 disabled:opacity-40 font-black text-[10px] px-5 py-3 rounded-xl transition-all duration-150"
    >
     + Images ({currentImages}/{limits.maxPhotos})
    </button>
    <button 
     onClick={() => actingVideoRef.current?.click()} 
     disabled={uploading || currentVideos >= limits.maxVideos}
     className="border border-[#3835A4]/20 hover:border-[#3835A4] disabled:border-[#3835A4]/10 text-[#3835A4]/60 hover:text-[#3835A4] disabled:text-[#3835A4]/30 disabled:opacity-40 font-black text-[10px] px-5 py-3 rounded-xl transition-all duration-150"
    >
     + Acting Clips ({currentVideos}/{limits.maxVideos})
    </button>
    <button 
     onClick={() => castingVideoRef.current?.click()} 
     disabled={uploading || currentCasting >= limits.maxCasting}
     className="border border-[#3835A4]/20 hover:border-[#3835A4] disabled:border-[#3835A4]/10 text-[#3835A4]/60 hover:text-[#3835A4] disabled:text-[#3835A4]/30 disabled:opacity-40 font-black text-[10px] px-5 py-3 rounded-xl transition-all duration-150"
    >
     + Casting Reel ({currentCasting}/1)
    </button>
    <button 
     onClick={() => { setShowAudioForm(!showAudioForm); setShowLinkForm(false); }} 
     disabled={uploading || currentAudios >= limits.maxAudios}
     className="border border-[#3835A4]/20 hover:border-[#3835A4] disabled:border-[#3835A4]/10 text-[#3835A4]/60 hover:text-[#3835A4] disabled:text-[#3835A4]/30 disabled:opacity-40 font-black text-[10px] px-5 py-3 rounded-xl transition-all duration-150"
    >
     + Audio Files ({currentAudios}/{limits.maxAudios})
    </button>
    <button 
     onClick={() => { setShowLinkForm(!showLinkForm); setShowAudioForm(false); }} 
     disabled={uploading}
     className={`font-black text-[10px] px-5 py-3 rounded-xl transition-all duration-150 ${showLinkForm ? 'bg-[#3835A4] text-white' : 'border border-[#3835A4]/20 hover:border-[#3835A4] text-[#3835A4]/60'}`}
    >
     ∞ Add Links
    </button>
   </div>

      {/* Link form */}
   {showLinkForm && (
    <div className="bg-[#3835A4]/5 border border-[#3835A4]/10 rounded-2xl p-6 space-y-6 animate-fadeIn">
     <div className="border-b border-[#3835A4]/10 pb-2">
      <h4 className="text-[10px] font-black text-[#3835A4]/40">Add Video Links</h4>
     </div>
     
     <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
      <div className="md:col-span-5 space-y-1.5 group">
       <label className="text-[9px] font-extrabold text-[#3835A4]/40">Video URL</label>
       <input 
        type="text" 
        placeholder="https://youtube.com/..." 
        value={linkUrl} 
        onChange={(e) => setLinkUrl(e.target.value)} 
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLinkToList(); } }}
        className="w-full bg-transparent border-b border-[#3835A4]/20 focus:border-[#3835A4] py-2 text-sm font-medium text-[#3835A4] placeholder-[#3835A4]/30 outline-none transition-colors" 
       />
      </div>
      <div className="md:col-span-3 space-y-1.5">
       <label className="text-[9px] font-extrabold text-[#3835A4]/40">Title</label>
       <input 
        type="text" 
        placeholder="Link title" 
        value={linkTitle} 
        onChange={(e) => setLinkTitle(e.target.value)} 
        className="w-full bg-transparent border-b border-[#3835A4]/20 focus:border-[#3835A4] py-2 text-sm font-medium text-[#3835A4] placeholder-[#3835A4]/30 outline-none transition-colors" 
       />
      </div>
      <div className="md:col-span-2 space-y-1.5">
       <label className="text-[9px] font-extrabold text-[#3835A4]/40">Type</label>
       <select 
        value={linkType} 
        onChange={(e) => setLinkType(e.target.value)} 
        className="w-full bg-transparent border-b border-[#3835A4]/20 focus:border-[#3835A4] py-2 text-xs font-bold text-[#3835A4] outline-none cursor-pointer"
       >
        <option value="VIDEO_LINK">Generic</option>
        <option value="ACTING_VIDEO">Acting</option>
        <option value="CASTING_VIDEO">Casting</option>
       </select>
      </div>
      <div className="md:col-span-2">
       <button 
        onClick={addLinkToList} 
        className="w-full bg-[#3835A4]/90 hover:bg-[#3835A4] text-white font-black text-[9px] py-3 rounded-xl transition-colors"
       >
        + Add
       </button>
      </div>
     </div>

      {/* Pending links */}
     {pendingLinks.length > 0 && (
      <div className="space-y-2 border-t border-[#3835A4]/10 pt-4">
       <p className="text-[9px] font-extrabold text-[#3835A4]/40 mb-3">Pending Links</p>
       {pendingLinks.map((l, i) => (
        <div key={i} className="flex items-center justify-between bg-white border border-[#3835A4]/10 rounded-xl px-4 py-2.5 text-xs">
         <span className="font-medium text-[#3835A4]/80 truncate max-w-xl">
          <strong className="text-[9px] font-mono text-[#3835A4]/40 mr-2 border border-[#3835A4]/10 px-1.5 py-0.5 rounded">{l.type}</strong> 
          {l.title || l.url}
         </span>
         <button onClick={() => removeLinkFromList(i)} className="text-[10px] font-bold text-[#3835A4]/30 hover:text-[#C6007E] transition-colors ml-4">Remove</button>
        </div>
       ))}
       <div className="pt-2">
        <button 
         onClick={handleUploadAllLinks} 
         disabled={uploading} 
         className="bg-[#3835A4] hover:bg-[#2a2780] text-white font-black text-[10px] px-6 py-3.5 rounded-xl transition-all shadow-md shadow-[#3835A4]/20"
        >
         Upload All Links ({pendingLinks.length})
        </button>
       </div>
      </div>
     )}
     <button onClick={() => setShowLinkForm(false)} className="text-[10px] font-black text-[#3835A4]/40 hover:text-[#3835A4] transition-colors">Close</button>
    </div>
   )}

      {/* Audio form */}
   {showAudioForm && (
    <div className="bg-[#3835A4]/5 border border-[#3835A4]/10 rounded-2xl p-6 space-y-6 animate-fadeIn">
     <div className="border-b border-[#3835A4]/10 pb-2">
      <h4 className="text-[10px] font-black text-[#3835A4]/40">Add Audio Files</h4>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
      <div className="md:col-span-8 space-y-1.5">
       <label className="text-[9px] font-extrabold text-[#3835A4]/40">Audio Title</label>
       <input 
        type="text" 
        placeholder="Audio title" 
        value={audioTitle} 
        onChange={(e) => setAudioTitle(e.target.value)} 
        className="w-full bg-transparent border-b border-[#3835A4]/20 focus:border-[#3835A4] py-2 text-sm font-medium text-[#3835A4] placeholder-[#3835A4]/30 outline-none transition-colors" 
       />
      </div>
      <div className="md:col-span-4">
       <label className="w-full block bg-[#3835A4]/90 hover:bg-[#3835A4] text-white font-black text-[9px] py-3.5 rounded-xl transition-colors cursor-pointer text-center">
        Select Audio File
        <input type="file" accept="audio/*" className="hidden" onChange={handleAddAudioToList} />
       </label>
      </div>
     </div>

      {/* Pending audios */}
     {pendingAudios.length > 0 && (
      <div className="space-y-2 border-t border-[#3835A4]/10 pt-4">
       <p className="text-[9px] font-extrabold text-[#3835A4]/40 mb-3">Pending Files</p>
       {pendingAudios.map((a, i) => (
        <div key={i} className="flex items-center justify-between bg-white border border-[#3835A4]/10 rounded-xl px-4 py-2.5 text-xs">
         <span className="font-medium text-[#3835A4]/80 truncate">🎵 {a.title}</span>
         <button onClick={() => removeAudioFromList(i)} className="text-[10px] font-bold text-[#3835A4]/30 hover:text-[#C6007E] transition-colors ml-4">Remove</button>
        </div>
       ))}
       <div className="pt-2">
        <button 
         onClick={handleUploadAllAudios} 
         disabled={uploading} 
         className="bg-[#3835A4] hover:bg-[#2a2780] text-white font-black text-[10px] px-6 py-3.5 rounded-xl transition-all shadow-md shadow-[#3835A4]/20"
        >
         Upload All Audio Files ({pendingAudios.length})
        </button>
       </div>
      </div>
     )}
     <button onClick={() => setShowAudioForm(false)} className="text-[10px] font-black text-[#3835A4]/40 hover:text-[#3835A4] transition-colors">Close</button>
    </div>
   )}

      {/* Filter tabs */}
   <div className="flex gap-1.5 border-b border-[#3835A4]/10 pb-3">
    {MEDIA_TABS.map(tab => (
     <button
      key={tab}
      onClick={() => setActiveFilter(tab)}
      className={`text-[10px] font-black px-4 py-2 rounded-lg transition-all duration-150 ${activeFilter === tab ? 'bg-[#3835A4] text-white shadow-sm' : 'text-[#3835A4]/40 hover:text-[#3835A4]'}`}
     >
      {tab} <span className="font-mono text-[9px] opacity-60 ml-0.5">({getFilterCount(tab)})</span>
     </button>
    ))}
   </div>

      {/* Media grid */}
   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {filteredMedia.length === 0 ? (
     <div className="col-span-full border border-dashed border-[#3835A4]/20 rounded-2xl py-16 text-center">
      <p className="text-xs font-medium text-[#3835A4]/40">
       No {activeFilter.toLowerCase()} yet.
      </p>
     </div>
    ) : (
     filteredMedia.map((item: any) => (
      <div key={item.id} className="group border border-[#3835A4]/10 hover:border-[#3835A4] rounded-2xl overflow-hidden bg-white flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md">
       
       <div className="relative w-full aspect-[4/3] bg-[#3835A4]/5 overflow-hidden flex items-center justify-center">
        {item.type === 'IMAGE' && (
         <img src={item.url} alt={item.caption || ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        )}
        
        {(item.type === 'VIDEO' || item.type === 'ACTING_VIDEO' || item.type === 'CASTING_VIDEO') && (
         <div className="w-full h-full relative">
          <video src={item.url} className="w-full h-full object-cover" controls />
          {item.type !== 'VIDEO' && (
           <span className="absolute top-3 left-3 bg-[#3835A4]/80 border border-white/10 text-white font-mono text-[8px] font-bold px-2 py-1 rounded">
            {item.type.replace('_', ' ')}
           </span>
          )}
         </div>
        )}
        
        {item.type === 'VIDEO_LINK' && (
         <div className="w-full h-full bg-[#3835A4]/5 p-5 flex flex-col justify-center items-center text-center space-y-2 border-b border-[#3835A4]/10">
          <span className="text-xl">🔗</span>
          <p className="text-[11px] font-medium text-[#3835A4]/80 line-clamp-2 px-2">{item.caption || 'Video Link'}</p>
          <a href={item.videoLink} target="_blank" rel="noreferrer" className="text-[9px] font-black text-[#3835A4]/40 hover:text-[#3835A4] transition-colors pt-1">Open Link ↗</a>
         </div>
        )}
        
        {item.type === 'AUDIO' && (
         <div className="w-full h-full bg-[#3835A4]/5 p-4 flex flex-col justify-center items-center space-y-3 border-b border-[#3835A4]/10">
          <span className="text-xl">🎵</span>
          <p className="text-[11px] font-medium text-[#3835A4]/80 line-clamp-1 px-4">{item.caption || item.title || 'Audio'}</p>
          <audio src={item.url} controls className="w-full scale-90" />
         </div>
        )}
       </div>
       
       {/* Meta */}
       <div className="p-4 bg-white space-y-3">
        <p className="text-[11px] font-bold text-[#3835A4]/80 truncate">
         {item.caption || item.title || item.type}
        </p>
        <div className="flex items-center justify-between pt-1 border-t border-[#3835A4]/5">
         <span className="text-[9px] font-mono text-[#3835A4]/40">{item.type.toLowerCase().replace('_', ' ')}</span>
         <button
          onClick={() => handleDelete(item.id)}
          className="text-[9px] font-black text-[#3835A4]/40 hover:text-[#C6007E] transition-colors"
         >
          Delete
         </button>
        </div>
       </div>

      </div>
     ))
    )}
   </div>
  </div>
 );
};

export default PortfolioTab;