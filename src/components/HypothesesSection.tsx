import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { formats, hypotheses, sections } from '../data/aiFarm'
import type { FormatId } from '../data/aiFarm'
import { reveal } from '../lib/motion'
import { SectionIntro } from './SectionIntro'

const formatIds = Object.keys(formats) as FormatId[]

export function HypothesesSection() {
  const [active, setActive] = useState(0)
  const hypothesis = hypotheses[active]
  const matched = new Set(hypothesis.formats)

  return (
    <section className="section hypotheses-section" id="hypotheses">
      <div className="container">
        <SectionIntro {...sections.hypotheses} />

        <div className="hypothesis-grid">
          <motion.div className="format-matrix surface" {...reveal}>
            <p className="matrix-label">матрица форматов</p>
            {formatIds.map((id) => (
              <div className={`format-row${matched.has(id) ? ' is-match' : ''}`} key={id}>
                <span>{formats[id].name}</span>
                <small>{formats[id].pattern}</small>
                <em>{formats[id].length}</em>
              </div>
            ))}
            <p className="matrix-hint">подсвечены форматы, которые проверяет выбранная гипотеза</p>
          </motion.div>

          <motion.div className="hypothesis-panel surface" {...reveal}>
            <div className="hyp-tabs" aria-label="Гипотезы">
              {hypotheses.map((item, index) => (
                <button
                  key={item.title}
                  aria-pressed={active === index}
                  aria-label={`Гипотеза ${index + 1}: ${item.title}`}
                  className={active === index ? 'is-selected' : ''}
                  onClick={() => setActive(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={hypothesis.title}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.28 }}
              >
                <p className="hyp-kicker">гипотеза роста</p>
                <h3>{hypothesis.title}</h3>
                <dl className="hyp-list">
                  <div>
                    <dt>Ставка</dt>
                    <dd>{hypothesis.bet}</dd>
                  </div>
                  <div>
                    <dt>Сигнал</dt>
                    <dd>{hypothesis.signal}</dd>
                  </div>
                  <div>
                    <dt>Риск</dt>
                    <dd>{hypothesis.risk}</dd>
                  </div>
                </dl>
                <div className="hyp-formats">
                  {hypothesis.formats.map((id) => (
                    <span key={id}>{formats[id].name}</span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
