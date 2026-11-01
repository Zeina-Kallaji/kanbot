import { Box, Typography, Stack } from '@mui/material';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * EmptyState Component
 * 
 * Displays a centered empty state with optional icon, title, description, and action.
 * Used throughout the app when lists or views have no content.
 */
export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
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
        {icon && (
          <Box
            sx={{
              color: 'text.disabled',
              '& > svg': {
                fontSize: 64,
              },
            }}
          >
            {icon}
          </Box>
        )}
        
        <Typography variant="h3" color="text.primary">
          {title}
        </Typography>
        
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
        
        {action && (
          <Box sx={{ mt: 2 }}>
            {action}
          </Box>
        )}
      </Stack>
    </Box>
  );
}
