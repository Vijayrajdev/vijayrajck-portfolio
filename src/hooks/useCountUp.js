import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Counts from 0 to `target` (ease-out) the first time the element scrolls
// into view. Returns [ref, value].
export function useCountUp(target, durationMs = 1400) {
  const ref = useRef(null)
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0))

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    let frame
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const tick = (now) => {
          const t = Math.min(1, (now - start) / durationMs)
          setValue(Math.round(target * (1 - (1 - t) ** 3)))
          if (t < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [target, durationMs])

  return [ref, value]
}
