import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import db, { type Group } from '@/db'
import { DialogDescription } from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'
import { IconButton } from '@/components/icon-button'
import { useNavigate } from '@tanstack/react-router'

export function DeleteGroupButton({
  group,
  className
}: React.ComponentProps<'button'> & { group: Group }) {
  const nav = useNavigate()
  return (
    <Dialog>
      <DialogTrigger asChild>
        <IconButton aria-label='Delete group' className={cn(className, 'my-1 -translate-y-[0.05rem]')}>
          <Trash2 />
        </IconButton>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader className='min-w-0 overflow-x-clip'>
          <DialogTitle>Delete <em>{group.name}</em>?</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          This will permanently erase all data associated with this group.
        </DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant='destructive' onClick={_ => {
              db.groups.delete(group.id)
              toast.success('Group successfully deleted')
              nav({ to: '/' })
            }}>Confirm</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}