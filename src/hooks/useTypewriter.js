import { useEffect, useState } from 'react'

// Cycles through phrases with a type / hold / delete rhythm.
export function useTypewriter(phrases, { typeMs = 65, deleteMs = 30, holdMs = 1800 } = {}) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const phrase = phrases[index % phrases.length]
    let timeout

    if (!deleting && text === phrase) {
      timeout = setTimeout(() => setDeleting(true), holdMs)
    } else if (deleting && text === '') {
      setDeleting(false)
      setIndex((i) => (i + 1) % phrases.length)
    } else {
      timeout = setTimeout(
        () => setText(phrase.slice(0, text.length + (deleting ? -1 : 1))),
        deleting ? deleteMs : typeMs,
      )
    }
    return () => clearTimeout(timeout)
  }, [text, deleting, index, phrases, typeMs, deleteMs, holdMs])

  return text
}
