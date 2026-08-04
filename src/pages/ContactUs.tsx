import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import api from '../api/axios';

interface CmsContent {
  metaTitle?: string;
  metaDescription?: string;
  pageHeading?: string;
  subHeading?: string;
  pageDescription?: string;
  address?: string;
  phone?: string;
  email?: string;
}

const DEFAULT_HEADING = 'Contact Us';
const DEFAULT_SUB_HEADING = "Get in touch with us. We'd love to hear from you.";
const DEFAULT_ADDRESS = 'Yoocasta FZE LLC\nSharjah Publishing City, UAE';
const DEFAULT_PHONE = '+971582224178 | 048848938';
const DEFAULT_EMAIL = 'casting@yoocasta.com\nmanagement@yoocasta.com';

export default function ContactUs() {
  const [cms, setCms] = useState<CmsContent>({});
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    api.get('/cms/contact-us')
      .then((res) => {
        if (!active || !res.data?.success || !res.data?.data) return;
        const d = res.data.data;
        setCms(d);
        if (d.metaTitle) document.title = d.metaTitle;
        if (d.metaDescription) {
          let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
          if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'description';
            document.head.appendChild(meta);
          }
          meta.content = d.metaDescription;
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const heading = cms.pageHeading || DEFAULT_HEADING;
  const subHeading = cms.subHeading || DEFAULT_SUB_HEADING;
  const address = cms.address || DEFAULT_ADDRESS;
  const phone = cms.phone || DEFAULT_PHONE;
  const email = cms.email || DEFAULT_EMAIL;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/contact', form);
      setSubmitted(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white py-16 min-h-screen relative overflow-hidden">
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#3835A4]/[0.03] filter blur-[120px] pointer-events-none" />
      <div className="absolute left-0 bottom-0 h-96 w-96 rounded-full bg-[#C6007E]/[0.02] filter blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-none mb-4">
            {heading}
          </h2>
          {subHeading && (
            <p className="text-sm text-neutral-400 font-medium max-w-xl mx-auto">
              {subHeading}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Form */}
          <div>
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-sm font-black text-green-800">Message Sent!</h3>
                <p className="text-xs text-green-600 font-medium mt-1">We will get back to you soon.</p>
                <button onClick={() => setSubmitted(false)} className="mt-4 text-xs font-bold text-[#3835A4] hover:underline">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black tracking-widest text-neutral-400 uppercase mb-1.5">Name</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-900 outline-none focus:border-[#3835A4] transition-colors bg-neutral-50" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-[10px] font-black tracking-widest text-neutral-400 uppercase mb-1.5">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-900 outline-none focus:border-[#3835A4] transition-colors bg-neutral-50" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-[10px] font-black tracking-widest text-neutral-400 uppercase mb-1.5">Subject</label>
                  <input type="text" name="subject" value={form.subject} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-900 outline-none focus:border-[#3835A4] transition-colors bg-neutral-50" placeholder="Subject" />
                </div>
                <div>
                  <label className="block text-[10px] font-black tracking-widest text-neutral-400 uppercase mb-1.5">Message</label>
                  <textarea name="message" value={form.message} onChange={handleChange} required rows={5} className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-900 outline-none focus:border-[#3835A4] transition-colors bg-neutral-50 resize-none" placeholder="Your message..." />
                </div>
                {error && <p className="text-xs text-[#C6007E] font-medium">{error}</p>}
                <button type="submit" disabled={loading} className="w-full py-3.5 rounded-2xl text-xs font-black tracking-widest uppercase bg-gradient-to-r from-[#3835A4] to-[#C6007E] text-white hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                      Sending...
                    </>
                  ) : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#3835A4]/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#3835A4]" />
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-widest text-neutral-400 uppercase mb-0.5">Address</p>
                  <p className="text-sm font-medium text-neutral-700 whitespace-pre-line">{address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#3835A4]/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-[#3835A4]" />
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-widest text-neutral-400 uppercase mb-0.5">Phone</p>
                  <p className="text-sm font-medium text-neutral-700 whitespace-pre-line">{phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#3835A4]/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#3835A4]" />
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-widest text-neutral-400 uppercase mb-0.5">Email</p>
                  <p className="text-sm font-medium text-neutral-700 whitespace-pre-line">{email}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#3835A4] to-[#C6007E] rounded-2xl p-6 text-white">
              <h3 className="text-sm font-black mb-1">Yoocasta FZE LLC</h3>
              <p className="text-xs text-white/70 font-medium">We're here to help you with any questions about our platform, memberships, or casting services.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
