import { useEffect, useRef } from 'react'

// Adds .is-visible to any descendant with .reveal when it scrolls into view.
// The class is added outside React, so a .reveal element's className must
// stay constant across renders — if it changes, React rewrites the attribute,
// .is-visible is lost, and the element turns invisible. Put state-driven
// classes on a wrapper instead.
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
