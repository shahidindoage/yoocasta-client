import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import api from '../api/axios';

interface CmsContent {
  metaTitle?: string;
  metaDescription?: string;
  pageHeading?: string;
  subHeading?: string;
  talentFaqs?: string;
  companyFaqs?: string;
}

interface Faq {
  q: string;
  a: string;
}

const talentFaqs = [
  { q: 'What is Yoocasta?', a: 'Yoocasta is Your Own Online Casting Agency which acts as a platform to connect you with various production houses or event companies or casting professionals by applying to the opportunities posted by them with its Best Feature - Next Day Payment!' },
  { q: 'Why should I register with Yoocasta?', a: 'Yoocasta offers a very interesting and attractive feature of next working day payment. With Yoocasta\'s "Premium Plus Membership" you can collect your payment up to AED 5000 (per project) on the next working day. We help you to avoid multiple follow ups and the struggle to get your hard-earned money.' },
  { q: 'How do I start working with Yoocasta.com as a talent?', a: 'It\'s very simple:\n\n1. Sign up with Yoocasta with a valid email ID which will be used for all communications henceforth.\n2. Click on the verification link sent to the registered ID.\n3. Complete your profile.\n4. Enter all the details to the best accuracy.\n5. Upload the best headshots which shows your Facial features clearly (Avoid selfies & pics with Sunglasses or hats) and you are set to apply for all the opportunities and be the Next Star in the Making!' },
  { q: 'How to have success on Yoocasta.com?', a: '1. Signing up to Yoocasta is just one step to beginning your journey towards success with us. As a self-promotion website, it is crucial to make yourself visible and appealing to the client.\n\n2. Detailed description and any special skills you have! Your description should include an overview of you as a person and your interests. Mention your special skills as this will make it easier for you to get noticed. Do you do yoga? Swimming? Acrobats? Sky Diving? Dance? Beatbox? Include them!\n\n3. Experience (if any) — let us know about your previous experiences as this will be a plus point.\n\n4. Courses (if any) — always good to mention your courses.\n\n5. Images — keep them clean! Upload pictures that show your work or characters. Avoid group pictures, avoid revealing photos.\n\n6. Apply to the Jobs! If you see a job that matches your requirement, just Apply!' },
  { q: 'How to Upload Headshots?', a: 'Tips For a good headshot:\n- Make sure Pictures are with high quality resolution\n- Make sure picture should have clear facial features (Avoid sunglasses and hats)\n\nDon\'ts:\n- Don\'t upload selfies.\n- Don\'t upload blurred, edited or photos with other people.\n- Don\'t upload photos in low resolution.\n- Don\'t upload images of other people.\n- No nudity should be in the photo.\n\nDo\'s:\n- Upload clear and recent photos on a plain background.\n- Upload photos in great lighting (natural light works best)\n- Upload photos from different angles and both full body and half shots.\n- Upload Pictures showing your personality or various characters.' },
  { q: 'Managing Photos', a: 'You can always delete and replace photos with new photos, which is essentially important if you change your style, beard, hair color or other alterations. Keep your profile up to date always as you never know someone might be viewing your profile!' },
  { q: 'How to add/manage your Videos?', a: 'Having a video on your profile is hugely beneficial. It gives the Casting Directors a chance to get to know you a little more.\n\nDon\'ts:\n- Don\'t upload a video that you are not visible in.\n- Don\'t share offensive or inappropriate content.\n- Don\'t upload bad quality video.\n\nDo\'s:\n- Do include a general casting video of yourself.\n- Do make sure you tell us about yourself and your interests.\n- Do show off your personality.\n\nAdding Your Videos:\n1. Upload the video to YouTube.com or Vimeo.com\n2. Copy the link into the provided box and click "Add Video" and give a suitable title.' },
  { q: 'How and what audios to upload?', a: 'Got an awesome voice? Want to share it with the world?\n\n1. Be sure that your audio is in either mp3 or wav format and no bigger than 1mb.\n2. From your Dashboard, select Add Video/Audios and under Audio, click "Choose File" and select the audio file you wish to upload.' },
  { q: 'Is it important to add course/experience details?', a: 'Yes, adding experience and course details adds value to your profile and increases your chance of selection for any project. Letting clients know about your experience is always good.' },
  { q: 'What is Premium Plus Membership?', a: 'We understand the struggle and pain of continuous follow ups and delays in the payment from the client. With Premium Plus membership you can collect your payment up to AED 5000 the next working day after your shoot.\n\nBenefits:\n1. Apply for unlimited roles\n2. Profile pushed to the front of the database\n3. Showcased above Premium & Basic members\n4. Upload up to 30 Photos\n5. 30 Videos\n6. 30 Voice Clips\n7. Know the number of views of your profile' },
  { q: 'What is a Premium Membership?', a: 'Our Premium Membership includes benefits same as that of Premium Plus except that the payment shall be paid when the client pays us.\n\nBenefits:\n1. Apply for unlimited roles\n2. Profile pushed to the front of the database\n3. Showcased above basic members\n4. Upload up to 30 Photos\n5. 30 Videos\n6. 30 Voice Clips\n7. Know the number of views of your profile' },
  { q: 'How many memberships can I have?', a: 'Any talent by default will have one basic membership and maximum of two paid memberships of which the last upgraded membership will be active and the second paid membership will be on hold. On hold membership will become active on expiry of the ongoing membership. Talent cannot downgrade to a lower paid/duration membership. Any upgraded membership will be effective from the next calendar day.' },
  { q: 'Can I Cancel my subscription/membership package?', a: 'Yes, you can cancel your individual plan from membership plans page. Once the subscription or the membership is cancelled it cannot be revoked.' },
  { q: 'Is there any refund on cancellation of membership/subscription?', a: 'Sorry, there is No refund of membership / payment in any case. Final decision shall be made by Yoocasta management.' },
  { q: 'Can I see which other talents have been shortlisted for the jobs I have applied for?', a: 'Yes, on "My Applications" page, for a particular role which you have applied for click on the green icon next to the status.' },
  { q: 'How to Apply to the Jobs?', a: '1. Apply through the emails you receive by clicking on the links.\n2. Apply directly on the website. Click on the job and once the job details page opens, you can apply.\n3. Click on "Apply Now" on the Job box.\n\nRemember, you cannot apply for jobs by responding to the emails, you must apply directly on the platform.' },
  { q: 'So, You Have Applied for the Role, Now What?', a: 'After applying for a job wait for a notification email from Yoocasta. If you get shortlisted or selected you shall receive an email and one of us from Yoocasta team will get in touch with you. If you DO NOT get contacted within 24 hours, please connect with us on +971582224178 or send us an email at support@yoocasta.com.' },
  { q: 'Why am I unable to apply for the jobs?', a: 'Please check your membership package. The number of jobs that you can apply to is based on your membership plan. Still if you have any problems please connect with us on 00971582224178 or send us an email at support@yoocasta.com.' },
  { q: 'How do I reset my Password?', a: 'Lost or Forgot your Password? On the Login page of Yoocasta click on Reset password. Enter your Email address and you shall receive the link on your email address to reset your password.' },
  { q: 'How do I change my password?', a: 'On the left menu on the dashboard, you have an option "Change password". Click on it and you can now change the password.' },
  { q: 'What should I do if I have Payment Problems?', a: 'Trying to upgrade but the payment is not going through? Please connect with us on +971582224178 or send us an email at support@yoocasta.com.' },
];

