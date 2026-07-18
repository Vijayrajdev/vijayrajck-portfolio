import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/orbitron/500.css'
import '@fontsource/orbitron/700.css'
import '@fontsource/orbitron/900.css'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/700.css'
import './index.css'
import App from './App.jsx'
import { APPLE_PLATFORM, FROST_GL, SOFTWARE_GL, WEBGL_AVAILABLE } from './utils/capabilities.js'

// backdrop-filter needs GPU compositing: browsers with software rendering
// (blocklisted drivers, disabled hardware acceleration — common on Windows)
// silently skip it even though CSS.supports() says yes.
function backdropFilterUnavailable() {
  try {
    const supported =
      CSS.supports('backdrop-filter', 'blur(1px)') ||
      CSS.supports('-webkit-backdrop-filter', 'blur(1px)')
    return !supported || (WEBGL_AVAILABLE && SOFTWARE_GL)
  } catch {
    return false
  }
}

if (!WEBGL_AVAILABLE) document.documentElement.classList.add('no-webgl')
if (backdropFilterUnavailable()) document.documentElement.classList.add('no-backdrop')

// Apple platforms render CSS backdrop blur reliably → original sheer glass.
// Other platforms with a real GPU → sheer glass too, with the blur rendered
// by FrostGL inside the background canvas instead of by the browser.
if (APPLE_PLATFORM) document.documentElement.classList.add('glass-sheer')
if (FROST_GL) document.documentElement.classList.add('frost-gl')

console.info(
  `[vj-portfolio] webgl=${WEBGL_AVAILABLE} frostgl=${FROST_GL} backdrop=${!document.documentElement.classList.contains('no-backdrop')}`,
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((err) => {
      console.warn('Service worker registration failed:', err)
    })
  })
}
