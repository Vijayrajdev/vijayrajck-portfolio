import { useEffect, useState } from 'react'
import { ACHIEVEMENT_EVENT, getUnlocked } from '../utils/achievements.js'

// The set of unlocked badge ids, kept in sync with unlock() calls anywhere.
export function useAchievements() {
  const [unlocked, setUnlocked] = useState(getUnlocked)
  useEffect(() => {
    const onChange = () => setUnlocked(getUnlocked())
    window.addEventListener(ACHIEVEMENT_EVENT, onChange)
    return () => window.removeEventListener(ACHIEVEMENT_EVENT, onChange)
  }, [])
  return unlocked
}
