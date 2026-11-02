import { useQuery } from '@tanstack/react-query';

import { listProjects } from '../../api/projects';
import { projectKeys } from './projectKeys';

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: listProjects,
  });
}