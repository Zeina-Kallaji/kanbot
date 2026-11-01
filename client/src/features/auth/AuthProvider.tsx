import { useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import type { User } from '../../types/api';
import { me } from '../../api/auth';
import { setUnauthorizedCallback } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from '../../lib/toast';

const TOKEN_KEY = 'kanbot_token';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const initializedRef = useRef(false);

  /**
   * Handle session expiration (401 from any API call)
   * Memoized to avoid unnecessary effect re-runs
   */
  const handleSessionExpired = useCallback(() => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    toast.warning('Your session has expired. Please log in again.');
    const returnUrl = location.pathname + location.search;
    navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`, { replace: true });
  }, [navigate, location.pathname, location.search]);

  /**
   * Initialize authentication state on mount
   * Uses ref to prevent double initialization in React StrictMode
   */
  useEffect(() => {
    // Prevent double initialization in StrictMode development
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    const initializeAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await me();
        setUser(response.user);
      } catch (error) {
        // Token is invalid or expired - clear it
        console.error('Auth initialization failed:', error);
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []); // Empty deps - run only once on mount

  /**
   * Register unauthorized callback with API client
   * Updates when callback changes
   */
  useEffect(() => {
    setUnauthorizedCallback(handleSessionExpired);
  }, [handleSessionExpired]);

  /**
   * Login - called after successful authentication
   */
  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(userData);
  }, []);

  /**
   * Logout - clears session and redirects to login
   */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    navigate('/login', { replace: true });
    toast.info('You have been logged out.');
  }, [navigate]);

  if (isLoading) {
    return <LoadingSpinner fullPage message="Loading your session..." />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}