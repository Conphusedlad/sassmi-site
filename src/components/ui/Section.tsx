import { motion } from 'framer-motion'
import { fadeUp } from '../../lib/motion'

export function Container({ children, className = '', max = 'max-w-7xl' }: { children: React.ReactNode; className?: string; max?: string }) {
  return <div className={`mx-auto w-full ${max} px-5 sm:px-8 ${className}`}>{children}</div>
}

export function SectionHead({ kicker, title, sub, align = 'center', tone = 'light' }: { kicker?: string; title: React.ReactNode; sub?: React.ReactNode; align?: 'center' | 'left'; tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark'
  return (
    <motion.div {...fadeUp()} className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-2xl`}>
      {kicker && <p className={`kicker ${align === 'center' ? 'rule-gold' : ''}`}>{kicker}</p>}
      <h2 className={`mt-4 text-balance text-[clamp(32px,4.6vw,56px)] ${dark ? 'text-ivory' : 'text-ink'}`}>{title}</h2>
      {sub && <p className={`mt-5 text-[17px] leading-relaxed ${dark ? 'text-ivory/70' : 'text-ink-soft'}`}>{sub}</p>}
    </motion.div>
  )
}

export function GoldRule({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-gold ${className}`} aria-hidden>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold" />
      <span className="text-[10px]">◆</span>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold" />
    </div>
  )
}
