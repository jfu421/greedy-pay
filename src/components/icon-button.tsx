import { cn } from '@/lib/utils'

/**
 * A clickable, keyboard-focusable icon. Size it with `className`; the icon
 * child fills the button. `aria-label` is required since there's no text
 */
export function IconButton({
  className,
  ...props
}: React.ComponentProps<'button'> & { 'aria-label': string }) {
  return (
    <button type='button'
      className={cn(
        'cursor-pointer transition-colors hover:text-muted-foreground',
        'rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        '[&>svg]:size-full',
        className,
      )}
      {...props}
    />
  )
}
