export const EASE = [0.16, 1, 0.3, 1] as const
/** ?noanim=1 renders every section in its resting state (QA aid; also kinder to weak devices). */
export const NOANIM = typeof location !== 'undefined' && new URLSearchParams(location.search).has('noanim')
export const fadeUp = (delay = 0) => NOANIM ? {} : ({
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.9, ease: EASE, delay },
})
export const fadeIn = (delay = 0) => NOANIM ? {} : ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 1, ease: EASE, delay },
})
