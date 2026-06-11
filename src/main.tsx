import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import QAPage from './qa/QAPage.tsx'
import { CareProvider } from './care/CareContext.tsx'

const isQA = window.location.pathname.replace(/\/+$/, '') === '/qa'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CareProvider>{isQA ? <QAPage /> : <App />}</CareProvider>
  </StrictMode>,
)
