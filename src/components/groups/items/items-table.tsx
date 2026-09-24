import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import db, { type Group, type Item } from '@/db'
import { MemberItemSummary } from './member-item-summary'
import { cn, formatCurrency } from '@/lib/utils'
import { ItemDataDialog } from './item-data-dialog'
import { Fragment } from 'react/jsx-runtime'
import { DeleteItemDialog } from './delete-item-dialog'
import { RowHandle, SortableList, SortableTableRow } from '@/components/sortable-table'
import { useOptimisticOrder } from '@/hooks/use-optimistic-order'
import { useState } from 'react'

export function ItemsTable({ group }: { group: Group }) {
  const [items, moveItem] = useOptimisticOrder(
    group.items,
    items => db.groups.update(group.id, { items })
  )
  const columns: ColumnDef<Item>[] = [
    // {
    //   id: 'actions',
    //   header: _ => <TableHead className='bg-accent/50 w-0'></TableHead>, // w-0 minimises column width
    //   cell: ({ row }) => <TableCell className='bg-accent/50 pl-3'>
    //     <ItemActions group={group} item={row.original} />
    //   </TableCell>,
    //   footer: () => <TableCell className='bg-accent/50' />
    // },
    {
      accessorKey: 'name',
      header: _ => <TableHead className='bg-accent/50 pr-4 w-0 text-end'>
        Item
      </TableHead>,
      cell: ({ row }) => <TableCell className='bg-accent/50'>
        <div className='flex gap-2 items-center'>
        <ItemActions group={group} item={row.original} />
          <span className='mr-2'>
            {row.original.name}
          </span>
        </div>
      </TableCell>,
      footer: () => <TableCell className='bg-accent/50 pr-4 text-end'>
        Total
      </TableCell>
    },
    ...group.members.map(member => ({
      id: member,
      header: _ => <TableHead className='border-l bg-accent/30'>
        {member}
      </TableHead>,
      cell: ({ row }) => {
        return (
          <TableCell className='border-l p-0'>
            <MemberItemSummary
              isOwed={row.original.owees[member]}
              owes={group.paymentsRequired()[row.original.name][member]}
            />
          </TableCell>
        )
      },
      footer: _ => {
        const balance = group.balances()[member]
        const colour = balance === 0 ?
          'bg-accent/70' :
          balance > 0 ?
            'bg-green-300/30' :
            'bg-red-300/30'
        return (
          <TableCell className={cn(colour, 'border-l')}>
            {formatCurrency(balance)}
          </TableCell>
        )
      }
    } as ColumnDef<Item>))
  ]
  const table = useReactTable({
    data: items,
    columns,
    getRowId: item => item.name,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <SortableList ids={items.map(item => item.name)} onMove={moveItem}>
      <div className='max-w-full'>
        <Table className='overflow-auto'>
          {table.getRowModel().rows?.length ?
            <>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {
                      headerGroup.headers.map(header => (
                        <Fragment key={header.id}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </Fragment>
                      ))
                    }
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <SortableTableRow key={row.id} id={row.id}>
                    {
                      row.getVisibleCells().map(cell => (
                        <Fragment key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </Fragment>
                      ))
                    }
                  </SortableTableRow>
                ))}
                {table.getFooterGroups().map(footerGroup => (
                  <TableRow key={footerGroup.id}>
                    {
                      footerGroup.headers.map(header => (
                        <Fragment key={header.id}>
                          {flexRender(
                            header.column.columnDef.footer,
                            header.getContext()
                          )}
                        </Fragment>
                      ))
                    }
                  </TableRow>
                ))}
              </TableBody>
            </> :
            <TableBody>
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  This group currently has no items.
                </TableCell>
              </TableRow>
            </TableBody>
          }
        </Table>
      </div>
    </SortableList>
  )
}

function ItemActions({ group, item }: { group: Group, item: Item }) {
  const [dialog, setDialog] = useState<'edit' | 'delete'>()
  const setOpen = (which: 'edit' | 'delete') =>
    (open: boolean) => setDialog(open ? which : undefined)
  return (
    <>
      <RowHandle label={item.name}
        onEdit={() => setDialog('edit')}
        onDelete={() => setDialog('delete')}
      />
      <ItemDataDialog title={<>Edit Item <em>{item.name}</em></>} group={group} item={item}
        open={dialog === 'edit'} onOpenChange={setOpen('edit')}
      />
      <DeleteItemDialog group={group} item={item}
        open={dialog === 'delete'} onOpenChange={setOpen('delete')}
      />
    </>
  )
}
