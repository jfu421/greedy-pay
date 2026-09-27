import { AppSidebar, AppSidebarOpen } from '@/components/sidebar/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <div className='h-screen'>
      <SidebarProvider>
        <AppSidebar />
        <AppSidebarOpen />
        <div className='w-full min-w-0'>
          <Outlet />
        </div>
      </SidebarProvider>
    </div>
  ),
})
