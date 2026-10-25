import { useEffect, useState } from 'react'

// Tracks which section is under the upper third of the viewport, plus overall
// scroll progress (0–1) for the nav's progress bar.
export function useScrollSpy(ids) {
  const [active, setActive] = useState(null)
  const [progress, setProgress] = useState(0)
  const key = ids.join(',')

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
      const probe = window.innerHeight / 3
      let current = null
      for (const id of key.split(',')) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= probe) current = id
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [key])

  return { active, progress }
}
