
import { useQuery } from '@tanstack/react-query';

import { listTodos } from '../../api/todos';
import { todoKeys } from './todoKeys';

import type { TodoListQuery } from '../../types/api';

export function useTodos(
  projectId: string,
  filters: TodoListQuery = {},
  enabled = true
) {
  return useQuery({
    queryKey: todoKeys.list(projectId, filters),

    queryFn: () => listTodos(projectId, filters),

    enabled: Boolean(projectId) && enabled,
  });
}
