import { Outlet } from 'react-router-dom';
import AuthProvider from './features/auth/AuthProvider';

/**
 * App Component
 * 
 * Root component that wraps the entire app with AuthProvider.
 * This component is rendered as the root route element in createBrowserRouter,
 * so it has access to React Router context and hooks.
 * 
 * Outlet renders the matched child route.
 */
export default function App() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}