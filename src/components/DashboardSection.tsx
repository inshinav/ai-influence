import { useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import { LineChart } from 'lucide-react'
import { dashboard, pilotTrend, roadmap, sections } from '../data/aiFarm'
import type { DashboardMetric } from '../data/aiFarm'
import { formatInt, formatPct, formatRub } from '../lib/format'
import { useCountUp } from '../lib/useCountUp'
import { reveal, staggerChild, staggerParent } from '../lib/motion'
import { SectionIntro } from './SectionIntro'

function formatValue(value: number, unit: DashboardMetric['unit']): string {
  if (unit === 'percent') return formatPct(value)
  if (unit === 'rub') return formatRub(value)
  return formatInt(value)
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data)
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 26 - (value / max) * 22 - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg className="sparkline" viewBox="0 0 100 26" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} />
    </svg>
  )
}

function MetricTile({ metric, active }: { metric: DashboardMetric; active: boolean }) {
  const value = useCountUp(metric.value, active)
  return (
    <motion.article className="metric-tile" {...staggerChild}>
      <span className="metric-label">{metric.label}</span>
      <strong>{formatValue(value, metric.unit)}</strong>
      <Sparkline data={metric.spark} />
      <small>{metric.delta}</small>
    </motion.article>
  )
}

export function DashboardSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const [range, setRange] = useState<'daily' | 'weekly'>('weekly')
  const bars = pilotTrend[range]
  const max = Math.max(...bars)

  return (
    <section className="section dashboard-section" id="roadmap">
      <div className="container">
        <SectionIntro {...sections.dashboard} />

        <div className="dashboard-grid" ref={ref}>
          <motion.div className="metric-board surface" {...reveal}>
            <div className="board-head">
              <span className="panel-label">
                <LineChart size={16} />
                пилот-дашборд · демо-данные
              </span>
              <div className="range-toggle">
                <button className={range === 'daily' ? 'is-on' : ''} onClick={() => setRange('daily')}>
                  по дням
                </button>
                <button className={range === 'weekly' ? 'is-on' : ''} onClick={() => setRange('weekly')}>
                  по неделям
                </button>
              </div>
            </div>

            <motion.div className="metric-grid" {...staggerParent}>
              {dashboard.map((metric) => (
                <MetricTile key={metric.label} metric={metric} active={inView} />
              ))}
            </motion.div>

            <div className="trend-chart" aria-label="График досмотра">
              {bars.map((value, index) => (
                <motion.span
                  key={`${range}-${index}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${(value / max) * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
                />
              ))}
            </div>
          </motion.div>

          <motion.div className="roadmap-list" {...staggerParent}>
            {roadmap.map((item) => (
              <motion.div className="roadmap-item surface" key={item.phase} {...staggerChild}>
                <span className="roadmap-phase">{item.phase}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.period}</small>
                  <p>{item.detail}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
