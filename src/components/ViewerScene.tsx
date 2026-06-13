import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { ArrowUpRight, RotateCcw } from 'lucide-react'
import { personas, sections, topics, viewerScene } from '../data/aiFarm'
import { SectionIntro } from './SectionIntro'
import { Phone } from './Phone'

const mira = personas.find((p) => p.id === 'mira') ?? personas[0]
const BEAT_MS = 1700

// Человеческий якорь: как ферма выглядит с той стороны экрана. Зритель листает
// ленту ночью, цепляется за один ролик, чувствует, что про него — и появляется
// тихий мост к «Ясно». Без давления и обещаний (это и есть смысл сцены).
export function ViewerScene() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: false, amount: 0.4 })
  const [step, setStep] = useState(1)

  const total = viewerScene.beats.length
  // При reduce-motion показываем всю сцену сразу (derive), без setState в эффекте.
  const activeStep = reduce ? total : step

  useEffect(() => {
    if (reduce || !inView || step >= total) return
    const timer = setTimeout(() => setStep((value) => Math.min(total, value + 1)), BEAT_MS)
    return () => clearTimeout(timer)
  }, [inView, step, total, reduce])

  const revealed = viewerScene.beats.slice(0, activeStep)
  const lastFeed = [...revealed].reverse().find((beat) => beat.kind !== 'inner')
  const phoneHook = lastFeed?.text ?? 'лента «для тебя»'
  const phonePersona =
    personas.find((p) => p.id === (lastFeed?.personaId ?? mira.id)) ?? mira

  return (
    <section className="section viewer-section" id="viewer">
      <div className="container">
        <SectionIntro eyebrow={sections.viewer.eyebrow} title={sections.viewer.title} lead={sections.viewer.lead} />

        <div className="viewer-stage" ref={ref}>
          <motion.div
            className="viewer-phone"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Phone
              persona={phonePersona}
              hook={phoneHook}
              topicLabel={lastFeed ? topics.anxiety.name : undefined}
              time={viewerScene.time}
              metrics={{ retention: '61%', saves: '8,4%' }}
              size="lg"
              showRail={Boolean(lastFeed)}
            />
          </motion.div>

          <div className="viewer-thread">
            <div className="viewer-context">
              <span className="viewer-clock">{viewerScene.time}</span>
              {viewerScene.context}
            </div>

            <ol className="viewer-beats">
              <AnimatePresence initial={false}>
                {revealed.map((beat, index) => (
                  <motion.li
                    key={`${beat.kind}-${index}`}
                    className={`vbeat vbeat--${beat.kind}`}
                    initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {beat.kind === 'feed' && <span className="vbeat-tag">{phonePersona.handle}</span>}
                    {beat.kind === 'bridge' && (
                      <span className="vbeat-tag vbeat-tag--bridge">
                        мягкий переход <ArrowUpRight size={13} />
                      </span>
                    )}
                    <p>{beat.text}</p>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>

            <div className="viewer-foot">
              <p className="viewer-note">{viewerScene.note}</p>
              {step >= total && !reduce && (
                <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>
                  <RotateCcw size={15} />
                  Ещё раз
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
