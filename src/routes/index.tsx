import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import z from 'zod'

import { LoaderCircle } from 'lucide-react'

import { GroupView } from '@/components/groups/group-view'
import { NewGroupButton } from '@/components/groups/list/new-group-btn'
import db from '@/db'

const searchSchema = z.object({
  groupId: z.number().optional(),
})

export const Route = createFileRoute('/')({
  component: Index,
  validateSearch: searchSchema,
})

function Index() {
  const { groupId } = Route.useSearch()
  const group = useLiveQuery(() => groupId ? db.groups.get(groupId) : undefined, [groupId])
  if (groupId) {
    // group undefined here means has not yet loaded
    return (
      <div className='w-full h-full p-8 md:p-12 lg:px-16'>
        {group ?
          <GroupView group={group} /> :
          <LoaderCircle className='animate-spin m-auto size-24' />
        }
      </div>
    )
  }
  return (
    <div className='w-full min-h-full flex flex-col justify-center items-center gap-8'>
      <h1 className='mx-2 text-3xl font-semibold text-center'>
        Create a new group to split bills better
      </h1>
      <NewGroupButton className='size-16' />
    </div>
  )
}
