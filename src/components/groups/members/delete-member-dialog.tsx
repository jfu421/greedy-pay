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
import db, { type Group } from '@/db'

export function DeleteMemberDialog({
  group,
  member,
  open,
  onOpenChange,
}: {
  group: Group,
  member: string,
  open: boolean,
  onOpenChange: (open: boolean) => void,
}) {
  const reasons: string[] = []
  for (const item of group.items) {
    if (Object.keys(item.owees).includes(member)) {
      reasons.push(`Is owed money for item "${item.name}"`)
    }
    // else if the item is being split equally amongst all, can delete
    // since it will redistribute
    if (!item.owers) continue
    // else if item is a being manually split,
    // can delete only if person is not included
    if (
      (item.owers instanceof Array && item.owers.includes(member)) ||
      !(item.owers instanceof Array) && Object.keys(item.owers).includes(member)
    ) {
      reasons.push(`Is explicitly listed as an debtor for item "${item.name}"`)
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Delete Member <em>{member}</em></DialogTitle>
        </DialogHeader>
        {reasons.length > 0 &&
          <div className='text-sm'>
            {member} cannot be deleted for the following reasons:
            <ul className='list-disc list-inside mt-2'>
              {reasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        }
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>
              {reasons.length > 0 ? 'Close' : 'Cancel'}
            </Button>
          </DialogClose>
          {reasons.length === 0 &&
            <DialogClose asChild>
              <Button variant='destructive' onClick={_ => {
                db.groups.update(group.id, {
                  members: group.members.filter(n => n !== member)
                })
                toast.success(`Successfully saved changes`)
              }}>
                Confirm
              </Button>
            </DialogClose>
          }
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
