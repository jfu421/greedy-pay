import {
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { AddMemberButton } from './add-member-btn';
import { EditMemberDialog } from './edit-member-dialog';

import db, { type Group } from '@/db';
import { formatPayments } from '@/lib/utils';
import { DeleteMemberDialog } from './delete-member-dialog';
import { RowHandle, SortableList, SortableTableRow } from '@/components/sortable-table';
import { useOptimisticOrder } from '@/hooks/use-optimistic-order';
import { useState } from 'react';

export function GroupMembers({ group }: { group: Group }) {
  const [members, moveMember] = useOptimisticOrder(
    group.members,
    members => db.groups.update(group.id, { members })
  )
  const transactions = group.minimisedTransactions()
  return (
    <>
      <div className='flex gap-2 items-end'>
        <h2 className='text-2xl font-semibold'>Members</h2>
        <AddMemberButton group={group} className='size-6 ml-4' />
      </div>
      <div className='text-sm text-muted-foreground mb-2'>{group.members.length} members</div>
      <SortableList ids={members} onMove={moveMember}>
        <Table>
          <TableBody className='b-0'>
            {members.length > 0 ?
              members.map(member => (
                <SortableTableRow key={member} id={member}>
                  <TableCell className='bg-accent/50 w-0'> {/* w-0 minimises column width */}
                    <div className='flex gap-2 items-center'>
                      <MemberActions group={group} member={member} />
                      <span className='mr-2'>
                        {member}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell colSpan={1}>{formatPayments(transactions[member])}</TableCell>
                </SortableTableRow>
              )) :
              <TableRow>
                <TableCell className="h-24 text-center">
                  This group currently has no members.
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </SortableList>
    </>
  )
}

function MemberActions({ group, member }: { group: Group, member: string }) {
  const [dialog, setDialog] = useState<'edit' | 'delete'>()
  const setOpen = (which: 'edit' | 'delete') =>
    (open: boolean) => setDialog(open ? which : undefined)
  return (
    <>
      <RowHandle label={member}
        onEdit={() => setDialog('edit')}
        onDelete={() => setDialog('delete')}
      />
      <EditMemberDialog group={group} member={member}
        open={dialog === 'edit'} onOpenChange={setOpen('edit')}
      />
      <DeleteMemberDialog group={group} member={member}
        open={dialog === 'delete'} onOpenChange={setOpen('delete')}
      />
    </>
  )
}
