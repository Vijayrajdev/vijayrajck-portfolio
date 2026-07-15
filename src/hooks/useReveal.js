import { useEffect, useRef } from 'react'

// Adds .is-visible to any descendant with .reveal when it scrolls into view.
export function useReveal() {
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const targets = root.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 },
    )
    targets.forEach((t) => observer.observe(t))
    return () => observer.disconnect()
  }, [])

  return ref
}
