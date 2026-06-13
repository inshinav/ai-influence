import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Cpu,
  Eye,
  Film,
  FlaskConical,
  Gauge,
  HeartHandshake,
  Layers3,
  LineChart,
  Megaphone,
  Mic2,
  MonitorSmartphone,
  Network,
  Pause,
  Play,
  Radio,
  RefreshCw,
  ScanLine,
  Send,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  UserRound,
  Wand2,
  Workflow,
  Zap,
} from 'lucide-react'
import {
  clips,
  creatorEconomics,
  dashboard,
  ethics,
  formats,
  hypotheses,
  infrastructure,
  personas,
  pipelineSteps,
  roadmap,
  topics,
} from './data/aiFarm'
import type { Clip, FormatId, Persona, PersonaId, TopicId } from './data/aiFarm'

type AccentStyle = CSSProperties & {
  '--accent'?: string
  '--glow'?: string
  '--delay'?: string
  '--node-x'?: string
  '--node-y'?: string
}

const topicIds = Object.keys(topics) as TopicId[]
const formatIds = Object.keys(formats) as FormatId[]

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: 'easeOut' },
} as const

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function personaById(id: PersonaId) {
  return personas.find((persona) => persona.id === id) ?? personas[0]
}

function topicName(id: TopicId) {
  return topics[id].name
}

function formatName(id: FormatId) {
  return formats[id].name
}

function publicExamplePath(fileName: string) {
  return `${import.meta.env.BASE_URL}examples/${fileName}`
}

function SectionIntro({
  kicker,
  title,
  text,
  align = 'left',
}: {
  kicker: string
  title: string
  text: string
  align?: 'left' | 'center'
}) {
  return (
    <motion.div className={cx('section-intro', align === 'center' && 'section-intro-center')} {...reveal}>
      <p className="kicker">{kicker}</p>
      <h2>{title}</h2>
      <p>{text}</p>
    </motion.div>
  )
}

