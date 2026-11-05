import { useMutation, useQueryClient } from '@tanstack/react-query';
import { summarizeSprint } from '../../api/ai';
import type { SprintBoardResponse, SprintListResponse } from '../../types/api';
import { sprintKeys } from './sprintKeys';

interface SummarizeSprintVariables {
  projectId: string;
  sprintId: string;
}

export function useSummarizeSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, sprintId }: SummarizeSprintVariables) =>
      summarizeSprint(projectId, sprintId),
    onSuccess: ({ sprint }, { projectId, sprintId }) => {
      queryClient.setQueryData<SprintListResponse>(
        sprintKeys.list(projectId),
        (current) =>
          current && {
            sprints: current.sprints.map((item) =>
              item.id === sprintId ? sprint : item
            ),
          }
      );
      queryClient.setQueryData<SprintBoardResponse>(
        sprintKeys.board(sprintId),
        (current) => (current ? { ...current, sprint } : current)
      );
      queryClient.setQueryData(sprintKeys.detail(sprintId), { sprint });

      void queryClient.invalidateQueries({
        queryKey: sprintKeys.list(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: sprintKeys.board(sprintId),
      });
      void queryClient.invalidateQueries({
        queryKey: sprintKeys.detail(sprintId),
      });
    },
  });
}
