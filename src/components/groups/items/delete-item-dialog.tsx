import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import db, { type Group, type Item } from '@/db'

export function DeleteItemDialog({
  group,
  item,
  open,
  onOpenChange,
}: {
  group: Group,
  item: Item,
  open: boolean,
  onOpenChange: (open: boolean) => void,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px] max-h-11/12 flex flex-col'>
        <DialogHeader>
          <DialogTitle>Delete Item <em>{item.name}</em></DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant='destructive' onClick={_ => {
              db.groups.update(group.id, {
                items: group.items.filter(n => n.name !== item.name)
              })
              toast.success(`Successfully saved changes`)
            }}>
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
