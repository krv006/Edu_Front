import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@livekit/components-styles'
import { AppProviders } from '@/app/providers'
import { AppRouter } from '@/app/router'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>,
)
