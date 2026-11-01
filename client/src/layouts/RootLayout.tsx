import { Outlet } from 'react-router-dom';
import AuthProvider from '../features/auth/AuthProvider';

/**
 * RootLayout Component
 * 
 * Wraps all routes with AuthProvider so authentication state
 * is available throughout the application.
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
