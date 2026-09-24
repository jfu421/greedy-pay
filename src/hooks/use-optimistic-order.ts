import { useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'

/**
 * Returns the list in its displayed order, and a function to move an entry
 * that saves the new order with `save`
 */
export function useOptimisticOrder<T>(list: T[], save: (list: T[]) => void) {
  // Saving is async, so show the new order until the saved list arrives.
  // Otherwise the dropped row jumps back to where it was for a moment
  const [pending, setPending] = useState<{ base: T[], order: T[] }>()
  const ordered = pending?.base === list ? pending.order : list
  const move = (from: number, to: number) => {
    const order = arrayMove(ordered, from, to)
    setPending({ base: list, order })
    save(order)
  }
  return [ordered, move] as const
}
