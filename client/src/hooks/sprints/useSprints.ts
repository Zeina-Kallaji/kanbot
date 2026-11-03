import { useQuery } from '@tanstack/react-query';
import { listSprints } from '../../api/sprints';
import { sprintKeys } from './sprintKeys';

export function useSprints(projectId: string) {
  return useQuery({
    queryKey: sprintKeys.list(projectId),
    queryFn: () => listSprints(projectId),
    enabled: Boolean(projectId),
  });
}
