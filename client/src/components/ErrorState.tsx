import { Box, Typography, Stack, Button } from '@mui/material';
import { ErrorOutlined } from '@mui/icons-material';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * ErrorState Component
 * 
 * Displays an error state with message and optional retry action.
 * Used when data fetching or mutations fail.
 */
export default function ErrorState({ 
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again'
}: ErrorStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 320,
        textAlign: 'center',
        py: 6,
        px: 3,
      }}
    >
      <Stack spacing={2} sx={{ alignItems: "center", maxWidth: 400 }}>
        <ErrorOutlined 
          sx={{ 
            fontSize: 64, 
            color: 'error.main',
            opacity: 0.8,
          }} 
        />
        
        <Typography variant="h3" color="text.primary">
          {title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
        
        {onRetry && (
          <Button 
            variant="outlined" 
            onClick={onRetry}
            sx={{ mt: 2 }}
          >
            {retryLabel}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
