import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

// Import the route tree
import { routeTree } from './routeTree.gen'
import { Toaster } from './components/ui/sonner'
import { ThemeProvider } from './components/theme-provider'

// Create the router
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: { auth: undefined! },
  basepath: '/',
})

// Declare the router in the global scope
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster closeButton={true} />
      </ThemeProvider>
    </StrictMode>,
  )
}
