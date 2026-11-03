import { request } from './client';
import type {
  CreateSprintRequest,
  CompleteSprintRequest,
  Sprint,
  SprintBoardResponse,
  SprintListResponse,
  StartSprintRequest,
  UpdateSprintRequest,
} from '../types/api';

interface SprintResponse {
  sprint: Sprint;
}

async function requireResponse<T>(
  promise: Promise<T | undefined>
): Promise<T> {
  const response = await promise;

  if (response === undefined) {
    throw new Error('The server returned an empty response.');
  }

  return response;
}

export function listSprints(projectId: string): Promise<SprintListResponse> {
  return requireResponse(
    request<SprintListResponse>('GET', `/projects/${projectId}/sprints`)
  );
}

export function getSprintBoard(sprintId: string): Promise<SprintBoardResponse> {
  return requireResponse(
    request<SprintBoardResponse>('GET', `/sprints/${sprintId}/todos`)
  );
}

export function createSprint(
  projectId: string,
  data: CreateSprintRequest
): Promise<SprintResponse> {
  return requireResponse(
    request<SprintResponse>('POST', `/projects/${projectId}/sprints`, data)
  );
}

export function updateSprint(
  sprintId: string,
  data: UpdateSprintRequest
): Promise<SprintResponse> {
  return requireResponse(
    request<SprintResponse>('PATCH', `/sprints/${sprintId}`, data)
  );
}

export async function deleteSprint(sprintId: string): Promise<void> {
  await request<void>('DELETE', `/sprints/${sprintId}`);
}

export function startSprint(
  sprintId: string,
  data: StartSprintRequest
): Promise<SprintResponse> {
  return requireResponse(
    request<SprintResponse>('POST', `/sprints/${sprintId}/start`, data)
  );
}

export function completeSprint(
  sprintId: string,
  data: CompleteSprintRequest
): Promise<SprintResponse> {
  return requireResponse(
    request<SprintResponse>('POST', `/sprints/${sprintId}/complete`, data)
  );
}
