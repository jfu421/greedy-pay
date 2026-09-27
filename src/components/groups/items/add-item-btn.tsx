import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { type Group } from '@/db'
import { cn } from '@/lib/utils'
import { IconButton } from '@/components/icon-button'
import { ItemDataDialog } from './item-data-dialog'

export function AddItemButton({
  className,
  group
}: React.ComponentProps<'button'> & { group: Group }) {
  return (
    <ItemDataDialog title={'Add New Item'} group={group} item={{ name: '', owees: {} }}>
      <IconButton aria-label='Add item' className={cn(className, 'my-1')}
        onClick={e => {
          if (group.members.length === 0) {
            toast.error('Cannot create an item when there are no members in the group')
            e.stopPropagation()
            e.preventDefault()
          }
        }}
      >
        <Plus />
      </IconButton>
    </ItemDataDialog>
  )
}