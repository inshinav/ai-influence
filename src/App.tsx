import { useCallback, useState } from 'react'
import type { QuizLaunch, Therapist, TopicId } from './types'
import Header from './components/Header'
import Hero from './components/Hero'
import PressMarquee from './components/PressMarquee'
import HowItWorks from './components/HowItWorks'
import TherapistsSection from './components/TherapistsSection'
import BreathWidget from './components/BreathWidget'
import MiniTests from './components/MiniTests'
import Pricing from './components/Pricing'
import SelectionFunnel from './components/SelectionFunnel'
import Reviews from './components/Reviews'
import BigStat from './components/BigStat'
import FAQ from './components/FAQ'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'
import StickyCTA from './components/StickyCTA'
import QuizOverlay from './quiz/QuizOverlay'

export default function App() {
  const [launch, setLaunch] = useState<QuizLaunch | null>(null)

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
        <Hero onOpenQuiz={(topic) => openQuiz(topic ? 'hero_chip' : 'hero', topic)} />
        <PressMarquee />
        <HowItWorks />
        <TherapistsSection onBook={bookTherapist} />
        <BreathWidget onOpenQuiz={() => openQuiz('breath_widget')} />
        <MiniTests onOpenQuiz={(topic) => openQuiz('mini_test', topic)} />
        <Pricing />
        <SelectionFunnel />
        <Reviews />
        <BigStat onOpenQuiz={() => openQuiz('big_stat')} />
        <FAQ />
        <FinalCTA onOpenQuiz={() => openQuiz('final_cta')} />
      </main>
      <Footer />
      <StickyCTA hidden={launch !== null} onOpenQuiz={() => openQuiz('sticky_cta')} />
      <QuizOverlay launch={launch} onClose={() => setLaunch(null)} />
    </>
  )
}
