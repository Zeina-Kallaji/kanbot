import { Box, CircularProgress, Typography, Stack } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  fullPage?: boolean;
  size?: number;
}

/**
 * LoadingSpinner Component
 * 
 * Displays a loading spinner with optional message.
 * Can be centered in a full page or inline in a component.
 */
export default function LoadingSpinner({ 
  message = 'Loading...', 
  fullPage = false,
  size = 40 
}: LoadingSpinnerProps) {
  const content = (
    <Stack spacing={2} sx={{ alignItems: "center" }}>
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Stack>
  );

  if (fullPage) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        py: 4,
      }}
    >
      {content}
    </Box>
  );
}