const companyFaqs = [
  { q: 'Why am I not able to post a job without verification?', a: 'As a company protocol it takes us a few minutes to verify the account details. Once verified you will be able to post the job.' },
  { q: 'Can I Mark Talents for my future projects?', a: 'Yes, you can use our Cast Bag features to mark talents for your future projects.\n\n1. Simply create a Cast Bag, give it a name.\n2. Select the talents for the project and add them to the Cast Bag by a single click.\n3. Alternatively select multiple talents from Talent Pool and click on add to Cast Bag.\n\nGood News! You can share this folder with any of your friends and clients.' },
  { q: 'What is a Cast Bag?', a: 'Cast Bag is a feature that acts like folders where you/company user can select some talents and store their profiles for future references. A company can have multiple Cast Bags. These Cast Bags can be shared over emails with a validity period.' },
  { q: 'Is there any fee per posting a job?', a: 'Absolutely Not! Posting a job is absolutely free.' },
  { q: 'I have confirmed/selected the talents. What Next?', a: 'Great News! Someone from Yoocasta team shall get in touch with you to proceed further with the project. Alternatively, please feel free to call us on 971582224178 or send us an email at support@yoocasta.com.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-neutral-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-neutral-800 hover:bg-neutral-50 transition-colors"
      >
        <span>{q}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-neutral-600 leading-relaxed font-medium whitespace-pre-line border-t border-neutral-100 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [tab, setTab] = useState<'talents' | 'company'>('talents');
  const [cms, setCms] = useState<CmsContent>({});

  const parseFaqs = (raw?: string): Faq[] => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return [];
  };

  useEffect(() => {
    let active = true;
    api.get('/cms/faq')
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

  const heading = cms.pageHeading || 'Frequently Asked Questions';
  const subHeading = cms.subHeading || 'Find answers to common questions about Yoocasta.';
  const effectiveTalentFaqs = parseFaqs(cms.talentFaqs);
  const effectiveCompanyFaqs = parseFaqs(cms.companyFaqs);
  const faqs = (tab === 'talents' ? (effectiveTalentFaqs.length > 0 ? effectiveTalentFaqs : talentFaqs) : (effectiveCompanyFaqs.length > 0 ? effectiveCompanyFaqs : companyFaqs));

  return (
    <div className="w-full bg-white py-16 min-h-screen relative overflow-hidden">
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#3835A4]/[0.03] filter blur-[120px] pointer-events-none" />
      <div className="absolute left-0 bottom-0 h-96 w-96 rounded-full bg-[#C6007E]/[0.02] filter blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
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

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-neutral-100/80 p-1.5 rounded-2xl border border-neutral-250/30 w-fit mx-auto mb-10">
          <button
            onClick={() => setTab('talents')}
            className={`relative px-5 py-2.5 rounded-xl text-xs font-black tracking-wider transition-all cursor-pointer ${
              tab === 'talents'
                ? 'bg-gradient-to-r from-[#3835A4] to-[#C6007E] text-white shadow-md'
                : 'text-neutral-500 hover:text-[#3835A4]'
            }`}
          >
            Talents
          </button>
          <button
            onClick={() => setTab('company')}
            className={`relative px-5 py-2.5 rounded-xl text-xs font-black tracking-wider transition-all cursor-pointer ${
              tab === 'company'
                ? 'bg-gradient-to-r from-[#3835A4] to-[#C6007E] text-white shadow-md'
                : 'text-neutral-500 hover:text-[#3835A4]'
            }`}
          >
            Company
          </button>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </div>
  );
}
