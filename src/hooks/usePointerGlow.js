import { useEffect } from 'react'

// Feeds pointer position into any .spotlight element under the cursor as
// --mx / --my (for the light) and --rx / --ry (for .tilt cards). One shared
// listener, throttled to a frame; CSS does the rendering.
export function usePointerGlow() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let frame = 0
    let last = null

    const update = () => {
      frame = 0
      const card = last.target instanceof Element ? last.target.closest('.spotlight') : null
      if (!card) return
      const rect = card.getBoundingClientRect()
      const x = (last.clientX - rect.left) / rect.width
      const y = (last.clientY - rect.top) / rect.height
      card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
      card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
      card.style.setProperty('--rx', `${((0.5 - y) * 6).toFixed(2)}deg`)
      card.style.setProperty('--ry', `${((x - 0.5) * 6).toFixed(2)}deg`)
    }

    const onMove = (e) => {
      last = e
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [])
}
