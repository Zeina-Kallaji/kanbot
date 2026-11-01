import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * ProtectedRoute Component
 * 
 * Route guard for authenticated pages.
 * Redirects to login if user is not authenticated.
 * Includes the current location as a redirect parameter.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const redirectUrl = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectUrl)}`} replace />;
  }

  return <>{children}</>;
}