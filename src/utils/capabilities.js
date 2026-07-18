// Probed once at startup and shared by main.jsx and the 3D layer.

export const WEBGL_AVAILABLE = (() => {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
})()

// Apple platforms render CSS backdrop-filter reliably; elsewhere it silently
// fails on many GPU/driver configs.
export const APPLE_PLATFORM = /Mac|iPhone|iPad|iPod/.test(
  navigator.platform || navigator.userAgent,
)

// Software rasterizers (blocklisted GPU / disabled hardware acceleration)
// can run WebGL, but real-time post-processing there would crawl.
export const SOFTWARE_GL = (() => {
  if (!WEBGL_AVAILABLE) return true
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = String(
      info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    )
    return /swiftshader|llvmpipe|softpipe|software|basic render driver/i.test(renderer)
  } catch {
    return false
  }
})()

// WebGL-rendered frost: our own blur of the background scene, composited
// under every glass panel. Activated on non-Apple machines with a real GPU —
// the platforms where CSS backdrop-filter can't be trusted but WebGL can.
// ?frostgl=1 / ?frostgl=0 force it for debugging.
export const FROST_GL = (() => {
  try {
    const param = new URLSearchParams(window.location.search).get('frostgl')
    if (param === '1') return true
    if (param === '0') return false
  } catch {
    /* ignore */
  }
  return WEBGL_AVAILABLE && !APPLE_PLATFORM && !SOFTWARE_GL
})()
