
export const todoKeys = {
  all: ['todos'] as const,

  lists: () => [...todoKeys.all, 'list'] as const,

  list: (
    projectId: string,
    filters: {
      sprintId?: string;
      status?: string;
      priority?: string;
      type?: string;
      search?: string;
    } = {}
  ) => [...todoKeys.lists(), projectId, filters] as const,

  details: () => [...todoKeys.all, 'detail'] as const,

  detail: (todoId: string) =>
    [...todoKeys.details(), todoId] as const,
};
