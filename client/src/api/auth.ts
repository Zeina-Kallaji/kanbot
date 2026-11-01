import type { 
  AuthResponse, 
  MeResponse, 
  LoginRequest, 
  RegisterRequest 
} from '../types/api';
import { api } from './client';

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', data);
  if (!response) {
    throw new Error('No response from register endpoint');
  }
  return response;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', data);
  if (!response) {
    throw new Error('No response from login endpoint');
  }
  return response;
}

export async function me(): Promise<MeResponse> {
  const response = await api.get<MeResponse>('/auth/me');
  if (!response) {
    throw new Error('No response from me endpoint');
  }
  return response;
}