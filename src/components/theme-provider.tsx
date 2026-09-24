import { createContext, useContext, useEffect, useRef, useState } from 'react'

type Theme = 'dark' | 'light'

// Exposed to styles.css as --theme-transition-duration
const THEME_TRANSITION_MS = 150

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'dark',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme,
  storageKey = 'theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => {
      const storedTheme = localStorage.getItem(storageKey) as Theme
      if (storedTheme) return storedTheme
      if (defaultTheme) return defaultTheme
      const systemPreferredTheme = window
        .matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      return systemPreferredTheme
    }
  )

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  const transitionTimeout = useRef<number>(undefined)

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      // Temporarily give every element the same colour transition (see
      // .theme-transition in styles.css) so the whole app fades together
      const root = window.document.documentElement
      root.style.setProperty('--theme-transition-duration', `${THEME_TRANSITION_MS}ms`)
      root.classList.add('theme-transition')
      window.clearTimeout(transitionTimeout.current)
      // Extra margin because the .dark class is only applied after React
      // re-renders; removing the class early would cut the fade short
      transitionTimeout.current = window.setTimeout(
        () => root.classList.remove('theme-transition'),
        THEME_TRANSITION_MS + 200,
      )
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}