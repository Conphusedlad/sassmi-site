/**
 * Business configuration — the ONE place to edit facts about the company.
 * Anything marked TODO is unconfirmed by the family and must be checked before launch.
 */
export const business = {
  brand: 'Sassmi',
  brandLegal: 'Sassmi™',
  tagline: 'Rooted in Mithila. Crafted for today.',
  motto: 'Snack Mindfully. Live Better.',
  promise: 'A taste of a calmer tomorrow.',
  domain: 'sassmiglobal.com',
  siteUrl: 'https://sassmiglobal.com',

  /**
   * The online-store switch. While `open` is false the Sassmi tins show "Coming soon" instead of prices,
   * and every add-to-cart, checkout and order button sends the visitor to WhatsApp. Crunchy Makhana is
   * on sale in stores and is not affected. Flip to true only once prices, pack size and payments are confirmed.
   */
  store: { open: false },

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
    phoneDisplay: '+91 98688 15333', // Dad's number (corrected 17 Sep 2026 — 98731 07076 is Shivansh's own)
    phoneE164: '+919868815333',
    whatsapp: '919868815333',
    email: 'crunchymakhanaa@gmail.com', // TODO: switch to hello@sassmiglobal.com once the mailbox exists
    hours: 'Mon–Sat, 10 am – 6 pm IST',
  },

  /** Consumer Protection (E-Commerce) Rules 2020 — a named grievance officer is mandatory */
  grievance: {
    name: 'Sanjay Kumar Jha', // TODO: confirm who is named
    designation: 'Proprietor & Grievance Officer',
    email: 'crunchymakhanaa@gmail.com',
    phone: '+91 98688 15333',
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
    phoneDisplay: '+91 99031 95739', // printed on Crunchy packs
    phoneE164: '+919903195739',
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

/** true once the family opens online ordering (see `business.store`). */
export const STORE_OPEN: boolean = business.store.open

/** WhatsApp link for "coming soon" moments: asks about one product, or about the launch in general. */
export const soonWhatsApp = (what?: string) =>
  whatsappLink(what ? `Hi Sassmi! I'm interested in ${what}. When can I order it?` : 'Hi Sassmi! Please let me know when the tins launch.')

export const formatINR = (rupees: number) =>
  '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(rupees)

export const queryTopics = ['Order help', 'Bulk & corporate gifting', 'Flavour Works — B2B seasonings', 'Distributor enquiry', 'Crunchy Makhana', 'Press & collaborations', 'Something else'] as const
export type QueryTopic = (typeof queryTopics)[number]
