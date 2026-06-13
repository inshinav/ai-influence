import { Header } from './components/Header'
import { ScrollProgress } from './components/ScrollProgress'
import { Hero } from './components/Hero'
import { SystemBar } from './components/SystemBar'
import { SignalBoard } from './components/SignalBoard'
import { ViewerScene } from './components/ViewerScene'
import { NetworkSection } from './components/NetworkSection'
import { FeedSection } from './components/FeedSection'
import { PipelineSection } from './components/PipelineSection'
import { ConsoleSection } from './components/ConsoleSection'
import { InfrastructureSection } from './components/InfrastructureSection'
import { HypothesesSection } from './components/HypothesesSection'
import { EconomicsSection } from './components/EconomicsSection'
import { DashboardSection } from './components/DashboardSection'
import { EthicsSection } from './components/EthicsSection'
import { FinalCTA } from './components/FinalCTA'

// Драматургия скролла: человек → авторы → лента → конвейер → консоль →
// операции → гипотезы → экономика → дашборд → этика → следующий ход.
export default function App() {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        <SystemBar />
        <SignalBoard />
        <ViewerScene />
        <NetworkSection />
        <FeedSection />
        <PipelineSection />
        <ConsoleSection />
        <InfrastructureSection />
        <HypothesesSection />
        <EconomicsSection />
        <DashboardSection />
        <EthicsSection />
        <FinalCTA />
      </main>
    </>
  )
}
