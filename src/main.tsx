import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import QAPage from './qa/QAPage.tsx'
import { CareProvider } from './care/CareContext.tsx'

// Срабатывает и в корне (/qa), и в подпапке (/yasno/qa)
const isQA = window.location.pathname.replace(/\/+$/, '').endsWith('/qa')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CareProvider>{isQA ? <QAPage /> : <App />}</CareProvider>
  </StrictMode>,
)
