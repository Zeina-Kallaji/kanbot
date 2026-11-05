import { request } from './client';
import type {
  AiStatusResponse,
  ChatRequest,
  ChatResponse,
  GenerateTodosRequest,
  GenerateTodosResponse,
  PlanSprintRequest,
  PlanSprintResponse,
  SprintSummaryRequest,
  SprintSummaryResponse,
} from '../types/api';

async function requireResponse<T>(promise: Promise<T | undefined>): Promise<T> {
  const response = await promise;
  if (response === undefined) {
    throw new Error('The server returned an empty response.');
  }
  return response;
}

export function getAiStatus(): Promise<AiStatusResponse> {
  return requireResponse(request<AiStatusResponse>('GET', '/ai/status'));
}

export function generateTodos(
  projectId: string,
  data: GenerateTodosRequest
): Promise<GenerateTodosResponse> {
  return requireResponse(
    request<GenerateTodosResponse>(
      'POST',
      `/projects/${projectId}/ai/generate-todos`,
      data
    )
  );
}

export function planSprint(
  projectId: string,
  data: PlanSprintRequest
): Promise<PlanSprintResponse> {
  return requireResponse(
    request<PlanSprintResponse>(
      'POST',
      `/projects/${projectId}/ai/plan-sprint`,
      data
    )
  );
}

export async function summarizeSprint(
  projectId: string,
  sprintId: string
): Promise<SprintSummaryResponse> {
  const data = await requireResponse(
    request<SprintSummaryResponse>(
      'POST',
      `/sprints/${sprintId}/ai/summary`,
      { projectId } satisfies SprintSummaryRequest
    )
  );
  if (data.sprint.id !== sprintId || data.sprint.projectId !== projectId) {
    throw new Error('The server returned a summary for a different sprint.');
  }
  return data;
}

export function sendChat(
  projectId: string,
  data: ChatRequest
): Promise<ChatResponse> {
  return requireResponse(
    request<ChatResponse>('POST', `/projects/${projectId}/ai/chat`, data)
  );
}
