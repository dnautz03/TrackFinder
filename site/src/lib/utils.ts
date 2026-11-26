import { clsx, type ClassValue } from 'clsx'

// Class names are hand-written without conflicts, so plain clsx is enough
// (tailwind-merge would add ~25 KB for nothing here).
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
