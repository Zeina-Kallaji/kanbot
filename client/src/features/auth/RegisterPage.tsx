import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Stack,
} from '@mui/material';
import { useAuth } from './AuthContext';
import { register as apiRegister } from '../../api/auth';
import { ApiError, fieldErrors } from '../../api/client';

/**
 * Register Form Validation Schema
 */
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80, 'Name must be 80 characters or less'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(200, 'Password must be 200 characters or less'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * RegisterPage Component
 * 
 * Allows new users to create an account.
 * 
 * Features:
 * - Client-side validation with zod (all required, valid email, password ≥8 chars, passwords match)
 * - Server validation errors show under matching fields
 * - 409 conflict (duplicate email) shows under email field
 * - Loading state prevents double submission
 * - Auto-login on success, redirect to /projects
 * - Link to login page
 * 
 * Acceptance Criteria (AUTH-1):
 * - Form: name, email, password, confirmPassword
 * - Client validation: all required, valid email, password ≥8 chars, confirm matches
 * - Server errors show under fields (409 duplicate email under email field)
 * - Loading state, no double submit
 * - On success, user is signed in and goes to /projects
 */
export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true);

    try {
      // Extract only the fields needed for registration
      const registerData = {
        name: data.name,
        email: data.email,
        password: data.password,
      };
      const response = await apiRegister(registerData);
      
      // Auto-login after successful registration
      authLogin(response.token, response.user);

      // Navigate to projects page
      navigate('/projects', { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        // Map server validation errors to form fields
        const errors = fieldErrors(error);
        
        // Set errors on matching fields
        Object.entries(errors).forEach(([field, message]) => {
          setError(field as keyof RegisterFormData, {
            type: 'server',
            message,
          });
        });

        // If no field-specific errors, it's a general error
        if (Object.keys(errors).length === 0) {
          setError('root', {
            type: 'server',
            message: error.message,
          });
        }
      } else {
        setError('root', {
          type: 'server',
          message: 'An unexpected error occurred. Please try again.',
        });
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
        py: { xs: 3, sm: 8 },
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={2}
          sx={{
            width: '100%',
            p: { xs: 2.5, sm: 4 },
            borderRadius: 2,
          }}
        >
          <Box
            component="img"
            src="/kanbot-logo-tagline.svg"
            alt="Kanbot — Your sprint board with an AI teammate"
            sx={{
              display: 'block',
              width: '100%',
              maxWidth: 230,
              height: 'auto',
              mx: 'auto',
              mb: 2,
            }}
          />

          <Typography variant="h2" sx={{ mb: 3, textAlign: 'center' }}>
            Create your account
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2.5}>
              {/* Name Field */}
              <TextField
                label="Name"
                type="text"
                autoComplete="name"
                autoFocus
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
                {...register('name')}
                disabled={isLoading}
              />

              {/* Email Field */}
              <TextField
                label="Email"
                type="email"
                autoComplete="email"
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
                autoComplete="new-password"
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
                {...register('password')}
                disabled={isLoading}
              />

              {/* Confirm Password Field */}
              <TextField
                label="Confirm Password"
                type="password"
                autoComplete="new-password"
                fullWidth
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                {...register('confirmPassword')}
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
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </Stack>
          </form>

          {/* Login Link */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  fontWeight: 500,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Log in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
