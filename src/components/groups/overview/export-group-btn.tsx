import { Download } from 'lucide-react'
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
import type { Group } from '@/db'
import { DialogDescription } from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'
import { IconButton } from '@/components/icon-button'

export function ExportGroupButton({
  group,
  className
}: React.ComponentProps<'button'> & { group: Group }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <IconButton aria-label='Export group' className={cn(className, 'my-1')}>
          <Download />
        </IconButton>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader className='min-w-0 overflow-x-clip'>
          <DialogTitle>Export <em>{group.name}</em></DialogTitle>
        </DialogHeader>
        <DialogDescription>
          This will export all the data of this group into a file which can then
          be imported on another device.
        </DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant='success' onClick={_ => {
              // Create blob link to download
              const url = window.URL.createObjectURL(
                new Blob([JSON.stringify(group)], { type: 'application/json' })
              );
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute(
                'download',
                `${group.name}.json`,
              );
              link.click();
              // Clean up used url
              URL.revokeObjectURL(url)
            }}>Export</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}