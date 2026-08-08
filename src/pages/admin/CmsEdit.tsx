import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCmsPageByKey, updateCmsPage } from '../../api/admin.api';
import { ChevronLeft, ChevronDown } from 'lucide-react';
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
  videoSection: string;
  testimonialsSection: string;
  faqSection: string;
  body: string;
}

interface FaqItem {
  q: string;
  a: string;
}

interface VideoClip {
  id: string;
  title: string;
  talentName: string;
  category: string;
  location: string;
  videoUrl: string;
  posterUrl: string;
  views: string;
  tags: string[];
}

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  image: string;
  rating: number;
  quote: string;
  verified: boolean;
  project: string;
}

interface FaqItemQuestion {
  question: string;
  answer: string;
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
  const [videoSection, setVideoSection] = useState<VideoClip[]>([]);
  const [testimonialsSection, setTestimonialsSection] = useState<TestimonialItem[]>([]);
  const [faqSection, setFaqSection] = useState<FaqItemQuestion[]>([]);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showHtml, setShowHtml] = useState(false);
  const [openSection, setOpenSection] = useState<'video' | 'testimonials' | 'faq' | null>(null);
  const [openFaqBlock, setOpenFaqBlock] = useState<'talent' | 'company' | null>(null);

  const toggleSection = (section: 'video' | 'testimonials' | 'faq') => {
    setOpenSection(prev => (prev === section ? null : section));
  };

  const toggleFaqBlock = (block: 'talent' | 'company') => {
    setOpenFaqBlock(prev => (prev === block ? null : block));
  };

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

  const parseVideos = (raw?: string): VideoClip[] => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return [];
  };

  const parseTestimonials = (raw?: string): TestimonialItem[] => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return [];
  };

  const parseFaqSection = (raw?: string): FaqItemQuestion[] => {
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
        setVideoSection(parseVideos(d.videoSection));
        setTestimonialsSection(parseTestimonials(d.testimonialsSection));
        setFaqSection(parseFaqSection(d.faqSection));
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
        videoSection: JSON.stringify(videoSection),
        testimonialsSection: JSON.stringify(testimonialsSection),
        faqSection: JSON.stringify(faqSection),
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
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <button type="button" onClick={() => toggleFaqBlock('talent')}
              className="w-full flex items-center justify-between gap-3 p-4 bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer">
              <span className="flex items-center gap-3">
                <ChevronDown className={`h-4 w-4 text-[#3835A4] transition-transform duration-200 ${openFaqBlock === 'talent' ? '' : '-rotate-90'}`} />
                <span className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">Talent FAQs</span>
              </span>
              <span className="text-[10px] font-bold text-[#3835A4]">{talentFaqs.length} question{talentFaqs.length !== 1 ? 's' : ''}</span>
            </button>
            {openFaqBlock === 'talent' && (
              <div className="p-4">
                <div className="flex items-center justify-end mb-3">
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
          </div>
        )}

        {(companyFaqs.length > 0 || pageKey === 'faq') && (
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <button type="button" onClick={() => toggleFaqBlock('company')}
              className="w-full flex items-center justify-between gap-3 p-4 bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer">
              <span className="flex items-center gap-3">
                <ChevronDown className={`h-4 w-4 text-[#3835A4] transition-transform duration-200 ${openFaqBlock === 'company' ? '' : '-rotate-90'}`} />
                <span className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">Company FAQs</span>
              </span>
              <span className="text-[10px] font-bold text-[#3835A4]">{companyFaqs.length} question{companyFaqs.length !== 1 ? 's' : ''}</span>
            </button>
            {openFaqBlock === 'company' && (
              <div className="p-4">
                <div className="flex items-center justify-end mb-3">
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
          </div>
        )}

        {pageKey === 'home' && (
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <button type="button" onClick={() => toggleSection('video')}
              className="w-full flex items-center justify-between gap-3 p-4 bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer">
              <span className="flex items-center gap-3">
                <ChevronDown className={`h-4 w-4 text-[#3835A4] transition-transform duration-200 ${openSection === 'video' ? '' : '-rotate-90'}`} />
                <span className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">Video Section (Casting Reels)</span>
              </span>
              <span className="text-[10px] font-bold text-[#3835A4]">{videoSection.length} reel{videoSection.length !== 1 ? 's' : ''}</span>
            </button>
            {openSection === 'video' && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] text-stone-400">Videos shown in the "High-Energy Casting Reels" section on the homepage. Provide a video URL (.mp4) for each reel.</p>
                  <button type="button" onClick={() => setVideoSection([...videoSection, { id: String(Date.now()), title: '', talentName: '', category: '', location: '', videoUrl: '', posterUrl: '', views: '', tags: [] }])}
                    className="text-[10px] font-bold text-[#3835A4] hover:underline cursor-pointer whitespace-nowrap ml-3">+ Add Video</button>
                </div>
                <div className="space-y-4">
                  {videoSection.map((clip, i) => (
                    <div key={i} className="border border-stone-200 rounded-lg p-4 bg-stone-50/60">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold text-stone-400 uppercase">Reel {i + 1}</span>
                        <button type="button" onClick={() => setVideoSection(videoSection.filter((_, idx) => idx !== i))}
                          className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer">Remove</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Reel Title</label>
                          <input type="text" value={clip.title} onChange={(e) => setVideoSection(videoSection.map((c, idx) => idx === i ? { ...c, title: e.target.value } : c))}
                            className="w-full bg-white border border-stone-200 rounded px-3 py-2 text-sm outline-none focus:border-[#3835A4]" placeholder="e.g. Cyber Couture Editorial Walk" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Talent Name</label>
                          <input type="text" value={clip.talentName} onChange={(e) => setVideoSection(videoSection.map((c, idx) => idx === i ? { ...c, talentName: e.target.value } : c))}
                            className="w-full bg-white border border-stone-200 rounded px-3 py-2 text-sm outline-none focus:border-[#3835A4]" placeholder="e.g. Amira Al-Mansoori" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Category</label>
                          <input type="text" value={clip.category} onChange={(e) => setVideoSection(videoSection.map((c, idx) => idx === i ? { ...c, category: e.target.value } : c))}
                            className="w-full bg-white border border-stone-200 rounded px-3 py-2 text-sm outline-none focus:border-[#3835A4]" placeholder="e.g. High Fashion Runway" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Location</label>
                          <input type="text" value={clip.location} onChange={(e) => setVideoSection(videoSection.map((c, idx) => idx === i ? { ...c, location: e.target.value } : c))}
                            className="w-full bg-white border border-stone-200 rounded px-3 py-2 text-sm outline-none focus:border-[#3835A4]" placeholder="e.g. Dubai Design District" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Video URL <span className="text-[#C6007E]">*</span></label>
                          <input type="text" value={clip.videoUrl} onChange={(e) => setVideoSection(videoSection.map((c, idx) => idx === i ? { ...c, videoUrl: e.target.value } : c))}
                            className="w-full bg-white border border-stone-200 rounded px-3 py-2 text-sm outline-none focus:border-[#3835A4]" placeholder="https://...casting_video_12345.mp4" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Poster URL</label>
                          <input type="text" value={clip.posterUrl} onChange={(e) => setVideoSection(videoSection.map((c, idx) => idx === i ? { ...c, posterUrl: e.target.value } : c))}
                            className="w-full bg-white border border-stone-200 rounded px-3 py-2 text-sm outline-none focus:border-[#3835A4]" placeholder="https://...poster.png (optional)" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Views</label>
                          <input type="text" value={clip.views} onChange={(e) => setVideoSection(videoSection.map((c, idx) => idx === i ? { ...c, views: e.target.value } : c))}
                            className="w-full bg-white border border-stone-200 rounded px-3 py-2 text-sm outline-none focus:border-[#3835A4]" placeholder="e.g. 12.4K views" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Tags (comma separated)</label>
                          <input type="text" value={clip.tags.join(', ')} onChange={(e) => setVideoSection(videoSection.map((c, idx) => idx === i ? { ...c, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) } : c))}
                            className="w-full bg-white border border-stone-200 rounded px-3 py-2 text-sm outline-none focus:border-[#3835A4]" placeholder="Aesthetic Walk, Silver Metallic, Elite Model" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {pageKey === 'home' && (
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <button type="button" onClick={() => toggleSection('testimonials')}
              className="w-full flex items-center justify-between gap-3 p-4 bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer">
              <span className="flex items-center gap-3">
                <ChevronDown className={`h-4 w-4 text-[#3835A4] transition-transform duration-200 ${openSection === 'testimonials' ? '' : '-rotate-90'}`} />
                <span className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">Testimonials Section (Success Diaries)</span>
              </span>
              <span className="text-[10px] font-bold text-[#3835A4]">{testimonialsSection.length} testimonial{testimonialsSection.length !== 1 ? 's' : ''}</span>
            </button>
            {openSection === 'testimonials' && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] text-stone-400">Testimonials shown in the "Success Diaries & Feedback" section on the homepage.</p>
                  <button type="button" onClick={() => setTestimonialsSection([...testimonialsSection, { id: `t${Date.now()}`, name: '', role: '', image: '', rating: 5, quote: '', verified: true, project: '' }])}
                    className="text-[10px] font-bold text-[#3835A4] hover:underline cursor-pointer whitespace-nowrap ml-3">+ Add Testimonial</button>
                </div>
                <div className="space-y-4">
                  {testimonialsSection.map((t, i) => (
                    <div key={i} className="border border-stone-200 rounded-lg p-4 bg-stone-50/60">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold text-stone-400 uppercase">Testimonial {i + 1}</span>
                        <button type="button" onClick={() => setTestimonialsSection(testimonialsSection.filter((_, idx) => idx !== i))}
                          className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer">Remove</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Name</label>
                          <input type="text" value={t.name} onChange={(e) => setTestimonialsSection(testimonialsSection.map((c, idx) => idx === i ? { ...c, name: e.target.value } : c))}
                            className="w-full bg-white border border-stone-200 rounded px-3 py-2 text-sm outline-none focus:border-[#3835A4]" placeholder="e.g. Baraa Rahmy" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Role</label>
                          <input type="text" value={t.role} onChange={(e) => setTestimonialsSection(testimonialsSection.map((c, idx) => idx === i ? { ...c, role: e.target.value } : c))}
                            className="w-full bg-white border border-stone-200 rounded px-3 py-2 text-sm outline-none focus:border-[#3835A4]" placeholder="e.g. Fashion Model & Actor" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Photo URL</label>
                          <input type="text" value={t.image} onChange={(e) => setTestimonialsSection(testimonialsSection.map((c, idx) => idx === i ? { ...c, image: e.target.value } : c))}
                            className="w-full bg-white border border-stone-200 rounded px-3 py-2 text-sm outline-none focus:border-[#3835A4]" placeholder="https://...portrait.jpg" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Rating (1-5)</label>
                          <input type="number" min={1} max={5} value={t.rating} onChange={(e) => setTestimonialsSection(testimonialsSection.map((c, idx) => idx === i ? { ...c, rating: Math.max(1, Math.min(5, Number(e.target.value) || 0)) } : c))}
                            className="w-full bg-white border border-stone-200 rounded px-3 py-2 text-sm outline-none focus:border-[#3835A4]" placeholder="5" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Project Booked</label>
                          <input type="text" value={t.project} onChange={(e) => setTestimonialsSection(testimonialsSection.map((c, idx) => idx === i ? { ...c, project: e.target.value } : c))}
                            className="w-full bg-white border border-stone-200 rounded px-3 py-2 text-sm outline-none focus:border-[#3835A4]" placeholder="e.g. Emaar Properties Promo" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Quote</label>
                          <textarea value={t.quote} onChange={(e) => setTestimonialsSection(testimonialsSection.map((c, idx) => idx === i ? { ...c, quote: e.target.value } : c))} rows={3}
                            className="w-full bg-white border border-stone-200 rounded px-3 py-2 text-sm outline-none focus:border-[#3835A4] resize-y" placeholder="Verified testimonial quote..." />
                        </div>
                        <div className="md:col-span-2 flex items-center gap-2">
                          <input type="checkbox" checked={t.verified} onChange={(e) => setTestimonialsSection(testimonialsSection.map((c, idx) => idx === i ? { ...c, verified: e.target.checked } : c))}
                            className="accent-[#C6007E]" id={`tw-${i}`} />
                          <label htmlFor={`tw-${i}`} className="text-[10px] font-bold text-stone-400 uppercase cursor-pointer">Verified Cast</label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {pageKey === 'home' && (
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <button type="button" onClick={() => toggleSection('faq')}
              className="w-full flex items-center justify-between gap-3 p-4 bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer">
              <span className="flex items-center gap-3">
                <ChevronDown className={`h-4 w-4 text-[#3835A4] transition-transform duration-200 ${openSection === 'faq' ? '' : '-rotate-90'}`} />
                <span className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">FAQ Section (Got questions?)</span>
              </span>
              <span className="text-[10px] font-bold text-[#3835A4]">{faqSection.length} question{faqSection.length !== 1 ? 's' : ''}</span>
            </button>
            {openSection === 'faq' && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] text-stone-400">FAQs shown in the "Got questions? We have answers." accordion on the homepage.</p>
                  <button type="button" onClick={() => setFaqSection([...faqSection, { question: '', answer: '' }])}
                    className="text-[10px] font-bold text-[#3835A4] hover:underline cursor-pointer whitespace-nowrap ml-3">+ Add Question</button>
                </div>
                <div className="space-y-4">
                  {faqSection.map((faq, i) => (
                    <div key={i} className="border border-stone-200 rounded-lg p-4 bg-stone-50/60">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold text-stone-400 uppercase">Q{i + 1}</span>
                        <button type="button" onClick={() => setFaqSection(faqSection.filter((_, idx) => idx !== i))}
                          className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer">Remove</button>
                      </div>
                      <input type="text" value={faq.question} onChange={(e) => setFaqSection(faqSection.map((f, idx) => idx === i ? { ...f, question: e.target.value } : f))}
                        className="w-full bg-white border border-stone-200 rounded px-3 py-2 text-sm outline-none focus:border-[#3835A4] mb-2" placeholder="Question" />
                      <textarea value={faq.answer} onChange={(e) => setFaqSection(faqSection.map((f, idx) => idx === i ? { ...f, answer: e.target.value } : f))} rows={3}
                        className="w-full bg-white border border-stone-200 rounded px-3 py-2 text-sm outline-none focus:border-[#3835A4] resize-y" placeholder="Answer" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {body && (
          <div className='mb-12'>
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
