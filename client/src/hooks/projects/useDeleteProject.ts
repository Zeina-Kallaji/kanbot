import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteProject } from '../../api/projects';
import { projectKeys } from './projectKeys';

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,

    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      });

      queryClient.removeQueries({
        queryKey: projectKeys.detail(projectId),
      });
    },
  });
}