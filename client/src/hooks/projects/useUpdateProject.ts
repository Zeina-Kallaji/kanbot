import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateProject } from '../../api/projects';
import { projectKeys } from './projectKeys';

import type { UpdateProjectRequest } from '../../types/api';

interface UpdateProjectVariables {
  projectId: string;
  data: UpdateProjectRequest;
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: UpdateProjectVariables) => updateProject(projectId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(variables.projectId),
      });
    },
  });
}