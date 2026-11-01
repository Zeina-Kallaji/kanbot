import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * GuestRoute Component
 * 
 * Route guard for guest-only pages (login, register).
 * Redirects authenticated users to the app.
 */
export default function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/projects" replace />;
  }

  return <>{children}</>;
}
