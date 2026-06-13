import { useState } from 'react'
import type { CSSProperties } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Bookmark, ChevronLeft, ChevronRight, Film, Gauge, ShieldCheck, Sparkles } from 'lucide-react'
import { SAFETY_LABELS, clips, formats, personas, sections, topics } from '../data/aiFarm'
import { reveal } from '../lib/motion'
import { SectionIntro } from './SectionIntro'
import { Phone } from './Phone'

type AccentStyle = CSSProperties & { '--accent'?: string; '--glow'?: string }

function personaById(id: (typeof clips)[number]['personaId']) {
  return personas.find((p) => p.id === id) ?? personas[0]
}

export function FeedSection() {
  const [index, setIndex] = useState(0)
  const clip = clips[index]
  const persona = personaById(clip.personaId)

  const go = (delta: number) => setIndex((value) => (value + delta + clips.length) % clips.length)

  return (
    <section className="section feed-section" id="feed">
      <div className="container">
        <SectionIntro {...sections.feed} />

        <div className="feed-grid">
          <motion.div className="feed-stage" {...reveal}>
            <AnimatePresence mode="wait">
              <motion.div
                key={clip.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Phone
                  persona={persona}
                  hook={clip.hook}
                  topicLabel={topics[clip.topic].name}
                  caption={clip.caption}
                  metrics={{ retention: `${clip.metrics.retention}%`, saves: `${clip.metrics.saves}%` }}
                  videoFile={clip.videoFile}
                  size="lg"
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div className="feed-panel surface" {...reveal}>
            <div className="panel-head">
              <span className="panel-label">
                <Film size={16} />
                демо-лента · {clips.length} роликов
              </span>
              <div className="feed-nav">
                <button onClick={() => go(-1)} aria-label="Предыдущий ролик">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => go(1)} aria-label="Следующий ролик">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="clip-rail" role="tablist" aria-label="Ролики">
              {clips.map((item, itemIndex) => {
                const itemPersona = personaById(item.personaId)
                return (
                  <button
                    key={item.id}
                    role="tab"
                    aria-selected={itemIndex === index}
                    className={`clip-card${itemIndex === index ? ' is-active' : ''}`}
                    style={{ '--accent': itemPersona.color, '--glow': itemPersona.glow } as AccentStyle}
                    onClick={() => setIndex(itemIndex)}
                  >
                    <span className="clip-card-top">
                      <span className="clip-avatar">{itemPersona.name.slice(0, 1)}</span>
                      <span className="clip-saves">
                        <Bookmark size={12} />
                        {item.metrics.saves}%
                      </span>
                    </span>
                    <strong>{item.title}</strong>
                    <small>{topics[item.topic].name}</small>
                    <span className="clip-bar" aria-hidden="true">
                      <span style={{ width: `${item.metrics.retention}%` }} />
                    </span>
                  </button>
                )
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                className="clip-brief"
                key={clip.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
                style={{ '--accent': persona.color } as AccentStyle}
              >
                <p className="brief-kicker">карточка сценария · {formats[clip.format].name}</p>
                <h3>{clip.title}</h3>
                <div className="decision-stack">
                  <div>
                    <span>
                      <Gauge size={14} />
                      сигнал
                    </span>
                    <strong>{clip.status}</strong>
                  </div>
                  <div>
                    <span>
                      <Sparkles size={14} />
                      паттерн
                    </span>
                    <strong>{formats[clip.format].pattern}</strong>
                  </div>
                </div>
                <div className="brief-beats">
                  {clip.beats.map((beat) => (
                    <span key={beat}>{beat}</span>
                  ))}
                </div>
                <div className="metric-line">
                  <span>Досмотр {clip.metrics.retention}%</span>
                  <span>Сохранения {clip.metrics.saves}%</span>
                  <span>CTR {clip.metrics.click}%</span>
                </div>
                <p className="safety-note">
                  <ShieldCheck size={15} />
                  {clip.safety}
                </p>
                <div className="brief-safety" aria-label="Safety checks">
                  {clip.safetyChecks.map((tag) => (
                    <span key={tag}>{SAFETY_LABELS[tag]}</span>
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
