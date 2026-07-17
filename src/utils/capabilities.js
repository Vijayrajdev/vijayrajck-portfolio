// Probed once at startup. On machines where WebGL is unavailable (enterprise
// policy, blocklisted GPU, remote desktop, some VMs — most common on Windows)
// every 3D scene must be replaced by a DOM fallback instead of an empty box.
export const WEBGL_AVAILABLE = (() => {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
})()
