/** Must match `api/app/terms.py` CURRENT_TERMS_VERSION */
export const TERMS_VERSION = '2026-06-2';

export const TERMS_LAST_UPDATED = 'June 2026';

export type TermsContext = {
  /** Full name shown in the acceptance clause */
  userName: string;
  /** Email used as User ID in the acceptance clause */
  userId: string;
  /** IST date/time string; set when the modal is opened if omitted */
  dateTime: string;
};

const IST = 'Asia/Kolkata';

export function formatTermsDateTimeIst(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST,
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

function applyPlaceholders(text: string, ctx: TermsContext): string {
  return text
    .replace(/\[DYNAMIC_USER_NAME\]/g, ctx.userName)
    .replace(/\[DYNAMIC_USER_ID\]/g, ctx.userId)
    .replace(/\[DYNAMIC_DATE_TIME\]/g, ctx.dateTime);
}

const TERMS_SECTION_TEMPLATES: { title: string; body: string }[] = [
  {
    title: 'Acceptance of Terms',
    body: `These Terms and Conditions ("Terms") govern the access to and use of the Infrazmind Software-as-a-Service (SaaS) platform (the "Platform") and related digital technology services ("Services").

By registering an account, signing in, or otherwise accessing the Platform, the individual or entity creating the account (hereinafter referred to as the "Client" or "User", associated with User Name: [DYNAMIC_USER_NAME], User ID: [DYNAMIC_USER_ID], on [DYNAMIC_DATE_TIME]) explicitly agrees to be bound by these Terms. This action forms a legally binding contract between the User and Infrazmind, a sole proprietorship firm registered under the laws of India. If the User does not agree to these Terms in their entirety, the User may not create an account or use the Services.`,
  },
  {
    title: '1. Services',
    body: `Infrazmind shall provide the User access to its proprietary Platform for KYC, KYB, identity verification, onboarding, and other digital technology solutions. The specific scope, specifications, and requirements are determined by the features accessed via the User's account.`,
  },
  {
    title: '2. Fees and Prepaid Credit Model',
    body: `2.1 Prepaid Wallet: The Services are offered on a prepaid wallet/credit-based model. The User shall pay applicable fees in advance to be allotted a corresponding credit balance ("Credits").

2.2 Deductions: Each successful API request/verification shall deduct the applicable amount from the User's Credits balance. Access to Services continues only so long as the Credits balance remains positive.

2.3 Suspension: In the event the Credits balance reaches zero or falls below the minimum threshold required for a particular API request, the User's access to the Platform and Services shall be automatically suspended without further notice until the balance is topped up.

2.4 Non-Refundable: All amounts paid for Credits are non-refundable and non-transferable. Unused Credits are subject to the applicable expiry/validity period, after which they are automatically forfeited.

2.5 Taxes: All fees and Credit purchases are exclusive of GST and other applicable taxes, which shall be borne additionally by the User.`,
  },
  {
    title: '3. User Covenants',
    body: `The User shall provide true, accurate, valid, correct, complete, and up-to-date information to Infrazmind.

The User shall use the Platform strictly for legitimate, lawful internal business purposes.

The User shall not resell, redistribute, or commercialize the Platform or any output to any third party.

The User is solely responsible for obtaining all necessary consents and authorizations from end-users/Customers whose data is processed.

The User shall comply with all applicable laws.`,
  },
  {
    title: '4. Acceptable Use Policy and Prohibited Uses (CRITICAL)',
    body: `4.1 Permitted Use
The User shall use the Platform strictly for lawful business purposes, including verification of identity, KYC/KYB compliance, onboarding of legitimate customers, fraud prevention, and regulatory compliance.

4.2 Prohibited Uses
The User expressly agrees, represents, warrants, and undertakes that they shall NOT, directly or indirectly, use the Platform, Services, or any data obtained therefrom for:

• Stalking, harassing, intimidating, threatening, or causing harm of any nature to any individual.
• Blackmail, extortion, coercion, or any form of unlawful pressure.
• Identity theft, impersonation, or fraudulent misrepresentation.
• Unauthorized surveillance, monitoring, or tracking without lawful consent.
• Defamation, character assassination, doxing, or unauthorized public disclosure of personal information.
• Discrimination on the basis of caste, religion, gender, race, ethnicity, disability, sexual orientation, or any other protected category.
• Selling, sharing, trading, leasing, or commercializing Customer Data with any third party.
• Building any database, profile, repository, or product for purposes other than immediate internal verification needs.
• Unlawful debt collection practices or harassment of borrowers violating RBI guidelines.
• Money laundering, terror financing, hawala, or any activities prohibited under the Prevention of Money Laundering Act, 2002 (PMLA).
• Any activity violating the Information Technology Act, 2000, the Digital Personal Data Protection Act, 2023, the Aadhaar Act, 2016, or the Indian Penal Code.
• Reselling access, redistributing API outputs, white-labelling, or providing access to third parties.
• Any other purpose that is unlawful, fraudulent, malicious, defamatory, or harmful.

4.3 Absolute Responsibility and No Knowledge Defense
The User is solely, fully, and absolutely responsible for any misuse of the Platform by themselves, their employees, agents, or third parties accessing the account. The User expressly waives any defense based on lack of knowledge, lack of intent, or rogue employees. Breach of this policy results in immediate termination without refund, unlimited liability, and potential report to law enforcement.`,
  },
  {
    title: '5. Confidentiality',
    body: `The User agrees to hold all proprietary and Confidential Information of Infrazmind in strict confidence for a period of five (5) years. Customer Data processed through the Platform remains the User's Confidential Information. Infrazmind shall use Customer Data solely for providing Services and shall not share it with third parties.`,
  },
  {
    title: '6. Intellectual Property',
    body: `Infrazmind holds all rights, titles, and interests in the Platform, Services, software, APIs, and algorithms. The User is granted a limited, revocable, non-transferable, non-sublicensable license to access the Platform solely for internal business purposes. The User shall not reverse engineer, decompile, modify, or create derivative works of the Platform.`,
  },
  {
    title: '7. Warranties and Disclaimers',
    body: `THE PLATFORM AND SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. INFRAZMIND SPECIFICALLY DISCLAIMS ALL WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. Infrazmind is not responsible for errors in third-party data sources (e.g., UIDAI, NSDL, GSTN) or outages caused by external providers.`,
  },
  {
    title: '8. Indemnification and Limitation of Liability',
    body: `8.1 User Indemnification
The User shall defend, indemnify, and hold harmless Infrazmind from any claims, damages, fines, or penalties arising from: (i) the User's breach of these Terms; (ii) any violation of the Acceptable Use Policy; (iii) any violation of applicable laws (DPDP Act, Aadhaar Act, IT Act, RBI guidelines); (iv) any harm caused to individuals due to misuse; and (v) unauthorized commercialization of the Services.

8.2 Liability Cap
INFRAZMIND'S AGGREGATE LIABILITY SHALL NOT EXCEED THE ACTUAL AMOUNT PAID BY THE USER IN THE ONE (1) MONTH PERIOD PRECEDING THE CLAIM. This liability cap shall NOT apply to breaches by the User of the Acceptable Use Policy, Confidentiality, Intellectual Property rights, or Indemnification obligations.`,
  },
  {
    title: '9. Termination',
    body: `Infrazmind reserves the right to immediately suspend or terminate the User's access without notice and without refund if the User breaches the Acceptable Use Policy, engages in unauthorized use, fails to maintain a positive Credits balance for 15 days, or faces regulatory proceedings. Upon termination, all access is revoked, and surviving clauses (IP, Indemnification, Confidentiality) remain in effect.`,
  },
  {
    title: '10. Governing Law and Jurisdiction',
    body: `These Terms shall be governed by the laws of India. Any disputes shall be settled by arbitration in Kanpur, Uttar Pradesh, India. The courts at Kanpur shall have exclusive jurisdiction.`,
  },
];

export function buildTermsSections(ctx: TermsContext): { title: string; body: string }[] {
  return TERMS_SECTION_TEMPLATES.map((section) => ({
    title: section.title,
    body: applyPlaceholders(section.body, ctx),
  }));
}
