import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { IconButton } from '@/components/icon-button'

export function ThemeButton() {
  const { theme, setTheme } = useTheme()
  const light = theme === 'light'
  return (
    <IconButton aria-label='Toggle theme' onClick={_ => setTheme(light ? 'dark' : 'light')}
      className='size-8'
    >
      <Sun className='relative w-full h-full transition-all scale-100 rotate-0 dark:scale-0 dark:-rotate-180' />
      <Moon className='relative bottom-8 w-full h-full transition-all scale-0 rotate-180 dark:scale-100 dark:rotate-0' />
    </IconButton>
  )
}