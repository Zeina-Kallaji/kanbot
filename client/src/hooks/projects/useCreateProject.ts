import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createProject } from '../../api/projects';
import { projectKeys } from './projectKeys';

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      });
    },
  });
}