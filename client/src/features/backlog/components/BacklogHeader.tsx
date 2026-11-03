// client/src/features/backlog/components/BacklogHeader.tsx

import { Box, Button, Stack, Typography } from '@mui/material';
import { AutoAwesomeOutlined } from '@mui/icons-material';

interface BacklogHeaderProps {
  totalTasks: number;
  totalPoints: number;
}

export default function BacklogHeader({
  totalTasks,
  totalPoints,
}: BacklogHeaderProps) {
  return (
    <Box
      sx={{
        mb: 3,
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'baseline' }, minWidth: 0 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Backlog
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {totalTasks} todos · {totalPoints} pts
        </Typography>
      </Stack>
      <Button
        variant="outlined"
        size="small"
        startIcon={<AutoAwesomeOutlined />}
        disabled
        title="Ask AI is not available yet."
      >
        Ask AI
      </Button>
    </Box>
  );
}