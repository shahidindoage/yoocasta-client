import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCmsPages, createCmsPage, deleteCmsPage } from '../../api/admin.api';
import { Trash2, Pencil, Plus, X } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface CmsPageItem {
  id: string;
  pageKey: string;
  metaTitle: string;
  metaDescription: string;
  pageHeading: string;
  subHeading: string;
  pageDescription: string;
  body: string;
}

interface FaqItem {
  q: string;
  a: string;
}

const ManageCms = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CmsPageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [pageKey, setPageKey] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [pageHeading, setPageHeading] = useState('');
  const [subHeading, setSubHeading] = useState('');
  const [pageDescription, setPageDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [bottomHeading, setBottomHeading] = useState('');
  const [bottomDescription, setBottomDescription] = useState('');
  const [talentFaqs, setTalentFaqs] = useState<FaqItem[]>([]);
  const [companyFaqs, setCompanyFaqs] = useState<FaqItem[]>([]);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showHtml, setShowHtml] = useState(false);

  const cleanHtml = (html: string) =>
    html
      .replace(/&nbsp;/g, ' ')
      .replace(/\u00a0/g, ' ');

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['code-block'],
      ['clean']
    ],
  };

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await getCmsPages();
      setItems(res.data.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => {
    setPageKey(''); setMetaTitle(''); setMetaDescription(''); setPageHeading(''); setSubHeading(''); setPageDescription(''); setAddress(''); setPhone(''); setEmail(''); setVideoUrl(''); setBottomHeading(''); setBottomDescription(''); setTalentFaqs([]); setCompanyFaqs([]); setBody('');
    setError(''); setSuccess(''); setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setPageKey(''); setMetaTitle(''); setMetaDescription(''); setPageHeading(''); setSubHeading(''); setPageDescription(''); setAddress(''); setPhone(''); setEmail(''); setVideoUrl(''); setBottomHeading(''); setBottomDescription(''); setTalentFaqs([]); setCompanyFaqs([]); setBody('');
    setError(''); setSuccess('');
  };

  const openEdit = (key: string) => {
    navigate(`/admin/cms/${key}/edit`);
  };

  const handleDelete = async (key: string) => {
    if (!window.confirm(`Delete this page (${key})?`)) return;
    try {
      await deleteCmsPage(key);
      setItems((prev) => prev.filter((i) => i.pageKey !== key));
      setSuccess(`${key} page deleted`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageKey.trim()) { setError('Page key is required'); return; }
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      const res = await createCmsPage({
        pageKey: pageKey.trim().toLowerCase().replace(/\s+/g, '-'),
        metaTitle: metaTitle.trim(),
        metaDescription: metaDescription.trim(),
        pageHeading: pageHeading.trim(),
        subHeading: subHeading.trim(),
        pageDescription: pageDescription.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        videoUrl: videoUrl.trim(),
        bottomHeading: bottomHeading.trim(),
        bottomDescription: bottomDescription.trim(),
        talentFaqs: JSON.stringify(talentFaqs),
        companyFaqs: JSON.stringify(companyFaqs),
        body: cleanHtml(body),
      });
      setItems((prev) => [...prev, res.data.data]);
      setSuccess('Page created successfully');
      setTimeout(() => closeModal(), 800);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-[#3835A4]">CMS</h2>
          <p className="text-xs text-stone-400">{items.length} total pages</p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 bg-[#C6007E] text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#a10065] transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> Add Page
        </button>
      </div>

      {error && !modalOpen && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold">{error}</div>}
      {success && !modalOpen && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-xs font-bold">{success}</div>}

      <div className="bg-white border border-stone-200"><div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-stone-50 border-b border-stone-200">
            {['Sl No', 'Page Key', 'Meta Title', 'Page Heading', 'Action'].map((h) => (
              <th key={h} className={`px-4 py-3 text-[10px] font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap border-r border-stone-100 last:border-r-0 ${h === 'Action' ? 'text-center' : 'text-left'}`}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="text-center py-12 text-stone-400 text-sm font-bold border-t border-stone-100">Loading...</td></tr>
            : items.length === 0 ? <tr><td colSpan={5} className="text-center py-12 text-stone-400 text-sm font-bold border-t border-stone-100">No pages found</td></tr>
            : items.map((item, idx) => (
                <tr key={item.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-3 text-stone-400 border-r border-stone-100">{idx + 1}</td>
                  <td className="px-4 py-3 font-bold text-[#3835A4] border-r border-stone-100">{item.pageKey}</td>
                  <td className="px-4 py-3 text-stone-600 border-r border-stone-100">{item.metaTitle || '—'}</td>
                  <td className="px-4 py-3 text-stone-600 border-r border-stone-100">{item.pageHeading || '—'}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <button onClick={() => openEdit(item.pageKey)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer mr-2"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                    <button onClick={() => handleDelete(item.pageKey)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div></div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#3835A4]">Add New Page</h3>
              <button onClick={closeModal} className="text-stone-400 hover:text-stone-600 text-xl leading-none cursor-pointer"><X /></button>
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold">{error}</div>}
            {success && <div className="p-3 bg-green-50 border border-green-200 text-green-600 text-xs font-bold">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Page Key *</label>
                <input type="text" value={pageKey} onChange={(e) => setPageKey(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]"
                  placeholder="e.g. blogs" autoFocus />
                <p className="text-[10px] text-stone-400 mt-1">Unique identifier used to fetch content for a page (lowercase, e.g. "blogs").</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Meta Title</label>
                  <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]" placeholder="SEO meta title" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Page Heading</label>
                  <input type="text" value={pageHeading} onChange={(e) => setPageHeading(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]" placeholder="Main page heading" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Sub Heading</label>
                  <input type="text" value={subHeading} onChange={(e) => setSubHeading(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]" placeholder="Sub heading shown under the main heading" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Meta Description</label>
                  <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={2}
                    className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4] resize-none" placeholder="SEO meta description" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Address</label>
                  <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2}
                    className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4] resize-none" placeholder="Office address" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Phone</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]" placeholder="Contact phone number(s)" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Email</label>
                  <textarea value={email} onChange={(e) => setEmail(e.target.value)} rows={2}
                    className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4] resize-none" placeholder="Contact email address(es)" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Video URL</label>
                  <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]" placeholder="https://...mp4" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Bottom Heading</label>
                  <input type="text" value={bottomHeading} onChange={(e) => setBottomHeading(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]" placeholder="Big bottom heading text" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Bottom Description</label>
                  <textarea value={bottomDescription} onChange={(e) => setBottomDescription(e.target.value)} rows={2}
                    className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4] resize-none" placeholder="Short bottom description text" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Page Description</label>
                <textarea value={pageDescription} onChange={(e) => setPageDescription(e.target.value)} rows={2}
                  className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4] resize-none" placeholder="Short page description shown under the heading" />
              </div>
              <div className="border-t border-stone-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-[10px] font-bold text-stone-500 uppercase">Talent FAQs</label>
                  <button type="button" onClick={() => setTalentFaqs([...talentFaqs, { q: '', a: '' }])}
                    className="text-[10px] font-bold text-[#3835A4] hover:underline cursor-pointer">+ Add Question</button>
                </div>
                <div className="space-y-4">
                  {talentFaqs.map((faq, i) => (
                    <div key={i} className="border border-stone-200 rounded-lg p-4 bg-stone-50/60">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-stone-400 uppercase">Q{i + 1}</span>
                        <button type="button" onClick={() => setTalentFaqs(talentFaqs.filter((_, idx) => idx !== i))}
                          className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer">Remove</button>
                      </div>
                      <input type="text" value={faq.q} onChange={(e) => setTalentFaqs(talentFaqs.map((f, idx) => idx === i ? { ...f, q: e.target.value } : f))}
                        className="w-full bg-white border border-stone-200 rounded px-3 py-2 text-sm outline-none focus:border-[#3835A4] mb-2" placeholder="Question" />
                      <textarea value={faq.a} onChange={(e) => setTalentFaqs(talentFaqs.map((f, idx) => idx === i ? { ...f, a: e.target.value } : f))} rows={3}
                        className="w-full bg-white border border-stone-200 rounded px-3 py-2 text-sm outline-none focus:border-[#3835A4] resize-y" placeholder="Answer" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-stone-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-[10px] font-bold text-stone-500 uppercase">Company FAQs</label>
                  <button type="button" onClick={() => setCompanyFaqs([...companyFaqs, { q: '', a: '' }])}
                    className="text-[10px] font-bold text-[#3835A4] hover:underline cursor-pointer">+ Add Question</button>
                </div>
                <div className="space-y-4">
                  {companyFaqs.map((faq, i) => (
                    <div key={i} className="border border-stone-200 rounded-lg p-4 bg-stone-50/60">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-stone-400 uppercase">Q{i + 1}</span>
                        <button type="button" onClick={() => setCompanyFaqs(companyFaqs.filter((_, idx) => idx !== i))}
                          className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer">Remove</button>
                      </div>
                      <input type="text" value={faq.q} onChange={(e) => setCompanyFaqs(companyFaqs.map((f, idx) => idx === i ? { ...f, q: e.target.value } : f))}
                        className="w-full bg-white border border-stone-200 rounded px-3 py-2 text-sm outline-none focus:border-[#3835A4] mb-2" placeholder="Question" />
                      <textarea value={faq.a} onChange={(e) => setCompanyFaqs(companyFaqs.map((f, idx) => idx === i ? { ...f, a: e.target.value } : f))} rows={3}
                        className="w-full bg-white border border-stone-200 rounded px-3 py-2 text-sm outline-none focus:border-[#3835A4] resize-y" placeholder="Answer" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-bold text-stone-500 uppercase">Page Body (WYSIWYG)</label>
                  <button type="button" onClick={() => setShowHtml(!showHtml)}
                    className="text-[10px] font-bold text-[#3835A4] hover:underline cursor-pointer">
                    {showHtml ? 'Show WYSIWYG' : 'Show HTML Code'}
                  </button>
                </div>
                {showHtml ? (
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full h-[250px] p-4 border border-stone-300 rounded text-sm font-mono focus:outline-none focus:border-[#3835A4] resize-y"
                    placeholder="<p>Enter HTML code here...</p>"
                  />
                ) : (
                  <div style={{ height: '250px' }}>
                    <ReactQuill
                      theme="snow"
                      value={body}
                      onChange={setBody}
                      modules={modules}
                      style={{ height: '100%' }}
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeModal}
                  className="text-stone-500 font-bold hover:text-stone-700 transition-colors text-xs uppercase tracking-widest cursor-pointer">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="bg-[#C6007E] text-white px-8 py-3 font-black uppercase tracking-widest hover:bg-[#a10065] transition-colors text-xs disabled:opacity-50 cursor-pointer">
                  {submitting ? 'Saving...' : 'Add Page'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCms;
