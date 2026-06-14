import { motion } from 'motion/react'
import { Sparkles } from 'lucide-react'
import { TARGET_DOMAIN, sections, system } from '../data/aiFarm'
import { reveal } from '../lib/motion'

export function FinalCTA() {
  return (
    <section className="final-section">
      <div className="container">
        <motion.div className="final-panel" {...reveal}>
          <div className="final-copy">
            <p className="eyebrow">{sections.final.eyebrow}</p>
            <h2>{sections.final.title}</h2>
          </div>
          <a className="btn btn-primary btn-lg" href="#console">
            <Sparkles size={18} />
            Собрать свой пример ролика
          </a>
        </motion.div>

        <footer className="site-footer">
          <span>Я-Ферма — концепт, не официальный сайт «Ясно».</span>
          <span>
            {system.creators} AI-авторов · {system.devices} устройств · демо-данные
          </span>
          <span>{TARGET_DOMAIN}</span>
        </footer>
      </div>
    </section>
  )
}
