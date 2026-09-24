import { GroupList } from '@/components/groups/list/group-list'
import { ImportGroupButton } from '@/components/groups/list/import-group-btn'
import { NewGroupButton } from '@/components/groups/list/new-group-btn'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { SettingsButton } from './settings-button'
import { ThemeButton } from './theme-button'

import db from '@/db'

import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'

export function AppSidebar() {
  const groups = useLiveQuery(() => db.groups.toArray()) || []
  const { groupId } = useParams({ strict: false })
  return (
    <Sidebar>
      <SidebarHeader className='pt-4'>
        <div className='flex'>
          <h1 className='text-3xl font-semibold ml-2'>
            Groups
          </h1>
          <div className='flex items-center gap-2 ml-auto mr-2'>
            <NewGroupButton className='size-8' />
            <ImportGroupButton className='size-6' />
          </div>
        </div>
      </SidebarHeader>
      <hr />
      <SidebarContent>
        <div className='mx-2'>
          <GroupList groups={groups} selected={parseInt(groupId || '-1')} />
        </div>
      </SidebarContent>
      <hr />
      <SidebarFooter className='pb-2'>
        <div className='flex gap-2'>
          <ThemeButton />
          <SettingsButton />
        </div>
      </SidebarFooter>
      <AppSidebarClose />
    </Sidebar>
  )
}

export function AppSidebarOpen() {
  const { open, isMobile, openMobile } = useSidebar()
  if ((isMobile && openMobile) || (!isMobile && open)) return <></>
  return <SidebarTrigger
    className='absolute top-[calc(50%-1rem)] size-12 w-6 rounded-l-none'
  />
}

function AppSidebarClose() {
  const { open, isMobile } = useSidebar()
  if (isMobile || !open) return <></>
  return (
    <SidebarTrigger className={`
      absolute top-[calc(50%-1rem)] size-12 w-6 rounded-l-none
      z-20 transition-all ease-linear translate-x-[0.5px]
      group-data-[side=left]:-right-6 group-data-[side=right]:left-0
    `} />
  )
}
