import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * prefers-reduced-motion, hydration-safe: reports false while hydrating (as
 * the prerendered HTML did), then the real value right after, and follows
 * changes to the setting.
 */
export function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(QUERY)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
