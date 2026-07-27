'use client'

import { useEffect, useState } from 'react'

export function ThemeToggle({ label }: { label: string }) {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {}
  }

  return (
    <md-icon-button className="zx-theme-toggle" onClick={toggle} aria-label={label}>
      <md-icon>{isDark ? 'light_mode' : 'dark_mode'}</md-icon>
    </md-icon-button>
  )
}
