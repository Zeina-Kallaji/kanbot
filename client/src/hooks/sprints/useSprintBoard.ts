import { useQuery } from '@tanstack/react-query';
import { getSprintBoard } from '../../api/sprints';
import { sprintKeys } from './sprintKeys';

export function useSprintBoard(sprintId: string) {
  return useQuery({
    queryKey: sprintKeys.board(sprintId),
    queryFn: () => getSprintBoard(sprintId),
    enabled: Boolean(sprintId),
  });
}
