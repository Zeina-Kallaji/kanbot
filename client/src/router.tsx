import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './features/auth/ProtectedRoute';
import GuestRoute from './features/auth/GuestRoute';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ProjectsPage from './features/projects/ProjectsPage';
import NotFoundPage from './pages/NotFoundPage';
import BacklogPage from './features/backlog/BacklogPage';

/**
 * Application Router
 * 
 * Uses createBrowserRouter (React Router v6.4+ data API).
 * AuthProvider is inside the App component which is the root route element.
 */
export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      // Guest routes (login, register) - no layout
      {
        path: '/login',
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
      },
      {
        path: '/register',
        element: (
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        ),
      },
      
      // Protected routes - with AppLayout
      {
        element: (
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: '/',
            element: <Navigate to="/projects" replace />,
          },
          {
            path: '/projects',
            element: <ProjectsPage />,
          },
          // Placeholder routes for Day 2+
          {
           path: '/projects/:projectId/backlog',
           element: <BacklogPage />,
},
          {
            path: '/projects/:projectId/sprint',
            element: <div>Active Sprint (Day 4)</div>,
          },
          {
            path: '/projects/:projectId/board',
            element: <div>Board (Day 5)</div>,
          },
          {
            path: '/projects/:projectId/sprints',
            element: <div>Sprints (Day 5)</div>,
          },
        ],
      },
      
      // 404 Not Found
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
