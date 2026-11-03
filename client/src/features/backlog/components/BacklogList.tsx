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
  compact?: boolean;
}

export default function BacklogList({
  todos,
  onTodoClick,
  listId,
  isDraggable,
  sprints,
  onMove,
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
        spacing={compact ? 0 : 1.5}
        sx={{
          minHeight: 8,
          borderRadius: 1,
          outline: isOver ? '2px solid' : 'none',
          outlineColor: 'primary.main',
        }}
      >
        {orderedTodos.map((todo) => (
          <BacklogItem
            key={todo.id}
            todo={todo}
            onClick={onTodoClick}
            listId={listId}
            isDraggable={isDraggable}
            sprints={sprints}
            onMove={onMove}
            compact={compact}
          />
        ))}
      </Stack>
    </SortableContext>
  );
}