import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import type { QuizLaunch, Therapist, TopicId } from './types'
import Header from './components/Header'
import Hero from './components/Hero'
import BigStat from './components/BigStat'
import PressMarquee from './components/PressMarquee'
import HowItWorks from './components/HowItWorks'
import TherapistsSection from './components/TherapistsSection'
import BreathWidget from './components/BreathWidget'
import ClearingSection from './clearing/ClearingSection'
import SelectionFunnel from './components/SelectionFunnel'
import Pricing from './components/Pricing'
import Reviews from './components/Reviews'
import FAQ from './components/FAQ'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'
import StickyCTA from './components/StickyCTA'
import CarePanel from './care/CarePanel'

/** Квиз — самый тяжёлый кусок: грузим лениво, префетчим на idle, чтобы клик открывал мгновенно */
const QuizOverlay = lazy(() => import('./quiz/QuizOverlay'))
const prefetchQuiz = () => import('./quiz/QuizOverlay')

/**
 * Драматургия страницы — лестница уверенности: каждая секция снимает
 * конкретный страх (это не для меня → дорого → не поможет → сложно начать)
 * и заканчивается микро-входом в воронку.
 */
export default function App() {
  const [launch, setLaunch] = useState<QuizLaunch | null>(null)

  // Префетч квиза после первого пейнта — бандл лендинга остаётся лёгким
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number }
    if (w.requestIdleCallback) w.requestIdleCallback(() => void prefetchQuiz())
    else window.setTimeout(() => void prefetchQuiz(), 1500)
  }, [])

  const openQuiz = useCallback((source: string, topic?: TopicId) => {
    setLaunch({ kind: 'quiz', topic, source })
  }, [])

  const bookTherapist = useCallback((therapist: Therapist) => {
    setLaunch({ kind: 'book', therapist, source: 'therapist_card' })
  }, [])

  return (
    <>
      <Header onOpenQuiz={() => openQuiz('header')} />
      <main>
        {/* Страх «это не для меня»: эмоциональное узнавание + мгновенный вход */}
        <Hero onOpenQuiz={(topic) => openQuiz(topic ? 'hero_chip' : 'hero', topic)} />
        {/* «Я один такой»: живое доказательство масштаба */}
        <BigStat />
        <PressMarquee />
        {/* «Сложно начать»: подбор за 2 минуты, видно до регистрации */}
        <HowItWorks />
        {/* «Не уверен, с чего начать» — ДО каталога: сперва помогаем понять себя */}
        <ClearingSection onOpenQuiz={(topic) => openQuiz('clearing_test', topic)} />
        {/* «Кот в мешке»: открытые анкеты до записи */}
        <TherapistsSection onBook={bookTherapist} onOpenQuiz={() => openQuiz('therapists_cta')} />
        {/* «Дорого» и «не поможет»: прозрачность отбора и цены — единый акт доверия */}
        <SelectionFunnel />
        <Pricing onOpenQuiz={() => openQuiz('pricing_cta')} />
        {/* «Не поможет»: живые истории результата */}
        <Reviews onOpenQuiz={() => openQuiz('reviews_cta')} />
        {/* Декомпрессия перед решением: почувствовать заботу телом */}
        <BreathWidget onOpenQuiz={() => openQuiz('breath_widget')} />
        <FAQ />
        {/* Пик уверенности: лёгкий быстрый старт */}
        <FinalCTA onOpenQuiz={() => openQuiz('final_cta')} />
      </main>
      <Footer />
      <StickyCTA hidden={launch !== null} onOpenQuiz={() => openQuiz('sticky_cta')} />
      <CarePanel />
      <Suspense fallback={null}>
        <QuizOverlay launch={launch} onClose={() => setLaunch(null)} />
      </Suspense>
    </>
  )
}
