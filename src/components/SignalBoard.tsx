import { motion } from 'motion/react'
import { Activity, Boxes, Radar, Route, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { pilotRunway, sections, strategicSignals } from '../data/aiFarm'
import { reveal, staggerChild, staggerParent } from '../lib/motion'
import { SectionIntro } from './SectionIntro'

const ICONS: Record<string, LucideIcon> = {
  channel: Radar,
  owned: Boxes,
  safety: ShieldCheck,
  loop: Activity,
}

export function SignalBoard() {
  return (
    <section className="signal-section" id="signals">
      <div className="container">
        <SectionIntro {...sections.signals} align="center" />

        <motion.div className="signal-board surface" {...reveal}>
          <div className="signal-board-head">
            <div>
              <span className="panel-label">
                <Route size={16} />
                pilot thesis
              </span>
              <h3>Рост как редакционная система, а не как воронка давления</h3>
            </div>
            <p>
              Это не официальный сайт «Ясно» и не обещание эффективности. Это прототип того, как может выглядеть
              собственная сеть AI-авторов с прозрачными ограничениями.
            </p>
          </div>

          <motion.div className="signal-grid" {...staggerParent}>
            {strategicSignals.map((signal) => {
              const Icon = ICONS[signal.icon] ?? Activity
              return (
                <motion.article className="signal-card" key={signal.label} {...staggerChild}>
                  <span className="signal-icon">
                    <Icon size={18} />
                  </span>
                  <span>{signal.label}</span>
                  <strong>{signal.value}</strong>
                  <p>{signal.detail}</p>
                </motion.article>
              )
            })}
          </motion.div>

          <div className="runway" aria-label="Логика пилота">
            {pilotRunway.map((item) => (
              <article className="runway-item" key={item.phase}>
                <span>{item.phase}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.metric}</small>
                  <p>{item.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
