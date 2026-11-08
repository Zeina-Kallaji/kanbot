import { useLocation } from 'react-router-dom';

import {
  Box,
  Typography,
  Button,
  Stack,
  Container,
} from '@mui/material';

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import ThemeToggle from '../ThemeToggle';
import {
  pageHeaderButtonSx,
  pageHeaderIconSx,
  pageHeaderContentSx,
  pageHeaderSx,
  pageHeaderTitleSx,
} from './pageHeaderStyles';

interface Props {
  onAskAI?: () => void;
  disabled?: boolean;
}

export default function TopBar({ onAskAI, disabled = false }: Props) {
  const location = useLocation();
  const isProjectsList = location.pathname === '/projects';
  const isBacklog = location.pathname.endsWith('/backlog');
  const useBacklogHeaderLayout =
    location.pathname.includes('/board') ||
    location.pathname.includes('/sprints') ||
    location.pathname.includes('/sprint');

  if (isProjectsList || isBacklog) return null;

  const getPageTitle = () => {
    if (location.pathname.includes('/backlog')) return 'Backlog';
    if (location.pathname.includes('/sprints')) return 'Sprints';
    if (location.pathname.includes('/board') || location.pathname.includes('/sprint')) return 'Active Sprint';

    return 'Projects';
  };

  const getPageIcon = () => {
    if (location.pathname.includes('/sprints')) {
      return <CalendarMonthIcon sx={pageHeaderIconSx} />;
    }
    if (location.pathname.includes('/board') || location.pathname.includes('/sprint')) {
      return <ViewKanbanIcon sx={pageHeaderIconSx} />;
    }
    return <FolderCopyIcon sx={pageHeaderIconSx} />;
  };

  const headerContent = (
    <>
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
        {getPageIcon()}
        <Typography variant="h1" sx={pageHeaderTitleSx}>
          {getPageTitle()}
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
          startIcon={<AutoAwesomeOutlinedIcon />}
          onClick={onAskAI}
          disabled={disabled}
          sx={{ ...pageHeaderButtonSx, minWidth: 0 }}
        >
          Ask AI
        </Button>
      </Stack>
    </>
  );

  return (
    <Box component="header" sx={pageHeaderSx}>
      {useBacklogHeaderLayout ? (
        <Container maxWidth="lg">
          <Box sx={pageHeaderContentSx}>{headerContent}</Box>
        </Container>
      ) : (
        <Box
          sx={{
            width: '100%',
            px: { xs: 2, sm: 3 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          {headerContent}
        </Box>
      )}
    </Box>
  );
}