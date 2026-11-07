// client/src/features/backlog/components/BacklogList.tsx

import { Stack } from '@mui/material';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

import type { Sprint, Todo } from '../../../types/api';
import BacklogItem from './BacklogItem';

interface BacklogListProps {
  todos: Todo[];
  onTodoClick: (todo: Todo) => void;
  listId: string;
  isDraggable: boolean;
  sprints: Sprint[];
  onMove: (todo: Todo, sprintId: string | null) => void;
  onReorder: (todo: Todo, position: number) => void;
  onDelete: (todo: Todo) => void;
  compact?: boolean;
}

export default function BacklogList({
  todos,
  onTodoClick,
  listId,
  isDraggable,
  sprints,
  onMove,
  onReorder,
  onDelete,
  compact = false,
}: BacklogListProps) {
  const orderedTodos = [...todos].sort(
    (a, b) => a.order - b.order
  );

  const { setNodeRef, isOver } = useDroppable({
    id: listId,
    data: { listId },
  });

  return (
    <SortableContext
      items={orderedTodos.map((todo) => todo.id)}
      strategy={verticalListSortingStrategy}
    >
      <Stack
        ref={setNodeRef}
        data-drop-list={listId}
        spacing={0}
        sx={{
          minHeight: 8,
          borderRadius: 1,
          outline: isOver ? '2px solid' : 'none',
          outlineColor: 'primary.main',
        }}
      >
        {orderedTodos.map((todo) => {
          const orderedList =
            listId === 'backlog'
              ? orderedTodos
              : orderedTodos.filter((item) => item.status === todo.status);
          const index = orderedList.findIndex((item) => item.id === todo.id);

          return (
            <BacklogItem
              key={todo.id}
              todo={todo}
              onClick={onTodoClick}
              listId={listId}
              isDraggable={isDraggable}
              sprints={sprints}
              onMove={onMove}
              onReorder={onReorder}
              onDelete={onDelete}
              canMoveUp={isDraggable && index > 0}
              canMoveDown={isDraggable && index < orderedList.length - 1}
              compact={compact}
              roundBottomCorners={
                listId !== 'backlog' && todo.id === orderedTodos[orderedTodos.length - 1]?.id
              }
            />
          );
        })}
      </Stack>
    </SortableContext>
  );
}