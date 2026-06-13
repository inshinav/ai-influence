import type { CSSProperties } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowRight, Radio, ShieldCheck, Sparkles, Wand2 } from 'lucide-react'
import { clips, personas, sections, topics } from '../data/aiFarm'
import { Phone } from './Phone'

type AccentStyle = CSSProperties & { '--accent'?: string; '--glow'?: string; '--delay'?: string }

const heroClips = clips.slice(0, 3)

function HeroStage() {
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll()
  // Лёгкий параллакс: витрина чуть уезжает вверх по мере входа в систему.
  const y = useTransform(scrollYProgress, [0, 0.18], [0, -40])
  const opacity = useTransform(scrollYProgress, [0, 0.16], [1, 0.55])

  return (
    <motion.div className="hero-stage" style={reduce ? undefined : { y, opacity }} aria-label="Витрина creator OS">
      <div className="hero-ribbon">
        <Radio size={14} />
        creator OS · живая симуляция
      </div>

      <div className="hero-phones">
        {heroClips.map((clip, index) => {
          const persona = personas.find((p) => p.id === clip.personaId) ?? personas[0]
          return (
            <motion.div
              key={clip.id}
              className={`hero-phone hero-phone--${index + 1}`}
              animate={reduce ? undefined : { y: [0, -12, 0] }}
              transition={{ duration: 5 + index, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 }}
            >
              <Phone
                persona={persona}
                hook={clip.hook}
                topicLabel={topics[clip.topic].name}
                metrics={{ retention: `${clip.metrics.retention}%`, saves: `${clip.metrics.saves}%` }}
                size="sm"
                showRail={index === 1}
              />
            </motion.div>
          )
        })}
      </div>

      <div className="hero-roster" aria-hidden="true">
        {personas.map((persona, index) => (
          <motion.span
            key={persona.id}
            className="hero-dot"
            style={{ '--accent': persona.color, '--delay': `${index * 0.12}s` } as AccentStyle}
            animate={reduce ? undefined : { scale: [1, 1.14, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3.4, repeat: Infinity, delay: index * 0.22 }}
          >
            {persona.name.slice(0, 1)}
          </motion.span>
        ))}
      </div>
    </motion.div>
  )
}

export function Hero() {
  const { hero } = sections

  return (
    <section className="hero" id="top">
      <div className="hero-aurora" aria-hidden="true" />
      <div className="container hero-grid">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1>{hero.title}</h1>
          <p className="hero-lead">{hero.lead}</p>
          <div className="hero-metrics" aria-label="Сводка пилота">
            {hero.stats.map((stat) => (
              <span key={stat.label}>
                <strong>{stat.value}</strong>
                {stat.label}
              </span>
            ))}
          </div>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#console">
              <Wand2 size={18} />
              Собрать пример ролика
            </a>
            <a className="btn btn-ghost" href="#viewer">
              Как это видит человек
              <ArrowRight size={18} />
            </a>
          </div>
          <ul className="trust-row" aria-label="Этические ограничения">
            {hero.trust.map((note, index) => (
              <li key={note}>
                {index === 1 ? <Sparkles size={14} /> : <ShieldCheck size={14} />}
                {note}
              </li>
            ))}
          </ul>
        </motion.div>

        <HeroStage />
      </div>
    </section>
  )
}
