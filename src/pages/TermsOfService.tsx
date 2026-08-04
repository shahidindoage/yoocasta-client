import { useState, useEffect } from 'react';
import api from '../api/axios';

interface CmsContent {
  metaTitle?: string;
  metaDescription?: string;
  pageHeading?: string;
  subHeading?: string;
  body?: string;
}

const DEFAULT_HEADING = 'Terms of Service';
const DEFAULT_SUB_HEADING = 'Please read these terms carefully before using our platform.';

export default function TermsOfService() {
  const [cms, setCms] = useState<CmsContent>({});
  const sections = [
    {
      title: 'EFFECTIVE AS OF 10th Jan 2019',
      content: null,
    },
    {
      title: 'OVERVIEW',
      content: `These Terms of Use (Terms) govern the use of our website located at www.yoocasta.com (website) and any subdomain of this URL in platform and the services available thereon and constitute a legally binding agreement between Yoocasta FZE LLC (the "Company") and the user.\n\nBy accessing our website or using any of the services or applications provided on our Website "Services", user agrees to be bound by these Terms of Use. If user does not agree with these Terms, use and access to our Website and services must be stopped immediately.`,
    },
    {
      title: 'ACCEPTANCE OF TERMS OF USE',
      content: `By using www.yoocasta.com user acknowledge and understand that www.yoocasta.com is an online talent casting platform that connects the emerging talent with the industry professionals. Industry Professionals i.e. Companies or freelancers share their talent requirements either posting directly on Yoocasta or through the administrator of the platform and in response to that requirement Yoocasta provide them with the best matching talent out of its talent pool. The Talent categories include actors, singers, dancers, models, models, photographers, Directors, makeup professionals, promoters and other. The user further acknowledges that before using, visiting, registering and/or otherwise accessing www.yoocasta.com he/she have read the Terms of Use and hereby affirm that:\n\nUser is fully able and competent to enter the terms, conditions, obligations, affirmations, representations, and warranties set forth in these Terms of Use, and to abide by and comply with these Terms of Use,\nUser is not a person barred from receiving services under the laws of UAE.\nIn case of use of the Platform or creating an Account on behalf of a business, you have the authority to bind that business.`,
    },
    {
      title: 'SCOPE',
      content: `This document contains provisions that define the limits, legal rights and obligations of www.yoocasta.com and the user with respect to use of our website and services including the content that has been uploaded, communications, functions and internet links.`,
    },
    {
      title: 'TYPES OF USERS',
      content: [
        `This apply to all the visitors browsing www.yoocasta.com or using our services by becoming a member, either individuals for their own use and those using it on behalf of an entity.`,
        `1. Emerging talent, looking for the casting roles/jobs, and`,
        `2. Industry professionals i.e. organizations, agencies, institutions, or freelancers looking for the talent for different roles and jobs.`,
        `Note: Yoocata will not trade with or provide any services to OFAC and countries sanctioned by UAE Government.`,
      ],
    },
    {
      title: 'JOB POSTING CRITERIA',
      content: [
        `All the Industry professionals i.e. organizations, agencies, institutions, or freelancers looking for the talent for different roles and jobs while posting jobs on Yoocasta undertake that the:`,
        `1. Posted is valid and not breach any applicable law and government regulations.`,
        `2. Will abide by the editorial guidelines of Yoocasta while listing/posting jobs.`,
        `3. The job posting must specify that the job/role offered is Paid or Unpaid work. In case the work is paid the rate of payment should also be clearly specified.`,
      ],
    },
    {
      title: 'USER ACCOUNT',
      content: `In order to use our Services, user must at first create an account ("profile") and provide us with accurate, complete and updated information to complete their profile. The treatment of the data/information shared will be subject to the terms of Privacy Policy of www.yoocasta.com wherever applicable.`,
    },
    {
      title: 'MEMBERSHIP PLANS & KEY FEATURES',
      content: [
        `www.yoocasta.com operates a paid basic & Premium, which falls under recurring billing with the following key features:`,
        null,
        `BASIC MEMBERSHIP`,
        `Basic membership is a free of charge service which allows the member to upload up to 5 photos, 1 video, 1 audio and 2 jobs apply (per month). It enables the member to receive the casting updates, payment in case of getting and performing a job through the platform as soon as the payment is released from the industry professional who casted the talent for the role/job and www.yoocasta.com receive the payment, job notifications, profile views and position/appearance in the database after the premium and premiumplus members.`,
        null,
        `PREMIUM MEMBERSHIP`,
        `Premium membership is a paid service provided against the charges given on www.yoocasta.com and updated from time to time for a specific time period. Premium membership allows the member to upload up to 30 photos, 30 videos, 30 audios, and apply for unlimited jobs during the premium membership period. It enables the member to receive casting updates, payment in case of getting and performing a job through the platform (as soon as the payment is released from the industry professional who casted the talent for the role/job and www.yoocasta.com receives the payment), job notifications, profile views, and position/appearance in the database before basic members (middle).`,
        `Premium membership is set to auto-renew on the day of package expiry, ensuring uninterrupted access to premium features unless canceled by the member before the renewal date.`,
        null,
        `UPGRADING MEMBERSHIP`,
        `A talent, at any point of time can have maximum of 1 Paid active membership/packages offered by www.yoocasta.com.`,
        `Any user holding the basic membership shall be eligible for upgrading the membership anytime.`,
        `In case a talent purchases 2nd Paid Membership on top of the 1st Paid membership, the 1st membership shall go on Hold until the expiry of the 2nd (latest) membership and shall be reactivated automatically on the expiry of 2nd membership.`,
        `The 2nd (latest) membership purchased will be the active and counted first. On expiry of the latest, the subsequent package (if any) will become active. The last active / expired membership shall be auto renewed automatically.`,
        `However, payment to any user for any role/job done shall be made as per the terms of membership plan the user possessed at the time of that job not as per the terms of payment of upgraded membership.`,
      ],
    },
    {
      title: 'USER UPLOADED CONTENT',
      content: `User understands and agrees that all their information/data of any kind and in form ("Content") that the user is uploading on our platform they are authorised to share with us i.e. they have proprietary rights over it or they have license to use without any restriction.\n\nUser undertakes that the content does not contain any harmful or destructive content, the Content is not pornographic, does not contain threats or incite violence, and does not violate the privacy or publicity rights of any third party or any of the laws of UAE. User further agrees and understand that www.yoocasta.com reserves the right to take down immediately all the content from the platform found in breach of these terms and any of UAE Laws.`,
    },
    {
      title: "USER'S LICENCE TO US",
      content: `The user agrees and understands that www.yoocasta.com shall have the non-exclusive, irrevocable, royalty-free rights and license to use, host, reproduce, modify, communicate, publish, publicly display on www.yoocasta.com or related social media accounts, publicly perform and distribute the User Content for the limited purposes only.`,
    },
    {
      title: 'SUBSCRIPTION FEE & TERMS OF PAYMENT',
      content: [
        `www.yoocasta.com contains content including but not limited to text, graphics, photographs, images, news reports, articles, editorial and other writings, audio and video recordings, data, listings, and directory information (collectively, "Content") that is accessible by Users. However, it also offers premium services, which can be accessed only through purchase or paid subscription i.e. for 3 months, 6 months and 12 months subscription.`,
        `Reserves the right to increase the membership fee at any time as per its sole discretion.`,
        `The duration of subscription period needs be selected by the user while subscribing.`,
        `The payment for the subscription shall be charged in advance.`,
        `The means of payment for the subscription shall be _______________, and payment shall be charged as per the duration/plan selected.`,
        `The subscription shall be automatically renewed unless you opt out or cancel by following the instructions in these Terms of Use.`,
        `www.yoocasta.com may, in its sole discretion, suspend access to your account or deactivate your account without notice to you if the Company is unable to process your payment.`,
        `You may update any of your billing information (including a change to your desired billing payment method).`,
        `All fees paid in connection with your account are non-refundable and non-transferable.`,
        `"United Arab of Emirates is our country of domicile" and stipulate that the governing law is the local law.`,
        `Visa and Master Card and all currencies will be accepted for payment converted in AED.`,
        `We will not trade with or provide any services to OFAC and sanctioned countries.`,
        `Customer using the website who are Minor /under the age of 18 shall not register as a User of the website and shall not transact on or use the website.`,
        `Cardholder must retain a copy of transaction records and Merchant policies and rules.`,
        `User is responsible for maintaining the confidentiality of his account.`,
      ],
    },
    {
      title: 'MODIFICATION OF TERMS OF USE',
      content: `We reserve the right to change these Terms of Use at any time as per our sole discretion. If www.yoocasta.com makes a material change to these Terms of Use, an update will be posted in this regard on the website for a reasonable period and will indicate the effective date of the changes.\n\nIt is your responsibility to review these Terms of Use for any changes, having notified the changes, your constant use of website and services will constitute your acceptance of the changed terms. This Agreement applies to all persons and entities who visit any of Websites and/or use or access any of the services.`,
    },
    {
      title: 'PROPRIETARY RIGHTS ON INTELLECTUAL PROPERTY',
      content: `www.yoocasta.com owns, operates, licenses, controls, and provides access to the Website.\n\nwww.yoocasta.com has all the proprietary rights over all the associated materials, applications, software, and other contents of the Website available under the relevant laws unless otherwise notified. All trademarks, logos, service marks, trade names displayed on www.yoocasta.com are proprietary to Yoocasta FZE LLC unless otherwise noted and are protected by applicable intellectual property and other laws.\n\nThe use any of the proprietary work in any manner, except pursuant to the express limited grant of rights hereunder, is strictly prohibited. Subject to compliance of these Terms of Use, www.yoocasta.com grants user the non-exclusive and revocable license to create profile, upload or submit information, software, text, images, audio, video, and other materials, make changes or delete it, except to delete or change any Intellectual Property proprietary notices contained therein.`,
    },
    {
      title: 'THIRD PARTY CONTENT AND LINKED SITES',
      content: `www.yoocasta.com may contain links to other websites ("Third Party Services") or use third party service providers for provision of certain services to you in connection with your membership and may disclose personally identifiable information to the third party in case of providing the services you requested.`,
    },
    {
      title: 'DISRUPTION IN SITE ACCESS',
      content: `We are committed to provide continued and quality services, However, there might be circumstances when access to our website may be interrupted, restricted or delayed, which we will endeavour to resolve as soon as possible. In no case we will be liable for damages or costs for such interruption, restriction and delays.`,
    },
    {
      title: 'CUSTOMIZED EMAILS',
      content: `As a result of registration and membership with www.yoocasta.com you will receive casting calls, update emails matching your profile, our email newsletters, account updates and information about www.yoocasta.com features.`,
    },
    {
      title: 'DISCLAIMER',
      content: `www.yoocasta.com disclaims all warranties of any kind either expressed or implied, including any warranties of merchantability, non-infringement and fitness for a particular purpose i.e. validity and accuracy of the user content and any loss or damage resulted from acting upon that content/data.`,
    },
    {
      title: 'RESTRICTION OF LIABILITY',
      content: [
        `www.yoocasta.com will not be liable for any damages or injury caused by any use of our Website or services i.e. resulting from User Uploaded Information, use of, inability to use, or performance of the Website or any of the contents or features thereon, any action taken in connection with an investigation by www.yoocasta.com or law enforcement authorities regarding your use of the Website or the contents thereof, any action taken by or in connection with copyright owners.`,
        `www.yoocasta.com will not be liable for any discrepancy in description of any casting role/job posted on its website, neither www.yoocasta.com will be responsible for the for any act or omission on behalf of the referred talent to the industry professionals in the execution of the job/performance.`,
        `In case any employer and employee relationship take place between the users of the website, it is for the parties to do the mutual due diligence and adhere the all the relevant laws and www.yoocasta.com will not share any responsibility for any loss or injury resulting to anyone out of such engagement.`,
        `www.yoocasta.com will not be responsible for any loss caused to the third party as a result of any act or omission of the talent and industry professionals in the execution/performance of the role/job posted on the platform.`,
        `www.yoocasta.com is not responsible for the quality of work carried out by the referred talent to the industry professionals as the selection of the talent for a particular role/job is the responsibility of the industry professionals.`,
        `www.yoocasta.com does not in any case guarantee the job or visa status to any user or business.`,
        `In case of any advertisement on www.yoocasta.com from any third party, www.yoocasta.com shall not be responsible for any discrepancy or any loss or damage caused to anyone as result of it.`,
      ],
    },
    {
      title: 'INDEMNITY',
      content: `To the fullest extent permitted by law, you agree to defend, indemnify and hold www.yoocasta.com its affiliates, subsidiaries, and office bearers harmless from any potential claims and expenses, including reasonable legal fees, related to any breach of this Agreement resulting from your use of the www.yoocasta.com or any Content.`,
    },
    {
      title: 'CANCELLATION POLICY',
      content: `www.yoocasta.com reserves the right to cancel the subscription/membership of the user at any point of time without giving prior notice if found in breach of any of these terms.`,
    },
    {
      title: 'ASSIGNMENT',
      content: `The user/subscriber shall not be able to transfer, sub-contract or otherwise deal with subscriptions of www.yoocasta.com.`,
    },
    {
      title: 'EXCLUSION OF THIRD-PARTY RIGHTS',
      content: `These terms of use are for the benefit and understanding of www.yoocasta.com and its and are not intended for or to be enforceable by any third party.`,
    },
    {
      title: 'MODIFICATIONS',
      content: `There shall be no amendment or modification of these Terms of Service unless the same is in writing and signed by www.yoocasta.com and the user or its authorized person.`,
    },
    {
      title: 'TERMINATION',
      content: `User may terminate its account by submitting a termination request to www.yoocasta.com. www.yoocasta.com reserves the right to restrict, suspend, deny or terminate access to all or part of any of the Website and to deny access to any person in its sole discretion without notice or liability of any kind. Any violation of these Terms of Use may be referred to law enforcement authorities. Termination may result in the loss of information related to your account. Proprietary, warranty, disclaimers, indemnity and liability related provisions shall survive the termination.`,
    },
    {
      title: 'TERMS OF USE GOVERNS',
      content: `In case of any conflict between www.yoocasta.com and user over the terms of use and any other document mutually signed, these Terms of Use will govern the resolution of dispute between the Parties.`,
    },
    {
      title: 'INTERPRETATION OF TERMS',
      content: `The Terms of Use and the interpretation thereof shall be governed by and construed in accordance with the laws of UAE and your continued use of the same constitutes your irrevocable submission to the exclusive jurisdiction of the Courts of UAE. If any part of these Terms of Use is declared unlawful, void, or unenforceable by any Court of UAE, that part will be deemed severable and will not affect the validity and enforceability of any remaining provisions.`,
    },
    {
      title: 'JURISDICTION',
      content: `Yoocasta FZE LLC maintains the website www.yoocasta.com ("Site") and makes no representation that the contents of the Website are appropriate or available for use outside UAE and governed under the Laws of UAE.`,
    },
    {
      title: 'ENTIRE AGREEMENT',
      content: `These terms of use contain the entire agreement between the parties relating to their engagement.`,
    },
    {
      title: 'PAYMENT CONFIRMATION',
      content: [
        `Once the payment is made, the confirmation notice will be sent to the client via email within 24 hours of receipt of payment.`,
        `Customer can cancel their membership plan within 24 hours; refunds will be made back to the payment solution used initially by the customer. Please allow for up to 45 days for the refund transfer to be completed.`,
      ],
    },
    {
      title: 'REFUND POLICY',
      content: [
        `Refunds will be done only through the Original Mode of Payment and will be processed within 10 to 45 days depends on the issuing bank of the credit card.`,
        `Subscription once cancelled will be effective immediately.`,
      ],
    },
  ];

  const buildDefaultBody = () =>
    sections.map((s) => {
      if (s.content === null) return `<h3>${s.title}</h3>`;
      if (Array.isArray(s.content)) {
        return `<h3>${s.title}</h3><ul>${s.content
          .filter((item): item is string => item !== null)
          .map((item) => `<li>${item}</li>`)
          .join('')}</ul>`;
      }
      return `<h3>${s.title}</h3><p>${s.content}</p>`;
    }).join('');

  useEffect(() => {
    let active = true;
    api.get('/cms/terms-of-service')
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
  const body = cms.body || buildDefaultBody();

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

        <div className="cms-body" dangerouslySetInnerHTML={{ __html: body }} />
      </div>
    </div>
  );
}
