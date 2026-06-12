import { motion } from 'motion/react'
import { Mic, MicOff, PhoneOff } from 'lucide-react'
import { SPRING, VIEWPORT_ONCE, reveal } from '../lib/motionPresets'
import { ScribbleArrow } from './Scribble'

/** Мини-мокап шага 1: превью квиза с чипами */
function PreviewQuiz() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-5">
      <div className="h-2.5 w-3/4 rounded-full bg-ink/15" />
      <div className="h-2.5 w-1/2 rounded-full bg-ink/10" />
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-medium text-paper">Тревога</span>
        <span className="rounded-full bg-paper px-2.5 py-1 text-[11px] text-ink-soft">Отношения</span>
        <span className="rounded-full bg-paper px-2.5 py-1 text-[11px] text-ink-soft">Сон</span>
      </div>
    </div>
  )
}

/** Мини-мокап шага 2: карточки психологов с процентом */
function PreviewMatches() {
  const rows = [
    { name: 'w-24', pct: '94%' },
    { name: 'w-20', pct: '91%' },
    { name: 'w-28', pct: '88%' },
  ]
  return (
    <div className="flex h-full flex-col justify-center gap-2 p-5">
      {rows.map((r) => (
        <div key={r.pct} className="flex items-center gap-2.5 rounded-xl bg-paper px-3 py-2">
          <span className="size-6 shrink-0 rounded-full bg-gradient-to-br from-sky/40 to-azure/40" />
          <span className={`h-2 rounded-full bg-ink/15 ${r.name}`} />
          <span className="ml-auto rounded-full bg-ok/10 px-2 py-0.5 text-[11px] font-semibold text-ok">
            {r.pct}
          </span>
        </div>
      ))}
    </div>
  )
}

/** Мини-мокап шага 3: окно видеозвонка */
function PreviewCall() {
  return (
    <div className="flex h-full items-center justify-center p-5">
      <div className="relative flex aspect-video w-full max-w-[210px] flex-col items-center justify-center rounded-xl bg-ink">
        <span className="size-10 rounded-full bg-gradient-to-br from-sky to-azure" />
        <div className="mt-3 flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-white/15 text-paper">
            <Mic size={10} aria-hidden />
          </span>
          <span className="flex size-5 items-center justify-center rounded-full bg-white/15 text-paper">
            <MicOff size={10} aria-hidden />
          </span>
          <span className="flex size-5 items-center justify-center rounded-full bg-peach/90 text-ink">
            <PhoneOff size={10} aria-hidden />
          </span>
        </div>
        <span className="glass absolute -bottom-2 right-3 rounded-md px-2 py-0.5 text-[11px] font-medium">
          50 минут
        </span>
      </div>
    </div>
  )
}

const STEPS = [
  {
    title: 'Расскажите о себе',
    text: '2 минуты и 6 простых вопросов — без регистрации.',
    preview: <PreviewQuiz />,
  },
  {
    title: 'Получите 3 совпадения',
    text: 'Покажем трёх подходящих специалистов и объясним, почему именно они.',
    preview: <PreviewMatches />,
  },
  {
    title: 'Встречайтесь онлайн',
    text: 'Видеосессия в защищённом кабинете — из любой точки.',
    preview: <PreviewCall />,
  },
]

export default function HowItWorks() {
  return (
    <section id="how" className="py-20 md:py-28">
      <div className="container-x">
        <motion.div initial="hidden" whileInView="show" viewport={VIEWPORT_ONCE} variants={reveal}>
          <p className="eyebrow">Как это работает</p>
          <h2 className="mt-3 text-4xl md:text-5xl">Три шага до первой сессии</h2>
        </motion.div>

        <div className="relative mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.article
              key={s.title}
              className="glass card-hover relative flex flex-col rounded-[20px] p-6"
              initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={VIEWPORT_ONCE}
              transition={{ ...SPRING, delay: i * 0.08 }}
            >
              <div className="h-40 overflow-hidden rounded-xl border border-line bg-mist/60">
                {s.preview}
              </div>
              <p className="mt-5 text-[13px] font-semibold text-ink-soft">Шаг {i + 1}</p>
              <h3 className="mt-1 text-xl">{s.title}</h3>
              <p className="mt-2 text-[15px] text-ink-soft">{s.text}</p>
              {/* Рукописная связка к следующему шагу — только на desktop */}
              {i < 2 && (
                <ScribbleArrow
                  className="absolute -right-12 top-16 z-10 hidden w-16 lg:block"
                  delay={i === 0 ? 400 : 700}
                />
              )}
            </motion.article>
          ))}
        </div>

        <p className="mt-10 text-center text-[15px] text-ink-soft">
          <span className="hand text-[21px]">без регистрации</span>
          {' до момента записи. Не подойдёт психолог — бесплатно заменим.'}
        </p>
      </div>
    </section>
  )
}