function Header() {
  const links = [
    ['Сеть', '#network'],
    ['Ролики', '#feed'],
    ['Pipeline', '#pipeline'],
    ['Консоль', '#console'],
    ['Этика', '#ethics'],
  ]

  return (
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Я-Ферма">
        <span className="brand-mark">Я</span>
        <span>
          <strong>Я-Ферма</strong>
          <small>concept for Ясно</small>
        </span>
      </a>
      <nav aria-label="Навигация по концепту">
        {links.map(([label, href]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </nav>
      <a className="topbar-action" href="#console">
        <Sparkles size={16} />
        Симуляция
      </a>
    </header>
  )
}

function HeroPhones() {
  const heroClips = clips.slice(0, 3)

  return (
    <div className="hero-visual" aria-label="Симуляция AI creator operating system">
      <div className="signal-ribbon">
        <Radio size={16} />
        <span>creator OS live simulation</span>
      </div>
      <div className="phone-stack">
        {heroClips.map((clip, index) => {
          const persona = personaById(clip.personaId)
          return (
            <motion.div
              className="hero-phone"
              key={clip.id}
              style={{ '--accent': persona.color, '--glow': persona.glow, '--delay': `${index * 0.16}s` } as AccentStyle}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5 + index, repeat: Infinity, ease: 'easeInOut', delay: index * 0.4 }}
            >
              <div className="hero-phone-top">
                <span>{persona.handle}</span>
                <span>AI</span>
              </div>
              <div className="hero-video-shape">
                <span>{topicName(clip.topic)}</span>
                <strong>{clip.hook}</strong>
              </div>
              <div className="hero-phone-metrics">
                <span>{clip.metrics.retention} досмотр</span>
                <span>{clip.metrics.saves} save</span>
              </div>
            </motion.div>
          )
        })}
      </div>
      <div className="hero-network">
        {personas.map((persona, index) => (
          <motion.span
            key={persona.id}
            className="network-dot"
            style={{ '--accent': persona.color, '--delay': `${index * 0.12}s` } as AccentStyle}
            animate={{ scale: [1, 1.12, 1], opacity: [0.68, 1, 0.68] }}
            transition={{ duration: 3.2, repeat: Infinity, delay: index * 0.25 }}
          >
            {persona.name.slice(0, 1)}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="hero-section" id="top">
      <div className="hero-bg" />
      <div className="container hero-grid">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="kicker">экспериментальный digital experience</p>
          <h1>Я-Ферма: AI creator OS для бережного роста Ясно</h1>
          <p className="hero-lead">
            Концепт собственной сети AI-инфлюенсеров, которые публикуют вертикальный контент о тревоге,
            отношениях, выгорании, самооценке и мягко переводят релевантную аудиторию на сайт Ясно.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#console">
              <Wand2 size={18} />
              Собрать ролик
            </a>
            <a className="secondary-action" href="#pipeline">
              <Workflow size={18} />
              Смотреть pipeline
            </a>
          </div>
          <div className="trust-notes" aria-label="Этические ограничения">
            <span>концепт, не официальный сайт</span>
            <span>AI-персонажи не психологи</span>
            <span>TikTok - growth-гипотеза для проверки</span>
          </div>
        </motion.div>
        <HeroPhones />
      </div>
      <div className="domain-strip">
        <span>target deploy</span>
        <strong>https://inshinlab.com/ai-influence</strong>
        <span>premium therapy-tech prototype</span>
      </div>
    </section>
  )
}

function NetworkSection() {
  const [activeId, setActiveId] = useState<PersonaId>('mira')
  const active = personaById(activeId)

  return (
    <section className="section network-section" id="network">
      <div className="container">
        <SectionIntro
          kicker="01 / сеть авторов"
          title="Не один маскот, а портфель AI-медиа-активов"
          text="Каждый персонаж имеет собственный голос, темы, визуальный язык, форматы и safety-границы. Их можно развивать как редакцию, а не как рекламный креатив."
        />
        <div className="network-layout">
          <motion.div className="creator-map surface" {...reveal}>
            <div className="map-lines" />
            {personas.map((persona, index) => (
              <button
                className={cx('creator-node', activeId === persona.id && 'creator-node-active')}
                key={persona.id}
                style={
                  {
                    '--accent': persona.color,
                    '--glow': persona.glow,
                    '--node-x': `${16 + (index % 3) * 32}%`,
                    '--node-y': `${18 + Math.floor(index / 3) * 42}%`,
                  } as AccentStyle
                }
                onClick={() => setActiveId(persona.id)}
              >
                <span>{persona.name.slice(0, 1)}</span>
                <strong>{persona.name}</strong>
                <small>{persona.label}</small>
              </button>
            ))}
          </motion.div>
          <motion.div
            className="creator-detail surface"
            key={active.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            style={{ '--accent': active.color, '--glow': active.glow } as AccentStyle}
          >
            <div className="creator-portrait">
              <div className="portrait-core">
                <span>{active.name.slice(0, 1)}</span>
              </div>
              <div className="portrait-label">
                <strong>{active.handle}</strong>
                <span>{active.disclosure}</span>
              </div>
            </div>
            <div className="creator-copy">
              <p className="kicker">{active.label}</p>
              <h3>{active.name}, {active.age}</h3>
              <p>{active.story}</p>
            </div>
            <div className="creator-specs">
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
                  {topicName(topic)}
                </span>
              ))}
            </div>
            <div className="trait-grid">
              {active.traits.map((trait) => (
                <span key={trait}>
                  <Check size={14} />
                  {trait}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function VideoSurface({ clip }: { clip: Clip }) {
  const [videoState, setVideoState] = useState({ clipId: clip.id, failed: false })
  const persona = personaById(clip.personaId)
  const failed = videoState.clipId === clip.id ? videoState.failed : false

  return (
    <div className="phone-frame" style={{ '--accent': persona.color, '--glow': persona.glow } as AccentStyle}>
      <div className="phone-status">
        <span>{persona.handle}</span>
        <span>AI label</span>
      </div>
      <div className="video-canvas">
        {!failed && (
          <video
            key={clip.id}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            onError={() => setVideoState({ clipId: clip.id, failed: true })}
            src={publicExamplePath(clip.videoFile)}
          />
        )}
        <div className={cx('simulated-video', !failed && 'simulated-video-under')}>
          <div className="video-noise" />
          <span className="video-topic">{topicName(clip.topic)}</span>
          <strong>{clip.hook}</strong>
          <p>{clip.beats[1]}</p>
        </div>
      </div>
      <div className="phone-caption">
        <span>{formatName(clip.format)}</span>
        <span>{clip.metrics.retention}</span>
        <span>{clip.metrics.saves}</span>
      </div>
    </div>
  )
}

function FeedSection() {
  const [activeClipId, setActiveClipId] = useState(clips[0].id)
  const activeClip = clips.find((clip) => clip.id === activeClipId) ?? clips[0]
  const activePersona = personaById(activeClip.personaId)

  return (
    <section className="section feed-section" id="feed">
      <div className="container">
        <SectionIntro
          kicker="02 / вертикальная лента"
          title="Ролики как редакционные гипотезы, а не одноразовые объявления"
          text="Лента показывает, как контент может выглядеть до подключения реальных API. Если положить свои MP4 в public/examples с теми же именами, телефонные превью автоматически начнут проигрывать видео."
        />
        <div className="feed-layout">
          <motion.div className="feed-phone-zone" {...reveal}>
            <VideoSurface clip={activeClip} />
          </motion.div>
          <motion.div className="clip-console surface" {...reveal}>
            <div className="console-header">
              <span>
                <Film size={18} />
                test feed
              </span>
              <strong>{activePersona.name}</strong>
            </div>
            <div className="clip-list">
              {clips.map((clip) => {
                const persona = personaById(clip.personaId)
                return (
                  <button
                    className={cx('clip-row', activeClip.id === clip.id && 'clip-row-active')}
                    key={clip.id}
                    onClick={() => setActiveClipId(clip.id)}
                    style={{ '--accent': persona.color, '--glow': persona.glow } as AccentStyle}
                  >
                    <span className="clip-avatar">{persona.name.slice(0, 1)}</span>
                    <span>
                      <strong>{clip.title}</strong>
                      <small>
                        {topicName(clip.topic)} / {formatName(clip.format)}
                      </small>
                    </span>
                    <ChevronRight size={18} />
                  </button>
                )
              })}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                className="clip-brief"
                key={activeClip.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <p className="kicker">script card</p>
                <h3>{activeClip.title}</h3>
                <p>{activeClip.caption}</p>
                <div className="brief-steps">
                  {activeClip.beats.map((beat) => (
                    <span key={beat}>{beat}</span>
                  ))}
                </div>
                <div className="metric-line">
                  <span>Retention {activeClip.metrics.retention}</span>
                  <span>Saves {activeClip.metrics.saves}</span>
                  <span>CTR {activeClip.metrics.click}</span>
                </div>
                <div className="safety-note">
                  <ShieldCheck size={16} />
                  {activeClip.safety}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function PipelineSection() {
  const [active, setActive] = useState(0)
  const step = pipelineSteps[active]

  return (
    <section className="section pipeline-section" id="pipeline">
      <div className="container">
        <SectionIntro
          kicker="03 / production pipeline"
          title="От телефона до аналитики: операционная система, которую можно масштабировать"
          text="В MVP все функции работают как качественная локальная симуляция. Архитектура уже показывает, где будут подключаться реальные генераторы, scheduler, safety-модуль и dashboard."
        />
        <div className="pipeline-shell">
          <motion.div className="pipeline-rail surface" {...reveal}>
            {pipelineSteps.map((pipelineStep, index) => (
              <button
                key={pipelineStep.title}
                className={cx('pipeline-step', active === index && 'pipeline-step-active')}
                onClick={() => setActive(index)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{pipelineStep.title}</strong>
                <small>{pipelineStep.short}</small>
              </button>
            ))}
          </motion.div>
          <motion.div className="pipeline-detail surface" {...reveal}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.28 }}
              >
                <div className="detail-topline">
                  <span>
                    <Workflow size={18} />
                    step {active + 1} / {pipelineSteps.length}
                  </span>
                  <span>{step.short}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
                <div className="output-grid">
                  <div>
                    <span>Output</span>
                    <strong>{step.output}</strong>
                  </div>
                  <div>
                    <span>Safety gate</span>
                    <strong>{step.check}</strong>
                  </div>
                </div>
                <div className="automation-log" aria-label="Лог автоматизации">
                  <p>
                    <Cpu size={16} />
                    local simulator
                  </p>
                  <span>trend.brief.generated</span>
                  <span>script.variant.b.ready</span>
                  <span>safety.review.waiting</span>
                  <span>analytics.loop.updated</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function buildConsoleResult(persona: Persona, topic: TopicId, format: FormatId, version: number) {
  const topicData = topics[topic]
  const formatData = formats[format]
  const hookOptions = [
    `Если ${topicData.name.toLowerCase()} звучит внутри слишком громко, начни не с решения, а с одного честного наблюдения.`,
    `POV: ты не обязан превращать ${topicData.name.toLowerCase()} в проект на всю жизнь прямо сегодня.`,
    `Фраза, которая не лечит ${topicData.name.toLowerCase()}, но помогает не остаться с этим один на один.`,
  ]
  const visualOptions = [
    `первый кадр в стиле "${persona.theme}", крупный текст, много воздуха`,
    `тихий бытовой кадр, на экране только одна фраза и AI-label`,
    `split-screen: внутренний голос, спокойная альтернатива, мягкий CTA`,
  ]

  return {
    title: `${persona.name}: ${topicData.name} / ${formatData.name}`,
    hook: hookOptions[version % hookOptions.length],
    script: [
      `0-3 сек: узнаваемая сцена, ${visualOptions[version % visualOptions.length]}.`,
      `4-14 сек: ${persona.voice} тон, ${formatData.pattern}.`,
      `15-24 сек: микро-поворот без обещания результата: "можно попробовать заметить, что именно сейчас тяжелее всего".`,
      'финал: "Если это повторяется, с этим можно прийти к специалисту на Ясно".',
    ],
    voice: `Голос: ${persona.voice}. Длина: ${formatData.length}.`,
    safety: topicData.care,
  }
}

function ConsoleSection() {
  const [personaId, setPersonaId] = useState<PersonaId>('mira')
  const [topicId, setTopicId] = useState<TopicId>('anxiety')
  const [formatId, setFormatId] = useState<FormatId>('micro-practice')
  const [version, setVersion] = useState(0)

  const persona = personaById(personaId)
  const result = useMemo(
    () => buildConsoleResult(persona, topicId, formatId, version),
    [formatId, persona, topicId, version],
  )

  return (
    <section className="section console-section" id="console">
      <div className="container">
        <SectionIntro
          kicker="04 / AI-консоль"
          title="Выберите автора, тему и формат - система соберет пример ролика"
          text="Это локальная симуляция без внешних API: достаточно заменить данные, подключить свои видео в public/examples или позже добавить реальные модели генерации."
        />
        <motion.div className="creator-console" {...reveal}>
          <div className="console-controls surface">
            <div className="control-block">
              <label>
                <UserRound size={16} />
                Персонаж
              </label>
              <div className="segmented-grid">
                {personas.map((option) => (
                  <button
                    className={cx(option.id === personaId && 'selected')}
                    key={option.id}
                    onClick={() => setPersonaId(option.id)}
                    style={{ '--accent': option.color, '--glow': option.glow } as AccentStyle}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="control-block">
              <label>
                <HeartHandshake size={16} />
                Тема
              </label>
              <div className="segmented-grid">
                {topicIds.map((topic) => (
                  <button
                    className={cx(topic === topicId && 'selected')}
                    key={topic}
                    onClick={() => setTopicId(topic)}
                  >
                    {topics[topic].name}
                  </button>
                ))}
              </div>
            </div>
            <div className="control-block">
              <label>
                <SlidersHorizontal size={16} />
                Формат
              </label>
              <div className="segmented-grid">
                {formatIds.map((format) => (
                  <button
                    className={cx(format === formatId && 'selected')}
                    key={format}
                    onClick={() => setFormatId(format)}
                  >
                    {formats[format].name}
                  </button>
                ))}
              </div>
            </div>
            <button className="generate-button" onClick={() => setVersion((current) => current + 1)}>
              <RefreshCw size={18} />
              Перегенерировать пример
            </button>
          </div>
          <div className="console-output surface" style={{ '--accent': persona.color, '--glow': persona.glow } as AccentStyle}>
            <div className="output-header">
              <span>
                <Sparkles size={18} />
                draft generated locally
              </span>
              <span>{persona.disclosure}</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${personaId}-${topicId}-${formatId}-${version}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <h3>{result.title}</h3>
                <div className="hook-card">
                  <span>Hook</span>
                  <strong>{result.hook}</strong>
                </div>
                <div className="script-list">
                  {result.script.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                <div className="output-footer">
                  <span>
                    <Mic2 size={15} />
                    {result.voice}
                  </span>
                  <span>
                    <ShieldCheck size={15} />
                    {result.safety}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function InfrastructureSection() {
  return (
    <section className="section infrastructure-section" id="infra">
      <div className="container">
        <SectionIntro
          kicker="05 / аккаунты и устройства"
          title="Ферма не про хаос, а про дисциплину медиа-операций"
          text="У каждого устройства, аккаунта и персонажа есть роль, лимит, расписание, история публикаций и состояние safety-проверок."
        />
        <div className="infra-layout">
          <motion.div className="device-rack surface" {...reveal}>
            {Array.from({ length: 12 }).map((_, index) => (
              <span className={index % 4 === 0 ? 'device-active' : ''} key={index}>
                <Smartphone size={22} />
                <small>{String(index + 1).padStart(2, '0')}</small>
              </span>
            ))}
          </motion.div>
          <motion.div className="infra-grid" {...reveal}>
            {infrastructure.map((item, index) => (
              <div className="infra-tile surface" key={item.title}>
                <span className="tile-index">0{index + 1}</span>
                <strong>{item.value}</strong>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function HypothesesSection() {
  const [active, setActive] = useState(0)
  const hypothesis = hypotheses[active]

  return (
    <section className="section hypotheses-section" id="hypotheses">
      <div className="container">
        <SectionIntro
          kicker="06 / форматы и гипотезы"
          title="Тестируем не громкость, а качество узнавания"
          text="Система собирает разные форматы контента и смотрит на сигналы зрелого интереса: сохранения, досмотры, вопросы и повторные касания."
        />
        <div className="hypothesis-layout">
          <motion.div className="format-matrix surface" {...reveal}>
            {formatIds.map((format) => (
              <div className="format-row" key={format}>
                <span>{formats[format].name}</span>
                <strong>{formats[format].pattern}</strong>
                <small>{formats[format].length}</small>
              </div>
            ))}
          </motion.div>
          <motion.div className="hypothesis-panel surface" {...reveal}>
            <div className="hypothesis-tabs">
              {hypotheses.map((item, index) => (
                <button className={cx(active === index && 'selected')} key={item.title} onClick={() => setActive(index)}>
                  {index + 1}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={hypothesis.title}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.25 }}
              >
                <p className="kicker">growth hypothesis</p>
                <h3>{hypothesis.title}</h3>
                <div className="hypothesis-copy">
                  <p>
                    <strong>Ставка:</strong> {hypothesis.bet}
                  </p>
                  <p>
                    <strong>Сигнал:</strong> {hypothesis.signal}
                  </p>
                  <p>
                    <strong>Риск:</strong> {hypothesis.risk}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function EconomicsSection() {
  return (
    <section className="section economics-section" id="economics">
      <div className="container">
        <SectionIntro
          kicker="07 / экономика внимания"
          title="Интеграция у блогера покупает всплеск. AI-медиа-актив копит систему."
          text="Идея не отменяет рекламу у авторов, но добавляет собственный управляемый слой роста, где каждая публикация остается в контуре Ясно."
          align="center"
        />
        <motion.div className="comparison-board" {...reveal}>
          <div className="comparison-column muted">
            <div className="comparison-head">
              <Megaphone size={22} />
              <h3>Закупка у блогеров</h3>
            </div>
            {creatorEconomics.blogger.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
          <div className="comparison-divider">
            <ArrowRight size={26} />
          </div>
          <div className="comparison-column accent">
            <div className="comparison-head">
              <Network size={22} />
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

function DashboardSection() {
  return (
    <section className="section dashboard-section" id="roadmap">
      <div className="container">
        <SectionIntro
          kicker="08 / roadmap и mock-dashboard"
          title="Пилот можно запустить как управляемый learning loop"
          text="Метрики ниже - демонстрационные. Они показывают, какие панели понадобятся для решения: продолжать, менять персонажа, усиливать формат или остановить гипотезу."
        />
        <div className="dashboard-layout">
          <motion.div className="metric-dashboard surface" {...reveal}>
            <div className="dashboard-top">
              <span>
                <LineChart size={18} />
                pilot dashboard
              </span>
              <span>mock data</span>
            </div>
            <div className="metric-grid">
              {dashboard.map((metric) => (
                <div className="metric-tile" key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <small>{metric.delta}</small>
                </div>
              ))}
            </div>
            <div className="chart-sim" aria-label="Симуляция графика">
              {[42, 58, 51, 68, 62, 74, 70, 82, 76, 88].map((value, index) => (
                <span key={`${value}-${index}`} style={{ height: `${value}%` }} />
              ))}
            </div>
          </motion.div>
          <motion.div className="roadmap-list" {...reveal}>
            {roadmap.map((item) => (
              <div className="roadmap-item surface" key={item.phase}>
                <span>{item.phase}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.period}</small>
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function EthicsSection() {
  return (
    <section className="section ethics-section" id="ethics">
      <div className="container">
        <SectionIntro
          kicker="09 / этика mental health AI"
          title="Вау-эффект не должен превращаться в давление"
          text="Правила встроены прямо в продуктовую логику: от профиля персонажа до safety-проверки перед публикацией и аналитики после."
          align="center"
        />
        <motion.div className="ethics-board" {...reveal}>
          {ethics.map((rule, index) => (
            <div className="ethics-rule" key={rule}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{rule}</p>
            </div>
          ))}
        </motion.div>
        <motion.div className="final-panel" {...reveal}>
          <div>
            <p className="kicker">ready for pilot</p>
            <h2>Следующий шаг - заменить mock-данные реальными роликами и проверить TikTok-гипотезу на малом пилоте.</h2>
          </div>
          <a className="primary-action" href="#console">
            <Sparkles size={18} />
            Вернуться в консоль
          </a>
        </motion.div>
      </div>
    </section>
  )
}

function SystemBar() {
  return (
    <div className="system-bar" aria-label="Сводка системы">
      <span>
        <Activity size={16} />
        6 AI creators
      </span>
      <span>
        <MonitorSmartphone size={16} />
        12 devices
      </span>
      <span>
        <ShieldCheck size={16} />
        safety before post
      </span>
      <span>
        <Gauge size={16} />
        learning loop
      </span>
    </div>
  )
}

function FloatingTools() {
  const tools = [
    [Play, 'draft'],
    [ScanLine, 'safety'],
    [BarChart3, 'analytics'],
    [Send, 'publish'],
    [Pause, 'hold'],
    [Eye, 'review'],
    [Layers3, 'vault'],
    [Server, 'infra'],
    [FlaskConical, 'test'],
    [Zap, 'trend'],
  ] as const

  return (
    <div className="floating-tools" aria-hidden="true">
      {tools.map(([Icon, label], index) => (
        <span key={label} style={{ '--delay': `${index * 0.08}s` } as AccentStyle}>
          <Icon size={15} />
        </span>
      ))}
    </div>
  )
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <SystemBar />
        <NetworkSection />
        <FeedSection />
        <PipelineSection />
        <ConsoleSection />
        <InfrastructureSection />
        <HypothesesSection />
        <EconomicsSection />
        <DashboardSection />
        <EthicsSection />
      </main>
      <FloatingTools />
    </>
  )
}
