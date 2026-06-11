import { useState } from 'react'
import { Download } from 'lucide-react'
import { DAWN, phaseForHour, resolveHour, type DawnPhase } from '../lib/dawn'
import { therapists } from '../data/therapists'
import { rankTherapists } from '../lib/matching'
import { emptyAnswers, type QuizAnswers } from '../types'
import ClearingSection from '../clearing/ClearingSection'
import SupportScreen from '../clearing/SupportScreen'
import { downloadResultCard } from '../clearing/ResultCard'
import BreathWidget from '../components/BreathWidget'
import BreathScene from '../breath/BreathScene'
import DawnBackdrop from '../components/DawnBackdrop'
import Results from '../quiz/Results'
import CarePanel from '../care/CarePanel'

const PHASES: DawnPhase[] = ['predawn', 'morning', 'day', 'sunset', 'night']
const HOUR_LINKS = [4, 6, 8, 13, 19, 23]

/** Мок-ответы для блока «Результаты подбора» — чистые данные, без хуков */
const SAMPLE_ANSWERS: QuizAnswers = {
  ...emptyAnswers,
  format: 'individual',
  topics: ['anxiety'],
  duration: 'year',
  hadTherapy: false,
  gender: 'any',
  method: 'any',
  schedule: ['evening'],
}

const SAMPLE_RANKED = rankTherapists(therapists, SAMPLE_ANSWERS)

function QABlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-12">
      <div className="container-x">
        <h2 className="font-display text-2xl">{title}</h2>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  )
}

/** Внутренняя QA-страница: все состояния новых компонентов на одном экране */
export default function QAPage() {
  const [sceneOpen, setSceneOpen] = useState(false)
  const hour = resolveHour()

  return (
    <main className="pb-24">
      <div className="container-x pt-10">
        <p className="eyebrow">Внутренняя страница</p>
        <h1 className="mt-2 font-display text-4xl">QA: состояния компонентов</h1>
        <p className="mt-3 max-w-xl text-ink-soft">
          {'Аудит новых поверхностей системы «Станет ясно». На проде этой страницы нет — это инструмент проверки.'}
        </p>
      </div>

      <QABlock title="Adaptive Dawn — все 5 фаз">
        <p className="text-[14.5px] text-ink-soft">
          Сейчас: час {hour}, фаза «{DAWN[phaseForHour(hour)].label}». Форсировать:{' '}
          {HOUR_LINKS.map((h) => (
            <a key={h} className="mr-2 underline underline-offset-4" href={`?hour=${h}`}>
              ?hour={h}
            </a>
          ))}
          <a
            className="underline underline-offset-4"
            href={`${import.meta.env.BASE_URL}?hour=${hour === 23 ? 8 : 23}`}
          >
            (посмотреть в hero)
          </a>
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PHASES.map((phase) => {
            const p = DAWN[phase]
            return (
              <div key={phase} className="card overflow-hidden">
                <div
                  className="relative h-28"
                  style={{
                    background: `radial-gradient(70% 80% at 25% 30%, ${p.blobs[0]}, transparent 70%), radial-gradient(70% 80% at 80% 25%, ${p.blobs[1]}, transparent 70%), radial-gradient(80% 80% at 55% 85%, ${p.blobs[2]}, transparent 70%), var(--paper)`,
                  }}
                >
                  <div className="absolute inset-0" style={{ background: p.veil }} />
                </div>
                <div className="p-3">
                  <p className="text-[13px] font-semibold">{p.label}</p>
                  <p className="mt-1 min-h-8 text-[12px] text-ink-soft">{p.heroLine ?? '— без строки-настроения'}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="card relative mt-5 h-64 overflow-hidden">
          <DawnBackdrop />
          <p className="absolute bottom-3 left-4 text-[13px] text-ink-soft">
            Живой DawnBackdrop (фаза по текущему часу / ?hour=)
          </p>
        </div>
      </QABlock>

      <QABlock title="«Расчистка» — живой тест (оба результата достижимы ответами)">
        <ClearingSection onOpenQuiz={(topic) => window.alert(`Открыли бы квиз с темой: ${topic}`)} />
      </QABlock>

      <QABlock title="«Расчистка» — ветка тяжёлого состояния (прямой рендер)">
        <div className="card max-w-2xl p-6 md:p-8">
          <SupportScreen
            testId="anxiety-test"
            onFindTherapist={() => window.alert('Открыли бы квиз')}
          />
        </div>
      </QABlock>

      <QABlock title="Карточка результата (PNG, генерация на клиенте)">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            void downloadResultCard({
              testName: 'Уровень тревоги',
              title: 'Повышенный уровень тревоги',
              text: 'Похоже, тревога занимает в вашей жизни заметное место. Это не диагноз — но тревога, которая мешает жить, хорошо поддаётся терапии.',
              fileName: 'yasno-qa-card',
            })
          }}
        >
          <Download size={16} aria-hidden />
          Скачать тестовую карточку
        </button>
      </QABlock>

      <QABlock title="Момент тишины — виджет и полноэкранная сцена">
        <button type="button" className="btn-secondary mb-6" onClick={() => setSceneOpen(true)}>
          Открыть полноэкранную сцену напрямую
        </button>
        {sceneOpen && <BreathScene onClose={() => setSceneOpen(false)} />}
        <div className="card overflow-hidden">
          <BreathWidget onOpenQuiz={() => window.alert('Открыли бы квиз')} />
        </div>
      </QABlock>

      <QABlock title="Результаты подбора — цитаты из ответов + проявление из тумана">
        <p className="mb-4 text-[14.5px] text-ink-soft">
          Мок-ответы: тревога · вечером · впервые в терапии · больше года. Проверяйте
          разные строки-цитаты на трёх карточках и отсутствие 100%.
        </p>
        <Results
          ranked={SAMPLE_RANKED}
          answers={SAMPLE_ANSWERS}
          onPick={(t) => window.alert(`Выбрали бы время у: ${t.name}`)}
          onEdit={() => window.alert('Вернулись бы к ответам')}
        />
      </QABlock>

      <QABlock title="Панель заботы">
        <p className="text-[14.5px] text-ink-soft">
          Плавающая кнопка — слева внизу. Проверьте: тихий режим глушит марку и дыхание,
          контраст меняет цвета текста, «крупнее текст» масштабирует, состояние переживает
          перезагрузку.
        </p>
      </QABlock>

      <CarePanel />
    </main>
  )
}
