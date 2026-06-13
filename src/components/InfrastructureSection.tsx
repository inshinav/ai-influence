import { motion } from 'motion/react'
import { Smartphone } from 'lucide-react'
import { infrastructure, sections, system } from '../data/aiFarm'
import { reveal, staggerChild, staggerParent } from '../lib/motion'
import { SectionIntro } from './SectionIntro'

export function InfrastructureSection() {
  return (
    <section className="section infra-section" id="infra">
      <div className="container">
        <SectionIntro {...sections.infra} />

        <div className="infra-grid">
          <motion.div className="device-rack surface" {...reveal}>
            <p className="rack-label">device pods · {system.devices}</p>
            <div className="rack-cells">
              {Array.from({ length: system.devices }).map((_, index) => (
                <span className={index % 4 === 0 ? 'is-live' : ''} key={index}>
                  <Smartphone size={20} />
                  <small>{String(index + 1).padStart(2, '0')}</small>
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div className="infra-tiles" {...staggerParent}>
            {infrastructure.map((item, index) => (
              <motion.article className="infra-tile surface" key={item.title} {...staggerChild}>
                <span className="tile-index">{String(index + 1).padStart(2, '0')}</span>
                <strong className="tile-value">{item.value}</strong>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
