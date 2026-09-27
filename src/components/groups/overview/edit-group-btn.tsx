import { Edit } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { toast } from 'sonner'
import db, { type Group } from '@/db'
import { cn } from '@/lib/utils'
import { IconButton } from '@/components/icon-button'

export function EditGroupButton({
  group,
  className
}: React.ComponentProps<'button'> & { group: Group }) {
  const [name, setName] = useState(group.name)
  const [desc, setDesc] = useState(group.description)
  return (
    <Dialog>
      <DialogTrigger asChild>
        <IconButton aria-label='Edit group' className={cn(className, 'my-1')}>
          <Edit />
        </IconButton>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader className='min-w-0 overflow-x-clip'>
          <DialogTitle>Edit <em>{group.name}</em></DialogTitle>
        </DialogHeader>
        <div className='grid gap-4'>
          <div className='grid gap-3'>
            <Label htmlFor='group-name'>Name</Label>
            <Input id='group-name' name='name'
              value={name} onChange={e => setName(e.target.value)}
              maxLength={20}
            />
          </div>
          <div className='grid gap-3'>
            <Label htmlFor='group-description'>Description</Label>
            <Textarea id='group-description' name='description'
              placeholder='Description of group'
              value={desc} onChange={e => setDesc(e.target.value)}  
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant='success' onClick={_ => {
              if (!name) {
                toast.error('Group name cannot be empty')
                return
              }
              db.groups.update(group.id, { name, description: desc })
              toast.success('Group successfully edited')
            }}>Save Changes</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}