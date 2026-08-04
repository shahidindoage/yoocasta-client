import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCmsPageByKey, updateCmsPage } from '../../api/admin.api';
import { ChevronLeft } from 'lucide-react';
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
  address: string;
  phone: string;
  email: string;
  videoUrl: string;
  bottomHeading: string;
  bottomDescription: string;
  talentFaqs: string;
  companyFaqs: string;
  body: string;
}

interface FaqItem {
  q: string;
  a: string;
}

const CmsEdit = () => {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
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

  const parseFaqs = (raw?: string): FaqItem[] => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return [];
  };

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

  useEffect(() => {
    if (!key) return;
    setLoading(true);
    getCmsPageByKey(key)
      .then((res) => {
        const d = res.data.data;
        setPageKey(d.pageKey);
        setMetaTitle(d.metaTitle || '');
        setMetaDescription(d.metaDescription || '');
        setPageHeading(d.pageHeading || '');
        setSubHeading(d.subHeading || '');
        setPageDescription(d.pageDescription || '');
        setAddress(d.address || '');
        setPhone(d.phone || '');
        setEmail(d.email || '');
        setVideoUrl(d.videoUrl || '');
        setBottomHeading(d.bottomHeading || '');
        setBottomDescription(d.bottomDescription || '');
        setTalentFaqs(parseFaqs(d.talentFaqs));
        setCompanyFaqs(parseFaqs(d.companyFaqs));
        setBody(cleanHtml(d.body || ''));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [key]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key) return;
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      await updateCmsPage(key, {
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
      setSuccess('Page updated successfully');
      setTimeout(() => navigate('/admin/cms'), 800);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally { setSubmitting(false); }
  };

  if (loading) {
    return <div className="py-24 text-center text-stone-400 text-sm font-bold">Loading...</div>;
  }

  if (notFound) {
    return (
      <div className="bg-white border border-stone-200 p-12 text-center">
        <h2 className="text-lg font-black text-[#3835A4] mb-2">Page not found</h2>
        <Link to="/admin/cms" className="text-xs font-bold text-[#3835A4] underline cursor-pointer">Back to CMS</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/admin/cms" className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-[#3835A4] transition-colors mb-2 cursor-pointer">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to CMS
          </Link>
          <h2 className="text-2xl font-black text-[#3835A4] capitalize">Edit Page · {pageKey}</h2>
          <p className="text-xs text-stone-400">Update content and SEO details for the "{pageKey}" page</p>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-xs font-bold">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 p-6 space-y-5 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {metaTitle && (
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Meta Title</label>
              <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]" placeholder="SEO meta title" />
            </div>
          )}
          {pageHeading && (
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Page Heading</label>
              <input type="text" value={pageHeading} onChange={(e) => setPageHeading(e.target.value)}
                className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]" placeholder="Main page heading" />
            </div>
          )}
          {subHeading && (
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Sub Heading</label>
              <input type="text" value={subHeading} onChange={(e) => setSubHeading(e.target.value)}
                className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]" placeholder="Sub heading shown under the main heading" />
            </div>
          )}
          {metaDescription && (
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Meta Description</label>
              <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={2}
                className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4] resize-none" placeholder="SEO meta description" />
            </div>
          )}
          {address && (
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Address</label>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2}
                className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4] resize-none" placeholder="Office address" />
            </div>
          )}
          {phone && (
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Phone</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]" placeholder="Contact phone number(s)" />
            </div>
          )}
          {email && (
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Email</label>
              <textarea value={email} onChange={(e) => setEmail(e.target.value)} rows={2}
                className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4] resize-none" placeholder="Contact email address(es)" />
            </div>
          )}
          {(videoUrl || pageKey === 'browse-jobs' || pageKey === 'browse-talents' || pageKey === 'home') && (
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Video URL</label>
              <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]" placeholder="https://...mp4" />
            </div>
          )}
          {(bottomHeading || pageKey === 'home') && (
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Bottom Heading</label>
              <input type="text" value={bottomHeading} onChange={(e) => setBottomHeading(e.target.value)}
                className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4]" placeholder="Big bottom heading text" />
            </div>
          )}
          {(bottomDescription || pageKey === 'home') && (
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Bottom Description</label>
              <textarea value={bottomDescription} onChange={(e) => setBottomDescription(e.target.value)} rows={2}
                className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4] resize-none" placeholder="Short bottom description text" />
            </div>
          )}
        </div>

        {pageDescription && (
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">Page Description</label>
            <textarea value={pageDescription} onChange={(e) => setPageDescription(e.target.value)} rows={2}
              className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm outline-none focus:border-[#3835A4] resize-none" placeholder="Short page description shown under the heading" />
          </div>
        )}

        {(talentFaqs.length > 0 || pageKey === 'faq') && (
          <div className="border-t border-stone-200 pt-5">
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
        )}

        {(companyFaqs.length > 0 || pageKey === 'faq') && (
          <div className="border-t border-stone-200 pt-5">
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
        )}

        {body && (
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
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Link to="/admin/cms"
            className="text-stone-500 font-bold hover:text-stone-700 transition-colors text-xs uppercase tracking-widest cursor-pointer self-center">Cancel</Link>
          <button type="submit" disabled={submitting}
            className="bg-[#C6007E] text-white px-8 py-3 font-black uppercase tracking-widest hover:bg-[#a10065] transition-colors text-xs disabled:opacity-50 cursor-pointer">
            {submitting ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </form>
    </div>
  );
};

export default CmsEdit;
