import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Cpu, FlaskConical, Workflow } from 'lucide-react'
import { pipelineSteps, sections } from '../data/aiFarm'
import { reveal } from '../lib/motion'
import { SectionIntro } from './SectionIntro'

export function PipelineSection() {
  const [active, setActive] = useState(0)
  const step = pipelineSteps[active]
  const total = pipelineSteps.length
  const next = pipelineSteps[(active + 1) % total]

  return (
    <section className="section pipeline-section" id="pipeline">
      <div className="container">
        <SectionIntro {...sections.pipeline} />

        <div className="pipeline-grid">
          <motion.div className="pipeline-rail surface" {...reveal}>
            <ol>
              {pipelineSteps.map((item, index) => {
                const state = index < active ? 'is-done' : index === active ? 'is-active' : ''
                return (
                  <li key={item.title}>
                    <button className={`pipe-step ${state}`} onClick={() => setActive(index)}>
                      <span className="pipe-spine">
                        <span className="pipe-dot">{String(index + 1).padStart(2, '0')}</span>
                      </span>
                      <span className="pipe-text">
                        <strong>{item.title}</strong>
                        <small>{item.short}</small>
                      </span>
                      {item.experimental && <FlaskConical className="pipe-exp" size={14} />}
                    </button>
                  </li>
                )
              })}
            </ol>
          </motion.div>

          <motion.div className="pipeline-detail surface" {...reveal}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28 }}
              >
                <div className="detail-topline">
                  <span>
                    <Workflow size={16} />
                    шаг {active + 1} / {total}
                  </span>
                  {step.experimental && (
                    <span className="exp-badge">
                      <FlaskConical size={13} />
                      growth-эксперимент
                    </span>
                  )}
                </div>

                <h3>{step.title}</h3>
                <p className="pipe-detail-text">{step.detail}</p>

                <div className="io-grid">
                  <div>
                    <span>Output</span>
                    <strong>{step.output}</strong>
                  </div>
                  <div>
                    <span>Safety-гейт</span>
                    <strong>{step.check}</strong>
                  </div>
                </div>

                <div className="pipe-log" aria-label="Лог конвейера">
                  <p>
                    <Cpu size={15} />
                    production log · {step.short}
                  </p>
                  <span>{step.short}.started</span>
                  <span>output: {step.output} ✓</span>
                  <span>{step.experimental ? 'experiment.flag = on' : 'safety.review = ok'}</span>
                  <span>
                    handoff → {next.short}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
