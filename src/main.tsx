import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CareProvider } from './care/CareContext.tsx'

// QA-страница нужна единицам — не возим её в бандле лендинга
// eslint-disable-next-line react-refresh/only-export-components
const QAPage = lazy(() => import('./qa/QAPage.tsx'))

// Срабатывает и в корне (/qa), и в подпапке (/yasno/qa)
const isQA = window.location.pathname.replace(/\/+$/, '').endsWith('/qa')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CareProvider>
      {isQA ? (
        <Suspense fallback={null}>
          <QAPage />
        </Suspense>
      ) : (
        <App />
      )}
    </CareProvider>
  </StrictMode>,
)
