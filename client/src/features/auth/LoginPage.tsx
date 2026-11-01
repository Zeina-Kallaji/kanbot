import { useState } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Stack,
} from '@mui/material';
import { useAuth } from './AuthContext';
import { login as apiLogin } from '../../api/auth';
import { ApiError } from '../../api/client';

/**
 * Login Form Validation Schema
 */
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * LoginPage Component
 * 
 * Allows users to log in with email and password.
 * 
 * Features:
 * - Client-side validation with zod
 * - Server error display (401 shows message above form)
 * - Loading state on submit button
 * - Redirect to original URL or /projects after success
 * - Link to register page
 * 
 * Acceptance Criteria (AUTH-2):
 * - Form: email, password
 * - 401 shows server message above the form
 * - On success, go to ?redirect= or /projects
 */
export default function LoginPage() {
  const [serverError, setServerError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setServerError('');
    setIsLoading(true);

    try {
      const response = await apiLogin(data);
      
      // Update auth context
      authLogin(response.token, response.user);

      // Redirect to intended page or projects
      const redirectUrl = searchParams.get('redirect') || '/projects';
      navigate(redirectUrl, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        // Show server error message above form
        setServerError(error.message);
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 8,
      }}
    >
      <Container maxWidth="xs">
        <Stack spacing={3} sx={{ alignItems: "center" }}>
          {/* Logo */}
          <Box sx={{ mb: 2 }}>
            <Box
              component="img"
              src="/kanbot-logo.svg"
              alt="Kanbot"
              sx={{
                height: 48,
                mb: 1,
                display: 'block',
                mx: 'auto',
              }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", mt: 1 }}
            >
              Your sprint board with an AI teammate
            </Typography>
          </Box>

          <Paper
            elevation={2}
            sx={{
              width: '100%',
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography variant="h2" sx={{ mb: 3, textAlign: 'center' }}>
              Log in to your account
            </Typography>

            {/* Server Error Message */}
            {serverError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {serverError}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack spacing={2.5}>
                {/* Email Field */}
                <TextField
                  label="Email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  {...register('email')}
                  disabled={isLoading}
                />

                {/* Password Field */}
                <TextField
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  {...register('password')}
                  disabled={isLoading}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isLoading}
                  sx={{ mt: 1 }}
                >
                  {isLoading ? 'Logging in...' : 'Log in'}
                </Button>
              </Stack>
            </form>

            {/* Register Link */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{
                    fontWeight: 500,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Create one
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
