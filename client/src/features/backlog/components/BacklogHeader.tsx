// client/src/features/backlog/components/BacklogHeader.tsx

import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { AutoAwesomeOutlined } from '@mui/icons-material';
import FolderOpen from '@mui/icons-material/FolderOpen';
import ThemeToggle from '../../../components/ThemeToggle';
import {
  pageHeaderButtonSx,
  pageHeaderContentSx,
  pageHeaderIconSx,
  pageHeaderSx,
  pageHeaderTitleSx,
} from '../../../components/layout/pageHeaderStyles';

interface BacklogHeaderProps {
  totalTasks: number;
  totalPoints: number;
  onAskAI: () => void;
}

export default function BacklogHeader({
  totalTasks,
  totalPoints,
  onAskAI,
}: BacklogHeaderProps) {
  return (
    <Box component="header" sx={pageHeaderSx}>
      <Container maxWidth="lg">
        <Box sx={pageHeaderContentSx}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { sm: 'center' }, minWidth: 0 }}
          >
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
              <FolderOpen sx={pageHeaderIconSx} />
              <Typography variant="h1" sx={pageHeaderTitleSx}>
                Backlog
              </Typography>
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: '0.875rem' }}
            >
              {totalTasks} todos · {totalPoints} pts
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <ThemeToggle
              variant="onHeader"
              sx={{ display: { xs: 'none', md: 'inline-flex' } }}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<AutoAwesomeOutlined />}
              onClick={onAskAI}
              sx={pageHeaderButtonSx}
            >
              Ask AI
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}