import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CareProvider } from './care/CareContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CareProvider>
      <App />
    </CareProvider>
  </StrictMode>,
)
