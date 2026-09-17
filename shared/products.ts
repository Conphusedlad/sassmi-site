/**
 * The Sassmi catalogue — single source of truth for BOTH the website and the payment server.
 * Prices are in rupees (integers). ⚠️ PRICES AND PACK SIZE ARE PLACEHOLDERS until the family confirms.
 */
export type Product = {
  slug: string
  name: string
  kind: 'tin' | 'bundle'
  tagline: string
  description: string
  pairing: string
  ingredientHint: string
  netWeight: string
  price: number
  compareAt?: number
  hex: string // tin body colour
  accent: string // lighter accent for gradients/chips
  image: string // public path
  spice: 0 | 1 | 2 | 3
  profile: 'savoury' | 'sweet' | 'spicy'
  badges: string[]
  featured?: boolean
}

export const PACK_SIZE = '100 g' // TODO confirm — render shows 65 g, 12-Sep label draft shows 100 g (4 × 25 g)
export const TIN_PRICE = 249 // TODO confirm — placeholder MRP per tin, incl. of all taxes

const BADGES = ['Roasted in Olive Oil', 'Gluten Free', 'No Added Preservatives', 'Rich in Protein']

export const products: Product[] = [
  {
    slug: 'pudina', name: 'Pudina', kind: 'tin', profile: 'savoury', spice: 1,
    tagline: 'Freshness in every bite',
    description: 'Cool garden mint over warm, freshly roasted makhana. Bright, clean and a little peppery — the flavour that tastes like a Delhi evening breeze.',
    pairing: 'With adrak chai at four, or crushed over dahi.',
    ingredientHint: 'With real mint and rock salt',
    netWeight: PACK_SIZE, price: TIN_PRICE, hex: '#1F4D36', accent: '#3E7A5A', image: '/img/tins/pudina.webp', badges: BADGES, featured: true,
  },
  {
    slug: 'cream-onion', name: 'Cream & Onion', kind: 'tin', profile: 'savoury', spice: 0,
    tagline: 'Rich. Savoury. Irresistible.',
    description: 'Slow-cooked onion sweetness folded into a soft, creamy seasoning. Familiar comfort, made lighter by the pop.',
    pairing: 'Movie nights. Long train journeys. Anything with a screen.',
    ingredientHint: 'Cream & onion seasoning, rock salt',
    netWeight: PACK_SIZE, price: TIN_PRICE, hex: '#6B2F55', accent: '#9A5A85', image: '/img/tins/cream-onion.webp', badges: BADGES, featured: true,
  },
  {
    slug: 'choco', name: 'Choco', kind: 'tin', profile: 'sweet', spice: 0,
    tagline: 'A healthy indulgence',
    description: 'Roasted makhana wrapped in a thin coat of dark cocoa. Not a candy — a quiet, grown-up chocolate moment with a crunch.',
    pairing: 'After dinner, with black coffee.',
    ingredientHint: 'Cocoa, a touch of jaggery',
    netWeight: PACK_SIZE, price: TIN_PRICE, hex: '#4A2A1A', accent: '#7A4A30', image: '/img/tins/choco.webp', badges: BADGES,
  },
  {
    slug: 'crunchy-caramel', name: 'Crunchy Caramel', kind: 'tin', profile: 'sweet', spice: 0,
    tagline: 'Sweet crunch happiness',
    description: 'Golden caramel set thin and glassy over each pop. Buttery, toasty, and gone before you notice.',
    pairing: 'Gift boxes. Children. Adults who claim they don’t like sweets.',
    ingredientHint: 'Caramel, sea salt',
    netWeight: PACK_SIZE, price: TIN_PRICE, hex: '#98421A', accent: '#C4703F', image: '/img/tins/crunchy-caramel.webp', badges: BADGES,
  },
  {
    slug: 'jaggery', name: 'Jaggery', kind: 'tin', profile: 'sweet', spice: 0,
    tagline: 'Traditional goodness',
    description: 'Unrefined gur, the way our grandmothers sweetened everything. Deep, earthy, faintly smoky — the most Mithila of all our tins.',
    pairing: 'Winter afternoons. Post-workout. With a glass of warm milk.',
    ingredientHint: 'Jaggery (gur)',
    netWeight: PACK_SIZE, price: TIN_PRICE, hex: '#9A5416', accent: '#C9843C', image: '/img/tins/jaggery.webp', badges: BADGES, featured: true,
  },
  {
    slug: 'sweet-thai-chilli', name: 'Sweet Thai Chilli', kind: 'tin', profile: 'spicy', spice: 2,
    tagline: 'A perfect blend of sweet & heat',
    description: 'Red chilli, a whisper of garlic and a sweet finish that keeps you reaching back. Heat that builds politely.',
    pairing: 'Cocktail hour. Beer. A bowl on the table when friends come over.',
    ingredientHint: 'Sweet chilli seasoning, garlic',
    netWeight: PACK_SIZE, price: TIN_PRICE, hex: '#A0263A', accent: '#C9516A', image: '/img/tins/sweet-thai-chilli.webp', badges: BADGES,
  },
  {
    slug: 'schezwan', name: 'Schezwan', kind: 'tin', profile: 'spicy', spice: 3,
    tagline: 'Bold flavours, higher standards',
    description: 'Our loudest tin. Dried red chillies, garlic and Sichuan-style tang, roasted into every crevice of the pop.',
    pairing: 'Late nights. Cricket matches. Anyone who asks “is it spicy?”',
    ingredientHint: 'Schezwan seasoning: chilli, garlic, spices',
    netWeight: PACK_SIZE, price: TIN_PRICE, hex: '#9B2418', accent: '#C74A3A', image: '/img/tins/schezwan.webp', badges: BADGES,
  },
  {
    slug: 'honey-cheese', name: 'Honey Cheese', kind: 'tin', profile: 'savoury', spice: 0,
    tagline: 'Sweet meets savoury',
    description: 'Sharp cheese seasoning glazed with honey. The tin people argue over — and then finish.',
    pairing: 'Picnics. Kids’ tiffin. A cheese board that needed a surprise.',
    ingredientHint: 'Honey & cheese seasoning',
    netWeight: PACK_SIZE, price: TIN_PRICE, hex: '#C98A2A', accent: '#E3B25C', image: '/img/tins/honey-cheese.webp', badges: BADGES,
  },
  {
    slug: 'dry-fruits-kheer', name: 'Dry Fruits Kheer', kind: 'tin', profile: 'sweet', spice: 0,
    tagline: 'A taste of tradition',
    description: 'Cardamom, almond and pistachio — the flavour of festival kheer, without the bowl. Sweet, fragrant, celebratory.',
    pairing: 'Diwali gifting. Pooja thalis. Grandparents.',
    ingredientHint: 'Almonds, pistachios, cardamom, milk solids',
    netWeight: PACK_SIZE, price: TIN_PRICE, hex: '#1F5A5C', accent: '#3E8A8C', image: '/img/tins/dry-fruits-kheer.webp', badges: BADGES, featured: true,
  },
  {
    slug: 'nocturne-trio', name: 'The Nocturne Trio', kind: 'bundle', profile: 'sweet', spice: 0,
    tagline: 'Three tins. One midnight-blue box.',
    description: 'Choose any three flavours, boxed in indigo with a gold ribbon and a hand-written card. Our answer to the Diwali gift that gets re-gifted.',
    pairing: 'Corporate gifting, house-warmings, thank-yous.',
    ingredientHint: 'Any three 100 g tins',
    netWeight: `3 × ${PACK_SIZE}`, price: 699, compareAt: 747, hex: '#0F1A30', accent: '#C9A867', image: '/img/art/lineup.webp', badges: ['Gift box', 'Free card'],
  },
]

export const bySlug = (slug: string) => products.find((p) => p.slug === slug)
export const tins = products.filter((p) => p.kind === 'tin')
