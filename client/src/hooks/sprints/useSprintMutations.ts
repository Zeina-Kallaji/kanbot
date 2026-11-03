import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  completeSprint,
  createSprint,
  deleteSprint,
  startSprint,
  updateSprint,
} from '../../api/sprints';
import type {
  CompleteSprintRequest,
  CreateSprintRequest,
  Sprint,
  SprintListResponse,
  StartSprintRequest,
  UpdateSprintRequest,
} from '../../types/api';
import { projectKeys } from '../projects/projectKeys';
import { todoKeys } from '../todos/todoKeys';
import { sprintKeys } from './sprintKeys';

interface CreateSprintVariables {
  projectId: string;
  data: CreateSprintRequest;
}

interface UpdateSprintVariables {
  projectId: string;
  sprintId: string;
  data: UpdateSprintRequest;
}

interface ProjectSprintVariables {
  projectId: string;
  sprintId: string;
}

interface StartSprintVariables extends ProjectSprintVariables {
  data: StartSprintRequest;
}

interface CompleteSprintVariables extends ProjectSprintVariables {
  data: CompleteSprintRequest;
}

function updateCachedSprint(
  current: SprintListResponse | undefined,
  sprint: Sprint
): SprintListResponse | undefined {
  if (!current) return current;
  const found = current.sprints.some((item) => item.id === sprint.id);
  return {
    sprints: found
      ? current.sprints.map((item) => (item.id === sprint.id ? sprint : item))
      : [...current.sprints, sprint],
  };
}

export function useSprintMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: ({ projectId, data }: CreateSprintVariables) =>
      createSprint(projectId, data),
    onSuccess: ({ sprint }, { projectId }) => {
      queryClient.setQueryData<SprintListResponse>(
        sprintKeys.list(projectId),
        (current) => updateCachedSprint(current, sprint)
      );
      void queryClient.invalidateQueries({
        queryKey: sprintKeys.list(projectId),
      });
    },
  });

  const update = useMutation({
    mutationFn: ({ sprintId, data }: UpdateSprintVariables) =>
      updateSprint(sprintId, data),
    onSuccess: ({ sprint }, { projectId, sprintId }) => {
      queryClient.setQueryData<SprintListResponse>(
        sprintKeys.list(projectId),
        (current) => updateCachedSprint(current, sprint)
      );
      queryClient.setQueryData(sprintKeys.detail(sprintId), { sprint });
      void queryClient.invalidateQueries({
        queryKey: sprintKeys.list(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: sprintKeys.detail(sprintId),
      });
    },
  });

  const remove = useMutation({
    mutationFn: ({ sprintId }: ProjectSprintVariables) =>
      deleteSprint(sprintId),
    onSuccess: (_, { projectId, sprintId }) => {
      void queryClient.invalidateQueries({
        queryKey: sprintKeys.list(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: sprintKeys.detail(sprintId),
      });
      void queryClient.invalidateQueries({
        queryKey: todoKeys.projectLists(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      });
    },
  });

  const start = useMutation({
    mutationFn: ({ sprintId, data }: StartSprintVariables) =>
      startSprint(sprintId, data),
    onSuccess: ({ sprint }, { projectId, sprintId }) => {
      queryClient.setQueryData<SprintListResponse>(
        sprintKeys.list(projectId),
        (current) => updateCachedSprint(current, sprint)
      );
      queryClient.setQueryData(sprintKeys.detail(sprintId), { sprint });
      void queryClient.invalidateQueries({
        queryKey: sprintKeys.list(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: sprintKeys.detail(sprintId),
      });
      void queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      });
    },
  });

  const complete = useMutation({
    mutationFn: ({ sprintId, data }: CompleteSprintVariables) =>
      completeSprint(sprintId, data),
    onSuccess: ({ sprint }, { projectId, sprintId }) => {
      queryClient.setQueryData<SprintListResponse>(
        sprintKeys.list(projectId),
        (current) => updateCachedSprint(current, sprint)
      );
      queryClient.setQueryData(sprintKeys.detail(sprintId), { sprint });
      void queryClient.invalidateQueries({
        queryKey: sprintKeys.list(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: sprintKeys.board(sprintId),
      });
      void queryClient.invalidateQueries({
        queryKey: todoKeys.projectLists(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      });
    },
  });

  return { create, update, remove, start, complete };
}
