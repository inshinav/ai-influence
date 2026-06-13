import { motion } from 'motion/react'
import { ShieldCheck } from 'lucide-react'
import { SAFETY_LABELS, ethics, sections } from '../data/aiFarm'
import { reveal, staggerChild, staggerParent } from '../lib/motion'
import { SectionIntro } from './SectionIntro'

export function EthicsSection() {
  return (
    <section className="section ethics-section" id="ethics">
      <div className="container">
        <SectionIntro {...sections.ethics} align="center" />

        <motion.div className="ethics-board" {...staggerParent}>
          {ethics.map((rule, index) => (
            <motion.article className="ethics-card surface" key={rule.tag} {...staggerChild}>
              <div className="ethics-card-top">
                <span className="ethics-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="ethics-tag">
                  <ShieldCheck size={13} />
                  {SAFETY_LABELS[rule.tag]}
                </span>
              </div>
              <h3>{rule.title}</h3>
              <p>{rule.text}</p>
            </motion.article>
          ))}
        </motion.div>

        <motion.p className="ethics-accent hand" {...reveal}>
          вау-эффект — да. давление — никогда.
        </motion.p>
      </div>
    </section>
  )
}
