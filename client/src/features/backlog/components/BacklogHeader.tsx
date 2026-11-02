// client/src/features/backlog/components/BacklogHeader.tsx

import { Box, Typography } from '@mui/material';

interface BacklogHeaderProps {
  totalTasks: number;
  totalPoints: number;
}

export default function BacklogHeader({
  totalTasks,
  totalPoints,
}: BacklogHeaderProps) {
  return (
    <Box sx={{ mb: 3, display: 'flex', alignItems: 'baseline', gap: 2 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700 }}
      >
        Backlog
      </Typography>
      
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: '0.875rem' }}
      >
        {totalTasks} todos · {totalPoints} pts
      </Typography>
    </Box>
  );
}