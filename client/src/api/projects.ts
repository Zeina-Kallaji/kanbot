import { request } from './client';

import type {
  ProjectWithStats,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '../types/api';

interface ProjectsResponse {
  projects: ProjectWithStats[];
}

interface ProjectResponse {
  project: ProjectWithStats;
}

async function requireResponse<T>(
  promise: Promise<T | undefined>,
): Promise<T> {
  const response = await promise;

  if (response === undefined) {
    throw new Error('The server returned an empty response.');
  }

  return response;
}

export function listProjects(): Promise<ProjectsResponse> {
  return requireResponse(
    request<ProjectsResponse>('GET', '/projects'),
  );
}

export function getProject(
  projectId: string,
): Promise<ProjectResponse> {
  return requireResponse(
    request<ProjectResponse>('GET', `/projects/${projectId}`),
  );
}

export function createProject(
  data: CreateProjectRequest,
): Promise<ProjectResponse> {
  return requireResponse(
    request<ProjectResponse>('POST', '/projects', data),
  );
}

export function updateProject(
  projectId: string,
  data: UpdateProjectRequest,
): Promise<ProjectResponse> {
  return requireResponse(
    request<ProjectResponse>(
      'PATCH',
      `/projects/${projectId}`,
      data,
    ),
  );
}

export function deleteProject(
  projectId: string,
): Promise<void> {
  return request<void>('DELETE', `/projects/${projectId}`)
    .then(() => undefined);
}