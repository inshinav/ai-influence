import { press } from '../data/press'
import { useCalmMotion } from '../care/CareContext'

/** Стилизованные текстовые «логотипы» — без чужих графических знаков */
const STYLE: Record<string, string> = {
  Forbes: 'font-display font-bold',
  РБК: 'font-bold tracking-wide',
  'Афиша Daily': 'font-medium tracking-wide',
  'Т—Ж': 'font-extrabold',
  'Inc.': 'font-display font-semibold',
  'VC.ru': 'font-bold',
}

function PressRow({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-14 pr-14" aria-hidden={ariaHidden}>
      {press.map((name) => (
        <span key={name} className={`whitespace-nowrap text-xl text-ink-soft/80 ${STYLE[name] ?? ''}`}>
          {name}
        </span>
      ))}
    </div>
  )
}

export default function PressMarquee() {
  const reduced = useCalmMotion()

  return (
    <section className="border-y border-line bg-white/60 py-7">
      <div className="container-x flex items-center gap-8">
        <p className="eyebrow shrink-0">О нас пишут</p>
        {reduced ? (
          <div className="flex items-center gap-10 overflow-hidden">
            <PressRow />
          </div>
        ) : (
          <div className="press-wrap relative flex-1 overflow-hidden">
            <style>{`
              @keyframes press-marquee {
                from { transform: translateX(0); }
                to { transform: translateX(-50%); }
              }
              .press-track { animation: press-marquee 28s linear infinite; }
              .press-wrap:hover .press-track { animation-play-state: paused; }
            `}</style>
            <div className="press-track flex w-max">
              <PressRow />
              <PressRow ariaHidden />
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-paper to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-paper to-transparent" />
          </div>
        )}
      </div>
    </section>
  )
}
