import { motion } from 'motion/react'
import { reveal } from '../lib/motion'

// Единый заголовочный блок секции: эйб­рау → заголовок → лид.
export function SectionIntro({
  eyebrow,
  title,
  lead,
  align = 'left',
}: {
  eyebrow: string
  title: string
  lead: string
  align?: 'left' | 'center'
}) {
  return (
    <motion.header
      className={`section-intro${align === 'center' ? ' section-intro--center' : ''}`}
      {...reveal}
    >
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="section-lead">{lead}</p>
    </motion.header>
  )
}
