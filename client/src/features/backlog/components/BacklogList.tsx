// client/src/features/backlog/components/BacklogList.tsx

import { Stack } from '@mui/material';

import type { Todo } from '../../../types/api';
import BacklogItem from './BacklogItem';

interface BacklogListProps {
  todos: Todo[];
  onTodoClick: (todo: Todo) => void;
}

export default function BacklogList({
  todos,
  onTodoClick,
}: BacklogListProps) {
  const orderedTodos = [...todos].sort(
    (a, b) => a.order - b.order
  );

  return (
    <Stack spacing={1.5}>
      {orderedTodos.map((todo) => (
        <BacklogItem
          key={todo.id}
          todo={todo}
          onClick={onTodoClick}
        />
      ))}
    </Stack>
  );
}