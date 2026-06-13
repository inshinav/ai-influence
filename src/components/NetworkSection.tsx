import { useState } from 'react'
import type { CSSProperties } from 'react'
import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import { clips, personas, sections, topics } from '../data/aiFarm'
import type { PersonaId } from '../data/aiFarm'
import { reveal } from '../lib/motion'
import { SectionIntro } from './SectionIntro'
import { AiPill } from './AiPill'
import { Phone } from './Phone'

type AccentStyle = CSSProperties & {
  '--accent'?: string
  '--glow'?: string
  '--nx'?: string
  '--ny'?: string
}

// Узлы раскладываются по эллипсу вокруг центрального хаба «Ясно».
const NODES = personas.map((persona, index) => {
  const angle = (index / personas.length) * Math.PI * 2 - Math.PI / 2
  return {
    persona,
    x: 50 + Math.cos(angle) * 35,
    y: 50 + Math.sin(angle) * 37,
  }
})

function clipFor(id: PersonaId) {
  return clips.find((clip) => clip.personaId === id)
}

export function NetworkSection() {
  const [activeId, setActiveId] = useState<PersonaId>('mira')
  const active = personas.find((p) => p.id === activeId) ?? personas[0]
  const activeClip = clipFor(activeId)

  return (
    <section className="section network-section" id="network">
      <div className="container">
        <SectionIntro {...sections.network} />

        <div className="network-grid">
          <motion.div className="creator-map surface" {...reveal}>
            <svg className="map-wires" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {NODES.map(({ persona, x, y }) => (
                <line
                  key={persona.id}
                  x1={x}
                  y1={y}
                  x2="50"
                  y2="50"
                  className={persona.id === activeId ? 'wire is-active' : 'wire'}
                  style={{ stroke: persona.color }}
                />
              ))}
            </svg>

            <span className="map-hub" aria-hidden="true">
              Ясно
            </span>

            {NODES.map(({ persona, x, y }) => (
              <button
                key={persona.id}
                className={`creator-node${persona.id === activeId ? ' is-active' : ''}`}
                style={{ '--accent': persona.color, '--glow': persona.glow, '--nx': `${x}%`, '--ny': `${y}%` } as AccentStyle}
                onClick={() => setActiveId(persona.id)}
                aria-pressed={persona.id === activeId}
              >
                <span className="node-avatar">{persona.name.slice(0, 1)}</span>
                <span className="node-text">
                  <strong>{persona.name}</strong>
                  <small>{persona.label}</small>
                </span>
              </button>
            ))}
          </motion.div>

          <motion.div
            className="creator-detail surface"
            key={active.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ '--accent': active.color, '--glow': active.glow } as AccentStyle}
          >
            <div className="detail-main">
              <div className="detail-head">
                <span className="detail-avatar">{active.name.slice(0, 1)}</span>
                <div>
                  <AiPill label={active.disclosure} tone="light" />
                  <h3>
                    {active.name}, {active.age}
                  </h3>
                  <span className="detail-handle">{active.handle}</span>
                </div>
              </div>

              <p className="detail-story">{active.story}</p>

              <div className="detail-specs">
                <div>
                  <span>Голос</span>
                  <strong>{active.voice}</strong>
                </div>
                <div>
                  <span>Стиль</span>
                  <strong>{active.style}</strong>
                </div>
                <div>
                  <span>Визуальная тема</span>
                  <strong>{active.theme}</strong>
                </div>
              </div>

              <div className="chip-row">
                {active.topics.map((topic) => (
                  <span className="soft-chip" key={topic}>
                    {topics[topic].name}
                  </span>
                ))}
              </div>

              <div className="trait-row">
                {active.traits.map((trait) => (
                  <span key={trait}>
                    <Check size={13} strokeWidth={3} />
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {activeClip && (
              <div className="detail-preview">
                <Phone
                  persona={active}
                  hook={activeClip.hook}
                  topicLabel={topics[activeClip.topic].name}
                  metrics={{ retention: `${activeClip.metrics.retention}%`, saves: `${activeClip.metrics.saves}%` }}
                  videoFile={activeClip.videoFile}
                  size="sm"
                />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
