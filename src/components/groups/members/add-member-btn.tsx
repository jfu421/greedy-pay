import { Plus } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { toast } from 'sonner'
import db, { type Group } from '@/db'
import { cn } from '@/lib/utils'

export function AddMemberButton({
  className,
  group
}: React.ComponentProps<'svg'> & { group: Group }) {
  const [name, setName] = useState('')
  return (
    <Dialog onOpenChange={open => { if(open) setName('') }}>
      <DialogTrigger asChild>
        <Plus className={cn(className, 'hover:text-muted-foreground cursor-pointer my-1')} />
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
        </DialogHeader>
        <div className='grid gap-2'>
          <Label htmlFor='member-name'>Name</Label>
          <Input id='member-name' name='name'
            value={name} onChange={e => setName(e.target.value)}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <Button variant='success' onClick={_ => {
            if (!name) {
              toast.error('Please enter the member\'s name')
              return
            }
            if (group.members.includes(name)) {
              toast.error('The group already contains somebody with that name')
              return
            }
            db.groups.update(group.id, {
              members: [...group.members, name].sort()
            })
            setName('')
            toast.success(`Successfully added ${name} to the group`)
          }}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}