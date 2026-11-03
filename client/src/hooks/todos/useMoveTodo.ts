import { useMutation, useQueryClient } from '@tanstack/react-query';
import { moveTodo } from '../../api/todos';
import type { MoveTodoRequest, Todo, TodoListQuery, TodoListResponse } from '../../types/api';
import { projectKeys } from '../projects/projectKeys';
import { sprintKeys } from '../sprints/sprintKeys';
import { todoKeys } from './todoKeys';

interface MoveTodoVariables {
  projectId: string;
  todoId: string;
  data: MoveTodoRequest;
}

function getFilters(queryKey: readonly unknown[]): TodoListQuery {
  const filters = queryKey[3];
  return filters && typeof filters === 'object'
    ? filters as TodoListQuery
    : {};
}

function matchesFilters(todo: Todo, filters: TodoListQuery): boolean {
  if (filters.sprintId === 'backlog' && todo.sprintId !== null) return false;
  if (
    filters.sprintId &&
    filters.sprintId !== 'backlog' &&
    todo.sprintId !== filters.sprintId
  ) return false;
  if (filters.status && todo.status !== filters.status) return false;
  if (filters.priority && todo.priority !== filters.priority) return false;
  if (filters.type && todo.type !== filters.type) return false;
  if (filters.search) {
    const search = filters.search.toLowerCase();
    const searchable = [
      todo.key,
      todo.title,
      todo.description,
      ...todo.labels,
    ].join(' ').toLowerCase();
    if (!searchable.includes(search)) return false;
  }
  return true;
}

export function useMoveTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ todoId, data }: MoveTodoVariables) =>
      moveTodo(todoId, data),
    onMutate: async ({ projectId, todoId, data }) => {
      const queryKey = todoKeys.projectLists(projectId);
      await queryClient.cancelQueries({ queryKey });
      const snapshots = queryClient.getQueriesData<TodoListResponse>({
        queryKey,
      });
      const sourceTodo = snapshots
        .flatMap(([, response]) => response?.todos ?? [])
        .find((todo) => todo.id === todoId);

      if (!sourceTodo) return { snapshots };

      const movedTodo: Todo = {
        ...sourceTodo,
        sprintId: data.sprintId ?? null,
        status: data.status ?? sourceTodo.status,
        order: data.position,
      };

      for (const [cachedKey, response] of snapshots) {
        if (!response) continue;
        const filters = getFilters(cachedKey);
        const remaining = response.todos.filter((todo) => todo.id !== todoId);
        if (!matchesFilters(movedTodo, filters)) {
          queryClient.setQueryData<TodoListResponse>(cachedKey, {
            todos: remaining,
          });
          continue;
        }

        const sameOrderedList = (todo: Todo) =>
          todo.sprintId === movedTodo.sprintId &&
          (movedTodo.sprintId === null || todo.status === movedTodo.status);
        const orderedTarget = remaining
          .filter(sameOrderedList)
          .sort((a, b) => a.order - b.order);
        const position = Math.min(data.position, orderedTarget.length);
        orderedTarget.splice(position, 0, movedTodo);
        const orders = new Map(
          orderedTarget.map((todo, index) => [todo.id, index])
        );
        const updated = remaining.map((todo) => {
          const order = orders.get(todo.id);
          return order === undefined ? todo : { ...todo, order };
        });
        updated.push(movedTodo);
        queryClient.setQueryData<TodoListResponse>(cachedKey, {
          todos: updated,
        });
      }

      return { snapshots };
    },
    onError: (_error, _variables, context) => {
      context?.snapshots.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: (_, { projectId }) => {
      void queryClient.invalidateQueries({
        queryKey: todoKeys.projectLists(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: sprintKeys.list(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
      });
    },
  });
}
