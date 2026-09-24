import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { toast } from 'sonner'
import db, { type Group, type Item } from '@/db'

/** Replaces every reference to member `from` in the item with `to` */
function renameMemberInItem(item: Item, from: string, to: string): Item {
  const renameKeys = (amounts: { [member: string]: number }) =>
    Object.fromEntries(Object.entries(amounts).map(([m, a]) => [m === from ? to : m, a]))
  return {
    ...item,
    owees: renameKeys(item.owees),
    owers: item.owers instanceof Array ?
      item.owers.map(m => m === from ? to : m) :
      item.owers && renameKeys(item.owers),
  }
}

export function EditMemberDialog({
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        {/* The form is only mounted while open, so it starts from `member` each time */}
        <EditMemberForm group={group} member={member} />
      </DialogContent>
    </Dialog>
  )
}

function EditMemberForm({ group, member }: { group: Group, member: string }) {
  const [name, setName] = useState(member)
  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Member <em>{member}</em></DialogTitle>
      </DialogHeader>
      <div className='grid gap-2'>
        <Label htmlFor='member-name'>Name</Label>
        <Input id='member-name' name='name'
          value={name} onChange={e => setName(e.target.value)}
        />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant='outline'>
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button variant='success' onClick={e => {
            if (!name) {
              toast.error('Name cannot be blank')
              e.preventDefault()
              return
            }
            if (name !== member && group.members.includes(name)) {
              toast.error('The group already contains somebody with that name')
              e.preventDefault()
              return
            }
            // Items refer to members by name, so they must be renamed too
            db.groups.update(group.id, {
              members: group.members.map(m => m === member ? name : m),
              items: group.items.map(item => renameMemberInItem(item, member, name)),
            })
            toast.success(`Successfully saved changes`)
          }}>
            Save Changes
          </Button>
        </DialogClose>
      </DialogFooter>
    </>
  )
}
