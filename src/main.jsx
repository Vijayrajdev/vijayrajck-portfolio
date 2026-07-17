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
import { WEBGL_AVAILABLE } from './utils/capabilities.js'

// backdrop-filter needs GPU compositing: browsers with software rendering
// (blocklisted drivers, disabled hardware acceleration — common on Windows)
// silently skip it even though CSS.supports() says yes. Detect that case via
// the WebGL renderer string and switch the glass to its frost-plate emulation.
function backdropFilterUnavailable() {
  try {
    const supported =
      CSS.supports('backdrop-filter', 'blur(1px)') ||
      CSS.supports('-webkit-backdrop-filter', 'blur(1px)')
    if (!supported) return true
    if (!WEBGL_AVAILABLE) return false

    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return false
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = String(
      info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    )
    return /swiftshader|llvmpipe|softpipe|software|basic render driver/i.test(renderer)
  } catch {
    return false
  }
}

if (!WEBGL_AVAILABLE) document.documentElement.classList.add('no-webgl')
if (backdropFilterUnavailable()) document.documentElement.classList.add('no-backdrop')

// One-line diagnostic so remote debugging is possible: ask a visitor to open
// the console and read this.
console.info(
  `[vj-portfolio] webgl=${WEBGL_AVAILABLE} backdrop=${!document.documentElement.classList.contains('no-backdrop')}`,
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
