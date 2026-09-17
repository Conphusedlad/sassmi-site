/**
 * The Sassmi catalogue — single source of truth for BOTH the website and the payment server.
 * Flavour names and one-liners are exactly as printed on the 17-Sep-2026 tin renders.
 * Prices are in rupees (integers). ⚠️ PRICES AND PACK SIZE ARE PLACEHOLDERS until the family confirms.
 */
export type Product = {
  slug: string
  name: string
  kind: 'tin' | 'bundle'
  format?: 'ready-to-serve'
  tagline: string
  description: string
  pairing: string
  ingredientHint: string
  allergens?: string
  netWeight: string
  price: number
  compareAt?: number
  hex: string // tin body colour
  accent: string // lighter accent for gradients/chips
  spice: 0 | 1 | 2 | 3
  profile: 'savoury' | 'sweet' | 'spicy'
  badges: string[]
  featured?: boolean
}

export const PACK_SIZE = '100 g' // TODO confirm — earlier render said 65 g, 12-Sep label draft said 100 g (4 × 25 g)
export const TIN_PRICE = 249 // TODO confirm — placeholder MRP per tin, incl. of all taxes

const BADGES = ['Roasted in Olive Oil', 'Gluten Free', 'No Added Preservatives', 'Rich in Protein']
const tin = (p: Omit<Product, 'kind' | 'netWeight' | 'price' | 'badges'> & Partial<Pick<Product, 'netWeight' | 'price' | 'badges'>>): Product => ({
  kind: 'tin', netWeight: PACK_SIZE, price: TIN_PRICE, badges: BADGES, ...p,
})

