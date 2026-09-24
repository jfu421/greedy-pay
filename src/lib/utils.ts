import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats the transaction data of a single person into a readable string
 * for 'simpletons'
 * @param payments The payments of a **single** person
 */
export function formatPayments(payments: { [payee: string] : number }) {
  const paymentsList = Object.entries(payments)
  if (paymentsList.length === 0) return 'does not have to pay anyone.'
  return (
    'needs to pay ' +
    paymentsList
      .map(([payee, amount]) => `${formatCurrency(amount)} to ${payee}`)
      .join(' and ') +
    '.'
  )
}

/**
 * Formats a number to a string representation of how much it is
 * @param amount the amount in cents
 */
export function formatCurrency(amount: number) {
  const dollars = amount / 100
  return dollars < 0 ? `-$${(-dollars).toFixed(2)}` : `$${dollars.toFixed(2)}`
}
