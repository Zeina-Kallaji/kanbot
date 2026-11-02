
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateTodo } from '../../api/todos';
import { todoKeys } from './todoKeys';

import type { UpdateTodoRequest } from '../../types/api';

interface UpdateTodoVariables {
  todoId: string;
  projectId: string;
  data: UpdateTodoRequest;
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ todoId, data }: UpdateTodoVariables) =>
      updateTodo(todoId, data),

    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: todoKeys.lists(),
      });

      await queryClient.invalidateQueries({
        queryKey: todoKeys.detail(variables.todoId),
      });

      await queryClient.invalidateQueries({
        queryKey: ['projects'],
      });
    },
  });
}
