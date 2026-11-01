import type { ApiErrorBody, ErrorCode } from '../types/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: ErrorCode,
    message: string,
    public details?: { path: string; message: string }[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function fieldErrors(error: unknown): Record<string, string> {
  if (error instanceof ApiError && error.details) {
    return error.details.reduce((acc, detail) => {
      acc[detail.path] = detail.message;
      return acc;
    }, {} as Record<string, string>);
  }
  return {};
}

let onUnauthorizedCallback: (() => void) | null = null;

export function setUnauthorizedCallback(callback: () => void) {
  onUnauthorizedCallback = callback;
}

function getToken(): string | null {
  return localStorage.getItem('kanbot_token');
}

export async function request<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown
): Promise<T | undefined> {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  const url = `${baseUrl}${path}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (response.status === 204) {
      return undefined;
    }
    
    if (!response.ok) {
      const errorBody: ApiErrorBody = await response.json();
      
      if (response.status === 401 && !path.includes('/auth/login')) {
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback();
        }
      }
      
      throw new ApiError(
        response.status,
        errorBody.error.code,
        errorBody.error.message,
        errorBody.error.details
      );
    }
    
    const data = await response.json();
    return data as T;
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(
        0,
        'INTERNAL_ERROR',
        'Cannot reach the server. Is it running?'
      );
    }
    
    throw new ApiError(
      500,
      'INTERNAL_ERROR',
      'An unexpected error occurred. Please try again.'
    );
  }
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: (path: string) => request<void>('DELETE', path),
};