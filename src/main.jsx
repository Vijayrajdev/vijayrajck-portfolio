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

    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return true
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = String(
      info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    )
    return /swiftshader|llvmpipe|softpipe|software|basic render driver/i.test(renderer)
  } catch {
    return false
  }
}

if (backdropFilterUnavailable()) {
  document.documentElement.classList.add('no-backdrop')
}

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