export const products: Product[] = [
  tin({
    slug: 'mint-royale', name: 'Mint Royale', tagline: 'Cool. Refreshing. Real.', profile: 'savoury', spice: 1, featured: true,
    description: 'Garden mint over warm, freshly roasted makhana. Bright, clean and a little peppery — the tin that tastes like a Delhi evening breeze.',
    pairing: 'Adrak chai at four. Crushed over dahi. The first tin to open for guests.',
    ingredientHint: 'Real mint, rock salt', hex: '#3D663A', accent: '#6E9A67',
  }),
  tin({
    slug: 'garlic-fire', name: 'Garlic Fire', tagline: 'Bold. Aromatic. Irresistible.', profile: 'spicy', spice: 2,
    description: 'Slow-roasted garlic meets red chilli. Warm, savoury and unapologetically aromatic — it announces itself the moment the lid comes off.',
    pairing: 'Beer, biryani nights, anything with a lime wedge nearby.',
    ingredientHint: 'Garlic, red chilli, rock salt', hex: '#9C222B', accent: '#C94A52',
  }),
  tin({
    slug: 'jalapeno-zing', name: 'Jalapeno Zing', tagline: 'Spicy. Tangy. Exciting.', profile: 'spicy', spice: 2,
    description: 'Green jalapeño heat with a squeeze of citrus tang. Sharp, lively and impossible to eat slowly.',
    pairing: 'Movie nights. The bowl that replaces nachos.',
    ingredientHint: 'Jalapeño seasoning, lime', hex: '#1E5657', accent: '#3F8587',
  }),
  tin({
    slug: 'cream-onion-bliss', name: 'Cream Onion Bliss', tagline: 'Rich. Savoury. Satisfying.', profile: 'savoury', spice: 0, featured: true,
    description: 'Slow-cooked onion sweetness folded into a soft, creamy seasoning. Familiar comfort, made lighter by the pop.',
    pairing: 'Long train journeys. Board games. Anything with a screen.',
    ingredientHint: 'Cream & onion seasoning, rock salt', allergens: 'Contains milk solids', hex: '#7F3C69', accent: '#A8659A',
  }),
  tin({
    slug: 'peri-peri-blaze', name: 'Peri Peri Blaze', tagline: 'Fiery. Zesty. Addictive.', profile: 'spicy', spice: 3,
    description: 'Bird’s-eye chilli, lemon and herbs, roasted into every crevice of the pop. Heat that arrives fast and leaves you reaching back.',
    pairing: 'Cricket matches. Late nights. Anyone who asks “is it spicy?”',
    ingredientHint: 'Peri peri seasoning: chilli, lemon, herbs', hex: '#C04916', accent: '#E27A45',
  }),
  tin({
    slug: 'divine-salt-pepper', name: 'Divine Salt & Pepper', tagline: 'Pure. Balanced. Timeless.', profile: 'savoury', spice: 1, featured: true,
    description: 'Himalayan pink salt and freshly cracked black pepper. Nothing to hide behind — just the makhana, seasoned the way it has always been.',
    pairing: 'Fasting days. Whisky. The tin for people who say they don’t like flavoured snacks.',
    ingredientHint: 'Himalayan pink salt, black pepper', hex: '#3A342C', accent: '#6E6455',
  }),
  tin({
    slug: 'thai-sweet-chilly', name: 'Thai Sweet Chilly', tagline: 'Sweet. Hot. Exotic.', profile: 'spicy', spice: 2,
    description: 'Red chilli, a whisper of garlic and a sweet finish. Heat that builds politely and never overstays.',
    pairing: 'Cocktail hour. A bowl on the table when friends come over.',
    ingredientHint: 'Sweet chilli seasoning, garlic', hex: '#BD3452', accent: '#D9657D',
  }),
  tin({
    slug: 'hot-schezwan', name: 'Hot Schezwan', tagline: 'Bold. Spicy. Authentic.', profile: 'spicy', spice: 3,
    description: 'Our loudest tin. Dried red chillies, garlic and Sichuan-style tang, roasted deep into the pop.',
    pairing: 'Momos. Rainy evenings. Dares.',
    ingredientHint: 'Schezwan seasoning: chilli, garlic, spices', hex: '#BF261F', accent: '#DE5A4E',
  }),
  tin({
    slug: 'honey-cheese-bliss', name: 'Honey Cheese Bliss', tagline: 'Sweet meets savoury.', profile: 'savoury', spice: 0,
    description: 'Sharp cheese seasoning glazed with honey. The tin people argue over — and then finish.',
    pairing: 'Picnics. Kids’ tiffin. A cheese board that needed a surprise.',
    ingredientHint: 'Honey & cheese seasoning', allergens: 'Contains milk solids', hex: '#DE9924', accent: '#F0BE5A',
  }),
  tin({
    slug: 'caramel-crunch', name: 'Caramel Crunch', tagline: 'Crunchy. Sweet. Delightful.', profile: 'sweet', spice: 0,
    description: 'Golden caramel set thin and glassy over each pop. Buttery, toasty, and gone before you notice.',
    pairing: 'Gift boxes. Children. Adults who claim they don’t like sweets.',
    ingredientHint: 'Caramel, sea salt', hex: '#BA5020', accent: '#D87A45',
  }),
  tin({
    slug: 'choco-indulgence', name: 'Choco Indulgence', tagline: 'Guilty pleasure. Mindful choice.', profile: 'sweet', spice: 0,
    description: 'Roasted makhana wrapped in a thin coat of dark cocoa. Not a candy — a quiet, grown-up chocolate moment with a crunch.',
    pairing: 'After dinner, with black coffee.',
    ingredientHint: 'Cocoa, a touch of jaggery', hex: '#713D1E', accent: '#9A5F3A',
  }),
  tin({
    slug: 'jaggery-heritage', name: 'Jaggery Heritage', tagline: 'Traditional. Nourishing. Real.', profile: 'sweet', spice: 0, featured: true,
    description: 'Unrefined gur, the way our grandmothers sweetened everything. Deep, earthy, faintly smoky — the most Mithila of all our tins.',
    pairing: 'Winter afternoons. Post-workout. With a glass of warm milk.',
    ingredientHint: 'Jaggery (gur)', hex: '#B66824', accent: '#D48C48',
  }),
  tin({
    slug: 'royal-makhana-kheer', name: 'Royal Makhana Kheer', tagline: 'Traditional taste. Modern convenience.', profile: 'sweet', spice: 0, format: 'ready-to-serve',
    description: 'Festival kheer, ready when you are: makhana simmered in milk with cardamom, almonds and pistachio. Open, chill or warm, serve.',
    pairing: 'Pooja thalis. Diwali evenings. The grandparents’ tin.',
    ingredientHint: 'Makhana, milk, almonds, pistachios, cardamom', allergens: 'Contains milk and tree nuts',
    hex: '#4FB0C4', accent: '#86CDD9', badges: ['Ready to Serve', 'Gluten Free', 'No Added Preservatives'],
    netWeight: PACK_SIZE, // TODO: confirm the kheer pack size — a ready-to-serve format is unlikely to be 100 g
  }),
  {
    slug: 'nocturne-trio', name: 'The Nocturne Trio', kind: 'bundle', profile: 'sweet', spice: 0,
    tagline: 'Three tins. One midnight-blue box.',
    description: 'Choose any three flavours, boxed in indigo with a gold ribbon and a hand-written card. Our answer to the Diwali gift that gets re-gifted.',
    pairing: 'Corporate gifting, house-warmings, thank-yous.',
    ingredientHint: 'Any three 100 g tins',
    netWeight: `3 × ${PACK_SIZE}`, price: 699, compareAt: 747, hex: '#0F1A30', accent: '#C9A867', badges: ['Gift box', 'Free card'],
  },
]

export const bySlug = (slug: string) => products.find((p) => p.slug === slug)
export const tins = products.filter((p) => p.kind === 'tin')
/** Public image path for a product (tins are transparent PNG cut-outs; bundles use the lineup render). */
export const productImage = (p: Product) => (p.kind === 'tin' ? `/img/tins/${p.slug}.png` : '/img/art/lineup-v2.webp')
