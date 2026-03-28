import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PlatformProvider } from './context/PlatformContext'
import { setupNativePushListeners } from './lib/capacitor-push'
import './index.css'
import App from './App'

// Set up native push listeners early (no-op on web)
setupNativePushListeners();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PlatformProvider>
        <App />
      </PlatformProvider>
    </BrowserRouter>
  </StrictMode>,
)

// Register service worker in production only (web PWA)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW registration failed:', err)
    })
  })
}
