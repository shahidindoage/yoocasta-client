export default function PrivacyPolicy() {
  const sections = [
    {
      title: null,
      content: `Your privacy is important to us. At https://www.yoocasta.com/ the services are provided by Yoocasta FZE LLC. We are committed to protect and handle your privacy and information in the most transparent manner. This statement lays out how we collect, manage, store and protect your personal data. Please read carefully this statement to get a clearer understanding about our privacy policy. By providing us with any personal information, you are consenting to the use of your personal information as contemplated in this privacy notice. If you do not agree to any part of this Policy, Please stop accessing the website and do not submit any of your personal information here.`,
    },
    {
      title: 'WHAT INFORMATION DO WE COLLECT',
      content: [
        `Your Internet Protocol (IP) address, operating system, browser type, last used domain and the domain accessed after exiting our website, the date and time of access of our website, items clicked on, viewed pages and the amount of time spent on a particular page of our website are the instances of "Non-Personally Identifiable Information" we may collect on account of your usage of our website.`,
        `We also collect certain information (automatically) through the use of "cookies" and similar tracking technologies. Cookies are small data files that are stored on a user's computer or device at the request of a website to enable the website to recognize previous visitors and retain information such as user preferences and history. If you wish to block, erase, or be warned of cookies, please refer to your browser instructions or "help screen" to learn about these functions. However, if your browser is set to not accept cookies or if you reject a cookie, you will not be able to sign in to your user account or use certain parts of the Services.`,
        `We collect your Personal Data i.e. full name, email address, phone number, current address, photos and other media that you voluntarily provide us, when you register for Yoocasta or create a talent profile.`,
        `We also collect Personal Data when you sign up for email newsletters or alerts on Yoocasta. Personal Data may contain your name, email, contact information, your location, as well as other information you provide us.`,
        `We also collect billing information when processing payment for the purchase of our services and membership.`,
        `We collect and store data about you when you use and/or communicate with the website administration.`,
        `We may also obtain information about you through third party sources as permitted by applicable law, such as public databases, social media platforms, and marketing partners.`,
      ],
    },
    {
      title: 'USE OF INFORMATION',
      content: [
        `We use your information:`,
        `To create an account for you to use our platform and services.`,
        `To respond to your requests or to manage your user account.`,
        `To fulfil your requests, respond to your inquiries.`,
        `To match your data for the potential roles and jobs with the third parties advertising such roles and jobs.`,
        `To make your talent profile visible publicly and discoverable across the worldwide web.`,
        `To use the contents of your profile on the social media platforms of Yoocasta for the marketing and promotional purposes.`,
        `To use it for analytics, reporting and marketing purpose.`,
        `To monitor the safety and security of our services and platform.`,
        `To use data and content about users for communications promoting membership, job posting, and engagement with us.`,
        `To assess the performance of advertisements displayed to our users directly by us or through third party advertising partners.`,
      ],
    },
    {
      title: 'YOUR RIGHTS IN RELATION TO YOUR INFORMATION',
      content: [
        `You have various rights in relation to your personal information as mentioned below:`,
        `To access your data.`,
        `To modify the data, you have provided to us at any time through your Yoocasta profile.`,
        `To have your data rectified promptly if it is inaccurate or incomplete.`,
        `To have your data erased in specific circumstances.`,
      ],
    },
    {
      title: 'DATA RETENTION',
      content: `We retain information for the maximum period allowable by law, where there is a reasonable business need or legitimate interest to retain such data and may store it on our server.`,
    },
    {
      title: 'CHILDREN',
      content: `Our Services are not intended for use by children under the age of 18, and such use is prohibited by our Terms of Service. We do not knowingly collect Personal Information from children under 18. If you become aware that a child has provided us with Personal Information, please contact us as set forth in this Policy.\n\nIn case a user account has been created by the Guardian of a children under the age of 18, the person doing so must be the Parent or Legal Guardian of the children and, must affirm and consent to share the information of the children.`,
    },
    {
      title: 'THIRD-PARTY DISCLOSURE',
      content: `We do not sell, trade, or make your personal data commercially available to any third party.\n\nWe may share information with our service providers for the completion of the assignment you have entrusted to us or unless such disclosure is required by law of the United Arab Emirates only.`,
    },
    {
      title: 'ONLINE ADVERTISEMENT OF THIRD PARTY',
      content: `We may also use third parties to display and target ads which might possess certain functionality (such as maps), or to place their own cookies and other tracking technologies to collect, track and analyse usage and statistical information from users. We are not responsible for the information collection practices of any third parties.`,
    },
    {
      title: 'LINKS TO OTHER SITES',
      content: `Our website, newsletters, email updates and other communications may, from time to time, contain links to and from the websites of others. The personal data that you provide through such websites is not subject to this privacy notice and the treatment of your personal data by such websites is not the responsibility of www.yoocasta.com.\n\nIf you follow a link to any other websites, please note that these websites have their own privacy notices which will set out how your information is collected and processed when visiting those sites.`,
    },
    {
      title: 'HOW WE PROTECT YOUR DATA',
      content: `We have implemented reasonable administrative, technical and physical measures to protect your personal information against loss, misuse and alteration.`,
    },
    {
      title: 'SECURITY MEASURES',
      content: [
        `We endeavour to secure your Personal Information from our end, however, no security measures are perfect or impenetrable. To protect the confidentiality of your Personal Information is your responsibility. In case of any unauthorised use of your password, Yoocasta is not responsible and you must advise us immediately by emailing us if you believe your password has been misused.`,
        `https://yoocasta.com/ will not pass any debit/credit card details to third parties.`,
        `The https://yoocasta.com/ is not responsible for the privacy policies of websites to which it links. If you provide any information to such third parties different rules regarding the collection and use of your personal information may apply. You should contact these entities directly if you have any questions about their use of the information that they collect.`,
      ],
    },
    {
      title: 'TRANSFERS OF INFORMATION',
      content: `Information about our customers, including Personal Information, may be disclosed as part of any merger, acquisition, debt financing, sale of company assets, as well as in the event of an insolvency, bankruptcy or receivership in which Personal Information could be transferred to third parties as one of Yoocasta business assets. In such an event, we will attempt to notify you before your Personal Information is transferred, but you may not have the right to opt out of any such transfer.`,
    },
    {
      title: 'CHANGES TO THIS PRIVACY POLICY',
      content: `This policy was last updated on 10/01/2019. We might change and update this policy from time to time by updating this page. We encourage you to check this page periodically to ensure that you are happy with any changes.`,
    },
    {
      title: 'POLICY QUESTIONS AND ENFORCEMENT',
      content: `We are committed to protecting the privacy of your personal information. If you have questions or comments about our administration of your personal data or deactivate profile, please contact us at support@yoocasta.com.`,
    },
  ];

  return (
    <div className="w-full bg-white py-16 min-h-screen relative overflow-hidden">
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#3835A4]/[0.03] filter blur-[120px] pointer-events-none" />
      <div className="absolute left-0 bottom-0 h-96 w-96 rounded-full bg-[#C6007E]/[0.02] filter blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-none mb-4">
            Privacy Policy
          </h2>
          <p className="text-sm text-neutral-400 font-medium max-w-xl mx-auto">
            Last updated on 10/01/2019
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section, idx) => (
            <div key={idx}>
              {section.title && (
                <h3 className="text-sm font-black text-[#3835A4] tracking-wider mb-2">
                  {section.title}
                </h3>
              )}
              {Array.isArray(section.content) ? (
                <ul className="space-y-2">
                  {section.content.map((item, i) => (
                    <li key={i} className="text-sm text-neutral-600 leading-relaxed font-medium">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-neutral-600 leading-relaxed font-medium whitespace-pre-line">
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
