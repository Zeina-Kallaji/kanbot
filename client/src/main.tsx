import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { router } from './router';
import theme from './theme/theme';
import './index.css';

/**
 * Kanbot Main Entry Point
 * 
 * Providers hierarchy:
 * 1. ThemeProvider - MUI theme
 * 2. QueryClientProvider - TanStack Query for server state
 * 3. Router (with BrowserRouter built-in)
 *    └─ AuthProvider - Authentication state (wraps routes inside router)
 * 4. Toaster - Toast notifications
 */

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFFFF',
              color: '#202B3C',
              border: '1px solid #E5EAF2',
              borderRadius: '8px',
              fontSize: '14px',
            },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
