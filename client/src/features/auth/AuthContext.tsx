import { createContext, useContext } from 'react';
import type { User } from '../../types/api';

/**
 * Auth Context Type
 * 
 * Provides authentication state and methods throughout the app.
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

/**
 * Auth Context
 * 
 * Created with createContext and consumed via useAuth hook.
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * useAuth Hook
 * 
 * Access authentication state and methods from any component.
 * Must be used within an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
