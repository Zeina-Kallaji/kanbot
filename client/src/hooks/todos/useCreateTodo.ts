
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createTodo } from '../../api/todos';
import { todoKeys } from './todoKeys';

import type { CreateTodoRequest } from '../../types/api';

interface CreateTodoVariables {
  projectId: string;
  data: CreateTodoRequest;
}
export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
   mutationFn: ({ projectId, data }: CreateTodoVariables) =>
  createTodo(projectId, data),
   
    onSuccess: async () => {
  await queryClient.invalidateQueries({
    queryKey: todoKeys.lists(),
  });

  await queryClient.invalidateQueries({
    queryKey: ['projects'],
  });
},
  });
}
