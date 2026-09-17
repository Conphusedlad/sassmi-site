/**
 * Business configuration — the ONE place to edit facts about the company.
 * Anything marked TODO is unconfirmed by the family and must be checked before launch.
 */
export const business = {
  brand: 'Sassmi',
  brandLegal: 'Sassmi™',
  tagline: 'Rooted in Mithila. Crafted for today.',
  domain: 'sassmiglobal.com',
  siteUrl: 'https://sassmiglobal.com',

  /** Brand owner (holds the trademark) */
  owner: {
    name: 'SASSMI Global Private Limited',
    formerly: 'formerly Astro-Bharat Private Limited',
    cin: 'U56290DL2023PTC422925',
    address: 'Prop. No. 55, 2nd Floor, Masoodpur Dairy, South Delhi, New Delhi 110070',
  },

  /** Operating entity — manufactures, sells and invoices (FSSAI + GST holder) */
  operator: {
    name: 'M/S JJ Mithika Foods',
    proprietor: 'Sanjay Kumar Jha',
    address: 'First Floor, WZ-114D, Kh. No. 360, Todapur, New Delhi 110012',
    fssai: '13326009000225', // TODO: a 12-Sep label draft shows 10020011007234 — confirm which licence prints on packs
    gstin: '07ACJPJ0611R2ZE',
  },

  contact: {
    phoneDisplay: '+91 99031 95739',
    phoneE164: '+919903195739',
    whatsapp: '919903195739',
    email: 'crunchymakhanaa@gmail.com', // TODO: switch to hello@sassmiglobal.com once the mailbox exists
    hours: 'Mon–Sat, 10 am – 6 pm IST',
  },

  /** Consumer Protection (E-Commerce) Rules 2020 — a named grievance officer is mandatory */
  grievance: {
    name: 'Sanjay Kumar Jha', // TODO: confirm who is named
    designation: 'Proprietor & Grievance Officer',
    email: 'crunchymakhanaa@gmail.com',
    phone: '+91 99031 95739',
  },

  social: {
    instagramSassmi: '', // TODO: create @sassmi handle
    instagramCrunchy: 'https://www.instagram.com/crunchy_makhana',
  },

  /** Marketplace links — leave url empty to show "coming soon" */
  channels: [
    { key: 'amazon', name: 'Amazon', url: '' },
    { key: 'flipkart', name: 'Flipkart', url: '' },
    { key: 'blinkit', name: 'Blinkit', url: '' },
    { key: 'zepto', name: 'Zepto', url: '' },
  ],

  shipping: {
    flatFee: 49, // ₹ — TODO confirm
    freeAbove: 499, // ₹ — TODO confirm
    etaDays: '3–7 working days',
    codAvailable: false,
  },

  crunchy: {
    name: 'Crunchy Makhana',
    tagline: 'Snack Smart, Live Better!',
    website: 'https://crunchymakhana.in',
    instagram: 'https://www.instagram.com/crunchy_makhana',
    flavours: [
      { name: 'Chilli & Garlic', hex: '#D9642A' },
      { name: 'Cream & Onion', hex: '#2C8C86' },
      { name: 'Peri Peri', hex: '#C0322B' },
      { name: 'Pudina', hex: '#3D8B3A' },
      { name: 'Himalayan Salt & Pepper', hex: '#D07A93' },
      { name: 'Fiery Jalapeño', hex: '#7E8A2E' },
    ],
    sizes: [
      { grams: 11, price: 20 },
      { grams: 15, price: 30 },
      { grams: 25, price: 60 },
      { grams: 55, price: 130 },
    ],
  },
} as const

export const whatsappLink = (text: string) =>
  `https://wa.me/${business.contact.whatsapp}?text=${encodeURIComponent(text)}`

export const formatINR = (rupees: number) =>
  '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(rupees)

export const queryTopics = ['Order help', 'Bulk & corporate gifting', 'Distributor enquiry', 'Crunchy Makhana', 'Press & collaborations', 'Something else'] as const
export type QueryTopic = (typeof queryTopics)[number]
