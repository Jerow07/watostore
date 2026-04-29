import { useState, useEffect } from 'react'

export function useIsMobile(breakpoint = 768) {
  const [match, setMatch] = useState(false)
  useEffect(() => {
    const check = () => setMatch(window.innerWidth < breakpoint)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [breakpoint])
  return match
}
