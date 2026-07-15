import { useEffect, useState } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') return stored
    // Deep-space dark is the signature look; default to it.
    return 'dark'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
    const meta = document.querySelector('meta[name="theme-color"]:not([media])')
    const color = theme === 'dark' ? '#070312' : '#dbeafe'
    if (meta) meta.setAttribute('content', color)
    else {
      const el = document.createElement('meta')
      el.name = 'theme-color'
      el.content = color
      document.head.appendChild(el)
    }
  }, [theme])

  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))]
}
