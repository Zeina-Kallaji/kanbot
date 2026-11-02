
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteTodo } from '../../api/todos';
import { todoKeys } from './todoKeys';

interface DeleteTodoVariables {
  todoId: string;
  projectId: string;
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ todoId }: DeleteTodoVariables) =>
      deleteTodo(todoId),

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
