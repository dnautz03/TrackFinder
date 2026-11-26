import { m } from 'motion/react'
import { cn } from '@/lib/utils'

export const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Heading whose words rise out of a mask one after another when it scrolls
 * into view. Words from `accentFrom` on are painted acid.
 */
export function WordsReveal({
  text,
  className,
  accentFrom,
  as: Tag = 'h2',
  id,
}: {
  text: string
  className?: string
  accentFrom?: number
  as?: 'h2' | 'h3' | 'p'
  id?: string
}) {
  const words = text.split(' ')
  return (
    <Tag id={id} className={cn('type-display', className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <span key={`${w}-${i}`}>
            <span className="plate inline-block overflow-hidden pb-[0.08em] align-bottom">
              <m.span
                className={cn('inline-block', accentFrom !== undefined && i >= accentFrom && 'text-acid')}
                initial={{ y: '105%' }}
                whileInView={{ y: '0%' }}
                viewport={{ once: true, margin: '0px 0px -12% 0px' }}
                transition={{ duration: 0.85, ease: EASE, delay: i * 0.055 }}
              >
                {w}
              </m.span>
            </span>
            {i < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </Tag>
  )
}
