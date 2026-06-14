import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { AlertTriangle, Check, Copy, Cpu, HeartHandshake, Mic2, RefreshCw, ShieldCheck, SlidersHorizontal, UserRound } from 'lucide-react'
import { formats, personas, sections, topics } from '../data/aiFarm'
import type { FormatId, Persona, PersonaId, TopicId } from '../data/aiFarm'
import { buildConsoleDraft } from '../lib/console'
import type { ConsoleDraft } from '../lib/console'
import { reveal } from '../lib/motion'
import { SectionIntro } from './SectionIntro'
import { AiPill } from './AiPill'

type AccentStyle = CSSProperties & { '--accent'?: string; '--glow'?: string }

const topicIds = Object.keys(topics) as TopicId[]
const formatIds = Object.keys(formats) as FormatId[]

type Phase = 'generating' | 'streaming' | 'done'

export function ConsoleSection() {
  const reduce = useReducedMotion() ?? false
  const [personaId, setPersonaId] = useState<PersonaId>('mira')
  const [topicId, setTopicId] = useState<TopicId>('anxiety')
  const [formatId, setFormatId] = useState<FormatId>('micro-practice')
  const [variant, setVariant] = useState(0)

  const persona = personas.find((p) => p.id === personaId) ?? personas[0]
  const draft = useMemo(
    () => buildConsoleDraft(personaId, topicId, formatId, variant),
    [personaId, topicId, formatId, variant],
  )
  const genKey = `${personaId}-${topicId}-${formatId}-${variant}`

  return (
    <section className="section console-section" id="console">
      <div className="container">
        <SectionIntro {...sections.console} />

        <motion.div className="console" {...reveal}>
          <div className="console-controls surface">
            <Control icon={<UserRound size={15} />} label="Автор">
              <div className="segmented">
                {personas.map((option) => (
                  <button
                    key={option.id}
                    className={option.id === personaId ? 'is-selected' : ''}
                    style={{ '--accent': option.color } as AccentStyle}
                    onClick={() => setPersonaId(option.id)}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </Control>

            <Control icon={<HeartHandshake size={15} />} label="Тема">
              <div className="segmented">
                {topicIds.map((id) => (
                  <button key={id} className={id === topicId ? 'is-selected' : ''} onClick={() => setTopicId(id)}>
                    {topics[id].name}
                  </button>
                ))}
              </div>
            </Control>

            <Control icon={<SlidersHorizontal size={15} />} label="Формат">
              <div className="segmented">
                {formatIds.map((id) => (
                  <button key={id} className={id === formatId ? 'is-selected' : ''} onClick={() => setFormatId(id)}>
                    {formats[id].name}
                  </button>
                ))}
              </div>
            </Control>

            <button className="btn btn-dark generate-btn" onClick={() => setVariant((v) => v + 1)}>
              <RefreshCw size={17} />
              Перегенерировать пример
            </button>
            <p className="control-hint">вариантов собрано: {variant + 1}</p>
          </div>

          <DraftView key={genKey} draft={draft} persona={persona} reduce={reduce} />
        </motion.div>
      </div>
    </section>
  )
}

// Витрина генерации. Перемонтируется на каждый новый набор параметров (key),
// поэтому состояние стрима инициализируется заново, а эффект только запускает
// таймеры — без синхронного setState в теле эффекта.
function DraftView({ draft, persona, reduce }: { draft: ConsoleDraft; persona: Persona; reduce: boolean }) {
  const [phase, setPhase] = useState<Phase>(reduce ? 'done' : 'generating')
  const [typedHook, setTypedHook] = useState(() => (reduce ? draft.hook : ''))
  const [visibleLines, setVisibleLines] = useState(() => (reduce ? draft.script.length : 0))
  const [showChecks, setShowChecks] = useState(reduce)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (reduce) return
    let cancelled = false
    const timers: number[] = []
    const chars = Array.from(draft.hook)

    const revealLines = () => {
      let line = 0
      const lineTimer = window.setInterval(() => {
        if (cancelled) return window.clearInterval(lineTimer)
        line += 1
        setVisibleLines(line)
        if (line >= draft.script.length) {
          window.clearInterval(lineTimer)
          timers.push(
            window.setTimeout(() => {
              if (cancelled) return
              setShowChecks(true)
              setPhase('done')
            }, 240),
          )
        }
      }, 230)
      timers.push(lineTimer)
    }

    const startStream = () => {
      if (cancelled) return
      setPhase('streaming')
      let i = 0
      const typeTimer = window.setInterval(() => {
        if (cancelled) return window.clearInterval(typeTimer)
        i += 2
        setTypedHook(chars.slice(0, i).join(''))
        if (i >= chars.length) {
          window.clearInterval(typeTimer)
          revealLines()
        }
      }, 16)
      timers.push(typeTimer)
    }

    timers.push(window.setTimeout(startStream, 560))
    return () => {
      cancelled = true
      timers.forEach((id) => {
        window.clearTimeout(id)
        window.clearInterval(id)
      })
    }
  }, [draft, reduce])

  const copyDraft = () => {
    const text = [draft.title, '', draft.hook, '', ...draft.script, '', draft.voice].join('\n')
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1600)
      },
      () => undefined,
    )
  }

  const allPass = draft.checks.every((check) => check.passed)

  return (
    <motion.div
      className="console-output surface"
      style={{ '--accent': persona.color, '--glow': persona.glow } as AccentStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="output-head">
        <span className="output-label">
          <Cpu size={15} className={phase === 'generating' ? 'spin' : ''} />
          {phase === 'generating' ? 'собираю черновик…' : 'черновик · локальная генерация'}
        </span>
        <AiPill label={persona.disclosure} tone="dark" />
      </div>

      <h3 className="output-title">{draft.title}</h3>

      <div className="hook-card">
        <span>Hook</span>
        <strong>
          {typedHook}
          {phase === 'streaming' && <i className="caret" aria-hidden="true" />}
        </strong>
      </div>

      <div className="script-list">
        {draft.script.slice(0, visibleLines).map((line, index) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: reduce ? 0 : index * 0.02 }}
          >
            {line}
          </motion.p>
        ))}
      </div>

      <p className="output-voice">
        <Mic2 size={14} />
        {draft.voice}
      </p>

      <div className={`safety-gate${showChecks ? ' is-open' : ''}`}>
        <p className="gate-head">
          <ShieldCheck size={15} />
          Safety-гейт {showChecks ? (allPass ? '· пройден' : '· на ревизии') : '· проверка…'}
          {showChecks && draft.intercepted > 0 && <span className="gate-count">перехвачено: {draft.intercepted}</span>}
        </p>
        {showChecks && (
          <ul className="gate-checks">
            {draft.checks.map((check, index) => (
              <motion.li
                key={check.tag}
                className={check.passed ? 'is-pass' : 'is-revise'}
                initial={reduce ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reduce ? 0 : 0.12 * index, duration: 0.3 }}
              >
                {check.passed ? <Check size={13} strokeWidth={3} /> : <AlertTriangle size={13} />}
                {check.label}
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      <div className="output-foot">
        <span className="care-note">{draft.care}</span>
        <button className="copy-btn" onClick={copyDraft} disabled={phase !== 'done'}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'скопировано' : 'скопировать'}
        </button>
      </div>
    </motion.div>
  )
}

function Control({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="control">
      <label>
        {icon}
        {label}
      </label>
      {children}
    </div>
  )
}
