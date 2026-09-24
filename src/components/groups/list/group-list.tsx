import type { Group } from '@/db';
import { cn } from '@/lib/utils';
import { useNavigate } from '@tanstack/react-router';

export function GroupList({ groups, selected }: { groups: Group[], selected?: number }) {
  const nav = useNavigate()
  return (
    <ul>
      {
        groups.map((group, index) => (
          <li key={group.id}
            className={cn(
              'p-2 cursor-pointer hover:bg-accent-foreground/8 active:bg-accent-foreground/12',
              index > 0 ? 'border-t' : '',
              group.id === selected ? 'bg-accent-foreground/8' : ''
            )}
            onClick={_ => nav({ to: '.', search: { groupId: group.id } })}
          >
            <h3 className='font-semibold text-lg'>{group.name}</h3>
            <div className='text-sm'>Created {group.created.toLocaleString()}</div>
          </li>
        ))
      }
    </ul>
  )
}