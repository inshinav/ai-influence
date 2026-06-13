import { motion } from 'motion/react'
import { Megaphone, Network } from 'lucide-react'
import { creatorEconomics, economicsCurve, sections } from '../data/aiFarm'
import { reveal } from '../lib/motion'
import { SectionIntro } from './SectionIntro'

const W = 100
const H = 50
const PAD = 3

function points(values: number[]) {
  const n = values.length
  return values.map((value, index) => {
    const x = (index / (n - 1)) * (W - PAD * 2) + PAD
    const y = H - PAD - (value / 100) * (H - PAD * 2)
    return [x, y] as const
  })
}

function toPath(pts: ReadonlyArray<readonly [number, number]>) {
  return pts.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
}

export function EconomicsSection() {
  const owned = points(economicsCurve.owned)
  const blogger = points(economicsCurve.blogger)
  const ownedArea = `${toPath(owned)} L${W - PAD} ${H - PAD} L${PAD} ${H - PAD} Z`

  return (
    <section className="section economics-section" id="economics">
      <div className="container">
        <SectionIntro {...sections.economics} align="center" />

        <motion.div className="econ-chart surface" {...reveal}>
          <div className="econ-legend">
            <span className="legend-owned">
              <Network size={15} />
              собственная сеть — копит
            </span>
            <span className="legend-blogger">
              <Megaphone size={15} />
              разовые интеграции — всплески
            </span>
          </div>

          <svg className="econ-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="ownedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--sky)" stopOpacity="0.22" />
                <stop offset="1" stopColor="var(--sky)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={ownedArea} fill="url(#ownedFill)" />
            <motion.path
              d={toPath(blogger)}
              className="curve-blogger"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: 'easeInOut' }}
            />
            <motion.path
              d={toPath(owned)}
              className="curve-owned"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.3, ease: 'easeInOut', delay: 0.15 }}
            />
          </svg>
          <p className="econ-caption">демо-кривая: интеграции дают пики и гаснут, собственные авторы накапливают охват месяцами</p>
        </motion.div>

        <motion.div className="econ-compare" {...reveal}>
          <div className="econ-col is-muted">
            <div className="econ-col-head">
              <Megaphone size={20} />
              <h3>Закупка у блогеров</h3>
            </div>
            {creatorEconomics.blogger.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
          <div className="econ-col is-accent">
            <div className="econ-col-head">
              <Network size={20} />
              <h3>Собственная Я-Ферма</h3>
            </div>
            {creatorEconomics.owned.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
