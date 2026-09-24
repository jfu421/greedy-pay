import { createContext, useContext, useRef, useState } from 'react'
import {
  closestCenter,
  DndContext,
  KeyboardCode,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Edit3, GripVertical, Trash2 } from 'lucide-react'
import { TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

/**
 * Makes the `SortableTableRow`s inside it rearrangeable. Must wrap the whole
 * table, as it renders elements that are not allowed inside one
 */
export function SortableList({ ids, onMove, children }: React.PropsWithChildren & {
  ids: string[],
  onMove: (from: number, to: number) => void,
}) {
  const sensors = useSensors(
    // Only start dragging after moving a little, so a click opens the menu
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    // Space drags, leaving Enter free to open the menu
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: {
        start: [KeyboardCode.Space],
        cancel: [KeyboardCode.Esc],
        end: [KeyboardCode.Space, KeyboardCode.Enter, KeyboardCode.Tab],
      },
    }),
  )
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) return
        onMove(ids.indexOf(String(active.id)), ids.indexOf(String(over.id)))
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  )
}

type Handle = {
  attributes: DraggableAttributes
  listeners: DraggableSyntheticListeners
  setActivatorNodeRef: (element: HTMLElement | null) => void
  isDragging: boolean
}

const HandleContext = createContext<Handle | null>(null)

export function SortableTableRow({ id, className, style, ...props }:
  React.ComponentProps<typeof TableRow> & { id: string }
) {
  const {
    attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging
  } = useSortable({ id })
  return (
    <HandleContext.Provider value={{ attributes, listeners, setActivatorNodeRef, isDragging }}>
      <TableRow ref={setNodeRef}
        style={{ ...style, transform: CSS.Translate.toString(transform), transition }}
        // Keep the dragged row above, and hiding, the rows it passes over
        className={cn(isDragging && 'relative z-10 bg-background', className)}
        {...props}
      />
    </HandleContext.Provider>
  )
}

/**
 * Drag to rearrange the row it is in, or click for a menu to edit or delete
 */
export function RowHandle({ label, onEdit, onDelete }: {
  label: string,
  onEdit: () => void,
  onDelete: () => void,
}) {
  const handle = useContext(HandleContext)
  if (!handle) throw new Error('RowHandle must be used within a SortableTableRow')
  const { attributes, listeners, setActivatorNodeRef, isDragging } = handle
  const [menuOpen, setMenuOpen] = useState(false)
  const pointerDownAt = useRef({ x: 0, y: 0 })
  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <button ref={setActivatorNodeRef} {...attributes}
          aria-label={`Move, edit or delete ${label}`}
          className={cn(
            'flex rounded-sm text-muted-foreground hover:text-foreground outline-none',
            'focus-visible:ring-2 ring-ring/50 touch-none cursor-grab active:cursor-grabbing'
          )}
          onPointerDown={e => {
            listeners?.onPointerDown(e)
            pointerDownAt.current = { x: e.clientX, y: e.clientY }
            // The menu would otherwise open as soon as the pointer is pressed,
            // before we know whether this is a click or the start of a drag
            e.preventDefault()
          }}
          onClick={e => {
            // A click also fires when a drag is released over the handle
            const moved = Math.hypot(
              e.clientX - pointerDownAt.current.x,
              e.clientY - pointerDownAt.current.y,
            ) > 5
            // detail is 0 for clicks not made with a pointer
            if (e.detail !== 0 && moved) return
            setMenuOpen(true)
          }}
          onKeyDown={e => {
            listeners?.onKeyDown(e)
            // Keys pressed mid-drag (e.g. Enter to drop) must not open the menu
            if (isDragging) e.preventDefault()
          }}
          onKeyUp={e => {
            // Space starts and ends drags, so its click must not open the menu
            if (e.key === ' ') e.preventDefault()
          }}
        >
          <GripVertical className='size-5' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        <DropdownMenuItem onSelect={onEdit}>
          <Edit3 /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem variant='destructive' onSelect={onDelete}>
          <Trash2 /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
