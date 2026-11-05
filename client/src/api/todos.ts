
import { request } from './client';

import type {
  Todo,
  TodoListQuery,
  CreateTodoRequest,
  BulkCreateTodosRequest,
  BulkCreateTodosResponse,
  UpdateTodoRequest,
  MoveTodoRequest,
} from '../types/api';

interface TodosResponse {
  todos: Todo[];
}

interface TodoResponse {
  todo: Todo;
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

/**
 * Get todos for a specific project.
 * Supports backlog, status, priority, type, and search filters.
 */
export function listTodos(
  projectId: string,
  query: TodoListQuery = {}
): Promise<TodosResponse> {
  const params = new URLSearchParams();

  if (query.sprintId !== undefined) {
    params.set('sprintId', query.sprintId);
  }

  if (query.status) {
    params.set('status', query.status);
  }

  if (query.priority) {
    params.set('priority', query.priority);
  }

  if (query.type) {
    params.set('type', query.type);
  }

  if (query.search) {
    params.set('search', query.search);
  }

  const queryString = params.toString();
  const path = `/projects/${projectId}/todos${
    queryString ? `?${queryString}` : ''
  }`;

  return requireResponse(request<TodosResponse>('GET', path));
}

/**
 * Get a single todo by its ID.
 */
export function getTodo(todoId: string): Promise<TodoResponse> {
  return requireResponse(
    request<TodoResponse>('GET', `/todos/${todoId}`)
  );
}

/**
 * Create a todo inside a project.
 */
export function createTodo(
  projectId: string,
  data: CreateTodoRequest
): Promise<TodoResponse> {
  return requireResponse(
    request<TodoResponse>(
      'POST',
      `/projects/${projectId}/todos`,
      data
    )
  );
}

export function createTodos(
  projectId: string,
  data: BulkCreateTodosRequest
): Promise<BulkCreateTodosResponse> {
  return requireResponse(
    request<BulkCreateTodosResponse>(
      'POST',
      `/projects/${projectId}/todos/bulk`,
      data
    )
  );
}

/**
 * Update an existing todo.
 */
export function updateTodo(
  todoId: string,
  data: UpdateTodoRequest
): Promise<TodoResponse> {
  return requireResponse(
    request<TodoResponse>('PATCH', `/todos/${todoId}`, data)
  );
}

/**
 * Move or reorder a todo between the backlog and a sprint.
 */
export function moveTodo(
  todoId: string,
  data: MoveTodoRequest
): Promise<TodoResponse> {
  return requireResponse(
    request<TodoResponse>('POST', `/todos/${todoId}/move`, data)
  );
}

/**
 * Delete a todo.
 * The backend responds with 204 No Content.
 */
export async function deleteTodo(todoId: string): Promise<void> {
  await request<void>('DELETE', `/todos/${todoId}`);
}
